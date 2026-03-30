import { ParsedAPI, Endpoint, Parameter, AuthConfig, DataModel, Field } from './types';

/**
 * Detect if input is a curl command
 */
export function isCurlCommand(input: string): boolean {
  return input.trim().toLowerCase().startsWith('curl ');
}

/**
 * Parse a curl command into a ParsedAPI structure
 */
export function parseCurl(curlCommand: string): ParsedAPI {
  const curl = curlCommand.trim();

  // Extract URL
  const urlMatch = curl.match(/curl\s+(?:(?:-[A-Za-z]+\s+)*)?['"]?([^'"`\s]+)['"]?/i);
  if (!urlMatch) {
    throw new Error('Could not extract URL from curl command');
  }

  let url = urlMatch[1];

  // Handle -L flag and extract final URL
  const locationMatch = curl.match(/-L(?:\s+|$)/i);
  if (locationMatch) {
    // If -L is present, we'd need to follow redirects - use the URL as-is for now
  }

  // Extract method (-X or --request)
  const methodMatch = curl.match(/(?:-X|--request)\s+['"]?(\w+)['"]?/i);
  const method = methodMatch ? methodMatch[1].toUpperCase() as Endpoint['method'] : 'GET';

  // Extract headers (-H)
  const headerMatches = curl.matchAll(/-H\s+['"]([^'"]+)['"]/gi);
  const headers: Record<string, string> = {};
  for (const match of headerMatches) {
    const [key, ...valueParts] = match[1].split(':');
    headers[key.trim()] = valueParts.join(':').trim();
  }

  // Extract data/body (-d or --data)
  const dataMatch = curl.match(/(?:-d|--data(?:=-?raw)?)\s+['"]([^'"]*)['"]/i);
  const body = dataMatch ? dataMatch[1] : undefined;

  // Extract query parameters from URL
  const urlObj = new URL(url);
  const searchParams: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    searchParams[key] = value;
  });

  // Build auth config
  const auth: AuthConfig = { type: 'none' };
  if (headers['Authorization']) {
    const authHeader = headers['Authorization'];
    if (authHeader.toLowerCase().startsWith('bearer ')) {
      auth.type = 'bearer';
      auth.header = 'Authorization';
      auth.tokenName = 'token';
    } else if (authHeader.toLowerCase().startsWith('apikey ')) {
      auth.type = 'apikey';
      auth.header = 'Authorization';
    } else {
      auth.type = 'apikey';
      auth.header = 'Authorization';
    }
  }

  // Build base URL
  const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname.replace(/\/[^/]*$/, '')}`;

  // Build endpoint path (remove base URL portion)
  const fullPath = urlObj.pathname + urlObj.search;
  const path = fullPath.startsWith('/') ? fullPath : '/' + fullPath;

  // Build parameters
  const params: Parameter[] = [];
  Object.entries(searchParams).forEach(([name, value]) => {
    params.push({
      name,
      in: 'query',
      type: 'string',
      required: true,
      example: value
    });
  });

  // Build response schema from example data if available
  const responseExample = extractExampleResponse(headers);
  const response = {
    contentType: headers['Accept'] || 'application/json',
    statusCode: 200,
    example: responseExample
  };

  const endpoint: Endpoint = {
    method,
    path,
    summary: `API endpoint: ${method} ${urlObj.pathname}`,
    params,
    response
  };

  // Generate model from query params if available
  const models: DataModel[] = [];
  if (Object.keys(searchParams).length > 0) {
    const queryModel: DataModel = {
      name: 'QueryParams',
      fields: Object.entries(searchParams).map(([name, value]) => ({
        name,
        type: 'string' as const,
        example: value
      }))
    };
    models.push(queryModel);
  }

  // Extract API name from URL
  const pathParts = urlObj.pathname.split('/').filter(Boolean);
  const apiName = pathParts.length > 0
    ? pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')
    : 'API';

  return {
    name: apiName,
    baseUrl: `${urlObj.protocol}//${urlObj.host}`,
    endpoints: [endpoint],
    auth,
    models
  };
}

function extractExampleResponse(headers: Record<string, string>): object {
  // This would typically parse response body if available in the curl context
  // For now, return a placeholder that indicates the response structure
  return {
    message: 'Response structure would be parsed from actual response data'
  };
}

export const curlParser = {
  isCurlCommand,
  parseCurl
};
