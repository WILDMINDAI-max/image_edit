'use client';

import { useEffect, useState, useCallback } from 'react';
import { useEditorStore, useActivePage } from '@/store/editorStore';
import { useHistoryStore } from '@/store/historyStore';
import { useCanvasStore } from '@/store/canvasStore';
import { CanvasStage } from '@/components/canvas/CanvasStage';
import { SidebarContainer } from '@/components/sidebar/SidebarContainer';
import { TopToolbar } from '@/components/toolbar/TopToolbar';
import { ContextToolbar } from '@/components/toolbar/ContextToolbar';
import { ResizeModal } from './ResizeModal';
import { ExportModal } from './ExportModal';
import { PreviewMode } from './PreviewMode';
import { ColorsPanel } from '@/components/sidebar/ColorsPanel';
import { ImageEditPanel } from '@/components/sidebar/ImageEditPanel';
import { TextEditPanel } from '@/components/sidebar/TextEditPanel';
import { TextEffectsPanel } from '@/components/sidebar/TextEffectsPanel';
import { FontsPanel } from '@/components/sidebar/FontsPanel';
import { FilterPanel } from '@/components/sidebar/FilterPanel';
import { ChevronRight, ChevronLeft, ChevronUp, ChevronDown, FileText, AlertCircle, MoreHorizontal, Plus, Copy, ClipboardPaste, CopyPlus, Trash2, EyeOff, Lock } from 'lucide-react';

