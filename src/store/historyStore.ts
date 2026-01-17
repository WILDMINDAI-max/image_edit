// History Store
// Undo/Redo state management using Zustand

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
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
        // Initial state
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
                // Add current state to past
                state.past.push(entry);

                // Trim history if it exceeds max size
                if (state.past.length > state.maxHistorySize) {
                    state.past = state.past.slice(-state.maxHistorySize);
                }

                // Clear future on new action
                state.future = [];

                console.log(`[History] Pushed state: "${label}". History size: ${state.past.length}`);
            });
        },

        // Navigation
        undo: () => {
            const { past } = get();
            if (past.length === 0) return;

            const editorStore = useEditorStore.getState();
            const currentProject = editorStore.project;
            if (!currentProject) return;

            set((state) => {
                state.isUndoing = true;
            });

            // Save current state to future
            const currentEntry: HistoryEntry = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                label: 'Current',
                projectSnapshot: JSON.stringify(currentProject),
            };

            // Get the previous state
            const previousEntry = past[past.length - 1];
            const previousProject: Project = JSON.parse(previousEntry.projectSnapshot);

            // Restore previous state
            editorStore.loadProject(previousProject);

            set((state) => {
                // Move current to future
                state.future.unshift(currentEntry);
                // Remove from past
                state.past.pop();
                state.isUndoing = false;

                console.log(`[History] Undo successful. Restored: "${previousEntry.label}". Remaining history: ${state.past.length}`);
            });
        },

        redo: () => {
            const { future } = get();
            if (future.length === 0) return;

            const editorStore = useEditorStore.getState();
            const currentProject = editorStore.project;
            if (!currentProject) return;

            set((state) => {
                state.isRedoing = true;
            });

            // Save current state to past
            const currentEntry: HistoryEntry = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                label: 'Current',
                projectSnapshot: JSON.stringify(currentProject),
            };

            // Get the next state
            const nextEntry = future[0];
            const nextProject: Project = JSON.parse(nextEntry.projectSnapshot);

            // Restore next state
            editorStore.loadProject(nextProject);

            set((state) => {
                // Move current to past
                state.past.push(currentEntry);
                // Remove from future
                state.future.shift();
                state.isRedoing = false;

                console.log(`[History] Redo successful. Restored: "${nextEntry.label}". Future steps: ${state.future.length}`);
            });
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
            const { past } = get();
            const entryIndex = past.findIndex(e => e.id === entryId);
            if (entryIndex === -1) return;

            const entry = past[entryIndex];
            const project: Project = JSON.parse(entry.projectSnapshot);

            const editorStore = useEditorStore.getState();
            const currentProject = editorStore.project;
            if (!currentProject) return;

            // Save current and all states after target to future
            const currentEntry: HistoryEntry = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                label: 'Current',
                projectSnapshot: JSON.stringify(currentProject),
            };

            const statesAfter = past.slice(entryIndex + 1);

            // Restore target state
            editorStore.loadProject(project);

            set((state) => {
                state.future = [currentEntry, ...statesAfter.reverse(), ...state.future];
                state.past = past.slice(0, entryIndex);
                console.log(`[History] Jumped to state: "${entry.label}". New history size: ${state.past.length}`);
            });
        },

        // Configuration
        setMaxHistorySize: (size: number) => {
            set((state) => {
                state.maxHistorySize = Math.max(10, Math.min(200, size));
                // Trim if necessary
                if (state.past.length > state.maxHistorySize) {
                    state.past = state.past.slice(-state.maxHistorySize);
                }
            });
        },
    }))
);

// Hook for keyboard shortcuts
export const useHistoryShortcuts = () => {
    const undo = useHistoryStore((state) => state.undo);
    const redo = useHistoryStore((state) => state.redo);
    const canUndo = useHistoryStore((state) => state.canUndo);
    const canRedo = useHistoryStore((state) => state.canRedo);

    return { undo, redo, canUndo: canUndo(), canRedo: canRedo() };
};
