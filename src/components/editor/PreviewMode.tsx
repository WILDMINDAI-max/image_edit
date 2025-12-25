'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';

export function PreviewMode() {
    const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
    const previewPageIndex = useEditorStore((state) => state.previewPageIndex);
    const project = useEditorStore((state) => state.project);
    const closePreviewMode = useEditorStore((state) => state.closePreviewMode);
    const nextPreviewPage = useEditorStore((state) => state.nextPreviewPage);
    const prevPreviewPage = useEditorStore((state) => state.prevPreviewPage);
    const setActivePage = useEditorStore((state) => state.setActivePage);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get current preview page
    const pages = project?.pages ?? [];
    const currentPage = pages[previewPageIndex];
    const totalPages = pages.length;
    const canGoNext = previewPageIndex < totalPages - 1;
    const canGoPrev = previewPageIndex > 0;

    // Render the page to preview canvas
    const renderPreview = useCallback(async () => {
        if (!currentPage || !canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get container dimensions
        const containerWidth = container.clientWidth - 160; // Account for arrow buttons
        const containerHeight = container.clientHeight - 120; // Account for top/bottom spacing

        // Page dimensions
        const pageWidth = currentPage.width;
        const pageHeight = currentPage.height;

        // Calculate scale to fit page in container while maintaining aspect ratio
        const scaleX = containerWidth / pageWidth;
        const scaleY = containerHeight / pageHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Don't upscale beyond 100%

        // Set canvas size
        const displayWidth = Math.floor(pageWidth * scale);
        const displayHeight = Math.floor(pageHeight * scale);
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        // Draw background
        ctx.fillStyle = '#FFFFFF';
        if (currentPage.background.type === 'solid') {
            ctx.fillStyle = currentPage.background.color;
        }
        ctx.fillRect(0, 0, displayWidth, displayHeight);

        // Try to get the current fabric canvas and export it
        try {
            // Switch to preview page temporarily
            const originalPageId = project?.activePageId;
            if (currentPage.id !== originalPageId) {
                setActivePage(currentPage.id);
                // Wait for canvas to update
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const fabricCanvas = getFabricCanvas();
            const dataUrl = fabricCanvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: scale,
            });

            // Draw the exported canvas
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
            };
            img.src = dataUrl;

            // Restore original page if changed
            if (originalPageId && currentPage.id !== originalPageId) {
                // Don't restore - stay on preview page
            }
        } catch (error) {
            console.error('Error rendering preview:', error);
            // Fallback: just show background
        }
    }, [currentPage, project, setActivePage]);

    // Render preview when page changes
    useEffect(() => {
        if (isPreviewMode && currentPage) {
            // Small delay to ensure canvas is ready
            const timer = setTimeout(renderPreview, 150);
            return () => clearTimeout(timer);
        }
    }, [isPreviewMode, previewPageIndex, currentPage, renderPreview]);

    // Keyboard event handlers
    useEffect(() => {
        if (!isPreviewMode) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    closePreviewMode();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    prevPreviewPage();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextPreviewPage();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPreviewMode, closePreviewMode, nextPreviewPage, prevPreviewPage]);

    // Don't render if not in preview mode
    if (!isPreviewMode || !project) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
            ref={containerRef}
        >
            {/* Close hint at top */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-gray-400 text-sm bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span>Press</span>
                <kbd className="px-2 py-0.5 bg-gray-700 border border-gray-600 rounded text-gray-300 text-xs font-mono">Esc</kbd>
                <span>to exit</span>
            </div>

            {/* Close button */}
            <button
                onClick={closePreviewMode}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Close preview (Esc)"
            >
                <X size={24} />
            </button>

            {/* Left arrow - Previous page */}
            {totalPages > 1 && (
                <button
                    onClick={prevPreviewPage}
                    disabled={!canGoPrev}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all
                        ${canGoPrev
                            ? 'bg-gray-800/80 hover:bg-gray-700 text-white cursor-pointer'
                            : 'bg-gray-900/50 text-gray-600 cursor-not-allowed'}`}
                    title="Previous page (←)"
                >
                    <ChevronLeft size={32} />
                </button>
            )}

            {/* Preview Canvas */}
            <canvas
                ref={canvasRef}
                className="rounded-lg shadow-2xl"
            />

            {/* Right arrow - Next page */}
            {totalPages > 1 && (
                <button
                    onClick={nextPreviewPage}
                    disabled={!canGoNext}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all
                        ${canGoNext
                            ? 'bg-gray-800/80 hover:bg-gray-700 text-white cursor-pointer'
                            : 'bg-gray-900/50 text-gray-600 cursor-not-allowed'}`}
                    title="Next page (→)"
                >
                    <ChevronRight size={32} />
                </button>
            )}

            {/* Page indicator */}
            {totalPages > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {/* Page dots */}
                    <div className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full">
                        {pages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => useEditorStore.getState().setPreviewPage(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-all
                                    ${index === previewPageIndex
                                        ? 'bg-white scale-110'
                                        : 'bg-gray-500 hover:bg-gray-400'}`}
                                title={`Page ${index + 1}`}
                            />
                        ))}
                    </div>
                    {/* Page number */}
                    <div className="text-gray-400 text-sm bg-gray-800/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                        {previewPageIndex + 1} / {totalPages}
                    </div>
                </div>
            )}
        </div>
    );
}
