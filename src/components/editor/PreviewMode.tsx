'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { ChevronLeft, ChevronRight, X, Minus, Plus } from 'lucide-react';
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
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Local zoom state
    const [zoom, setZoom] = useState(100);
    const [isFitMode, setIsFitMode] = useState(true);

    // Get current preview page
    const pages = project?.pages ?? [];
    const currentPage = pages[previewPageIndex];
    const totalPages = pages.length;
    const canGoNext = previewPageIndex < totalPages - 1;
    const canGoPrev = previewPageIndex > 0;

    // Reset to fit mode when page changes
    useEffect(() => {
        setIsFitMode(true);
    }, [previewPageIndex]);

    // Calculate fit zoom level
    const calculateFitZoom = useCallback(() => {
        if (!currentPage || !scrollContainerRef.current) return 100;

        const container = scrollContainerRef.current;
        const padding = 64; // Padding
        const containerWidth = container.clientWidth - padding;
        const containerHeight = container.clientHeight - padding;

        const pageWidth = currentPage.width;
        const pageHeight = currentPage.height;

        if (containerWidth <= 0 || containerHeight <= 0) return 100;

        const scaleX = containerWidth / pageWidth;
        const scaleY = containerHeight / pageHeight;
        const scale = Math.min(scaleX, scaleY);

        return Math.floor(scale * 100);
    }, [currentPage]);

    // Auto-fit effect
    useEffect(() => {
        if (!isPreviewMode || !isFitMode || !currentPage) return;

        // Small delay to let layout settle
        const timer = setTimeout(() => {
            const fitZoom = calculateFitZoom();
            setZoom(fitZoom);
        }, 50);

        // Resize observer to keep fitting
        const resizeObserver = new ResizeObserver(() => {
            if (isFitMode) {
                const newFitZoom = calculateFitZoom();
                setZoom(newFitZoom);
            }
        });

        if (scrollContainerRef.current) {
            resizeObserver.observe(scrollContainerRef.current);
        }

        return () => {
            clearTimeout(timer);
            resizeObserver.disconnect();
        };
    }, [isPreviewMode, isFitMode, currentPage, calculateFitZoom]);

    // Zoom handlers
    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 10, 500));
        setIsFitMode(false);
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 10, 5));
        setIsFitMode(false);
    };

    const handleFit = () => {
        setIsFitMode(true);
        // Effect will trigger recalc
    };

    // Render the page to preview canvas
    const renderPreview = useCallback(async () => {
        if (!currentPage || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use current zoom state
        const scale = zoom / 100;

        // Page dimensions
        const pageWidth = currentPage.width;
        const pageHeight = currentPage.height;

        // Display dimensions (CSS pixels)
        const displayWidth = Math.floor(pageWidth * scale);
        const displayHeight = Math.floor(pageHeight * scale);

        // Handle High DPI (Retina) displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;

        // Force CSS dimensions
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        // Reset transform to identity before drawing
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Draw background
        ctx.fillStyle = '#FFFFFF';
        if (currentPage.background.type === 'solid') {
            ctx.fillStyle = currentPage.background.color;
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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

            // Get the working scale (virtual canvas scale) because the actual canvas might be smaller than logical size
            // We need to compensate for this in the multiplier to get the correct output resolution
            const workingScale = fabricCanvas.getWorkingScale ? fabricCanvas.getWorkingScale() : 1;

            const dataUrl = fabricCanvas.toDataURL({
                format: 'png',
                quality: 1,
                // Multiplier needs to account for layout scale, device pixel ratio, AND working scale compensation
                // Formula: (Target Scale / Working Scale) * DPR
                multiplier: (scale / workingScale) * dpr,
            });

            // Draw the exported canvas
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = dataUrl;

        } catch (error) {
            console.error('Error rendering preview:', error);
        }
    }, [currentPage, project, setActivePage, zoom]);

    // Render preview when zoom or page changes
    useEffect(() => {
        if (isPreviewMode && currentPage) {
            const timer = setTimeout(renderPreview, 150);
            return () => clearTimeout(timer);
        }
    }, [isPreviewMode, previewPageIndex, currentPage, renderPreview, zoom]); // Added zoom dependency

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
                case '+':
                case '=':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        handleZoomIn();
                    }
                    break;
                case '-':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        handleZoomOut();
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
    }, [isPreviewMode, closePreviewMode, nextPreviewPage, prevPreviewPage]); // Hook handles zoom logic internally via closure if needed, but easier to just use buttons. 
    // Note: closures might be stale for zoom state here, but that's fine for simple shortcuts.

    // Don't render if not in preview mode
    if (!isPreviewMode || !project) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black flex flex-col"
            ref={containerRef}
        >
            {/* Top Bar Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-50">

                {/* Close hint (Left aligned now to avoid center overlap if any) */}
                <div className="flex items-center gap-2 text-gray-400 text-sm bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg pointer-events-auto">
                    <span>Press</span>
                    <kbd className="px-2 py-0.5 bg-gray-700 border border-gray-600 rounded text-gray-300 text-xs font-mono">Esc</kbd>
                    <span>to exit</span>
                </div>

                {/* Right side controls */}
                <div className="flex items-center gap-3 pointer-events-auto">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2 bg-[#27272a] rounded-lg p-1 border border-gray-700">
                        <button
                            onClick={handleZoomOut}
                            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            title="Zoom Out"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="text-xs font-medium w-12 text-center text-gray-300 select-none">
                            {Math.round(zoom)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            title="Zoom In"
                        >
                            <Plus size={14} />
                        </button>
                        <div className="w-px h-4 bg-gray-700 mx-1" />
                        <button
                            onClick={handleFit}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded transition-colors ${isFitMode
                                ? 'bg-violet-500/20 text-violet-400'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                            title="Fit to Screen"
                        >
                            Fit
                        </button>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={closePreviewMode}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors bg-[#27272a] border border-gray-700"
                        title="Close preview"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content Area - Scrollable */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-auto flex items-center justify-center custom-scrollbar p-8 relative"
            >
                {/* Left arrow - Previous page (Fixed position relative to viewport) */}
                {totalPages > 1 && (
                    <button
                        onClick={prevPreviewPage}
                        disabled={!canGoPrev}
                        className={`fixed left-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all z-40
                            ${canGoPrev
                                ? 'bg-gray-800/80 hover:bg-gray-700 text-white cursor-pointer'
                                : 'bg-gray-900/50 text-gray-600 cursor-not-allowed hidden'}`}
                        title="Previous page (←)"
                    >
                        <ChevronLeft size={32} />
                    </button>
                )}

                {/* Preview Canvas Wrapper for Centering */}
                <div style={{ margin: 'auto' }}>
                    <canvas
                        ref={canvasRef}
                        className="rounded-lg shadow-2xl block"
                    />
                </div>

                {/* Right arrow - Next page (Fixed position) */}
                {totalPages > 1 && (
                    <button
                        onClick={nextPreviewPage}
                        disabled={!canGoNext}
                        className={`fixed right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all z-40
                            ${canGoNext
                                ? 'bg-gray-800/80 hover:bg-gray-700 text-white cursor-pointer'
                                : 'bg-gray-900/50 text-gray-600 cursor-not-allowed hidden'}`}
                        title="Next page (→)"
                    >
                        <ChevronRight size={32} />
                    </button>
                )}
            </div>

            {/* Bottom Bar: Page indicator */}
            {totalPages > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50 pointer-events-auto">
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
