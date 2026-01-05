'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { getFabricCanvas, resetFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { useEditorStore, useActivePage } from '@/store/editorStore';
import { useCanvasStore } from '@/store/canvasStore';
import { CropOverlay } from './CropOverlay';
import { Lock } from 'lucide-react';

interface CanvasStageProps {
    className?: string;
}

// Lock Icon Overlay Component - Shows lock icon when locked element is clicked
// FIXED: No longer blocks clicks on other elements - uses Fabric.js events instead
function LockIconOverlay({ displayScale }: { displayScale: number }) {
    const activePage = useActivePage();
    const unlockElement = useCanvasStore((state) => state.unlockElement);
    const [clickedLockedId, setClickedLockedId] = useState<string | null>(null);

    // Listen to Fabric.js mouse:down to detect clicks on locked elements
    useEffect(() => {
        const fabricCanvas = getFabricCanvas();
        const canvas = fabricCanvas.getCanvas();
        if (!canvas) return;

        const handleMouseDown = (e: any) => {
            // If there's a target and it's locked (evented: false won't fire, but we can check the point)
            const pointer = canvas.getPointer(e.e);

            // Find if click is on any locked element
            if (activePage) {
                // Check locked elements from top to bottom (reverse z-index order)
                const lockedElements = activePage.elements
                    .filter(el => el.locked)
                    .sort((a, b) => b.zIndex - a.zIndex); // Higher z-index first

                for (const element of lockedElements) {
                    const { x, y, width, height, scaleX, scaleY } = element.transform;
                    const elementWidth = width * Math.abs(scaleX || 1);
                    const elementHeight = height * Math.abs(scaleY || 1);

                    // Check if click is within element bounds
                    const left = x - elementWidth / 2;
                    const right = x + elementWidth / 2;
                    const top = y - elementHeight / 2;
                    const bottom = y + elementHeight / 2;

                    if (pointer.x >= left && pointer.x <= right &&
                        pointer.y >= top && pointer.y <= bottom) {
                        // Only show lock if no selectable object is at this position
                        // This allows elements on top to be selected
                        const targetAtPoint = canvas.findTarget(e.e, false);
                        if (!targetAtPoint || (targetAtPoint as any).data?.id === element.id) {
                            setClickedLockedId(element.id);
                            return;
                        }
                    }
                }
            }

            // Clear if clicked elsewhere
            setClickedLockedId(null);
        };

        canvas.on('mouse:down', handleMouseDown);

        return () => {
            canvas.off('mouse:down', handleMouseDown);
        };
    }, [activePage]);

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

    // Only render the lock icon for the clicked locked element
    const clickedElement = clickedLockedId
        ? activePage.elements.find(el => el.id === clickedLockedId && el.locked)
        : null;

    if (!clickedElement) return null;

    const { x, y, width, height, scaleX, scaleY } = clickedElement.transform;
    const elementWidth = width * Math.abs(scaleX || 1);
    const elementHeight = height * Math.abs(scaleY || 1);
    const elementLeft = (x - elementWidth / 2) * displayScale;
    const elementTop = (y - elementHeight / 2) * displayScale;
    const scaledWidth = elementWidth * displayScale;

    // Lock icon position at top-right corner
    const iconX = elementLeft + scaledWidth - 8;
    const iconY = elementTop - 8;

    return (
        <div
            className="absolute cursor-pointer animate-in fade-in zoom-in duration-200"
            style={{
                left: iconX,
                top: iconY,
                zIndex: 1001,
            }}
            onClick={(e) => {
                e.stopPropagation();
                unlockElement(clickedLockedId!);
                setClickedLockedId(null);
            }}
            title="Click to unlock"
        >
            <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-all">
                <Lock size={16} className="text-purple-600" />
            </div>
        </div>
    );
}

