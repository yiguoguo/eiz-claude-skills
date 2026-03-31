import { ParsedAPI, Endpoint, Parameter, AuthConfig, DataModel, Field } from './types';

/**
 * Parse API information from natural language/text description
 * This is used as a fallback when curl-parser and openapi-parser cannot parse the input
 */
export function parseText(text: string): ParsedAPI {
  const cleanedText = text.trim();

  // Try to extract URL
  const urlMatch = cleanedText.match(/(https?:\/\/[^\s]+)/);
  const url = urlMatch ? urlMatch[1] : '';

  // Try to extract method
  const methodMatch = cleanedText.match(/\b(GET|POST|PUT|DELETE|PATCH)\b/i);
  const method = methodMatch ? methodMatch[1].toUpperCase() as Endpoint['method'] : 'GET';

  // Extract endpoint path from URL
  let path = '/';
  let baseUrl = 'https://api.example.com';
  if (url) {
    try {
      const urlObj = new URL(url);
      baseUrl = `${urlObj.protocol}//${urlObj.host}`;
      path = urlObj.pathname + urlObj.search;
    } catch {
      path = new URL(url).pathname;
    }
  }

  // Try to extract auth type
  const auth = extractAuth(cleanedText);

  // Try to extract parameters
  const params = extractParams(cleanedText);

  // Try to extract request body
  const requestBody = extractRequestBody(cleanedText);

  // Try to extract response structure
  const response = extractResponse(cleanedText);

  // Extract model/data structure
  const models = extractModels(cleanedText);

  // Generate API name
  const name = extractAPIName(cleanedText, url);

  const endpoint: Endpoint = {
    method,
    path: path || '/',
    summary: `API endpoint: ${method} ${path || '/api/endpoint'}`,
    params,
    requestBody,
    response
  };

  return {
    name,
    baseUrl,
    endpoints: [endpoint],
    auth,
    models
  };
}

function extractAuth(text: string): AuthConfig {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('bearer') || lowerText.includes('token') || lowerText.includes('authorization')) {
    return {
      type: 'bearer',
      header: 'Authorization',
      tokenName: 'token'
    };
  }

  if (lowerText.includes('apikey') || lowerText.includes('api key') || lowerText.includes('x-api-key')) {
    return {
      type: 'apikey',
      header: 'X-API-Key',
      tokenName: 'apiKey'
    };
  }

  return { type: 'none' };
}

function extractParams(text: string): Parameter[] {
  const params: Parameter[] = [];

  // Look for query parameter patterns like "paramName: value" or "paramName=value"
  const paramPatterns = [
    /(\w+)\s*=\s*["']?([^"'\s,]+)["']?/g,  // param=value or param="value"
    /(\w+)\s*:\s*(string|number|integer|boolean|array|object)/gi,  // param: type
    /参数[\s:：]*(.+?)(?:,|$)/gi,  // Chinese: 参数 xxx
    /param(?:eter)?s?[\s:：]*(.+?)(?:,|$)/gi  // English: params xxx
  ];

  // Extract from URL query string
  const urlMatch = text.match(/[?&]([^=]+)=([^&\s]+)/g);
  if (urlMatch) {
    for (const param of urlMatch) {
      const [, name, value] = param.split('=');
      params.push({
        name: decodeURIComponent(name),
        in: 'query',
        type: inferType(value),
        required: true,
        example: decodeURIComponent(value)
      });
    }
  }

  // Look for structured parameter descriptions
  const paramDescMatch = text.match(/(?:参数|param|query)\s*[:：]?\s*([\s\S]*?)(?:\n\n|\r\r|$)/i);
  if (paramDescMatch) {
    const paramText = paramDescMatch[1];
    const lines = paramText.split(/[\n,]/).filter(Boolean);
    for (const line of lines) {
      const nameMatch = line.match(/(\w+)\s*(?:[-:](?:\s*)(.+))?/);
      if (nameMatch) {
        const [, name, desc] = nameMatch;
        params.push({
          name,
          in: 'query',
          type: 'string',
          required: !line.toLowerCase().includes('optional'),
          description: desc?.trim()
        });
      }
    }
  }

  return params;
}

