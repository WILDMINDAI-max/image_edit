// History Store
// Undo/Redo state management using Zustand

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useEffect } from 'react';
import { Project } from '@/types/project';
import { useEditorStore } from './editorStore';

interface HistoryEntry {
    id: string;
    timestamp: number;
    label: string;
    projectSnapshot: string; // Serialized project JSON
}

interface HistoryState {
    past: HistoryEntry[];
    future: HistoryEntry[];
    maxHistorySize: number;
    isUndoing: boolean;
    isRedoing: boolean;
}

interface HistoryActions {
    // State capture
    pushState: (label: string) => void;

    // Navigation
    undo: () => void;
    redo: () => void;

    // Utility
    canUndo: () => boolean;
    canRedo: () => boolean;
    clear: () => void;
    getHistory: () => HistoryEntry[];
    jumpToState: (entryId: string) => void;

    // Configuration
    setMaxHistorySize: (size: number) => void;
}

export type HistoryStore = HistoryState & HistoryActions;

export const useHistoryStore = create<HistoryStore>()(
    immer((set, get) => ({
        // Initial state - Strictly limited to 10 steps as requested
        past: [],
        future: [],
        maxHistorySize: 10,
        isUndoing: false,
        isRedoing: false,

        // State capture
        pushState: (label: string) => {
            const editorStore = useEditorStore.getState();
            const project = editorStore.project;
            if (!project) return;

            // Don't push state during undo/redo operations
            if (get().isUndoing || get().isRedoing) return;

            const entry: HistoryEntry = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                label,
                projectSnapshot: JSON.stringify(project),
            };

            set((state) => {
                // If we're at the limit, remove the oldest entry
                if (state.past.length >= state.maxHistorySize) {
                    state.past.shift();
                }

                // Add current state to past
                state.past.push(entry);

                // Clear future on new action
                state.future = [];
            });
        },

        // Navigation
        undo: () => {
            const { past, isUndoing, isRedoing } = get();
            if (past.length === 0 || isUndoing || isRedoing) return;

            const editorStore = useEditorStore.getState();
            const currentProject = editorStore.project;
            if (!currentProject) return;

            set((state) => {
                state.isUndoing = true;
            });

            try {
                // Get the state we want to restore
                const previousEntry = past[past.length - 1];
                const previousProject: Project = JSON.parse(previousEntry.projectSnapshot);

                // Save current state to future BEFORE restoring
                const currentEntry: HistoryEntry = {
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    label: 'Current',
                    projectSnapshot: JSON.stringify(currentProject),
                };

                set((state) => {
                    state.future.unshift(currentEntry);
                    // Trim future if it exceeds limit
                    if (state.future.length > state.maxHistorySize) {
                        state.future.pop();
                    }
                    state.past.pop();
                });

                // Restore previous state in editorStore
                editorStore.loadProject(previousProject);
            } catch (error) {
                console.error('[HistoryStore] Undo failed:', error);
            } finally {
                set((state) => {
                    state.isUndoing = false;
                });
            }
        },

        redo: () => {
            const { future, isUndoing, isRedoing } = get();
            if (future.length === 0 || isUndoing || isRedoing) return;

            const editorStore = useEditorStore.getState();
            const currentProject = editorStore.project;
            if (!currentProject) return;

            set((state) => {
                state.isRedoing = true;
            });

            try {
                // Get the state we want to restore
                const nextEntry = future[0];
                const nextProject: Project = JSON.parse(nextEntry.projectSnapshot);

                // Save current state to past BEFORE restoring
                const currentEntry: HistoryEntry = {
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    label: 'Current',
                    projectSnapshot: JSON.stringify(currentProject),
                };

                set((state) => {
                    state.past.push(currentEntry);
                    // Trim past if it exceeds limit
                    if (state.past.length > state.maxHistorySize) {
                        state.past.shift();
                    }
                    state.future.shift();
                });

                // Restore next state in editorStore
                editorStore.loadProject(nextProject);
            } catch (error) {
                console.error('[HistoryStore] Redo failed:', error);
            } finally {
                set((state) => {
                    state.isRedoing = false;
                });
            }
        },

        // Utility
        canUndo: () => {
            return get().past.length > 0;
        },

        canRedo: () => {
            return get().future.length > 0;
        },

        clear: () => {
            set((state) => {
                state.past = [];
                state.future = [];
            });
        },

        getHistory: () => {
            return get().past;
        },

        jumpToState: (entryId: string) => {
            const { past, isUndoing, isRedoing } = get();
            if (isUndoing || isRedoing) return;

            const entryIndex = past.findIndex(e => e.id === entryId);
            if (entryIndex === -1) return;

            const entry = past[entryIndex];
            const project: Project = JSON.parse(entry.projectSnapshot);

            const editorStore = useEditorStore.getState();
            const currentProject = editorStore.project;
            if (!currentProject) return;

            try {
                const currentEntry: HistoryEntry = {
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    label: 'Current',
                    projectSnapshot: JSON.stringify(currentProject),
                };

                const statesAfter = past.slice(entryIndex + 1);

                editorStore.loadProject(project);

                set((state) => {
                    state.future = [currentEntry, ...statesAfter.reverse(), ...state.future].slice(0, state.maxHistorySize);
                    state.past = past.slice(0, entryIndex);
                });
            } catch (error) {
                console.error('[HistoryStore] Jump failed:', error);
            }
        },

        // Configuration
        setMaxHistorySize: (size: number) => {
            set((state) => {
                state.maxHistorySize = Math.max(1, size);
                // Trim if necessary
                if (state.past.length > state.maxHistorySize) {
                    state.past = state.past.slice(-state.maxHistorySize);
                }
                if (state.future.length > state.maxHistorySize) {
                    state.future = state.future.slice(0, state.maxHistorySize);
                }
            });
        },
    }))
);

// Hook for keyboard shortcuts
export const useHistoryShortcuts = () => {
    const { undo, redo, canUndo, canRedo } = useHistoryStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if user is typing in an input or textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) {
                // Allow Z/Y if combined with Ctrl/Cmd, but be careful with native undo
                // Usually best to let native work in inputs
                return;
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const isCtrl = isMac ? e.metaKey : e.ctrlKey;

            if (isCtrl && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    // Ctrl+Shift+Z = Redo
                    redo();
                } else {
                    // Ctrl+Z = Undo
                    undo();
                }
            } else if (isCtrl && e.key.toLowerCase() === 'y') {
                // Ctrl+Y = Redo
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    return { undo, redo, canUndo: canUndo(), canRedo: canRedo() };
};
