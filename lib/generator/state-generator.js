import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
export async function generateStateManagement(outputPath) {
    await mkdir(join(outputPath, 'lib', 'store'), { recursive: true });
    const useDataStoreTs = `import { create } from 'zustand';

interface DataItem {
  [key: string]: unknown;
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface DataStore {
  data: DataItem[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  setData: (data: DataItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  fetchData: (token: string, endpoint?: string) => Promise<void>;
  reset: () => void;
}

const initialPagination: PaginationState = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
};

export const useDataStore = create<DataStore>((set, get) => ({
  data: [],
  loading: false,
  error: null,
  pagination: initialPagination,

  setData: (data) => set({ data }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),

  fetchData: async (token, endpoint = '/api/data') => {
    const { pagination } = get();
    set({ loading: true, error: null });

    try {
      const params = new URLSearchParams({
        token,
        page: String(pagination.page),
        pageSize: String(pagination.pageSize),
      });

      const response = await fetch(\`\${endpoint}?\${params}\`);

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      const result = await response.json();
      const items = Array.isArray(result) ? result : result.data || [];
      const total = result.total || items.length;
      const totalPages = Math.ceil(total / pagination.pageSize);

      set({
        data: items,
        pagination: { ...pagination, total, totalPages },
        loading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch data';
      set({ error: message, loading: false });
    }
  },

  reset: () =>
    set({
      data: [],
      loading: false,
      error: null,
      pagination: initialPagination,
    }),
}));
`;
    await writeFile(join(outputPath, 'lib', 'store', 'useDataStore.ts'), useDataStoreTs);
}
//# sourceMappingURL=state-generator.js.map