function extractRequestBody(text: string): any | undefined {
  const lowerText = text.toLowerCase();

  // Check if there's a request body mentioned
  if (lowerText.includes('body') || lowerText.includes('payload') || lowerText.includes('data')) {
    // Look for JSON-like structure
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          contentType: 'application/json',
          schema: parsed,
          example: parsed
        };
      } catch {
        return {
          contentType: 'application/json',
          description: 'Request body data'
        };
      }
    }

    return {
      contentType: 'application/json',
      description: 'Request body data'
    };
  }

  return undefined;
}

function extractResponse(text: string): any {
  const lowerText = text.toLowerCase();

  // Look for response/status code
  const statusMatch = text.match(/(\d{3})\s*(?:status|code|ok)/i);
  const statusCode = statusMatch ? parseInt(statusMatch[1]) : 200;

  // Look for JSON response structure
  const jsonMatch = text.match(/\{[\s\S]*"[\w]+"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        contentType: 'application/json',
        statusCode,
        example: parsed
      };
    } catch {
      // Not valid JSON
    }
  }

  return {
    contentType: 'application/json',
    statusCode
  };
}

function extractModels(text: string): DataModel[] {
  const models: DataModel[] = [];

  // Look for data model descriptions
  // Pattern: field name followed by description
  const fieldPatterns = [
    /(\w+)\s*[:\-]\s*(string|number|integer|boolean|array|object)/gi,
    /(\w+)\s*(?:=|：|：)\s*(.+?)(?:,|\n|$)/g
  ];

  // Try to find response/return structure
  const responseMatch = text.match(/(?:response|return|返回|结果)[\s:：]?([\s\S]*?)(?:\n\n|\n##|$)/i);
  if (responseMatch) {
    const responseText = responseMatch[1];
    const fields: Field[] = [];

    // Look for field: type patterns
    const fieldMatches = responseText.matchAll(/(\w+)\s*[:\-](?:\s*)(string|number|integer|boolean|array|object)/gi);
    for (const match of fieldMatches) {
      fields.push({
        name: match[1],
        type: match[2].toLowerCase() as Field['type']
      });
    }

    if (fields.length > 0) {
      models.push({
        name: 'ResponseData',
        fields,
        description: 'Response data structure'
      });
    }
  }

  // Look for array/object structures in JSON
  const jsonMatch = text.match(/\{[\s\S]*"[\w]+"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const fields = extractFieldsFromObject(parsed);
      if (fields.length > 0) {
        models.push({
          name: 'DataModel',
          fields,
          description: 'Data model extracted from response'
        });
      }
    } catch {
      // Not valid JSON
    }
  }

  return models;
}

function extractFieldsFromObject(obj: any, prefix = ''): Field[] {
  const fields: Field[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      fields.push({
        name: prefix + key,
        type: 'array',
        example: value.length > 0 ? value[0] : undefined
      });
      if (typeof value[0] === 'object' && value[0] !== null) {
        const nestedFields = extractFieldsFromObject(value[0], key + '.');
        fields.push(...nestedFields);
      }
    } else if (typeof value === 'object' && value !== null) {
      fields.push({
        name: prefix + key,
        type: 'object',
        example: value
      });
      const nestedFields = extractFieldsFromObject(value, prefix + key + '.');
      fields.push(...nestedFields);
    } else {
      fields.push({
        name: prefix + key,
        type: inferType(value),
        example: value as string | number | boolean | object
      });
    }
  }

  return fields;
}

function extractAPIName(text: string, url: string): string {
  // Try to extract from title/header
  const titleMatch = text.match(/#\s*(.+?)(?:\n|$)/);
  if (titleMatch) {
    return titleMatch[1].trim().replace(/\s+/g, '');
  }

  // Try to extract from URL path
  if (url) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        // Capitalize each part and join
        return pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
      }
    } catch {
      // Invalid URL
    }
  }

  // Try to extract from text keywords
  const apiMatch = text.match(/(?:api|endpoint|interface)[\s:-]*(.+?)(?:\n|$)/i);
  if (apiMatch) {
    return apiMatch[1].trim().replace(/\s+/g, '');
  }

  return 'API';
}

function inferType(value: any): Field['type'] {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'number';
  }
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return 'string';
}

export const textParser = {
  parseText
};
