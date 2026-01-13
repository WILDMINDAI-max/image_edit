'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { ChevronLeft, ChevronRight, X, Plus, Minus } from 'lucide-react';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';

export function PreviewMode() {
    const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
    const previewPageIndex = useEditorStore((state) => state.previewPageIndex);
    const project = useEditorStore((state) => state.project);
    const closePreviewMode = useEditorStore((state) => state.closePreviewMode);
    const nextPreviewPage = useEditorStore((state) => state.nextPreviewPage);
    const prevPreviewPage = useEditorStore((state) => state.prevPreviewPage);
    const setActivePage = useEditorStore((state) => state.setActivePage);

    // Zoom state
    const zoom = useEditorStore((state) => state.zoom);
    const isFitMode = useEditorStore((state) => state.isFitMode);
    const zoomIn = useEditorStore((state) => state.zoomIn);
    const zoomOut = useEditorStore((state) => state.zoomOut);
    const fitToScreen = useEditorStore((state) => state.fitToScreen);


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
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use the global zoom level for the preview scale
        const userZoom = zoom / 100;
        const pageWidth = currentPage.width;
        const pageHeight = currentPage.height;

        // Display dimensions (CSS pixels)
        const displayWidth = Math.floor(pageWidth * userZoom);
        const displayHeight = Math.floor(pageHeight * userZoom);

        // Handle High DPI (Retina) displays
        const dpr = window.devicePixelRatio || 1;

        // Update canvas resolution
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;

        // Force CSS dimensions
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        // Reset transform to identity before drawing
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Draw background (placeholder until snapshot arrives)
        ctx.fillStyle = currentPage.background.type === 'solid' ? currentPage.background.color : '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Take snapshot from Fabric
        try {
            // Switch to preview page temporarily if needed
            const originalPageId = project?.activePageId;
            if (currentPage.id !== originalPageId) {
                setActivePage(currentPage.id);
                // Give engine time to switch
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            const fabricCanvas = getFabricCanvas();

            // Ensure fabric canvas is also at the correct zoom level for the highest quality snapshot
            // This syncs the (hidden) editor canvas with the preview's zoom
            fabricCanvas.setZoom(zoom);

            const dataUrl = fabricCanvas.toDataURL({
                format: 'png',
                quality: 1,
                // Since the fabric canvas is already at the correct physical size (including dpr handling internally),
                // the multiplier should just be 1 (or dpr if we want the backing store size)
                // Actually, Fabric's setZoom(zoom) makes its intrinsic width = logicalWidth * (zoom/100).
                // So multiplier: dpr handles the retina clarity.
                multiplier: dpr,
            });


            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = dataUrl;

        } catch (error) {
            console.error('Error rendering preview:', error);
        }
    }, [currentPage, project, setActivePage, zoom]);

    // Re-fit calculation specifically for preview window
    const handleFit = useCallback(() => {
        if (!currentPage || !containerRef.current) return;

        const container = containerRef.current;
        const padding = 160; // Margin around the preview
        const availableWidth = container.clientWidth - padding;
        const availableHeight = container.clientHeight - padding;

        const scaleX = availableWidth / currentPage.width;
        const scaleY = availableHeight / currentPage.height;
        const fitScale = Math.min(scaleX, scaleY);

        const fitZoom = Math.max(5, Math.min(500, Math.round(fitScale * 100)));
        useEditorStore.getState().setZoom(fitZoom, true);
    }, [currentPage]);

    // Initial fit when entering preview or changing page
    useEffect(() => {
        if (isPreviewMode && currentPage) {
            handleFit();
        }
    }, [isPreviewMode, previewPageIndex, currentPage?.id]); // Only on initialization/page switch

    // Render preview when page or zoom changes
    useEffect(() => {
        if (isPreviewMode && currentPage) {
            // Speed up response time for smoother zooming
            renderPreview();
        }
    }, [isPreviewMode, previewPageIndex, currentPage, zoom, renderPreview]);


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
                case '=':
                case '+':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        zoomIn();
                    }
                    break;
                case '-':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        zoomOut();
                    }
                    break;
                case '0':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        handleFit();
                    }
                    break;

            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPreviewMode, closePreviewMode, nextPreviewPage, prevPreviewPage, zoomIn, zoomOut, handleFit]);


    // Don't render if not in preview mode
    if (!isPreviewMode || !project) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black flex flex-col overflow-auto custom-scrollbar"
            ref={containerRef}
        >
            {/* Top Bar - Zoom Controls and Close Button */}
            <div className="fixed top-0 left-0 right-0 h-16 px-4 flex items-center justify-between z-50 pointer-events-none">
                {/* Left - Page Info */}
                <div className="flex-1 flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg text-gray-300 text-sm font-medium pointer-events-auto">
                        {project.name}
                    </div>
                </div>

                {/* Center - Close hint */}
                <div className="hidden md:flex items-center gap-2 text-gray-400 text-xs bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg pointer-events-auto">
                    <span>Press</span>
                    <kbd className="px-2 py-0.5 bg-gray-700 border border-gray-600 rounded text-gray-300 text-[10px] font-mono">Esc</kbd>
                    <span>to exit</span>
                </div>

                {/* Right - Zoom Controls and Close Button */}
                <div className="flex-1 flex items-center justify-end gap-3 pointer-events-auto">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2 bg-gray-800/90 backdrop-blur-md rounded-xl p-1.5 border border-gray-700/50 shadow-2xl">
                        <button
                            onClick={zoomOut}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all active:scale-95"
                            title="Zoom Out (Ctrl -)"
                        >
                            <Minus size={16} aria-hidden="true" />
                        </button>
                        <span className="text-xs font-bold w-12 text-center text-gray-200 tabular-nums">
                            {Math.round(zoom)}%
                        </span>
                        <button
                            onClick={zoomIn}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all active:scale-95"
                            title="Zoom In (Ctrl +)"
                        >
                            <Plus size={16} aria-hidden="true" />
                        </button>
                        <div className="w-px h-4 bg-gray-700/50 mx-1" />
                        <button
                            onClick={handleFit}
                            className={`text-[10px] font-bold px-3 py-1 rounded-lg transition-all active:scale-95 ${isFitMode
                                ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                            title="Fit to Screen (Ctrl 0)"
                        >
                            Fit
                        </button>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={closePreviewMode}
                        className="p-2.5 text-gray-400 hover:text-white bg-gray-800/90 backdrop-blur-md border border-gray-700/50 rounded-xl transition-all hover:bg-red-500/10 hover:border-red-500/50 active:scale-95"
                        title="Close preview (Esc)"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Centered Scrollable Area */}
            <div className="min-w-full min-h-full flex items-center justify-center p-20 flex-shrink-0">
                {/* Left arrow - Previous page */}
                {totalPages > 1 && (
                    <button
                        onClick={prevPreviewPage}
                        disabled={!canGoPrev}
                        className={`fixed left-8 top-1/2 -translate-y-1/2 p-4 rounded-2xl transition-all z-40 shadow-2xl
                            ${canGoPrev
                                ? 'bg-gray-800/90 hover:bg-gray-700 text-white cursor-pointer backdrop-blur-md border border-gray-700/50 hover:scale-110 active:scale-95'
                                : 'bg-gray-900/50 text-gray-600 cursor-not-allowed border border-gray-800/50'}`}
                        title="Previous page (←)"
                    >
                        <ChevronLeft size={32} />
                    </button>
                )}

                {/* Preview Canvas */}
                <div className="relative group">
                    <canvas
                        ref={canvasRef}
                        className="rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-white transition-shadow duration-300"
                    />

                    {/* Shadow overlay to make borders distinct */}
                    <div className="absolute inset-0 pointer-events-none rounded-xl border border-white/10" />
                </div>

                {/* Right arrow - Next page */}
                {totalPages > 1 && (
                    <button
                        onClick={nextPreviewPage}
                        disabled={!canGoNext}
                        className={`fixed right-8 top-1/2 -translate-y-1/2 p-4 rounded-2xl transition-all z-40 shadow-2xl
                            ${canGoNext
                                ? 'bg-gray-800/90 hover:bg-gray-700 text-white cursor-pointer backdrop-blur-md border border-gray-700/50 hover:scale-110 active:scale-95'
                                : 'bg-gray-900/50 text-gray-600 cursor-not-allowed border border-gray-800/50'}`}
                        title="Next page (→)"
                    >
                        <ChevronRight size={32} />
                    </button>
                )}
            </div>

            {/* Page indicator (Bottom) */}
            {totalPages > 1 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40">
                    <div className="flex items-center gap-2.5 bg-gray-800/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-gray-700/50 shadow-2xl">

                        {pages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => useEditorStore.getState().setPreviewPage(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300
                                    ${index === previewPageIndex
                                        ? 'bg-violet-500 scale-125 ring-4 ring-violet-500/20'
                                        : 'bg-gray-600 hover:bg-gray-400 hover:scale-110'}`}
                                title={`Page ${index + 1}`}
                            />
                        ))}
                        <div className="w-px h-4 bg-gray-700/50 mx-1" />
                        <span className="text-gray-400 text-xs font-bold tabular-nums">
                            {previewPageIndex + 1} <span className="text-gray-600 font-normal">/</span> {totalPages}
                        </span>

                    </div>
                </div>
            )}
        </div>
    );
}
