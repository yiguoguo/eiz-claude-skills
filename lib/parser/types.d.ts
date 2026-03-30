export interface ParsedAPI {
    name: string;
    baseUrl: string;
    endpoints: Endpoint[];
    auth: AuthConfig;
    models: DataModel[];
}
export interface Endpoint {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    summary: string;
    params: Parameter[];
    requestBody?: RequestBody;
    response: ResponseSpec;
}
export interface Parameter {
    name: string;
    in: 'query' | 'path' | 'header';
    type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
    required: boolean;
    description?: string;
    example?: string | number | boolean;
}
export interface RequestBody {
    contentType: string;
    schema?: object;
    example?: object;
    description?: string;
}
export interface ResponseSpec {
    contentType: string;
    statusCode: number;
    schema?: object;
    example?: object;
    description?: string;
}
export interface AuthConfig {
    type: 'bearer' | 'apikey' | 'none';
    header?: string;
    tokenName?: string;
}
export interface DataModel {
    name: string;
    fields: Field[];
    description?: string;
}
export interface Field {
    name: string;
    type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
    description?: string;
    example?: string | number | boolean | object;
    optional?: boolean;
}
//# sourceMappingURL=types.d.ts.map