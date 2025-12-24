'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getFabricCanvas, resetFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { useEditorStore, useActivePage } from '@/store/editorStore';
import { useCanvasStore } from '@/store/canvasStore';
import { CropOverlay } from './CropOverlay';
import { Lock } from 'lucide-react';

interface CanvasStageProps {
    className?: string;
}

// Lock Icon Overlay Component - Shows lock icon when locked element is clicked
function LockIconOverlay({ displayScale }: { displayScale: number }) {
    const activePage = useActivePage();
    const unlockElement = useCanvasStore((state) => state.unlockElement);
    const [clickedLockedId, setClickedLockedId] = useState<string | null>(null);

    // Auto-hide lock icon after 3 seconds
    useEffect(() => {
        if (clickedLockedId) {
            const timer = setTimeout(() => {
                setClickedLockedId(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [clickedLockedId]);

    if (!activePage) return null;

    const lockedElements = activePage.elements.filter(el => el.locked);

    if (lockedElements.length === 0) return null;

    return (
        <>
            {lockedElements.map(element => {
                const { x, y, width, height, scaleX, scaleY } = element.transform;

                // Calculate element bounds (center-based origin)
                const elementWidth = width * Math.abs(scaleX || 1);
                const elementHeight = height * Math.abs(scaleY || 1);

                // Element position (top-left corner)
                const elementLeft = (x - elementWidth / 2) * displayScale;
                const elementTop = (y - elementHeight / 2) * displayScale;
                const scaledWidth = elementWidth * displayScale;
                const scaledHeight = elementHeight * displayScale;

                // Lock icon position at top-right corner
                const iconX = elementLeft + scaledWidth - 8;
                const iconY = elementTop - 8;

                const isClicked = clickedLockedId === element.id;

                return (
                    <div key={`lock-area-${element.id}`}>
                        {/* Invisible clickable area over locked element */}
                        <div
                            className="absolute cursor-pointer"
                            style={{
                                left: elementLeft,
                                top: elementTop,
                                width: scaledWidth,
                                height: scaledHeight,
                                zIndex: 999,
                            }}
                            onClick={() => setClickedLockedId(element.id)}
                        />

                        {/* Lock icon - only visible when this element is clicked */}
                        {isClicked && (
                            <div
                                className="absolute cursor-pointer animate-in fade-in zoom-in duration-200"
                                style={{
                                    left: iconX,
                                    top: iconY,
                                    zIndex: 1001,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    unlockElement(element.id);
                                    setClickedLockedId(null);
                                }}
                                title="Click to unlock"
                            >
                                <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-all">
                                    <Lock size={16} className="text-purple-600" />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
}

export function CanvasStage({ className }: CanvasStageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const activePage = useActivePage();
    const zoom = useEditorStore((state) => state.zoom);
    const setZoom = useEditorStore((state) => state.setZoom);
    const fitTrigger = useEditorStore((state) => state.fitTrigger);
    const select = useCanvasStore((state) => state.select);
    const deselect = useCanvasStore((state) => state.deselect);

    // Calculate the scale to fit canvas within container
    const calculateFitZoom = useCallback((canvasWidth: number, canvasHeight: number) => {
        if (!containerRef.current) return 100;

        const containerRect = containerRef.current.getBoundingClientRect();
        const padding = 40; // Padding around the canvas

        const availableWidth = containerRect.width - padding * 2;
        const availableHeight = containerRect.height - padding * 2;

        if (availableWidth <= 0 || availableHeight <= 0) return 100;

        const scaleX = availableWidth / canvasWidth;
        const scaleY = availableHeight / canvasHeight;

        // Use the smaller scale to ensure canvas fits both dimensions
        const scale = Math.min(scaleX, scaleY);

        // Convert to percentage and clamp between 5% and 200%
        return Math.max(5, Math.min(200, Math.round(scale * 100)));
    }, []);

    // Update container size tracking
    useEffect(() => {
        const updateContainerSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setContainerSize({ width: rect.width, height: rect.height });
            }
        };

        updateContainerSize();

        const resizeObserver = new ResizeObserver(updateContainerSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    // Auto-fit zoom when page dimensions change or Fit button is clicked
    useEffect(() => {
        if (!activePage || containerSize.width === 0) return;

        const fitZoom = calculateFitZoom(activePage.width, activePage.height);
        setZoom(fitZoom, true); // Pass true to indicate this is a "fit" zoom
    }, [activePage?.width, activePage?.height, containerSize, fitTrigger, calculateFitZoom, setZoom]);

    // Initialize Fabric.js canvas
    useEffect(() => {
        if (!canvasRef.current || isInitialized) return;

        const fabricCanvas = getFabricCanvas();

        fabricCanvas.init(canvasRef.current, {
            width: activePage?.width || 1080,
            height: activePage?.height || 1080,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
            selection: true,
        });

        // Set up event handlers
        // Set up event handlers
        fabricCanvas.onSelectionChange = (selectedIds) => {
            if (selectedIds.length === 0) {
                deselect();
            } else {
                select(selectedIds);
            }
        };

        const updateStoreFromFabric = (id: string) => {
            const fabricObject = fabricCanvas.getObjectById(id);
            if (!fabricObject) return;

            // Get current active page ID
            const state = useEditorStore.getState();
            if (!state.project) return;

            const activePageId = state.project.activePageId;
            const activePage = state.project.pages.find(p => p.id === activePageId);
            if (!activePage) return;

            const element = activePage.elements.find(el => el.id === id);
            if (!element) return;

            // Update element in store with new transform values
            // We use updatePage directly to avoid circular updates if we used canvasStore.updateTransform
            // (since updateTransform also tries to update fabric object)
            const updatedElements = activePage.elements.map(el => {
                if (el.id === id) {
                    // For Textbox (text elements), we also need to sync width since Textbox
                    // changes width when resized, not scaleX/scaleY
                    const newWidth = fabricObject.width ?? el.transform.width;
                    const newHeight = fabricObject.height ?? el.transform.height;

                    return {
                        ...el,
                        transform: {
                            ...el.transform,
                            x: fabricObject.left ?? el.transform.x,
                            y: fabricObject.top ?? el.transform.y,
                            width: newWidth,
                            height: newHeight,
                            scaleX: fabricObject.scaleX ?? el.transform.scaleX,
                            scaleY: fabricObject.scaleY ?? el.transform.scaleY,
                            rotation: fabricObject.angle ?? el.transform.rotation,
                        }
                    };
                }
                return el;
            });

            state.updatePage(activePageId, { elements: updatedElements });
        };

        fabricCanvas.onObjectModified = updateStoreFromFabric;
        fabricCanvas.onObjectUpdating = updateStoreFromFabric;

        // Handle text content changes
        fabricCanvas.onTextChanged = (id: string, newText: string) => {
            console.log('[CanvasStage] Text changed for element:', id, 'new text:', newText);

            const state = useEditorStore.getState();
            if (!state.project) return;

            const activePageId = state.project.activePageId;
            const activePage = state.project.pages.find(p => p.id === activePageId);
            if (!activePage) return;

            const element = activePage.elements.find(el => el.id === id);
            if (!element || element.type !== 'text') return;

            // Update the text content in the store
            const updatedElements = activePage.elements.map(el => {
                if (el.id === id && el.type === 'text') {
                    return {
                        ...el,
                        content: newText,
                    };
                }
                return el;
            });

            console.log('[CanvasStage] Updating store with new text content');
            state.updatePage(activePageId, { elements: updatedElements });
        };

        setIsInitialized(true);

        return () => {
            resetFabricCanvas();
            setIsInitialized(false);
        };
    }, []);

    // Load page when it changes (page ID or dimensions change)
    useEffect(() => {
        if (!isInitialized || !activePage) return;

        const fabricCanvas = getFabricCanvas();
        fabricCanvas.loadPage(activePage);
    }, [activePage?.id, activePage?.width, activePage?.height, isInitialized]);

    // Update background immediately when it changes (for real-time gradient updates)
    useEffect(() => {
        if (!isInitialized || !activePage?.background) return;

        const fabricCanvas = getFabricCanvas();
        fabricCanvas.setBackground(activePage.background);
        fabricCanvas.render();
    }, [activePage?.background, isInitialized]);

    // Note: Visual zoom is handled by CSS transform on the wrapper div
    // Fabric.js setZoom would cause double-scaling, so we don't use it
    // The canvas operates in logical coordinates (page width/height)
    // useEffect(() => {
    //     if (!isInitialized) return;
    //     const fabricCanvas = getFabricCanvas();
    //     fabricCanvas.setZoom(zoom);
    // }, [zoom, isInitialized]);

    // Calculate displayed canvas dimensions
    const displayScale = zoom / 100;
    const canvasWidth = activePage?.width || 1080;
    const canvasHeight = activePage?.height || 1080;
    const displayWidth = canvasWidth * displayScale;
    const displayHeight = canvasHeight * displayScale;

    return (
        <div
            ref={containerRef}
            className={`relative bg-[#F0F1F5] overflow-hidden ${className}`}
        >
            {/* Centered canvas wrapper */}
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                    padding: '20px',
                }}
            >
                <div
                    className="shadow-2xl flex-shrink-0 relative"
                    style={{
                        width: displayWidth,
                        height: displayHeight,
                        maxWidth: '100%',
                        maxHeight: '100%',
                    }}
                >
                    <div
                        style={{
                            width: canvasWidth,
                            height: canvasHeight,
                            transform: `scale(${displayScale})`,
                            transformOrigin: 'top left',
                        }}
                    >
                        <canvas ref={canvasRef} />
                    </div>

                    {/* Crop Overlay */}
                    <CropOverlay
                        zoom={zoom}
                        containerOffset={{ x: 0, y: 0 }}
                    />

                    {/* Lock Icon Overlays for locked elements */}
                    <LockIconOverlay displayScale={displayScale} />
                </div>
            </div>
        </div>
    );
}