export function CanvasStage({ className }: CanvasStageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    // Track workingScale to force re-render when canvas is resized
    const [workingScaleState, setWorkingScaleState] = useState(1);

    const activePage = useActivePage();
    const zoom = useEditorStore((state) => state.zoom);
    const setZoom = useEditorStore((state) => state.setZoom);
    const fitTrigger = useEditorStore((state) => state.fitTrigger);
    const snapToGuides = useEditorStore((state) => state.snapToGuides);
    const isExportModalOpen = useEditorStore((state) => state.isExportModalOpen);
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

    // Handle wheel/trackpad pinch-zoom for canvas zoom control
    // This prevents browser zoom and instead zooms only the canvas
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            // Check if this is a pinch-zoom gesture (ctrlKey is true for trackpad pinch)
            // or a regular scroll with Ctrl held
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                e.stopPropagation();

                // Calculate zoom change based on deltaY
                // Negative deltaY = zoom in, positive deltaY = zoom out
                const zoomSensitivity = 0.5; // Adjust sensitivity as needed
                const delta = -e.deltaY * zoomSensitivity;

                // Get current zoom and calculate new zoom
                const currentZoom = useEditorStore.getState().zoom;
                const newZoom = Math.max(5, Math.min(500, currentZoom + delta));

                // Update zoom (passing false to indicate manual zoom, not fit)
                setZoom(newZoom, false);
            }
        };

        // Use passive: false to allow preventDefault on wheel events
        container.addEventListener('wheel', handleWheel, { passive: false });

        // Also prevent default on the document when hovering over canvas area
        // This catches cases where the event might bubble
        const handleDocumentWheel = (e: WheelEvent) => {
            if ((e.ctrlKey || e.metaKey) && container.contains(e.target as Node)) {
                e.preventDefault();
            }
        };
        document.addEventListener('wheel', handleDocumentWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
            document.removeEventListener('wheel', handleDocumentWheel);
        };
    }, [setZoom]);

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

            // Fabric's zoom handles virtual canvas scaling, so coordinates are already in logical space
            // Update element in store with new transform values
            const updatedElements = activePage.elements.map(el => {
                if (el.id === id) {
                    // Get displayed dimensions from Fabric (visual size)
                    const fabricVisualWidth = fabricObject.getScaledWidth ? fabricObject.getScaledWidth() : (fabricObject.width || 1) * (fabricObject.scaleX || 1);
                    const fabricVisualHeight = fabricObject.getScaledHeight ? fabricObject.getScaledHeight() : (fabricObject.height || 1) * (fabricObject.scaleY || 1);

                    // Calculate position
                    let x = fabricObject.left ?? el.transform.x;
                    let y = fabricObject.top ?? el.transform.y;
                    let rotation = fabricObject.angle ?? el.transform.rotation;

                    // If object is in a group (ActiveSelection), calculate absolute coordinates and scale
                    // The group's transform compounds on top of individual transforms, so we must decompose
                    let decomposedScale: { scaleX: number; scaleY: number } | null = null;
                    if (fabricObject.group) {
                        const matrix = fabricObject.calcTransformMatrix();
                        const options = fabric.util.qrDecompose(matrix);
                        x = options.translateX;
                        y = options.translateY;
                        rotation = options.angle;
                        // Extract scale from decomposed matrix (includes group's compound scaling)
                        decomposedScale = { scaleX: options.scaleX, scaleY: options.scaleY };
                    }

                    // Standardized update for ALL element types:
                    // Always save BASE dimensions and Scale separately
                    // This prevents double-scaling issues and ensures consistent rendering
                    // newWidth/Height = unscaled dimensions (base)
                    // newScaleX/Y = scale factor

                    const newWidth = fabricObject.width || el.transform.width;
                    const newHeight = fabricObject.height || el.transform.height;
                    // Use decomposed scale if in group, otherwise use object's direct scale
                    const newScaleX = decomposedScale ? decomposedScale.scaleX : (fabricObject.scaleX || 1);
                    const newScaleY = decomposedScale ? decomposedScale.scaleY : (fabricObject.scaleY || 1);

                    // Base update for all element types
                    const baseUpdate = {
                        ...el,
                        transform: {
                            ...el.transform,
                            x,
                            y,
                            width: newWidth,
                            height: newHeight,
                            scaleX: newScaleX,
                            scaleY: newScaleY,
                            rotation,
                        }
                    };

                    // Special handling for line elements - sync endpoint coordinates
                    if (el.type === 'line') {
                        const line = fabricObject as fabric.Line;
                        return {
                            ...baseUpdate,
                            x1: line.x1 ?? (el as any).x1,
                            y1: line.y1 ?? (el as any).y1,
                            x2: line.x2 ?? (el as any).x2,
                            y2: line.y2 ?? (el as any).y2,
                        };
                    }

                    return baseUpdate;
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
        fabricCanvas.loadPage(activePage).then(() => {
            // Update workingScale state after page is loaded to trigger re-render
            setWorkingScaleState(fabricCanvas.getWorkingScale());
        });
    }, [activePage?.id, activePage?.width, activePage?.height, isInitialized]);

    // Re-sync canvas state when export modal closes
    // Export modal calls loadPage independently, so we need to refresh our state after it closes
    useEffect(() => {
        if (!isInitialized || !activePage || isExportModalOpen) return;

        // When modal closes, reload the page to ensure canvas is in correct state
        const fabricCanvas = getFabricCanvas();
        fabricCanvas.loadPage(activePage).then(() => {
            setWorkingScaleState(fabricCanvas.getWorkingScale());
        });
    }, [isExportModalOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    // Update background immediately when it changes (for real-time gradient updates)
    useEffect(() => {
        if (!isInitialized || !activePage?.background) return;

        const fabricCanvas = getFabricCanvas();
        fabricCanvas.setBackground(activePage.background);
        fabricCanvas.render();
    }, [activePage?.background, isInitialized]);

    // Sync element properties (visibility, locked) from store to Fabric
    // This allows sidebar toggles to update the canvas
    useEffect(() => {
        if (!isInitialized || !activePage) return;

        const fabricCanvas = getFabricCanvas();
        let needsRender = false;

        activePage.elements.forEach(element => {
            const fabricObject = fabricCanvas.getObjectById(element.id);
            if (fabricObject) {
                // Sync visibility
                if (fabricObject.visible !== element.visible) {
                    fabricObject.visible = element.visible;
                    needsRender = true;
                }

                // Sync locked status
                const isLocked = element.locked;
                // Check if lock state matches (checking just one property is enough to detect change)
                if (fabricObject.lockMovementX !== isLocked) {
                    fabricObject.lockMovementX = isLocked;
                    fabricObject.lockMovementY = isLocked;
                    fabricObject.lockRotation = isLocked;
                    fabricObject.lockScalingX = isLocked;
                    fabricObject.lockScalingY = isLocked;

                    // Also update visually if needed (e.g. selection handles)
                    if (isLocked) {
                        fabricObject.hasControls = false;
                    } else {
                        // Restore controls only if it's selected (Fabric handles this logic mostly, but good to be safe)
                        fabricObject.hasControls = true;
                    }
                    needsRender = true;
                }
            }
        });

        if (needsRender) {
            fabricCanvas.render();
        }
    }, [activePage?.elements, isInitialized]);

    // Sync snapToGuides setting from store to FabricCanvas
    useEffect(() => {
        if (!isInitialized) return;
        const fabricCanvas = getFabricCanvas();
        fabricCanvas.setSnapToGuides(snapToGuides);
    }, [snapToGuides, isInitialized]);

    // Note: Visual zoom is handled by CSS transform on the wrapper div
    // Fabric.js setZoom would cause double-scaling, so we don't use it
    // The canvas operates in logical coordinates (page width/height)
    // useEffect(() => {
    //     if (!isInitialized) return;
    //     const fabricCanvas = getFabricCanvas();
    //     fabricCanvas.setZoom(zoom);
    // }, [zoom, isInitialized]);

    // Calculate displayed canvas dimensions
    // For virtual canvas, we need to account for workingScale
    const logicalWidth = activePage?.width || 1080;
    const logicalHeight = activePage?.height || 1080;

    // Use workingScale from state (updated after loadPage completes)
    // This ensures React re-renders with correct dimensions after resize
    const workingScale = workingScaleState;
    const workingWidth = logicalWidth * workingScale;
    const workingHeight = logicalHeight * workingScale;

    // Combined display scale = user zoom * 1 (the canvas is already at working size)
    // We want the visual size to be based on logical dimensions at user zoom
    const userZoom = zoom / 100;
    // Scale from working dimensions to logical display size
    const displayWidth = logicalWidth * userZoom;
    const displayHeight = logicalHeight * userZoom;
    // CSS transform scale to apply to the working canvas to match display size
    const cssScale = displayWidth / workingWidth;

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
                            width: workingWidth,
                            height: workingHeight,
                            transform: `scale(${cssScale})`,
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
                    <LockIconOverlay displayScale={userZoom} />
                </div>
            </div>
        </div>
    );
}
