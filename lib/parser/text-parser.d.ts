import { ParsedAPI } from './types';
/**
 * Parse API information from natural language/text description
 * This is used as a fallback when curl-parser and openapi-parser cannot parse the input
 */
export declare function parseText(text: string): ParsedAPI;
export declare const textParser: {
    parseText: typeof parseText;
};
//# sourceMappingURL=text-parser.d.ts.map