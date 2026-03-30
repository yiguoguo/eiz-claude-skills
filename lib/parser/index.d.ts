import { ParsedAPI } from './types';
import { curlParser, isCurlCommand, parseCurl } from './curl-parser';
import { openapiParser, isOpenAPIDocument, parseOpenAPI } from './openapi-parser';
import { textParser, parseText } from './text-parser';
/**
 * Parse API information from various input formats
 * Automatically detects the input format and routes to the appropriate parser
 */
export declare function parseAPI(input: string): Promise<ParsedAPI>;
export { curlParser, openapiParser, textParser };
export { isCurlCommand, isOpenAPIDocument };
export { parseCurl, parseOpenAPI, parseText };
//# sourceMappingURL=index.d.ts.map