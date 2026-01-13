'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { getFabricCanvas, resetFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { useEditorStore, useActivePage } from '@/store/editorStore';
import { useCanvasStore } from '@/store/canvasStore';
import { useHistoryStore } from '@/store/historyStore';
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

    // Ref to track selection originating from Fabric.js (to prevent sync loops)
    const lastFabricSelectionRef = useRef<string[]>([]);

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

        // Use clientWidth/Height to exclude scrollbars if present
        const availableWidth = containerRef.current.clientWidth - 160; // 80px (p-20) * 2
        const availableHeight = containerRef.current.clientHeight - 160;

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
    // UPDATED: Only triggers if isFitMode is true or the user explicitly clicks Fit (fitTrigger)
    // Auto-fit zoom when page dimensions change or Fit button is clicked
    // UPDATED: Only triggers if isFitMode is true or the user explicitly clicks Fit (fitTrigger)
    useEffect(() => {
        if (!activePage || !containerRef.current) return;

        // If we am NOT in fit mode and this wasn't triggered by a Fit button click, don't auto-reset zoom
        // This allows manual zoom (In/Out/Pinch) to persist without being overridden
        const isExplicitFit = fitTrigger > 0;
        const prevFitTrigger = (containerRef.current as any)._lastFitTrigger || 0;
        const fitButtonClicked = fitTrigger !== prevFitTrigger;
        (containerRef.current as any)._lastFitTrigger = fitTrigger;

        if (useEditorStore.getState().isFitMode || fitButtonClicked) {
            console.log('[CanvasStage] Calculating Fit zoom...', { isFitMode: useEditorStore.getState().isFitMode, fitButtonClicked });
            const fitZoom = calculateFitZoom(activePage.width, activePage.height);
            setZoom(fitZoom, true);
        }
    }, [activePage?.width, activePage?.height, fitTrigger, calculateFitZoom, setZoom]);

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
            // Update ref BEFORE calling select so the sync useEffect knows this came from Fabric
            lastFabricSelectionRef.current = [...selectedIds];
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
        fabricCanvas.onHistoryPush = (label) => {
            useHistoryStore.getState().pushState(label);
        };

        // Handle text content changes
        fabricCanvas.onTextChanged = (id: string, newText: string) => {
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

            state.updatePage(activePageId, { elements: updatedElements });
            // Manual text changes should also be recorded in history
            useHistoryStore.getState().pushState('Edit Text');
        };

        setIsInitialized(true);

        return () => {
            resetFabricCanvas();
            setIsInitialized(false);
        };
    }, []);

    // Load page when it changes (page ID or dimensions change)
    // Removed activePage.updatedAt and activePage.elements check to prevent full reload on property changes
    // The "Reconciler" effect below handles property updates in-place
    useEffect(() => {
        if (!isInitialized || !activePage) return;

        // Use a ref to track the last loaded page ID to strictly prevent reload unless ID changes
        // or dimensions change (which require resize)
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

    // Sync element properties (visibility, locked, styles, text) from store to Fabric
    // This acts as a "Reconciler" to update the canvas without clearing/reloading
    useEffect(() => {
        if (!isInitialized || !activePage) return;

        const fabricCanvas = getFabricCanvas();
        const canvas = fabricCanvas.getCanvas();
        if (!canvas) return;

        let needsRender = false;

        // 1. Update existing objects and Add new ones
        activePage.elements.forEach(element => {
            const fabricObject = fabricCanvas.getObjectById(element.id);

            if (fabricObject) {
                // UPDATE EXISTING OBJECT
                let changed = false;

                // Sync Visibility
                if (fabricObject.visible !== element.visible) {
                    fabricObject.visible = element.visible;
                    changed = true;
                }

                // Sync Locked Status
                const isLocked = element.locked;
                if (fabricObject.lockMovementX !== isLocked) {
                    fabricObject.lockMovementX = isLocked;
                    fabricObject.lockMovementY = isLocked;
                    fabricObject.lockRotation = isLocked;
                    fabricObject.lockScalingX = isLocked;
                    fabricObject.lockScalingY = isLocked;
                    fabricObject.hasControls = !isLocked;
                    changed = true;
                }

                // Sync Transform (Check diffs to avoid jitter during drag)
                // We trust the store as the source of truth, but if the diff is tiny (floating point), skip
                // Ideally, during a drag, the store shouldn't update, so this is for Undo/Redo/Sidebar
                const diff = (a: number | undefined, b: number) => Math.abs((a || 0) - b) > 0.01;

                // For position, we need to handle grouping logic if inside group?
                // For now, assume flat structure or Fabric handles relative coords if we set properties?
                // Fabric's object commands usually work globally if not grouped, or relative if grouped?
                // Actually, our store stores absolute coordinates (usually).
                // If the object is in a group (ActiveSelection), Fabric manages it differently.
                // But for sidebar updates (single selection), it's fine.

                if (diff(fabricObject.left, element.transform.x)) { fabricObject.set('left', element.transform.x); changed = true; }
                if (diff(fabricObject.top, element.transform.y)) { fabricObject.set('top', element.transform.y); changed = true; }
                if (diff(fabricObject.angle, element.transform.rotation)) { fabricObject.set('angle', element.transform.rotation); changed = true; }
                // Use scaleX/scaleY directly
                // Note: Fabric objects might have width/height + scale. Store has width/height + scale.
                // We sync properties directly.
                if (diff(fabricObject.scaleX, element.transform.scaleX)) { fabricObject.set('scaleX', element.transform.scaleX); changed = true; }
                if (diff(fabricObject.scaleY, element.transform.scaleY)) { fabricObject.set('scaleY', element.transform.scaleY); changed = true; }


                // Sync Styles
                if (fabricObject.opacity !== element.style.opacity) { fabricObject.set('opacity', element.style.opacity); changed = true; }
                const newFill = element.style.fill as string || '';
                const newStroke = element.style.stroke as string || undefined;
                if (fabricObject.fill !== newFill) { fabricObject.set('fill', newFill); changed = true; }
                if (fabricObject.stroke !== newStroke) { fabricObject.set('stroke', newStroke); changed = true; }
                if (fabricObject.strokeWidth !== element.style.strokeWidth) { fabricObject.set('strokeWidth', element.style.strokeWidth); changed = true; }

                // Sync Text Properties
                if (element.type === 'text' && fabricObject instanceof fabric.Textbox) {
                    const textEl = element as any;
                    if (fabricObject.text !== textEl.content) { fabricObject.set('text', textEl.content); changed = true; }
                    if (fabricObject.fontFamily !== textEl.textStyle.fontFamily) { fabricObject.set('fontFamily', textEl.textStyle.fontFamily); changed = true; }
                    if (fabricObject.fontSize !== textEl.textStyle.fontSize) { fabricObject.set('fontSize', textEl.textStyle.fontSize); changed = true; }
                    if (fabricObject.fontWeight !== textEl.textStyle.fontWeight) { fabricObject.set('fontWeight', textEl.textStyle.fontWeight); changed = true; }
                    if (fabricObject.fontStyle !== textEl.textStyle.fontStyle) { fabricObject.set('fontStyle', textEl.textStyle.fontStyle); changed = true; }
                    if (fabricObject.textAlign !== textEl.textStyle.textAlign) { fabricObject.set('textAlign', textEl.textStyle.textAlign); changed = true; }
                }

                if (changed) {
                    fabricObject.setCoords();
                    needsRender = true;
                }

            } else {
                // ADD NEW OBJECT (e.g. from Undo/Redo or "Add Text")
                // Only add if it's strictly not there.
                console.log('[CanvasStage] Reconciler: Adding missing object', element.id);
                fabricCanvas.addElement(element).then(() => {
                    // Force render after async add
                    fabricCanvas.render();
                });
                // We don't set needsRender here because addElement is async/handles it.
            }
        });

        // 2. Remove deleted objects (e.g. from Undo/Redo)
        // Find objects in Fabric that are NOT in the store elements list
        // (and have an ID, implying they are managed objects)
        const fabricObjects = canvas.getObjects();
        const elementIds = new Set(activePage.elements.map(e => e.id));

        fabricObjects.forEach(obj => {
            const id = (obj as any).data?.id;
            if (id && !elementIds.has(id)) {
                console.log('[CanvasStage] Reconciler: Removing deleted object', id);
                canvas.remove(obj);
                needsRender = true;
            }
        });

        if (needsRender) {
            canvas.requestRenderAll();
        }
    }, [activePage?.elements, isInitialized]);

    // Sync snapToGuides setting from store to FabricCanvas
    useEffect(() => {
        if (!isInitialized) return;
        const fabricCanvas = getFabricCanvas();
        fabricCanvas.setSnapToGuides(snapToGuides);
    }, [snapToGuides, isInitialized]);

    // Sync selectedIds from store to Fabric.js canvas
    // This enables clicking a layer in the Layers panel to select it on canvas
    const selectedIds = useCanvasStore((state) => state.selectedIds);

    useEffect(() => {
        if (!isInitialized) return;

        const fabricCanvas = getFabricCanvas();
        const canvas = fabricCanvas.getCanvas();
        if (!canvas) return;

        // Check if this selection change originated from Fabric.js itself
        // If so, skip to avoid infinite loop
        const currentFabricSelection = lastFabricSelectionRef.current;
        if (
            selectedIds.length === currentFabricSelection.length &&
            selectedIds.every((id, i) => currentFabricSelection[i] === id)
        ) {
            return; // Selection unchanged or came from Fabric, skip sync
        }

        // Update ref to track this selection
        lastFabricSelectionRef.current = [...selectedIds];

        // First, discard any existing selection without triggering events
        canvas.discardActiveObject();

        if (selectedIds.length === 0) {
            // Already discarded above
            canvas.requestRenderAll();
        } else if (selectedIds.length === 1) {
            // Single selection
            const fabricObject = fabricCanvas.getObjectById(selectedIds[0]);
            if (fabricObject) {
                canvas.setActiveObject(fabricObject);
                canvas.requestRenderAll();
            }
        } else {
            // Multi-selection: create ActiveSelection
            const objects = selectedIds
                .map(id => fabricCanvas.getObjectById(id))
                .filter((obj): obj is fabric.Object => obj !== undefined);

            if (objects.length > 0) {
                // Standard Fabric.js multi-selection approach
                const selection = new fabric.ActiveSelection(objects, { canvas });
                canvas.setActiveObject(selection);
                canvas.requestRenderAll();
            }
        }
    }, [selectedIds, isInitialized]);

    // Keyboard Shortcuts: Zoom to Selection (z), Select All (Ctrl+A), Delete
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input, textarea, or contentEditable element
            const activeEl = document.activeElement;
            const isInput = activeEl instanceof HTMLInputElement ||
                activeEl instanceof HTMLTextAreaElement ||
                (activeEl as HTMLElement)?.isContentEditable;

            if (isInput) return;

            // 'z' key: Zoom to Selection
            if (e.key.toLowerCase() === 'z' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
                const fabricCanvas = getFabricCanvas();
                const bounds = fabricCanvas.getSelectionBounds();

                if (bounds && containerRef.current) {
                    const container = containerRef.current;
                    const viewportWidth = container.clientWidth;
                    const viewportHeight = container.clientHeight;
                    // Padding around the selection (e.g. 50px)
                    const padding = 50;
                    const availableWidth = viewportWidth - (padding * 2);
                    const availableHeight = viewportHeight - (padding * 2);

                    // Calculate zoom to fit
                    const scaleX = availableWidth / bounds.width;
                    const scaleY = availableHeight / bounds.height;
                    let targetZoom = Math.min(scaleX, scaleY) * 100;

                    // Clamp zoom
                    targetZoom = Math.min(Math.max(targetZoom, 10), 500);

                    // Apply zoom
                    useEditorStore.getState().setZoom(targetZoom, false); // false = not "Fit to Screen" mode

                    // Scroll to center the selection
                    // We need to wait for the zoom to apply and layout to update
                    requestAnimationFrame(() => {
                        if (!containerRef.current) return;

                        // Calculate center of bounds in logical coords
                        const centerX = bounds.left + bounds.width / 2;
                        const centerY = bounds.top + bounds.height / 2;

                        // Convert to new zoomed coords
                        const zoomFactor = targetZoom / 100;
                        const zoomedX = centerX * zoomFactor;
                        const zoomedY = centerY * zoomFactor;

                        // Container padding (p-20 = 80px)
                        const containerPadding = 80;

                        // Scroll position = (zoomed Center) + containerPadding - (viewport / 2)
                        const scrollLeft = zoomedX + containerPadding - (viewportWidth / 2);
                        const scrollTop = zoomedY + containerPadding - (viewportHeight / 2);

                        containerRef.current.scrollTo({
                            left: scrollLeft,
                            top: scrollTop,
                            behavior: 'smooth'
                        });
                    });
                }
            }

            // Ctrl+A: Select All
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                e.preventDefault(); // Prevent default text selection
                useCanvasStore.getState().selectAll();
            }

            // Delete / Backspace: Delete Selection
            // Check for Backspace specifically to ensure we don't accidentally navigate back
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const selectedIds = useCanvasStore.getState().selectedIds;
                if (selectedIds.length > 0) {
                    e.preventDefault(); // Prevent browser back navigation on Backspace
                    useCanvasStore.getState().removeElement(selectedIds);
                }
            }

            // Esc: Deselect All
            if (e.key === 'Escape') {
                useCanvasStore.getState().deselect();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isInitialized]);

    // NEW: Apply zoom using Fabric.js native zoom for crisp vector rendering
    useEffect(() => {
        if (!isInitialized || !activePage) return;

        const fabricCanvas = getFabricCanvas();
        // Use the centralized setZoom method which handles dimensions and Retina scaling
        fabricCanvas.setZoom(zoom);

    }, [zoom, isInitialized, activePage?.width, activePage?.height]);

    // Calculate displayed canvas dimensions
    const logicalWidth = activePage?.width || 1080;
    const logicalHeight = activePage?.height || 1080;
    const userZoom = zoom / 100;
    const displayWidth = logicalWidth * userZoom;
    const displayHeight = logicalHeight * userZoom;

    return (
        <div
            ref={containerRef}
            className={`relative bg-[#F0F1F5] overflow-auto custom-scrollbar ${className}`}
        >
            {/* Scrollable centering container */}
            <div
                className="min-w-full min-h-full flex items-center justify-center p-20"
                style={{
                    // Use flexbox centering
                }}
            >
                <div
                    className="shadow-2xl flex-shrink-0 relative"
                    style={{
                        width: displayWidth,
                        height: displayHeight,
                        // No maxWidth/maxHeight here to allow the canvas to expand the scrollable area
                    }}
                >
                    {/* Fabric canvas element */}
                    <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />

                    {/* Crop Overlay */}
                    <CropOverlay
                        zoom={zoom}
                        containerOffset={{ x: 0, y: 0 }}
                    />

                    {/* Lock Icon Overlays for locked elements */}
                    <LockIconOverlay displayScale={userZoom} />

                    {/* Page Locked Overlay - Prevents all interaction when page is locked */}
                    {activePage?.locked && (
                        <div
                            className="absolute inset-0 bg-blue-500/10 backdrop-blur-[1px] flex items-center justify-center z-50 cursor-not-allowed"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white/95 shadow-lg rounded-xl px-6 py-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Lock size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-gray-800 font-semibold">Page Locked</p>
                                    <p className="text-gray-500 text-sm">Click the lock button below to unlock</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Page Hidden Overlay - Completely hides page content */}
                    {activePage?.hidden && !activePage?.locked && (
                        <div
                            className="absolute inset-0 bg-gray-100 flex items-center justify-center z-40"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white shadow-lg rounded-xl px-6 py-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-800 font-semibold">Page Hidden</p>
                                    <p className="text-gray-500 text-sm">Click the hide button below to show</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
