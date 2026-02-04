import { apiClient } from './client';

export interface Template {
    id: string;
    name: string;
    thumbnailUrl?: string; // from backend
    thumbnail?: string; // legacy support if needed
    data: any;
    metadata?: {
        width: number;
        height: number;
        tags: string[];
    };
    // Flattened for easy access if your frontend expects these at root
    width?: number;
    height?: number;
    background?: any;
    elements?: any[];
}

export interface Category {
    id: string;
    name: string;
    themes: Theme[];
}

export interface Theme {
    id: string;
    name: string;
    templates: Template[]; // In full hierarchy fetch
}

export const templateApi = {
    getTemplates: async (params?: { category?: string; theme?: string; search?: string; limit?: number }) => {
        const res = await apiClient.get('/templates', { params });
        // Assuming backend returns { data: templates } due to formatApiResponse
        return res.data as Template[];
    },

    getCategories: async () => {
        const res = await apiClient.get('/templates/categories');
        return res.data as Category[]; // This assumes backend returns hierarchy or we need to build it. 
        // Wait, backend getCategories returns flat list of categories. getThemes returns flat list of themes.
        // The frontend expects a hierarchy { id, name, themes: [...] }.
        // We might need to fetch both and stitch them, or update backend to return hierarchy.
        // For now, let's fetch both and stitch here.
    },

    getThemes: async (categoryId?: string) => {
        const res = await apiClient.get('/templates/themes', { params: { category: categoryId } });
        return res.data;
    },

    getTemplateById: async (id: string) => {
        const res = await apiClient.get(`/templates/${id}`);
        return res.data as Template;
    }
};
