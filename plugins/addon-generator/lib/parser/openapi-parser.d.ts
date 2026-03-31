import { ParsedAPI } from './types';
/**
 * Detect if input is an OpenAPI/Swagger JSON document
 */
export declare function isOpenAPIDocument(input: string): boolean;
/**
 * Parse an OpenAPI JSON document into a ParsedAPI structure
 */
export declare function parseOpenAPI(jsonString: string): ParsedAPI;
export declare const openapiParser: {
    isOpenAPIDocument: typeof isOpenAPIDocument;
    parseOpenAPI: typeof parseOpenAPI;
};
//# sourceMappingURL=openapi-parser.d.ts.map