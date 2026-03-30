import { ParsedAPI } from './types';
/**
 * Detect if input is a curl command
 */
export declare function isCurlCommand(input: string): boolean;
/**
 * Parse a curl command into a ParsedAPI structure
 */
export declare function parseCurl(curlCommand: string): ParsedAPI;
export declare const curlParser: {
    isCurlCommand: typeof isCurlCommand;
    parseCurl: typeof parseCurl;
};
//# sourceMappingURL=curl-parser.d.ts.map