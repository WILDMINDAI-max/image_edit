// Editor Store
// Global editor state management using Zustand

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Project, Page, createDefaultProject, createDefaultPage, PagePreset } from '@/types/project';

export type SidebarPanel =
    | 'library'
    | 'templates'
    | 'assets'
    | 'text'
    | 'photos'
    | 'uploads'
    | 'layers'
    | 'animations'
    | 'mask'
    | null;

export type RightPanel = 'properties' | 'colors' | 'filters' | 'textEffects' | 'fonts' | null;


export type ToolMode =
    | 'select'
    | 'pan'
    | 'draw'
    | 'text'
    | 'shape';

interface EditorState {
    // Project state
    project: Project | null;
    isLoading: boolean;
    isSaving: boolean;
    hasUnsavedChanges: boolean;

    // UI state
    activeSidebarPanel: SidebarPanel;
    toolMode: ToolMode;
    zoom: number;
    isFitMode: boolean; // Track if zoom is at "fit to screen" level
    fitTrigger: number; // Increment to trigger re-fit calculation
    showGrid: boolean;
    showRulers: boolean;
    showGuides: boolean;
    snapToGrid: boolean;
    snapToGuides: boolean;

    // Right panel state
    activeRightPanel: RightPanel;

    // Modal states
    isExportModalOpen: boolean;
    isResizeModalOpen: boolean;
    isNewProjectModalOpen: boolean;

    // Preview mode state
    isPreviewMode: boolean;
    previewPageIndex: number;
}

interface EditorActions {
    // Project actions
    createNewProject: (preset?: PagePreset) => void;
    loadProject: (project: Project) => void;
    saveProject: () => Promise<void>;
    updateProjectName: (name: string) => void;

    // Page actions
    addPage: (preset?: PagePreset) => void;
    removePage: (pageId: string) => void;
    duplicatePage: (pageId: string) => void;
    setActivePage: (pageId: string) => void;
    reorderPages: (fromIndex: number, toIndex: number) => void;
    updatePage: (pageId: string, updates: Partial<Page>) => void;
    updatePageThumbnail: (pageId: string, thumbnail: string) => void;
    togglePageHidden: (pageId: string) => void;
    togglePageLocked: (pageId: string) => void;

    // UI actions
    setSidebarPanel: (panel: SidebarPanel) => void;
    setToolMode: (mode: ToolMode) => void;
    setZoom: (zoom: number, isFit?: boolean) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    fitToScreen: () => void;
    toggleGrid: () => void;
    toggleRulers: () => void;
    toggleGuides: () => void;
    toggleSnapToGrid: () => void;
    toggleSnapToGuides: () => void;

    // Right panel actions
    setRightPanel: (panel: RightPanel) => void;
    openColorsPanel: () => void;
    openPropertiesPanel: () => void;
    openFiltersPanel: () => void;
    openFontsPanel: () => void;
    openMaskPanel: () => void;
    closeRightPanel: () => void;

    // Modal actions
    openExportModal: () => void;
    closeExportModal: () => void;
    openResizeModal: () => void;
    closeResizeModal: () => void;
    openNewProjectModal: () => void;
    closeNewProjectModal: () => void;

    // Preview mode actions
    openPreviewMode: () => void;
    closePreviewMode: () => void;
    setPreviewPage: (index: number) => void;
    nextPreviewPage: () => void;
    prevPreviewPage: () => void;

    // Utility
    markAsChanged: () => void;
    markAsSaved: () => void;
}

export type EditorStore = EditorState & EditorActions;