export function EditorShell() {
    const createNewProject = useEditorStore((state) => state.createNewProject);
    const project = useEditorStore((state) => state.project);
    const pushState = useHistoryStore((state) => state.pushState);
    const selectedIds = useCanvasStore((state) => state.selectedIds);
    const activePage = useActivePage();
    const elements = activePage?.elements ?? [];

    // Determine selected element type
    const selectedElement = selectedIds.length === 1
        ? elements.find(el => el.id === selectedIds[0])
        : null;
    const selectedElementType = selectedElement?.type || null;

    // Right panel state from store
    const rightPanel = useEditorStore((state) => state.activeRightPanel);
    const setRightPanel = useEditorStore((state) => state.setRightPanel);

    // Local panel states
    const [pagesExpanded, setPagesExpanded] = useState(false);

    // Helper to check if right panel is open
    const showRightPanel = rightPanel !== null;

    // Initialize with a new project if none exists
    useEffect(() => {
        if (!project) {
            createNewProject();
        }
    }, [project, createNewProject]);

    // Push initial state when project is loaded
    useEffect(() => {
        if (project) {
            pushState('Initial state');
        }
    }, []);

    // Keyboard shortcuts for pages
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip if typing in an input field
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const store = useEditorStore.getState();
            const { project } = store;
            if (!project) return;

            const currentIndex = project.pages.findIndex(p => p.id === project.activePageId);

            // Arrow keys to switch pages
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                e.preventDefault();
                store.setActivePage(project.pages[currentIndex - 1].id);
            } else if (e.key === 'ArrowRight' && currentIndex < project.pages.length - 1) {
                e.preventDefault();
                store.setActivePage(project.pages[currentIndex + 1].id);
            }

            // Delete/Backspace to delete current page (only if no elements selected)
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length === 0) {
                if (project.pages.length > 1) {
                    e.preventDefault();
                    store.removePage(project.activePageId);
                }
            }

            // Tab key to open preview mode
            if (e.key === 'Tab') {
                e.preventDefault();
                store.openPreviewMode();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds]);

    if (!project) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-white text-lg">Loading editor...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Top Toolbar */}
            <TopToolbar />

            {/* Main Editor Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <SidebarContainer />

                {/* Canvas Area with Bottom Bar */}
                <div className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
                    {/* Context Toolbar */}
                    <ContextToolbar />

                    {/* Canvas */}
                    <CanvasStage className="flex-1" />

                    {/* Bottom Bar - Pages Navigator (inside canvas area) */}
                    <div className="relative bg-gradient-to-b from-white to-gray-50 border-t border-gray-200/80">
                        {/* Expanded Pages View */}
                        {pagesExpanded && (
                            <div className="px-5 py-5 pt-3 overflow-hidden">
                                <div className="flex items-center gap-5 overflow-x-auto custom-scrollbar pb-3 pt-2 pl-1" style={{ maxWidth: '100%' }}>
                                    {project.pages.map((page, index) => (
                                        <div key={page.id} className="relative flex-shrink-0 group">
                                            <button
                                                onClick={() => useEditorStore.getState().setActivePage(page.id)}
                                                className={`
                                                    w-28 h-[72px] rounded-xl overflow-hidden transition-all duration-200
                                                    ${project.activePageId === page.id
                                                        ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg shadow-blue-500/20 scale-[1.02]'
                                                        : 'shadow-md hover:shadow-lg hover:scale-[1.01] border border-gray-200/80'}
                                                `}
                                            >
                                                {/* Page Preview with gradient */}
                                                <div className={`
                                                    w-full h-full flex items-center justify-center
                                                    ${project.activePageId === page.id
                                                        ? 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
                                                        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}
                                                `}>
                                                    <span className={`text-xs font-medium ${project.activePageId === page.id ? 'text-blue-600' : 'text-gray-500'}`}>
                                                        Page {index + 1}
                                                    </span>
                                                </div>
                                            </button>
                                            {/* Options Button */}
                                            <button className="absolute top-1.5 right-1.5 p-1.5 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm hover:shadow hover:bg-gray-50">
                                                <MoreHorizontal size={11} className="text-gray-500" />
                                            </button>
                                        </div>
                                    ))}
                                    {/* Add Page Button */}
                                    <button
                                        onClick={() => useEditorStore.getState().addPage()}
                                        className="w-28 h-[72px] rounded-xl border-2 border-dashed border-gray-300/80 
                                                   hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-md
                                                   flex flex-col items-center justify-center gap-1 
                                                   transition-all duration-200 flex-shrink-0 group/add"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gray-100 group-hover/add:bg-blue-100 flex items-center justify-center transition-colors">
                                            <Plus size={18} className="text-gray-400 group-hover/add:text-blue-500 transition-colors" />
                                        </div>
                                        <span className="text-[10px] font-medium text-gray-400 group-hover/add:text-blue-500 transition-colors">Add Page</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Collapsed Bar */}
                        <div className="h-10 flex items-center justify-between px-4">
                            {/* Left spacer for balance */}
                            <div className="w-[180px]" />

                            {/* Center - Pages Count */}
                            <div className="flex items-center gap-1.5 text-sm tracking-wide">
                                <span className="text-gray-600 font-semibold">Pages</span>
                                <span className="text-gray-800 font-bold">{project.pages.findIndex(p => p.id === project.activePageId) + 1}</span>
                                <span className="text-gray-400">/</span>
                                <span className="text-gray-800 font-bold">{project.pages.length}</span>
                            </div>

                            {/* Right - Page Actions */}
                            <div className="flex items-center gap-1 w-[180px] justify-end">
                                {/* Copy Page Content */}
                                <button
                                    onClick={() => useCanvasStore.getState().copy()}
                                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                    title="Copy page content"
                                >
                                    <Copy size={15} />
                                </button>

                                {/* Paste */}
                                <button
                                    onClick={() => useCanvasStore.getState().paste()}
                                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                    title="Paste"
                                >
                                    <ClipboardPaste size={15} />
                                </button>

                                {/* Divider */}
                                <div className="w-px h-4 bg-gray-200 mx-1" />

                                {/* Duplicate Page */}
                                <button
                                    onClick={() => useEditorStore.getState().duplicatePage(project.activePageId)}
                                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                    title="Duplicate page"
                                >
                                    <CopyPlus size={15} />
                                </button>

                                {/* Delete Page */}
                                <button
                                    onClick={() => {
                                        if (project.pages.length > 1) {
                                            useEditorStore.getState().removePage(project.activePageId);
                                        }
                                    }}
                                    className={`p-1.5 rounded-md transition-colors ${project.pages.length > 1
                                        ? 'hover:bg-red-50 text-gray-500 hover:text-red-500'
                                        : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                    title={project.pages.length > 1 ? "Delete page" : "Cannot delete the only page"}
                                    disabled={project.pages.length <= 1}
                                >
                                    <Trash2 size={15} />
                                </button>

                                {/* Divider */}
                                <div className="w-px h-4 bg-gray-200 mx-1" />

                                {/* Hide Page */}
                                <button
                                    onClick={() => {/* TODO: Implement hide page */ }}
                                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                    title="Hide page (coming soon)"
                                >
                                    <EyeOff size={15} />
                                </button>

                                {/* Lock Page */}
                                <button
                                    onClick={() => {/* TODO: Implement lock page */ }}
                                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                    title="Lock page (coming soon)"
                                >
                                    <Lock size={15} />
                                </button>
                            </div>

                            {/* Center - Toggle Button with trapezoid tab */}
                            <button
                                onClick={() => setPagesExpanded(!pagesExpanded)}
                                className="absolute left-1/2 -translate-x-1/2 bottom-full z-40 
                                           flex items-center justify-center
                                           transition-all duration-200 active:scale-95"
                                title={pagesExpanded ? "Collapse pages" : "Expand pages"}
                            >
                                {/* Trapezoid tab SVG with minor curves */}
                                <svg
                                    width="100"
                                    height="24"
                                    viewBox="0 0 100 24"
                                    fill="none"
                                >
                                    {/* Trapezoid shape with subtle curves */}
                                    <path
                                        d="M0 24 Q5 24 12 12 Q18 4 30 4 L70 4 Q82 4 88 12 Q95 24 100 24 Z"
                                        className="fill-white"
                                    />
                                    {/* Top border line */}
                                    <path
                                        d="M0 24 Q5 24 12 12 Q18 4 30 4 L70 4 Q82 4 88 12 Q95 24 100 24"
                                        stroke="#E5E7EB"
                                        strokeWidth="1"
                                        fill="none"
                                    />
                                </svg>
                                {pagesExpanded ? (
                                    <ChevronDown size={16} className="absolute text-gray-400 top-2" />
                                ) : (
                                    <ChevronUp size={16} className="absolute text-gray-400 top-2" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Dynamic Content */}
                {showRightPanel && (
                    <div className="relative">
                        {/* Render panel based on type and selection */}
                        {rightPanel === 'colors' ? (
                            <ColorsPanel
                                onClose={() => setRightPanel(null)}
                            />
                        ) : rightPanel === 'filters' ? (
                            <div className="w-80 bg-white border-l border-gray-200 h-full overflow-hidden">
                                <FilterPanel />
                            </div>
                        ) : rightPanel === 'textEffects' ? (
                            <TextEffectsPanel onClose={() => setRightPanel(null)} />
                        ) : rightPanel === 'fonts' ? (
                            <FontsPanel onClose={() => setRightPanel(null)} />
                        ) : selectedElementType === 'text' ? (
                            <TextEditPanel />
                        ) : (
                            <ImageEditPanel />
                        )}

                        {/* Panel Close Button - Trapezoid shape */}
                        <button
                            onClick={() => setRightPanel(null)}
                            className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-full z-40 
                                       flex items-center justify-center
                                       transition-all duration-200
                                       hover:opacity-80 active:scale-95"
                            title="Close panel"
                        >
                            <svg
                                width="24"
                                height="80"
                                viewBox="0 0 24 80"
                                fill="none"
                            >
                                {/* Vertical trapezoid with subtle curves */}
                                <path
                                    d="M24 0 Q24 5 12 12 Q4 18 4 30 L4 50 Q4 62 12 68 Q24 75 24 80 Z"
                                    className="fill-white"
                                />
                                <path
                                    d="M24 0 Q24 5 12 12 Q4 18 4 30 L4 50 Q4 62 12 68 Q24 75 24 80"
                                    stroke="#E5E7EB"
                                    strokeWidth="1"
                                    fill="none"
                                />
                            </svg>
                            <ChevronRight size={14} className="absolute text-gray-400" />
                        </button>
                    </div>
                )}
            </div>

            {/* Toggle button when right panel is closed */}
            {!showRightPanel && (
                <button
                    onClick={() => setRightPanel('properties')}
                    className="fixed right-0 top-1/2 -translate-y-1/2 z-50
                               flex items-center justify-center
                               transition-all duration-200
                               hover:opacity-80 active:scale-95"
                    title="Show panel"
                >
                    <svg
                        width="24"
                        height="80"
                        viewBox="0 0 24 80"
                        fill="none"
                    >
                        {/* Vertical trapezoid with subtle curves - mirrored */}
                        <path
                            d="M24 0 Q24 5 12 12 Q4 18 4 30 L4 50 Q4 62 12 68 Q24 75 24 80 Z"
                            className="fill-white"
                        />
                        <path
                            d="M24 0 Q24 5 12 12 Q4 18 4 30 L4 50 Q4 62 12 68 Q24 75 24 80"
                            stroke="#E5E7EB"
                            strokeWidth="1"
                            fill="none"
                        />
                    </svg>
                    <ChevronLeft size={14} className="absolute text-gray-400" />
                </button>
            )}

            {/* Modals */}
            <ResizeModal />
            <ExportModal />

            {/* Preview Mode Overlay */}
            <PreviewMode />
        </div>
    );
}
