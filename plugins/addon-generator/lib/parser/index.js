import { curlParser, isCurlCommand, parseCurl } from './curl-parser';
import { openapiParser, isOpenAPIDocument, parseOpenAPI } from './openapi-parser';
import { textParser, parseText } from './text-parser';
/**
 * Parse API information from various input formats
 * Automatically detects the input format and routes to the appropriate parser
 */
export async function parseAPI(input) {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
        throw new Error('Input cannot be empty');
    }
    // Try curl command format first
    if (isCurlCommand(trimmedInput)) {
        return parseCurl(trimmedInput);
    }
    // Try OpenAPI/Swagger JSON format
    if (isOpenAPIDocument(trimmedInput)) {
        return parseOpenAPI(trimmedInput);
    }
    // Fall back to text/natural language parsing
    return parseText(trimmedInput);
}
export { curlParser, openapiParser, textParser };
export { isCurlCommand, isOpenAPIDocument };
export { parseCurl, parseOpenAPI, parseText };
//# sourceMappingURL=index.js.map