export const useEditorStore = create<EditorStore>()(
    immer((set, get) => ({
        // Initial state
        project: null,
        isLoading: false,
        isSaving: false,
        hasUnsavedChanges: false,
        activeSidebarPanel: 'templates',
        toolMode: 'select',
        zoom: 100,
        isFitMode: true,
        fitTrigger: 0,
        showGrid: false,
        showRulers: true,
        showGuides: true,
        snapToGrid: false,
        snapToGuides: true,
        activeRightPanel: 'properties',
        isExportModalOpen: false,
        isResizeModalOpen: false,
        isNewProjectModalOpen: false,
        isPreviewMode: false,
        previewPageIndex: 0,

        // Project actions
        createNewProject: (preset?: PagePreset) => {
            const project = createDefaultProject(preset);
            set((state) => {
                state.project = project;
                state.hasUnsavedChanges = false;
            });
        },

        loadProject: (project: Project) => {
            set((state) => {
                state.project = project;
                state.hasUnsavedChanges = false;
                state.isLoading = false;
            });
        },

        saveProject: async () => {
            set((state) => {
                state.isSaving = true;
            });

            // TODO: Implement actual save logic (localStorage, server, etc.)
            const project = get().project;
            if (project) {
                // Placeholder: save to localStorage
                localStorage.setItem(`project-${project.id}`, JSON.stringify(project));
            }

            set((state) => {
                state.isSaving = false;
                state.hasUnsavedChanges = false;
            });
        },

        updateProjectName: (name: string) => {
            set((state) => {
                if (state.project) {
                    state.project.name = name;
                    state.project.updatedAt = Date.now();
                    state.hasUnsavedChanges = true;
                }
            });
        },

        // Page actions
        addPage: (preset?: PagePreset) => {
            set((state) => {
                if (state.project) {
                    const newPage = createDefaultPage(preset);
                    state.project.pages.push(newPage);
                    state.project.activePageId = newPage.id;
                    state.project.updatedAt = Date.now();
                    state.hasUnsavedChanges = true;
                }
            });
        },

        removePage: (pageId: string) => {
            set((state) => {
                if (state.project && state.project.pages.length > 1) {
                    const index = state.project.pages.findIndex((p) => p.id === pageId);
                    if (index !== -1) {
                        state.project.pages.splice(index, 1);
                        // If we removed the active page, set a new active page
                        if (state.project.activePageId === pageId) {
                            state.project.activePageId = state.project.pages[0].id;
                        }
                        state.project.updatedAt = Date.now();
                        state.hasUnsavedChanges = true;
                    }
                }
            });
        },

        duplicatePage: (pageId: string) => {
            set((state) => {
                if (state.project) {
                    const page = state.project.pages.find((p) => p.id === pageId);
                    if (page) {
                        const duplicatedPage: Page = {
                            ...JSON.parse(JSON.stringify(page)),
                            id: crypto.randomUUID(),
                            name: `${page.name} (Copy)`,
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                        };
                        const index = state.project.pages.findIndex((p) => p.id === pageId);
                        state.project.pages.splice(index + 1, 0, duplicatedPage);
                        state.project.activePageId = duplicatedPage.id;
                        state.project.updatedAt = Date.now();
                        state.hasUnsavedChanges = true;
                    }
                }
            });
        },

        setActivePage: (pageId: string) => {
            set((state) => {
                if (state.project) {
                    state.project.activePageId = pageId;
                }
            });
        },

        reorderPages: (fromIndex: number, toIndex: number) => {
            set((state) => {
                if (state.project) {
                    const [moved] = state.project.pages.splice(fromIndex, 1);
                    state.project.pages.splice(toIndex, 0, moved);
                    state.project.updatedAt = Date.now();
                    state.hasUnsavedChanges = true;
                }
            });
        },

        updatePage: (pageId: string, updates: Partial<Page>) => {
            set((state) => {
                if (state.project) {
                    const page = state.project.pages.find((p) => p.id === pageId);
                    if (page) {
                        Object.assign(page, updates);
                        page.updatedAt = Date.now();
                        state.project.updatedAt = Date.now();
                        state.hasUnsavedChanges = true;
                    }
                }
            });
        },

        updatePageThumbnail: (pageId: string, thumbnail: string) => {
            set((state) => {
                if (state.project) {
                    const page = state.project.pages.find((p) => p.id === pageId);
                    if (page) {
                        page.thumbnail = thumbnail;
                    }
                }
            });
        },

        togglePageHidden: (pageId: string) => {
            set((state) => {
                if (state.project) {
                    const page = state.project.pages.find((p) => p.id === pageId);
                    if (page) {
                        page.hidden = !page.hidden;
                        page.updatedAt = Date.now();
                        state.project.updatedAt = Date.now();
                        state.hasUnsavedChanges = true;
                    }
                }
            });
        },

        togglePageLocked: (pageId: string) => {
            set((state) => {
                if (state.project) {
                    const page = state.project.pages.find((p) => p.id === pageId);
                    if (page) {
                        page.locked = !page.locked;
                        page.updatedAt = Date.now();
                        state.project.updatedAt = Date.now();
                        state.hasUnsavedChanges = true;
                    }
                }
            });
        },

        // UI actions
        setSidebarPanel: (panel: SidebarPanel) => {
            set((state) => {
                state.activeSidebarPanel = panel;
            });
        },

        setToolMode: (mode: ToolMode) => {
            set((state) => {
                state.toolMode = mode;
            });
        },

        setZoom: (zoom: number, isFit: boolean = false) => {
            set((state) => {
                state.zoom = Math.min(Math.max(zoom, 5), 500);
                state.isFitMode = isFit;
            });
        },

        zoomIn: () => {
            set((state) => {
                state.zoom = Math.min(state.zoom + 10, 500);
                state.isFitMode = false;
            });
        },

        zoomOut: () => {
            set((state) => {
                state.zoom = Math.max(state.zoom - 10, 5);
                state.isFitMode = false;
            });
        },

        resetZoom: () => {
            set((state) => {
                state.zoom = 100;
                state.isFitMode = false;
            });
        },

        fitToScreen: () => {
            // Increment trigger to cause CanvasStage to recalculate fit zoom
            set((state) => {
                state.fitTrigger = state.fitTrigger + 1;
                state.isFitMode = true;
            });
        },

        toggleGrid: () => {
            set((state) => {
                state.showGrid = !state.showGrid;
            });
        },

        toggleRulers: () => {
            set((state) => {
                state.showRulers = !state.showRulers;
            });
        },

        toggleGuides: () => {
            set((state) => {
                state.showGuides = !state.showGuides;
            });
        },

        toggleSnapToGrid: () => {
            set((state) => {
                state.snapToGrid = !state.snapToGrid;
            });
        },

        toggleSnapToGuides: () => {
            set((state) => {
                state.snapToGuides = !state.snapToGuides;
            });
        },

        // Right panel actions
        setRightPanel: (panel: RightPanel) => {
            set((state) => {
                state.activeRightPanel = panel;
            });
        },

        openColorsPanel: () => {
            set((state) => {
                state.activeRightPanel = 'colors';
            });
        },

        openPropertiesPanel: () => {
            set((state) => {
                state.activeRightPanel = 'properties';
            });
        },

        openFiltersPanel: () => {
            set((state) => {
                state.activeRightPanel = 'filters';
            });
        },

        openFontsPanel: () => {
            set((state) => {
                state.activeRightPanel = 'fonts';
            });
        },

        openMaskPanel: () => {
            set((state) => {
                state.activeSidebarPanel = 'mask';
            });
        },

        closeRightPanel: () => {
            set((state) => {
                state.activeRightPanel = null;
            });
        },

        // Modal actions
        openExportModal: () => {
            set((state) => {
                state.isExportModalOpen = true;
            });
        },

        closeExportModal: () => {
            set((state) => {
                state.isExportModalOpen = false;
            });
        },

        openResizeModal: () => {
            set((state) => {
                state.isResizeModalOpen = true;
            });
        },

        closeResizeModal: () => {
            set((state) => {
                state.isResizeModalOpen = false;
            });
        },

        openNewProjectModal: () => {
            set((state) => {
                state.isNewProjectModalOpen = true;
            });
        },

        closeNewProjectModal: () => {
            set((state) => {
                state.isNewProjectModalOpen = false;
            });
        },

        // Preview mode actions
        openPreviewMode: () => {
            const project = get().project;
            if (!project) return;
            // Find current page index
            const currentIndex = project.pages.findIndex(p => p.id === project.activePageId);
            set((state) => {
                state.isPreviewMode = true;
                state.previewPageIndex = currentIndex >= 0 ? currentIndex : 0;
            });
        },

        closePreviewMode: () => {
            set((state) => {
                state.isPreviewMode = false;
            });
        },

        setPreviewPage: (index: number) => {
            const project = get().project;
            if (!project) return;
            set((state) => {
                state.previewPageIndex = Math.max(0, Math.min(index, project.pages.length - 1));
            });
        },

        nextPreviewPage: () => {
            const project = get().project;
            if (!project) return;
            set((state) => {
                if (state.previewPageIndex < project.pages.length - 1) {
                    state.previewPageIndex += 1;
                }
            });
        },

        prevPreviewPage: () => {
            set((state) => {
                if (state.previewPageIndex > 0) {
                    state.previewPageIndex -= 1;
                }
            });
        },

        // Utility
        markAsChanged: () => {
            set((state) => {
                state.hasUnsavedChanges = true;
                if (state.project) {
                    state.project.updatedAt = Date.now();
                }
            });
        },

        markAsSaved: () => {
            set((state) => {
                state.hasUnsavedChanges = false;
            });
        },
    }))
);

// Selector hooks for optimized re-renders
export const useActivePage = () => {
    return useEditorStore((state) => {
        if (!state.project) return null;
        return state.project.pages.find((p) => p.id === state.project?.activePageId) || null;
    });
};

export const usePages = () => {
    return useEditorStore((state) => state.project?.pages ?? []);
};

export const useZoom = () => {
    return useEditorStore((state) => state.zoom);
};

export const useSidebarPanel = () => {
    return useEditorStore((state) => state.activeSidebarPanel);
};
