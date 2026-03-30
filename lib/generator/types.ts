export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description?: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
  response?: {
    type: string;
    description?: string;
  };
}

export interface ParsedAPI {
  name: string;
  description?: string;
  endpoints: APIEndpoint[];
  sampleData?: Record<string, unknown>;
}
