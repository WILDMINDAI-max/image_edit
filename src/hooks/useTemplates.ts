import { useState, useEffect } from 'react';
import { templateApi } from '../services/api/templates';

// Define types that match what the UI expects (hierarchical)
export interface TemplateData {
    id: string;
    name: string;
    thumbnail?: string;
    width: number;
    height: number;
    background: any;
    elements: any[];
    [key: string]: any;
}

export interface TemplateTheme {
    id: string;
    name: string;
    templates: TemplateData[];
}

export interface TemplateCategory {
    id: string;
    name: string;
    themes: TemplateTheme[];
}

export function useTemplatesHierarchy() {
    const [categories, setCategories] = useState<TemplateCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch flat data from backend
                const [cats, themes, templates] = await Promise.all([
                    (await import('../services/api/client')).apiClient.get('/templates/categories').then(r => r.data), // Direct axios usage or update api service
                    (await import('../services/api/client')).apiClient.get('/templates/themes').then(r => r.data),
                    templateApi.getTemplates({ limit: 1000 })
                ]);

                // Backend 'getTemplates' returns array directly based on our api service impl

                // Stitch into hierarchy
                const hierarchy: TemplateCategory[] = (cats as any[]).map(cat => {
                    const catThemes = (themes as any[])
                        .filter(t => t.categoryId === cat.id)
                        .map(theme => {
                            const themeTemplates = templates
                                .filter(tmpl => tmpl.themeId === theme.id)
                                .map(tmpl => ({
                                    ...tmpl,
                                    // Map backend fields to frontend expected fields
                                    width: tmpl.metadata?.width || tmpl.width || 1080,
                                    height: tmpl.metadata?.height || tmpl.height || 1080,
                                    thumbnail: tmpl.thumbnailUrl || tmpl.thumbnail,
                                    elements: tmpl.data.objects || tmpl.data.elements || [], // Fabric JSON struct
                                    background: tmpl.data.background || tmpl.background
                                }));

                            return {
                                id: theme.id,
                                name: theme.name,
                                templates: themeTemplates
                            };
                        });

                    return {
                        id: cat.id,
                        name: cat.name,
                        themes: catThemes
                    };
                });

                // Filter out empty categories or themes if desired, but for now keep them
                setCategories(hierarchy);

            } catch (err) {
                console.error("Failed to load templates:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { categories, loading, error };
}
