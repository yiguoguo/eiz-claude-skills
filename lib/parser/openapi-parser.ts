import { ParsedAPI, Endpoint, Parameter, AuthConfig, DataModel, Field } from './types';

/**
 * Detect if input is an OpenAPI/Swagger JSON document
 */
export function isOpenAPIDocument(input: string): boolean {
  try {
    const parsed = JSON.parse(input);
    return !!(parsed.openapi || parsed.swagger);
  } catch {
    return false;
  }
}

/**
 * Parse an OpenAPI JSON document into a ParsedAPI structure
 */
export function parseOpenAPI(jsonString: string): ParsedAPI {
  const doc = JSON.parse(jsonString);

  // Determine if it's OpenAPI 3.x or Swagger 2.x
  const isOpenAPI3 = !!doc.openapi && doc.openapi.startsWith('3.');
  const isSwagger2 = !!doc.swagger && doc.swagger === '2.0';

  if (!isOpenAPI3 && !isSwagger2) {
    throw new Error('Unsupported document format. Only OpenAPI 3.x and Swagger 2.x are supported.');
  }

  // Extract base URL
  const baseUrl = extractBaseUrl(doc, isOpenAPI3);

  // Extract auth config
  const auth = extractAuth(doc, isOpenAPI3);

  // Extract endpoints from paths
  const endpoints: Endpoint[] = [];
  const models: DataModel[] = [];

  const paths: Record<string, Record<string, any>> = doc.paths || {};
  for (const [path, pathItem] of Object.entries(paths)) {
    const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
    for (const method of methods) {
      if (method in pathItem) {
        const operation = pathItem[method];
        const params = extractParams(operation, pathItem, isOpenAPI3);

        const response = extractResponse(operation, isOpenAPI3);

        endpoints.push({
          method: method.toUpperCase() as Endpoint['method'],
          path,
          summary: operation.summary || operation.description || `${method.toUpperCase()} ${path}`,
          params,
          requestBody: extractRequestBody(operation, isOpenAPI3),
          response
        });

        // Extract models/schemas from request/response bodies
        extractModels(operation, models, isOpenAPI3);
      }
    }
  }

  // Extract shared schemas/components
  if (isOpenAPI3) {
    const schemas = doc.components?.schemas || {};
    for (const [name, schema] of Object.entries(schemas)) {
      const fields = extractSchemaFields(schema);
      models.push({ name, fields, description: (schema as any).description });
    }
  }

  // Generate API name from info or base URL
  const name = doc.info?.title || new URL(baseUrl).pathname.replace(/^\//, '').replace(/\/$/, '') || 'API';

  return {
    name,
    baseUrl,
    endpoints,
    auth,
    models
  };
}

function extractBaseUrl(doc: any, isOpenAPI3: boolean): string {
  if (isOpenAPI3) {
    const server = doc.servers?.[0];
    if (server) {
      return server.url;
    }
  } else {
    const basePath = doc.basePath || '';
    const host = doc.host || '';
    const schemes = doc.schemes || ['https'];
    const scheme = schemes[0] || 'https';
    if (host) {
      return `${scheme}://${host}${basePath}`;
    }
  }
  return 'https://api.example.com';
}

function extractAuth(doc: any, isOpenAPI3: boolean): AuthConfig {
  if (isOpenAPI3) {
    const securitySchemes = doc.components?.securitySchemes || {};
    for (const [name, scheme] of Object.entries(securitySchemes)) {
      const s = scheme as any;
      if (s.type === 'http') {
        if (s.scheme === 'bearer') {
          return { type: 'bearer', header: 'Authorization', tokenName: s.bearerFormat || 'token' };
        }
      } else if (s.type === 'apiKey') {
        return { type: 'apikey', header: s.name || s.in || 'X-API-Key', tokenName: name };
      }
    }
  } else {
    const securityDefinitions = doc.securityDefinitions || {};
    for (const [name, def] of Object.entries(securityDefinitions)) {
      const d = def as any;
      if (d.type === 'apiKey') {
        return { type: 'apikey', header: d.name || d.in || 'X-API-Key', tokenName: name };
      } else if (d.type === 'basic') {
        return { type: 'bearer', header: 'Authorization' };
      }
    }
  }
  return { type: 'none' };
}

function extractParams(operation: any, pathItem: any, isOpenAPI3: boolean): Parameter[] {
  const params: Parameter[] = [];
  const seen = new Set<string>();

  // Path-level params
  const pathParams = pathItem.parameters || [];
  for (const p of pathParams) {
    if (!seen.has(p.name)) {
      seen.add(p.name);
      params.push({
        name: p.name,
        in: p.in || 'path',
        type: mapType(p.type || p.schema?.type || 'string'),
        required: p.required || false,
        description: p.description,
        example: p.example || p.schema?.example
      });
    }
  }

  // Operation-level params
  const opParams = operation.parameters || [];
  for (const p of opParams) {
    if (!seen.has(p.name)) {
      seen.add(p.name);
      params.push({
        name: p.name,
        in: p.in || 'query',
        type: mapType(p.type || p.schema?.type || 'string'),
        required: p.required || false,
        description: p.description,
        example: p.example || p.schema?.example
      });
    }
  }

  return params;
}

function extractRequestBody(operation: any, isOpenAPI3: boolean): any | undefined {
  if (isOpenAPI3) {
    const requestBody = operation.requestBody;
    if (!requestBody) return undefined;

    const content = requestBody.content || {};
    const jsonContent = content['application/json'] || content['application/json; charset=utf-8'];
    return {
      contentType: Object.keys(content)[0] || 'application/json',
      schema: jsonContent?.schema,
      example: jsonContent?.example || jsonContent?.examples,
      description: requestBody.description
    };
  } else {
    const bodyParam = (operation.parameters || []).find((p: any) => p.in === 'body');
    if (!bodyParam) return undefined;
    return {
      contentType: 'application/json',
      schema: bodyParam.schema,
      example: bodyParam.examples,
      description: bodyParam.description
    };
  }
}

function extractResponse(operation: any, isOpenAPI3: boolean) {
  const responses = operation.responses || {};
  const successResponse = responses['200'] || responses['201'] || responses['default'] || Object.values(responses)[0];

  if (!successResponse) {
    return { contentType: 'application/json', statusCode: 200 };
  }

  const content = successResponse.content || {};
  const jsonContent = content['application/json'];

  return {
    contentType: Object.keys(content)[0] || 'application/json',
    statusCode: parseInt(Object.keys(responses)[0]) || 200,
    schema: jsonContent?.schema,
    example: jsonContent?.example || jsonContent?.examples,
    description: successResponse.description
  };
}

function extractModels(operation: any, models: DataModel[], isOpenAPI3: boolean) {
  // Extract from requestBody
  if (isOpenAPI3 && operation.requestBody?.content?.['application/json']?.schema) {
    const schema = operation.requestBody.content['application/json'].schema;
    extractInlineSchema(schema, models);
  }

  // Extract from responses
  const responses = operation.responses || {};
  for (const response of Object.values(responses) as any[]) {
    if (response.content?.['application/json']?.schema) {
      extractInlineSchema(response.content['application/json'].schema, models);
    }
  }
}

function extractInlineSchema(schema: any, models: DataModel[]) {
  if (!schema || typeof schema !== 'object') return;

  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    if (!models.find(m => m.name === refName)) {
      models.push({ name: refName, fields: [] });
    }
  }

  if (schema.properties) {
    for (const [name, prop] of Object.entries(schema.properties)) {
      const p = prop as any;
      const fields: Field[] = [];
      if (p.type === 'object' && p.properties) {
        for (const [fName, fProp] of Object.entries(p.properties)) {
          const fp = fProp as any;
          fields.push({
            name: fName,
            type: mapType(fp.type),
            description: fp.description,
            example: fp.example
          });
        }
      }
      if (!models.find(m => m.name === name)) {
        models.push({ name, fields, description: p.description });
      }
    }
  }
}

function extractSchemaFields(schema: any): Field[] {
  if (!schema || typeof schema !== 'object') return [];
  if (schema.type === 'array' && schema.items) {
    return [{ name: 'items', type: mapType(schema.items.type || 'object') }];
  }
  const fields: Field[] = [];
  const properties = schema.properties || schema;
  for (const [name, prop] of Object.entries(properties)) {
    const p = prop as any;
    fields.push({
      name,
      type: mapType(p.type || 'string'),
      description: p.description,
      example: p.example,
      optional: !schema.required?.includes(name)
    });
  }
  return fields;
}

function mapType(type?: string): Field['type'] {
  switch (type) {
    case 'integer': return 'integer';
    case 'number': return 'number';
    case 'boolean': return 'boolean';
    case 'array': return 'array';
    case 'object': return 'object';
    default: return 'string';
  }
}

export const openapiParser = {
  isOpenAPIDocument,
  parseOpenAPI
};
