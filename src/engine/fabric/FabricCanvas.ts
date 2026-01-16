// Fabric Canvas
// Core Fabric.js wrapper and initialization

import { fabric } from 'fabric';
import { CanvasElement, TextElement, ImageElement, ShapeElement, LineElement, StickerElement, GroupElement, BlendMode } from '@/types/canvas';
import { Page, PageBackground } from '@/types/project';
import { CustomText } from './CustomText';
import { SHAPE_CATALOG } from '@/types/shapes';
import { getCanvasBlendMode, isCustomBlendMode } from './BlendModes';
import { applyCustomBlendModesToCanvas } from './CustomBlendRenderer';
import { SmartGuides, initSmartGuides, disposeSmartGuides } from './SmartGuides';

export interface FabricCanvasOptions {
    width: number;
    height: number;
    backgroundColor?: string;
    preserveObjectStacking?: boolean;
    selection?: boolean;
    controlsAboveOverlay?: boolean;
}

// Maximum canvas size that browsers can reliably handle
// Reduced from 4000 to 2500 for better performance on large canvases
// For these sizes, we use virtual canvas: render at reduced size, display scaled up via CSS
const MAX_WORKING_CANVAS_SIZE = 2500;

export class FabricCanvas {
    private canvas: fabric.Canvas | null = null;
    private containerElement: HTMLCanvasElement | null = null;
    private objectIdMap: Map<string, fabric.Object> = new Map();
    private elementBlendModes: Map<string, BlendMode> = new Map();

    // Smart guides for alignment and snapping
    private smartGuides: SmartGuides | null = null;
    private snapToGuidesEnabled: boolean = true;

    // Performance optimization: skip heavy operations during drag
    private isDragging: boolean = false;

    // Virtual canvas properties - store logical (target) dimensions separately
    private logicalWidth: number = 1080;
    private logicalHeight: number = 1080;
    private workingScale: number = 1; // Ratio of working canvas to logical canvas

    // Event callbacks
    public onSelectionChange?: (selectedIds: string[]) => void;
    public onObjectModified?: (id: string) => void;
    public onObjectUpdating?: (id: string) => void;
    public onObjectAdded?: (id: string) => void;
    public onObjectRemoved?: (id: string) => void;
    public onTextChanged?: (id: string, newText: string) => void;
    public onHistoryPush?: (label: string) => void;

    constructor() {
        this.objectIdMap = new Map();
        this.elementBlendModes = new Map();
    }

    /**
     * Get the working scale factor (ratio of working canvas to logical canvas)
     * Used to convert between logical coordinates and Fabric.js coordinates
     */
    public getWorkingScale(): number {
        return this.workingScale;
    }

    /**
     * Get logical (target) canvas dimensions
     */
    public getLogicalDimensions(): { width: number; height: number } {
        return { width: this.logicalWidth, height: this.logicalHeight };
    }

    /**
     * Calculate optimal working dimensions for a given logical size
     * Returns dimensions that fit within MAX_WORKING_CANVAS_SIZE while preserving aspect ratio
     */
    private calculateWorkingDimensions(logicalWidth: number, logicalHeight: number): { width: number; height: number; scale: number } {
        // If canvas is within limits, use full size
        if (logicalWidth <= MAX_WORKING_CANVAS_SIZE && logicalHeight <= MAX_WORKING_CANVAS_SIZE) {
            return { width: logicalWidth, height: logicalHeight, scale: 1 };
        }

        // Calculate scale to fit within limits
        const scaleX = MAX_WORKING_CANVAS_SIZE / logicalWidth;
        const scaleY = MAX_WORKING_CANVAS_SIZE / logicalHeight;
        const scale = Math.min(scaleX, scaleY);

        return {
            width: Math.round(logicalWidth * scale),
            height: Math.round(logicalHeight * scale),
            scale: scale
        };
    }

    /**
     * Initialize the Fabric.js canvas
     */
    public init(canvasElement: HTMLCanvasElement, options: FabricCanvasOptions): fabric.Canvas {
        this.containerElement = canvasElement;

        this.canvas = new fabric.Canvas(canvasElement, {
            width: options.width,
            height: options.height,
            backgroundColor: options.backgroundColor || '#ffffff',
            preserveObjectStacking: options.preserveObjectStacking ?? true,
            selection: options.selection ?? true,
            controlsAboveOverlay: options.controlsAboveOverlay ?? true,
            renderOnAddRemove: true,
            stopContextMenu: true,
            fireRightClick: true,
            fireMiddleClick: true,
        });

        this.setupEventListeners();
        this.setupCustomControls();

        // Initialize smart guides for alignment and snapping
        this.smartGuides = initSmartGuides(this.canvas, { snapThreshold: 8 });

        // Add after:render hook for custom blend modes and smart guides
        // This applies pixel-level blending for modes not supported by Canvas 2D API
        this.canvas.on('after:render', () => {
            // Skip expensive blend mode operations during drag for better performance
            if (this.elementBlendModes.size > 0 && this.canvas && !this.isDragging) {
                applyCustomBlendModesToCanvas(this.canvas, this.elementBlendModes);
            }
            // Render smart guides overlay (lightweight, keep during drag)
            if (this.smartGuides && this.canvas) {
                const ctx = this.canvas.getContext();
                this.smartGuides.renderGuides(ctx);
            }
        });

        return this.canvas;
    }

    /**
     * Dispose of the canvas and clean up resources
     */
    public dispose(): void {
        // Dispose smart guides
        disposeSmartGuides();
        this.smartGuides = null;

        if (this.canvas) {
            this.canvas.dispose();
            this.canvas = null;
        }
        this.objectIdMap.clear();
        this.elementBlendModes.clear();
        this.containerElement = null;
    }

    /**
     * Enable or disable snap-to-guides functionality
     */
    public setSnapToGuides(enabled: boolean): void {
        this.snapToGuidesEnabled = enabled;
        if (this.smartGuides) {
            this.smartGuides.setEnabled(enabled);
        }
    }

    /**
     * Get the Fabric canvas instance
     */
    public getCanvas(): fabric.Canvas | null {
        return this.canvas;
    }

    /**
     * Setup event listeners for canvas interactions
     */
    private setupEventListeners(): void {
        if (!this.canvas) return;

        // Throttle tracking for performance
        let lastUpdateTime = 0;
        const UPDATE_THROTTLE_MS = 60; // Only update store every 60ms during drag

        // Selection events
        this.canvas.on('selection:created', () => {
            const selectedIds = this.getSelectedObjectIds();
            this.onSelectionChange?.(selectedIds);
        });

        this.canvas.on('selection:updated', () => {
            const selectedIds = this.getSelectedObjectIds();
            this.onSelectionChange?.(selectedIds);
        });

        this.canvas.on('selection:cleared', () => {
            this.onSelectionChange?.([]);
        });

        // Object modification events (end of transform)
        this.canvas.on('object:modified', (e: fabric.IEvent<MouseEvent>) => {
            const obj = e.target as fabric.Object & { data?: { id: string } };

            // Handle single object
            if (obj && obj.data?.id) {
                this.onObjectModified?.(obj.data.id);
            }
            // Handle multi-selection group (ActiveSelection)
            else if (obj && obj.type === 'activeSelection' && (obj as any)._objects) {
                const group = obj as fabric.ActiveSelection;
                // We need to trigger update for each object in the selection
                // The delay is to ensure Fabric has fully calculated the new individual transforms
                group.getObjects().forEach((innerObj: any) => {
                    if (innerObj.data?.id) {
                        this.onObjectModified?.(innerObj.data.id);
                    }
                });
            }

            // Trigger history push AFTER updating all objects in the store
            const transformType = e.action || 'transformation';
            const label = transformType.charAt(0).toUpperCase() + transformType.slice(1);
            this.onHistoryPush?.(label);
        });

        // Object updating events (during transform) - THROTTLED for performance
        const onUpdatingThrottled = (e: fabric.IEvent<MouseEvent>) => {
            const now = performance.now();
            // Skip if we updated too recently (throttle)
            if (now - lastUpdateTime < UPDATE_THROTTLE_MS) {
                return;
            }
            lastUpdateTime = now;

            // Disable real-time store updates during scaling/rotating to prevent re-render loops
            // The store will be updated on 'object:modified' (mouse up)
            /*
            const obj = e.target as fabric.Object & { data?: { id: string } };
            if (obj && obj.data?.id) {
                this.onObjectUpdating?.(obj.data.id);
            }
            */
        };

        this.canvas.on('object:scaling', (e) => {
            this.isDragging = true;
            onUpdatingThrottled(e);
        });
        this.canvas.on('object:rotating', (e) => {
            this.isDragging = true;
            onUpdatingThrottled(e);
        });

        // Object moving with smart guides snapping
        this.canvas.on('object:moving', (e: fabric.IEvent<MouseEvent>) => {
            const obj = e.target as fabric.Object & { data?: { id: string } };
            if (!obj) return;

            // Set dragging flag for performance optimization
            this.isDragging = true;

            // Disable real-time store updates during movement to prevent re-render loops
            // The store will be updated on 'object:modified' (mouse up)
            /*
            if (now - lastUpdateTime >= UPDATE_THROTTLE_MS) {
                lastUpdateTime = now;
                if (obj.data?.id) {
                    this.onObjectUpdating?.(obj.data.id);
                }
            }
            */

            // Apply smart guides snapping ONLY on small canvases (workingScale === 1)
            // On large canvases, skip this entirely for performance
            if (this.smartGuides && this.snapToGuidesEnabled && this.workingScale >= 0.9) {
                const snapResult = this.smartGuides.calculateSnap(obj);

                // Apply snapping if alignments found
                if (snapResult.snapX !== null) {
                    obj.set('left', snapResult.snapX);
                }
                if (snapResult.snapY !== null) {
                    obj.set('top', snapResult.snapY);
                }
            }
        });

        // Clear guides and dragging flag when object modification ends
        this.canvas.on('mouse:up', () => {
            // Clear dragging flag
            const wasDragging = this.isDragging;
            this.isDragging = false;

            if (this.smartGuides) {
                this.smartGuides.clearGuides();
            }

            // Re-render to apply blend modes that were skipped during drag
            if (wasDragging) {
                this.canvas?.requestRenderAll();
            }
        });

        this.canvas.on('object:added', (e: fabric.IEvent<MouseEvent>) => {
            const obj = e.target as fabric.Object & { data?: { id: string } };
            if (obj && obj.data?.id) {
                this.objectIdMap.set(obj.data.id, obj);
                this.onObjectAdded?.(obj.data.id);
            }
        });

        this.canvas.on('object:removed', (e: fabric.IEvent<MouseEvent>) => {
            const obj = e.target as fabric.Object & { data?: { id: string } };
            if (obj && obj.data?.id) {
                this.objectIdMap.delete(obj.data.id);
                this.onObjectRemoved?.(obj.data.id);
            }
        });

        // Text editing events - capture text content changes ONLY when editing is exited
        // This prevents real-time store updates from triggering canvas re-syncs during typing
        this.canvas.on('text:editing:exited' as any, (e: fabric.IEvent<Event>) => {
            const obj = e.target as fabric.IText & { data?: { id: string } };
            if (obj && obj.data?.id && obj.text !== undefined) {
                console.log('[FabricCanvas] text:editing:exited event for:', obj.data.id, 'text:', obj.text);
                this.onTextChanged?.(obj.data.id, obj.text);
            }
        });
    }

    /**
     * Setup custom control styling
     */
    private setupCustomControls(): void {
        // Reference to FabricCanvas instance for accessing workingScale
        const fabricCanvasInstance = this;

        // Customize control appearance
        fabric.Object.prototype.transparentCorners = false;
        fabric.Object.prototype.cornerColor = '#ffffff';
        fabric.Object.prototype.cornerStyle = 'circle';
        fabric.Object.prototype.borderColor = '#2563eb';
        fabric.Object.prototype.borderScaleFactor = 1.5; // Reduced default
        fabric.Object.prototype.padding = 5; // Reduced padding
        fabric.Object.prototype.cornerStrokeColor = '#2563eb';

        // Helper to get inverse scale for controls (keeps controls same visual size regardless of zoom)
        const getControlScale = (): number => {
            const canvas = fabricCanvasInstance.getCanvas();
            if (!canvas) return 1;
            const zoom = canvas.getZoom();
            // Inverse scale ensures consistent screen size
            // Strictly cap at 2.0x to prevent oversized controls on resize/zoom out
            const inverseScale = 1 / zoom;
            return Math.min(inverseScale, 2.0);
        };

        // Render function for circular corner controls (tl, tr, bl, br)
        const renderCircleControl = (ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: fabric.Object) => {
            const scale = getControlScale();
            const size = 9 * scale; // Aggressively reduced base size to 9
            const strokeWidth = 1 * scale; // Thin stroke

            ctx.save();
            ctx.translate(left, top);
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = '#2563eb';
            ctx.stroke();
            ctx.restore();
        };

        // Render function for horizontal pill-shaped side controls (mt, mb)
        const renderPillControlH = (ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: fabric.Object) => {
            const scale = getControlScale();
            const width = 18 * scale; // Reduced from 24
            const height = 6 * scale; // Reduced from 8
            const radius = 3 * scale;
            const strokeWidth = 1 * scale;

            ctx.save();
            ctx.translate(left, top);

            // Rotate the pill to match object rotation
            const angle = fabric.util.degreesToRadians(fabricObject.angle || 0);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.roundRect(-width / 2, -height / 2, width, height, radius);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = '#2563eb';
            ctx.stroke();
            ctx.restore();
        };

        // Render function for vertical pill-shaped side controls (ml, mr)
        const renderPillControlV = (ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: fabric.Object) => {
            const scale = getControlScale();
            const width = 6 * scale; // Reduced
            const height = 18 * scale; // Reduced
            const radius = 3 * scale;
            const strokeWidth = 1 * scale;

            ctx.save();
            ctx.translate(left, top);

            // Rotate the pill to match object rotation
            const angle = fabric.util.degreesToRadians(fabricObject.angle || 0);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.roundRect(-width / 2, -height / 2, width, height, radius);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = '#2563eb';
            ctx.stroke();
            ctx.restore();
        };

        // Custom Rotation Control Renderer
        const renderRotationControl = (ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: fabric.Object) => {
            const scale = getControlScale();
            const size = 24 * scale;
            const strokeWidth = 2 * scale;
            const arcRadius = 6 * scale;

            ctx.save();
            ctx.translate(left, top);

            // Blue circle background
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#2563eb';
            ctx.fill();

            // White refresh icon (scaled)
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = 'round';
            ctx.beginPath();
            // Draw an open circle arrow
            ctx.arc(0, 0, arcRadius, 0.2 * Math.PI, 1.8 * Math.PI);
            ctx.stroke();

            // Arrowhead (scaled)
            ctx.beginPath();
            ctx.moveTo(4 * scale, -4 * scale);
            ctx.lineTo(6 * scale, -6 * scale);
            ctx.lineTo(8 * scale, -3 * scale);
            ctx.stroke();

            ctx.restore();
        };

        // Assign custom controls
        // Corners
        fabric.Object.prototype.controls.tl.render = renderCircleControl;
        fabric.Object.prototype.controls.tr.render = renderCircleControl;
        fabric.Object.prototype.controls.bl.render = renderCircleControl;
        fabric.Object.prototype.controls.br.render = renderCircleControl;

        // Sides (Pills)
        fabric.Object.prototype.controls.mt.render = renderPillControlH;
        fabric.Object.prototype.controls.mb.render = renderPillControlH;
        fabric.Object.prototype.controls.ml.render = renderPillControlV;
        fabric.Object.prototype.controls.mr.render = renderPillControlV;

        // Rotation
        fabric.Object.prototype.controls.mtr.render = renderRotationControl;
        fabric.Object.prototype.controls.mtr.offsetY = -40; // Reduced offset
        fabric.Object.prototype.controls.mtr.withConnection = false; // Detached
    }

    /**
     * Get selected object IDs
     */
    private getSelectedObjectIds(): string[] {
        if (!this.canvas) return [];

        const activeObjects = this.canvas.getActiveObjects();
        return activeObjects
            .filter((obj: fabric.Object & { data?: { id: string } }) => obj.data?.id)
            .map((obj: fabric.Object & { data?: { id: string } }) => obj.data!.id);
    }

    /**
     * Get bounding box of current selection in logical coordinates
     */
    public getSelectionBounds(): { left: number; top: number; width: number; height: number } | null {
        if (!this.canvas) return null;

        const activeObject = this.canvas.getActiveObject();
        if (!activeObject) return null;

        // Get bounding rect in canvas coordinates
        const rect = activeObject.getBoundingRect();

        // Convert to logical coordinates (unscaled)
        const zoom = this.canvas.getZoom(); // This should be userZoom for display
        // However, getBoundingRect() returns coordinates in scene space (if canvas zoom is 1)?
        // Fabric's getBoundingRect() accounts for object transforms.
        // If canvas has zoom, it might affect it.
        // Actually, our FabricCanvas.setZoom sets the canvas zoom.
        // So rect is in zoomed coordinates. We need to divide by zoom to get logical coords.

        return {
            left: rect.left / zoom,
            top: rect.top / zoom,
            width: rect.width / zoom,
            height: rect.height / zoom
        };
    }

    /**
     * Get the current zoom level (user zoom * working scale)
     */
    public getZoom(): number {
        return this.canvas?.getZoom() || 1;
    }

    /**
     * Set the user zoom level
     * Handles updating dimensions and internal Fabric zoom
     */
    /**
     * Set the user zoom level
     * Handles updating dimensions and internal Fabric zoom
     */
    public setZoom(zoomPercent: number): void {
        if (!this.canvas) return;

        const userScale = zoomPercent / 100;

        // Calculate the physical display size (CSS size)
        const displayWidth = Math.round(this.logicalWidth * userScale);
        const displayHeight = Math.round(this.logicalHeight * userScale);

        console.log(`[FabricCanvas] setZoom: level=${zoomPercent}%, display=${displayWidth}x${displayHeight}`);

        // Update canvas element size
        // Fabric.js automatically handles devicePixelRatio if enableRetinaScaling is true (default)
        // It will set the internal resolution to displayWidth * dpr
        this.canvas.setDimensions({
            width: displayWidth,
            height: displayHeight
        });

        // Set Fabric zoom to match the user scale
        // This ensures elements defined in logical coordinates are rendered at correct size
        this.canvas.setZoom(userScale);

        // Update border thickness relative to zoom to keep it constant on screen (e.g. 1.5px screen width)
        // Cap it STRICTLY to avoid thick borders. Max 3 logical pixels.
        const constantBorderWidth = Math.min(1.5 / userScale, 3);

        // Update selection border width for all objects (if newly selected)
        fabric.Object.prototype.borderScaleFactor = constantBorderWidth;

        // Force update for current selection
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            activeObject.set({ borderScaleFactor: constantBorderWidth });

            // If active selection (group), update internal objects too? No, borderScaleFactor applies to the group box.
            // But good to be safe.
        }

        this.canvas.renderAll();
    }

    /**
     * Resize the logical dimensions of the canvas
     * @param width Logical (target) width
     * @param height Logical (target) height
     */
    public resize(width: number, height: number): void {
        if (!this.canvas) return;

        // Store logical dimensions
        this.logicalWidth = width;
        this.logicalHeight = height;

        console.log(`[FabricCanvas] resize: logical=${width}x${height}`);

        // We don't perform fit-to-screen or zoom logic here anymore.
        // Instead, we let the UI component (CanvasStage) drive the zoom/dimensions via setZoom().
        this.canvas.renderAll();
    }

    /**
     * Set canvas background
     */
    public setBackground(background: PageBackground): void {
        if (!this.canvas) return;

        // Optimization for Image Background updates (e.g. opacity changes)
        if (background.type === 'image' && this.canvas.backgroundImage instanceof fabric.Image) {
            const currentBg = this.canvas.backgroundImage;
            // Check if src matches
            if (currentBg.getSrc() === background.src) {
                // Reuse existing image object
                const img = currentBg;
                const canvasWidth = this.canvas.width!;
                const canvasHeight = this.canvas.height!;
                const imgWidth = img.width || 1;
                const imgHeight = img.height || 1;

                // Re-calculate scale based on fit mode (in case it changed or canvas resized)
                const scaleX = canvasWidth / imgWidth;
                const scaleY = canvasHeight / imgHeight;

                let scale: number;
                switch (background.fit) {
                    case 'cover':
                        scale = Math.max(scaleX, scaleY);
                        break;
                    case 'contain':
                        scale = Math.min(scaleX, scaleY);
                        break;
                    case 'fill':
                        img.set({ scaleX, scaleY });
                        scale = 1;
                        break;
                    default:
                        scale = 1;
                }

                if (background.fit !== 'fill') {
                    img.scale(scale);
                }

                // Center the image
                const scaledWidth = imgWidth * (background.fit === 'fill' ? scaleX : scale);
                const scaledHeight = imgHeight * (background.fit === 'fill' ? scaleY : scale);
                const left = (canvasWidth - scaledWidth) / 2;
                const top = (canvasHeight - scaledHeight) / 2;

                img.set({
                    left: left,
                    top: top,
                    opacity: background.opacity,
                    originX: 'left',
                    originY: 'top',
                });

                this.canvas.requestRenderAll();
                return;
            }
        }

        switch (background.type) {
            case 'solid':
                // Clear any existing background image first
                this.canvas.setBackgroundImage(undefined as unknown as fabric.Image, this.canvas.renderAll.bind(this.canvas));
                this.canvas.backgroundColor = background.color;
                break;

            case 'gradient': {
                // Clear any existing background image first
                this.canvas.setBackgroundImage(undefined as unknown as fabric.Image, this.canvas.renderAll.bind(this.canvas));

                const width = this.canvas.width!;
                const height = this.canvas.height!;

                let coords: fabric.IGradientOptions['coords'];

                if (background.gradientType === 'linear') {
                    // Calculate linear gradient coords based on angle
                    // CSS linear-gradient: 0deg = bottom to top, 90deg = left to right, 180deg = top to bottom
                    const angle = background.angle || 0;

                    // Use switch for common angles for precise positioning
                    switch (angle) {
                        case 0:
                            // Bottom to top
                            coords = { x1: width / 2, y1: height, x2: width / 2, y2: 0 };
                            break;
                        case 90:
                            // Left to right (horizontal)
                            coords = { x1: 0, y1: height / 2, x2: width, y2: height / 2 };
                            break;
                        case 180:
                            // Top to bottom (vertical)
                            coords = { x1: width / 2, y1: 0, x2: width / 2, y2: height };
                            break;
                        case 270:
                            // Right to left
                            coords = { x1: width, y1: height / 2, x2: 0, y2: height / 2 };
                            break;
                        case 135:
                            // Top-left to bottom-right (diagonal)
                            coords = { x1: 0, y1: 0, x2: width, y2: height };
                            break;
                        case 45:
                            // Bottom-left to top-right
                            coords = { x1: 0, y1: height, x2: width, y2: 0 };
                            break;
                        case 225:
                            // Bottom-right to top-left
                            coords = { x1: width, y1: height, x2: 0, y2: 0 };
                            break;
                        case 315:
                            // Top-right to bottom-left
                            coords = { x1: width, y1: 0, x2: 0, y2: height };
                            break;
                        default: {
                            // For other angles, calculate using trigonometry
                            const angleRad = (angle - 90) * (Math.PI / 180);
                            const cos = Math.cos(angleRad);
                            const sin = Math.sin(angleRad);
                            const cx = width / 2;
                            const cy = height / 2;
                            const length = Math.sqrt(width * width + height * height) / 2;

                            coords = {
                                x1: cx - cos * length,
                                y1: cy - sin * length,
                                x2: cx + cos * length,
                                y2: cy + sin * length,
                            };
                        }
                    }
                } else {
                    // Radial gradient
                    let cx = width / 2;
                    let cy = height / 2;

                    // Adjust center based on radialPosition
                    if (background.radialPosition === 'top-left') {
                        cx = 0;
                        cy = 0;
                    } else if (background.radialPosition === 'top-right') {
                        cx = width;
                        cy = 0;
                    } else if (background.radialPosition === 'bottom-left') {
                        cx = 0;
                        cy = height;
                    } else if (background.radialPosition === 'bottom-right') {
                        cx = width;
                        cy = height;
                    }
                    // 'center' keeps default center position

                    // Calculate radius to fully cover the canvas from the center position
                    const maxDistX = Math.max(cx, width - cx);
                    const maxDistY = Math.max(cy, height - cy);
                    const radius = Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY);

                    coords = {
                        x1: cx,
                        y1: cy,
                        r1: 0,
                        x2: cx,
                        y2: cy,
                        r2: radius,
                    };
                }

                // Sort color stops by offset to ensure correct gradient order
                const sortedColorStops = [...background.colorStops].sort((a, b) => a.offset - b.offset);

                const gradient = new fabric.Gradient({
                    type: background.gradientType,
                    coords,
                    colorStops: sortedColorStops,
                });
                this.canvas.backgroundColor = gradient as unknown as string;
                break;
            }

            case 'image':
                fabric.Image.fromURL(background.src, (img: fabric.Image) => {
                    if (!this.canvas) return;

                    const canvasWidth = this.canvas.width!;
                    const canvasHeight = this.canvas.height!;
                    const imgWidth = img.width || 1;
                    const imgHeight = img.height || 1;

                    // Scale image based on fit mode
                    const scaleX = canvasWidth / imgWidth;
                    const scaleY = canvasHeight / imgHeight;

                    let scale: number;
                    switch (background.fit) {
                        case 'cover':
                            // Use max scale to ensure image covers entire canvas
                            scale = Math.max(scaleX, scaleY);
                            break;
                        case 'contain':
                            scale = Math.min(scaleX, scaleY);
                            break;
                        case 'fill':
                            img.set({ scaleX, scaleY });
                            scale = 1;
                            break;
                        default:
                            scale = 1;
                    }

                    if (background.fit !== 'fill') {
                        img.scale(scale);
                    }

                    // Center the image (like CSS background-position: center)
                    // This crops overflow symmetrically from the center
                    const scaledWidth = imgWidth * (background.fit === 'fill' ? scaleX : scale);
                    const scaledHeight = imgHeight * (background.fit === 'fill' ? scaleY : scale);
                    const left = (canvasWidth - scaledWidth) / 2;
                    const top = (canvasHeight - scaledHeight) / 2;

                    img.set({
                        left: left,
                        top: top,
                        opacity: background.opacity,
                        originX: 'left',
                        originY: 'top',
                    });

                    this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
                }, { crossOrigin: 'anonymous' });
                break;
        }

        this.canvas.renderAll();
    }

    /**
     * Add a text element
     * Fabric's zoom handles virtual canvas scaling, so we use logical coordinates
     */
    public addText(element: TextElement): fabric.Textbox {
        if (!this.canvas) throw new Error('Canvas not initialized');

        // DEBUG: Log the font properties being used
        console.log(`[FabricCanvas] addText - fontFamily: ${element.textStyle.fontFamily}, fontWeight: ${element.textStyle.fontWeight}`);

        // Handle uppercase text transform - convert content to uppercase if textTransform is uppercase
        const displayContent = element.textStyle.textTransform === 'uppercase'
            ? element.content.toUpperCase()
            : element.content;

        // Use CustomText (extends Textbox) for rich text effects support
        // Textbox wraps text within width and reflows when resized
        // Use logical coordinates - Fabric's zoom handles the scaling
        const text = new CustomText(displayContent, {
            left: element.transform.x,
            top: element.transform.y,
            width: element.transform.width || 300,
            fontFamily: element.textStyle.fontFamily,
            fontSize: element.textStyle.fontSize,
            fontWeight: element.textStyle.fontWeight as number,
            fontStyle: element.textStyle.fontStyle,
            textAlign: element.textStyle.textAlign,
            lineHeight: element.textStyle.lineHeight,
            charSpacing: element.textStyle.letterSpacing * 100,
            // Text decoration properties for Fabric.js
            underline: element.textStyle.textDecoration === 'underline',
            linethrough: element.textStyle.textDecoration === 'line-through',
            fill: element.style.fill as string,
            stroke: element.style.stroke ?? undefined,
            strokeWidth: element.style.strokeWidth,
            opacity: element.style.opacity,
            angle: element.transform.rotation,
            // Use saved scaleX/scaleY to preserve user's text scaling
            scaleX: element.transform.scaleX || 1,
            scaleY: element.transform.scaleY || 1,
            originX: element.transform.originX,
            originY: element.transform.originY,
            selectable: element.selectable,
            lockMovementX: element.locked,
            lockMovementY: element.locked,
            visible: element.visible,
            data: { id: element.id, type: 'text' },
            // CustomText specific properties
            customId: element.id,
            effect: element.effect,
            textStyle: element.textStyle,
            globalCompositeOperation: getCanvasBlendMode(element.blendMode || 'normal') || 'source-over',
        });

        // Apply shadow if present
        if (element.style.shadow) {
            text.shadow = new fabric.Shadow({
                color: element.style.shadow.color,
                blur: element.style.shadow.blur,
                offsetX: element.style.shadow.offsetX,
                offsetY: element.style.shadow.offsetY,
            });
        }

        this.canvas.add(text);
        this.objectIdMap.set(element.id, text);

        return text;
    }

    /**
     * Add an image element
     * Fabric's zoom handles virtual canvas scaling, so we use logical coordinates
     */
    public async addImage(element: ImageElement): Promise<fabric.Image> {
        if (!this.canvas) throw new Error('Canvas not initialized');
        console.log('[FabricCanvas] addImage called for element:', element.id, 'src:', element.src?.substring(0, 100));

        return new Promise((resolve, reject) => {
            // Add timeout to prevent infinite hanging
            const timeout = setTimeout(() => {
                console.error('[FabricCanvas] addImage timeout for element:', element.id);
                reject(new Error(`Image loading timeout for element: ${element.id}`));
            }, 15000); // 15 second timeout

            fabric.Image.fromURL(
                element.src,
                (img: fabric.Image) => {
                    clearTimeout(timeout);

                    if (!img) {
                        console.error('[FabricCanvas] Image failed to load for element:', element.id);
                        reject(new Error(`Failed to load image: ${element.id}`));
                        return;
                    }

                    if (!this.canvas) {
                        reject(new Error('Canvas not initialized'));
                        return;
                    }

                    // Get image natural dimensions
                    const naturalWidth = img.width || 1;
                    const naturalHeight = img.height || 1;

                    // Calculate scale to display image at desired logical dimensions
                    const desiredWidth = element.transform.width || 200;
                    const desiredHeight = element.transform.height || 200;

                    // Base scale to fit image to desired dimensions
                    const baseScaleX = desiredWidth / naturalWidth;
                    const baseScaleY = desiredHeight / naturalHeight;

                    // Apply user's additional scale (Fabric zoom handles workingScale)
                    const finalScaleX = baseScaleX * element.transform.scaleX;
                    const finalScaleY = baseScaleY * element.transform.scaleY;

                    console.log('[FabricCanvas] Image loaded:', element.id,
                        'natural:', naturalWidth, 'x', naturalHeight,
                        'desired:', desiredWidth, 'x', desiredHeight,
                        'scale:', finalScaleX.toFixed(4), 'x', finalScaleY.toFixed(4));

                    // Use logical coordinates - Fabric's zoom handles the scaling
                    img.set({
                        left: element.transform.x,
                        top: element.transform.y,
                        scaleX: finalScaleX,
                        scaleY: finalScaleY,
                        angle: element.transform.rotation,
                        originX: element.transform.originX,
                        originY: element.transform.originY,
                        opacity: element.style.opacity,
                        selectable: element.selectable,
                        lockMovementX: element.locked,
                        lockMovementY: element.locked,
                        visible: element.visible,
                        data: { id: element.id, type: 'image' },
                        globalCompositeOperation: getCanvasBlendMode(element.blendMode || 'normal') || 'source-over',
                    });

                    // Apply filters
                    this.applyImageFilters(img, element);

                    this.canvas!.add(img);
                    this.objectIdMap.set(element.id, img);
                    console.log('[FabricCanvas] Image added to canvas for element:', element.id);

                    resolve(img);
                },
                { crossOrigin: element.crossOrigin || 'anonymous' }
            );
        });
    }

    /**
     * Apply image filters
     */
    private applyImageFilters(img: fabric.Image, element: ImageElement): void {
        const filters: fabric.IBaseFilter[] = [];

        if (element.filters.brightness !== 0) {
            filters.push(new fabric.Image.filters.Brightness({
                brightness: element.filters.brightness / 100,
            }));
        }

        if (element.filters.contrast !== 0) {
            filters.push(new fabric.Image.filters.Contrast({
                contrast: element.filters.contrast / 100,
            }));
        }

        if (element.filters.saturation !== 0) {
            filters.push(new fabric.Image.filters.Saturation({
                saturation: element.filters.saturation / 100,
            }));
        }

        if (element.filters.blur > 0) {
            filters.push(new fabric.Image.filters.Blur({
                blur: element.filters.blur / 100,
            }));
        }

        if (element.filters.grayscale) {
            filters.push(new fabric.Image.filters.Grayscale());
        }

        if (element.filters.sepia) {
            filters.push(new fabric.Image.filters.Sepia());
        }

        if (element.filters.invert) {
            filters.push(new fabric.Image.filters.Invert());
        }

        img.filters = filters;
        img.applyFilters();
    }

    /**
     * Add a shape element
     */
    public addShape(element: ShapeElement): fabric.Object {
        if (!this.canvas) throw new Error('Canvas not initialized');

        let shape: fabric.Object;
        const width = element.transform.width;
        const height = element.transform.height;

        // Find shape definition from catalog
        const shapeDef = SHAPE_CATALOG.find(s => s.id === element.shapeType);

        // Handle parametric shapes first (basic Fabric.js objects)
        switch (element.shapeType) {
            // Basic shapes
            case 'square':
            case 'rectangle':
                shape = new fabric.Rect({
                    width: width,
                    height: height,
                    rx: element.style.cornerRadius,
                    ry: element.style.cornerRadius,
                });
                break;

            case 'rounded-square':
            case 'rounded-rectangle':
                shape = new fabric.Rect({
                    width: width,
                    height: height,
                    rx: shapeDef?.params?.cornerRadius || 15,
                    ry: shapeDef?.params?.cornerRadius || 15,
                });
                break;

            case 'circle':
                shape = new fabric.Circle({
                    radius: Math.min(width, height) / 2,
                });
                break;

            case 'triangle-up':
            case 'triangle':
                shape = new fabric.Triangle({
                    width: width,
                    height: height,
                });
                break;

            // Polygons
            case 'diamond':
            case 'polygon':
                shape = new fabric.Polygon(
                    this.generatePolygonPoints(element.points || shapeDef?.params?.sides || 4, Math.min(width, height) / 2),
                    {}
                );
                break;

            case 'pentagon':
                shape = new fabric.Polygon(
                    this.generatePolygonPoints(5, Math.min(width, height) / 2),
                    {}
                );
                break;

            case 'hexagon':
                shape = new fabric.Polygon(
                    this.generatePolygonPoints(6, Math.min(width, height) / 2),
                    {}
                );
                break;

            case 'heptagon':
                shape = new fabric.Polygon(
                    this.generatePolygonPoints(7, Math.min(width, height) / 2),
                    {}
                );
                break;

            case 'octagon':
                shape = new fabric.Polygon(
                    this.generatePolygonPoints(8, Math.min(width, height) / 2),
                    {}
                );
                break;

            case 'nonagon':
                shape = new fabric.Polygon(
                    this.generatePolygonPoints(9, Math.min(width, height) / 2),
                    {}
                );
                break;

            case 'decagon':
                shape = new fabric.Polygon(
                    this.generatePolygonPoints(10, Math.min(width, height) / 2),
                    {}
                );
                break;

            // Stars
            case 'star':
            case 'star-5':
                shape = new fabric.Polygon(
                    this.generateStarPoints(5, Math.min(width, height) / 2, Math.min(width, height) * 0.2),
                    {}
                );
                break;

            case 'star-4':
                shape = new fabric.Polygon(
                    this.generateStarPoints(4, Math.min(width, height) / 2, Math.min(width, height) * 0.2),
                    {}
                );
                break;

            case 'star-6':
                shape = new fabric.Polygon(
                    this.generateStarPoints(6, Math.min(width, height) / 2, Math.min(width, height) * 0.25),
                    {}
                );
                break;

            case 'star-8':
                shape = new fabric.Polygon(
                    this.generateStarPoints(8, Math.min(width, height) / 2, Math.min(width, height) * 0.25),
                    {}
                );
                break;

            case 'star-12':
                shape = new fabric.Polygon(
                    this.generateStarPoints(12, Math.min(width, height) / 2, Math.min(width, height) * 0.3),
                    {}
                );
                break;

            case 'burst':
                shape = new fabric.Polygon(
                    this.generateStarPoints(16, Math.min(width, height) / 2, Math.min(width, height) * 0.35),
                    {}
                );
                break;

            // New star shapes
            case 'star-12-sharp':
                shape = new fabric.Polygon(
                    this.generateStarPoints(12, Math.min(width, height) / 2, Math.min(width, height) * 0.35),
                    {}
                );
                break;

            case 'starburst-12':
                shape = new fabric.Polygon(
                    this.generateStarPoints(12, Math.min(width, height) / 2, Math.min(width, height) * 0.25),
                    {}
                );
                break;

            case 'starburst-16':
                shape = new fabric.Polygon(
                    this.generateStarPoints(16, Math.min(width, height) / 2, Math.min(width, height) * 0.4),
                    {}
                );
                break;

            case 'starburst-24':
                shape = new fabric.Polygon(
                    this.generateStarPoints(24, Math.min(width, height) / 2, Math.min(width, height) * 0.425),
                    {}
                );
                break;

            case 'star-9-sharp':
                shape = new fabric.Polygon(
                    this.generateStarPoints(9, Math.min(width, height) / 2, Math.min(width, height) * 0.2),
                    {}
                );
                break;

            case 'star-10-thin':
                shape = new fabric.Polygon(
                    this.generateStarPoints(10, Math.min(width, height) / 2, Math.min(width, height) * 0.15),
                    {}
                );
                break;

            case 'seal-24':
                shape = new fabric.Polygon(
                    this.generateStarPoints(24, Math.min(width, height) / 2, Math.min(width, height) * 0.45),
                    {}
                );
                break;

            case 'line':
                shape = new fabric.Line([0, 0, width, 0], {
                    strokeWidth: element.style.strokeWidth || 2,
                });
                break;

            // SVG Path shapes - use shape definition or element's svgPath
            default: {
                // Get SVG path from catalog or element
                const svgPath = element.svgPath || shapeDef?.svgPath;

                if (svgPath) {
                    // Check if this is a line category shape
                    const isLineShape = shapeDef?.category === 'lines';

                    // Create path from SVG, scaled to element size
                    shape = new fabric.Path(svgPath, {
                        scaleX: width / 100,  // SVG paths are normalized to 100x100
                        scaleY: height / 100,
                        // Line shapes use stroke, not fill
                        fill: isLineShape ? 'transparent' : undefined,
                        stroke: isLineShape ? (element.style.fill as string || '#4A90D9') : undefined,
                        strokeWidth: isLineShape ? 3 : undefined,
                    });
                } else {
                    // Fallback to rectangle
                    shape = new fabric.Rect({
                        width: width,
                        height: height,
                    });
                }
            }
        }

        // Check if this is a line category shape for proper styling
        const isLineCategory = shapeDef?.category === 'lines';

        // Use logical coordinates - Fabric's zoom handles the scaling
        shape.set({
            left: element.transform.x,
            top: element.transform.y,
            // Apply saved scaleX/scaleY (now that we save base width separately)
            scaleX: element.transform.scaleX || 1,
            scaleY: element.transform.scaleY || 1,
            // Line shapes use stroke for color, not fill
            fill: isLineCategory ? 'transparent' : (element.style.fill as string),
            stroke: isLineCategory ? (element.style.fill as string || '#4A90D9') : (element.style.stroke ?? undefined),
            strokeWidth: isLineCategory ? 3 : element.style.strokeWidth,
            opacity: element.style.opacity,
            angle: element.transform.rotation,
            originX: element.transform.originX,
            originY: element.transform.originY,
            selectable: element.selectable,
            lockMovementX: element.locked,
            lockMovementY: element.locked,
            visible: element.visible,
            data: { id: element.id, type: 'shape' },
            globalCompositeOperation: getCanvasBlendMode(element.blendMode || 'normal') || 'source-over',
        });

        // Apply shadow if present
        if (element.style.shadow) {
            shape.shadow = new fabric.Shadow({
                color: element.style.shadow.color,
                blur: element.style.shadow.blur,
                offsetX: element.style.shadow.offsetX,
                offsetY: element.style.shadow.offsetY,
            });
        }

        this.canvas.add(shape);
        this.objectIdMap.set(element.id, shape);

        return shape;
    }
    /**
     * Add a line element with custom endpoint controls (Canva-style)
     * ALL line types get the same endpoint-only controls
     */
    public addLine(element: LineElement): fabric.Line {
        if (!this.canvas) throw new Error('Canvas not initialized');

        // Create the main line - ALL lines use fabric.Line for consistent controls
        const line = new fabric.Line([element.x1, element.y1, element.x2, element.y2], {
            stroke: element.strokeColor,
            strokeWidth: element.strokeWidth,
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            selectable: element.selectable,
            evented: !element.locked,
            opacity: element.style.opacity,
            objectCaching: false,
            globalCompositeOperation: getCanvasBlendMode(element.blendMode || 'normal') || 'source-over',
        });

        // Apply dash pattern based on lineStyle
        if (element.lineStyle.dashPattern === 'dashed') {
            line.strokeDashArray = [element.strokeWidth * 4, element.strokeWidth * 2];
        } else if (element.lineStyle.dashPattern === 'dotted') {
            line.strokeDashArray = [element.strokeWidth, element.strokeWidth * 2];
            line.strokeLineCap = 'round';
        }

        // Store metadata and line element reference
        // CRITICAL: Must use 'data' property for selection detection (getSelectedObjectIds uses obj.data?.id)
        const lineWithMeta = line as fabric.Line & {
            data?: { id: string; type: string };
            elementId?: string;
            elementType?: string;
            lineElement?: LineElement;
        };
        lineWithMeta.data = { id: element.id, type: 'line' };
        lineWithMeta.elementId = element.id;
        lineWithMeta.elementType = 'line';
        lineWithMeta.lineElement = element;

        // Override render to draw decorations
        const originalRender = line._render.bind(line);
        line._render = (ctx: CanvasRenderingContext2D) => {
            // Draw the main line first
            originalRender(ctx);

            // Draw decorations at endpoints
            // IMPORTANT: Read from lineWithMeta.lineElement for dynamic updates when using context toolbar
            const currentLineElement = lineWithMeta.lineElement || element;
            const strokeWidth = line.strokeWidth ?? element.strokeWidth;
            const color = (line.stroke as string) ?? element.strokeColor;
            const currentLineStyle = currentLineElement.lineStyle || { startCap: 'none', endCap: 'none', capFill: 'outline' };
            const isFilled = currentLineStyle.capFill === 'filled';

            // In fabric.Line._render, context is centered on line's bounding box
            // Line endpoints in local space are at:
            // x1,y1 relative to center and x2,y2 relative to center
            const lineX1 = line.x1 ?? 0;
            const lineY1 = line.y1 ?? 0;
            const lineX2 = line.x2 ?? 0;
            const lineY2 = line.y2 ?? 0;

            // Calculate center of the line
            const centerX = (lineX1 + lineX2) / 2;
            const centerY = (lineY1 + lineY2) / 2;

            // Local coordinates relative to center
            const x1 = lineX1 - centerX;
            const y1 = lineY1 - centerY;
            const x2 = lineX2 - centerX;
            const y2 = lineY2 - centerY;

            // Calculate angle for arrows
            const dx = x2 - x1;
            const dy = y2 - y1;
            const angle = Math.atan2(dy, dx);

            // Draw start cap
            this.drawLineCap(ctx, currentLineStyle.startCap || 'none', x1, y1, angle + Math.PI, strokeWidth, color, isFilled);

            // Draw end cap
            this.drawLineCap(ctx, currentLineStyle.endCap || 'none', x2, y2, angle, strokeWidth, color, isFilled);
        };

        // Setup custom endpoint-only controls (removes default bounding box)
        this.setupLineControls(line, element);

        this.canvas.add(line);
        this.objectIdMap.set(element.id, line);

        return line;
    }

    /**
     * Draw a line cap decoration using Canvas 2D context
     */
    private drawLineCap(
        ctx: CanvasRenderingContext2D,
        capType: string,
        x: number,
        y: number,
        angle: number,
        strokeWidth: number,
        color: string,
        isFilled: boolean
    ): void {
        if (capType === 'none') return;

        const size = strokeWidth * 3;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.fillStyle = isFilled ? color : 'transparent';
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;

        switch (capType) {
            case 'arrow':
                // Triangle arrow pointing right
                ctx.beginPath();
                ctx.moveTo(size, 0);
                ctx.lineTo(-size * 0.5, -size * 0.6);
                ctx.lineTo(-size * 0.5, size * 0.6);
                ctx.closePath();
                if (isFilled) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
                break;

            case 'bar':
                // Perpendicular bar
                ctx.beginPath();
                ctx.moveTo(0, -size);
                ctx.lineTo(0, size);
                ctx.stroke();
                break;

            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, size, 0, Math.PI * 2);
                if (isFilled) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
                break;

            case 'square':
                ctx.beginPath();
                ctx.rect(-size, -size, size * 2, size * 2);
                if (isFilled) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
                break;

            case 'diamond':
                ctx.beginPath();
                ctx.moveTo(0, -size);
                ctx.lineTo(size, 0);
                ctx.lineTo(0, size);
                ctx.lineTo(-size, 0);
                ctx.closePath();
                if (isFilled) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
                break;
        }

        ctx.restore();
    }

    /**
     * Create line endpoint decoration (arrow, bar, circle, square, diamond)
     */
    private createLineDecoration(
        capType: string,
        x: number,
        y: number,
        angle: number,
        strokeWidth: number,
        color: string,
        capFill: string
    ): fabric.Object | null {
        const size = strokeWidth * 3;
        const isFilled = capFill === 'filled';

        switch (capType) {
            case 'arrow':
                // Triangle arrow
                return new fabric.Triangle({
                    width: size * 2,
                    height: size * 2.5,
                    left: x,
                    top: y,
                    fill: color,
                    angle: angle + 90,
                    originX: 'center',
                    originY: 'center',
                });

            case 'bar':
                // Vertical bar
                return new fabric.Rect({
                    width: strokeWidth,
                    height: size * 2,
                    left: x,
                    top: y,
                    fill: color,
                    angle: angle,
                    originX: 'center',
                    originY: 'center',
                });

            case 'circle':
                return new fabric.Circle({
                    radius: size,
                    left: x,
                    top: y,
                    fill: isFilled ? color : 'transparent',
                    stroke: color,
                    strokeWidth: isFilled ? 0 : strokeWidth,
                    originX: 'center',
                    originY: 'center',
                });

            case 'square':
                return new fabric.Rect({
                    width: size * 2,
                    height: size * 2,
                    left: x,
                    top: y,
                    fill: isFilled ? color : 'transparent',
                    stroke: color,
                    strokeWidth: isFilled ? 0 : strokeWidth,
                    originX: 'center',
                    originY: 'center',
                });

            case 'diamond':
                return new fabric.Rect({
                    width: size * 1.5,
                    height: size * 1.5,
                    left: x,
                    top: y,
                    fill: isFilled ? color : 'transparent',
                    stroke: color,
                    strokeWidth: isFilled ? 0 : strokeWidth,
                    angle: 45,
                    originX: 'center',
                    originY: 'center',
                });

            case 'none':
            default:
                return null;
        }
    }

    /**
     * Setup custom endpoint-only controls for line objects (Canva-style)
     */
    private setupLineControls(line: fabric.Line, _element?: LineElement): void {
        // Remove all default controls
        line.controls = {};

        // Custom circular control renderer
        const renderCircleControl = (
            ctx: CanvasRenderingContext2D,
            left: number,
            top: number,
            _styleOverride: unknown,
            _fabricObject: fabric.Object
        ) => {
            const size = 14;
            ctx.save();
            ctx.translate(left, top);

            // Outer circle (white fill with blue border)
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#0d99ff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        };

        // P1 (start point) control
        line.controls.p1 = new fabric.Control({
            x: -0.5,
            y: 0,
            cursorStyle: 'crosshair',
            positionHandler: function (_dim, _finalMatrix, fabricObject) {
                const l = fabricObject as fabric.Line;
                // Calculate local position relative to line center
                const x1 = l.x1 ?? 0;
                const y1 = l.y1 ?? 0;
                const x2 = l.x2 ?? 0;
                const y2 = l.y2 ?? 0;
                const centerX = (x1 + x2) / 2;
                const centerY = (y1 + y2) / 2;
                const localX = x1 - centerX;
                const localY = y1 - centerY;
                // Transform to canvas coordinates
                return fabric.util.transformPoint(
                    new fabric.Point(localX, localY),
                    fabricObject.calcTransformMatrix()
                );
            },
            actionHandler: function (_eventData, transform, x, y) {
                const l = transform.target as fabric.Line;
                // Convert canvas point to local coordinates
                const inverseMatrix = fabric.util.invertTransform(l.calcTransformMatrix());
                const localPoint = fabric.util.transformPoint(new fabric.Point(x, y), inverseMatrix);

                // Calculate current center
                const x1 = l.x1 ?? 0;
                const y1 = l.y1 ?? 0;
                const x2 = l.x2 ?? 0;
                const y2 = l.y2 ?? 0;
                const centerX = (x1 + x2) / 2;
                const centerY = (y1 + y2) / 2;

                // Update x1, y1 based on local point + center
                l.set({
                    x1: localPoint.x + centerX,
                    y1: localPoint.y + centerY
                });
                l.setCoords();
                return true;
            },
            render: renderCircleControl,
            actionName: 'modifyLine',
        });

        // P2 (end point) control
        line.controls.p2 = new fabric.Control({
            x: 0.5,
            y: 0,
            cursorStyle: 'crosshair',
            positionHandler: function (_dim, _finalMatrix, fabricObject) {
                const l = fabricObject as fabric.Line;
                // Calculate local position relative to line center
                const x1 = l.x1 ?? 0;
                const y1 = l.y1 ?? 0;
                const x2 = l.x2 ?? 0;
                const y2 = l.y2 ?? 0;
                const centerX = (x1 + x2) / 2;
                const centerY = (y1 + y2) / 2;
                const localX = x2 - centerX;
                const localY = y2 - centerY;
                // Transform to canvas coordinates
                return fabric.util.transformPoint(
                    new fabric.Point(localX, localY),
                    fabricObject.calcTransformMatrix()
                );
            },
            actionHandler: function (_eventData, transform, x, y) {
                const l = transform.target as fabric.Line;
                // Convert canvas point to local coordinates
                const inverseMatrix = fabric.util.invertTransform(l.calcTransformMatrix());
                const localPoint = fabric.util.transformPoint(new fabric.Point(x, y), inverseMatrix);

                // Calculate current center
                const x1 = l.x1 ?? 0;
                const y1 = l.y1 ?? 0;
                const x2 = l.x2 ?? 0;
                const y2 = l.y2 ?? 0;
                const centerX = (x1 + x2) / 2;
                const centerY = (y1 + y2) / 2;

                // Update x2, y2 based on local point + center
                l.set({
                    x2: localPoint.x + centerX,
                    y2: localPoint.y + centerY
                });
                l.setCoords();
                return true;
            },
            render: renderCircleControl,
            actionName: 'modifyLine',
        });

        // Disable bounding box and scaling, but allow rotation
        line.lockRotation = false;
        line.lockScalingX = true;
        line.lockScalingY = true;
        line.hasBorders = false;

        // Add rotation control
        if (fabric.Object.prototype.controls.mtr) {
            line.controls.mtr = new fabric.Control({
                x: 0,
                y: -0.5,
                offsetY: -40,
                actionHandler: (fabric as any).controlsUtils?.rotationWithSnapping || fabric.Object.prototype.controls.mtr.actionHandler,
                cursorStyle: 'url("data:image/svg+xml,%3Csvg height=\'18\' width=\'18\' viewBox=\'0 0 32 32\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M16,0 L16,0 C7.163,0 0,7.163 0,16 C0,24.837 7.163,32 16,32 C24.837,32 32,24.837 32,16 C32,7.163 24.837,0 16,0 Z M16,28 C9.373,28 4,22.627 4,16 C4,9.373 9.373,4 16,4 C22.627,4 28,9.373 28,16 C28,22.627 22.627,28 16,28 Z M24,14 L24,14 C24,12.895 23.105,12 22,12 L18,12 L18,8 C18,6.895 17.105,6 16,6 C14.895,6 14,6.895 14,8 L14,12 L10,12 C8.895,12 8,12.895 8,14 C8,15.105 8.895,16 10,16 L14,16 L14,20 C14,21.105 14.895,22 16,22 C17.105,22 18,21.105 18,20 L18,16 L22,16 C23.105,16 24,15.105 24,14 Z\' fill=\'%23000\' fill-rule=\'evenodd\'/%3E%3C/svg%3E") 12 12, crosshair',
                actionName: 'rotate',
                render: fabric.Object.prototype.controls.mtr.render, // Use the same custom rotation renderer
                withConnection: true // Show connection line since borders are hidden
            });
        }
    }

    /**
     * Generate polygon points
     */
    private generatePolygonPoints(sides: number, radius: number): fabric.Point[] {
        const points: fabric.Point[] = [];
        const angle = (2 * Math.PI) / sides;

        for (let i = 0; i < sides; i++) {
            const x = radius * Math.cos(i * angle - Math.PI / 2);
            const y = radius * Math.sin(i * angle - Math.PI / 2);
            points.push(new fabric.Point(x + radius, y + radius));
        }

        return points;
    }

    /**
     * Generate star points
     */
    private generateStarPoints(points: number, outerRadius: number, innerRadius: number): fabric.Point[] {
        const starPoints: fabric.Point[] = [];
        const angle = Math.PI / points;

        for (let i = 0; i < 2 * points; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = radius * Math.cos(i * angle - Math.PI / 2);
            const y = radius * Math.sin(i * angle - Math.PI / 2);
            starPoints.push(new fabric.Point(x + outerRadius, y + outerRadius));
        }

        return starPoints;
    }

    /**
     * Get object by ID
     */
    public getObjectById(id: string): fabric.Object | undefined {
        return this.objectIdMap.get(id);
    }

    /**
     * Get element's actual rendered dimensions from Fabric.js
     */
    public getElementDimensions(id: string): { width: number; height: number } | null {
        const obj = this.objectIdMap.get(id);
        if (!obj) return null;

        // Use Fabric.js methods to get actual rendered size
        const width = obj.getScaledWidth();
        const height = obj.getScaledHeight();

        return { width, height };
    }

    /**
     * Set object for an ID (used for replacing objects after crop)
     */
    public setObjectById(id: string, obj: fabric.Object): void {
        this.objectIdMap.set(id, obj);
    }

    /**
     * Get the underlying HTML image element from a Fabric Image object
     */
    public getImageElement(id: string): HTMLImageElement | null {
        const obj = this.objectIdMap.get(id);
        if (!obj) return null;

        // Access the internal element - Fabric.js stores it as _element
        const fabricImg = obj as fabric.Image & { _element?: HTMLImageElement };
        return fabricImg._element || null;
    }

    /**
     * Remove object by ID
     */
    public removeObject(id: string): boolean {
        const obj = this.objectIdMap.get(id);
        if (obj && this.canvas) {
            this.canvas.remove(obj);
            this.objectIdMap.delete(id);
            return true;
        }
        return false;
    }

    /**
     * Select objects by IDs
     */
    public selectObjects(ids: string[]): void {
        if (!this.canvas) return;

        const objects = ids
            .map(id => this.objectIdMap.get(id))
            .filter((obj): obj is fabric.Object => obj !== undefined);

        if (objects.length === 0) {
            this.canvas.discardActiveObject();
        } else if (objects.length === 1) {
            this.canvas.setActiveObject(objects[0]);
        } else {
            const selection = new fabric.ActiveSelection(objects, { canvas: this.canvas });
            this.canvas.setActiveObject(selection);
        }

        this.canvas.renderAll();
    }

    /**
     * Create a Fabric.js Group from selected objects
     * This creates a persistent group that doesn't ungroup on click outside
     */
    public createGroup(groupElement: GroupElement, childIds: string[]): fabric.Group | null {
        if (!this.canvas) return null;

        // First, discard any active selection before we manipulate objects
        this.canvas.discardActiveObject();

        // Get all fabric objects by child IDs - KEEP THEIR CURRENT POSITIONS
        const objects: fabric.Object[] = [];
        childIds.forEach(id => {
            const obj = this.objectIdMap.get(id);
            if (obj) {
                objects.push(obj);
                // Remove from object ID map (we'll track the group instead)
                this.objectIdMap.delete(id);
            }
        });

        if (objects.length === 0) return null;

        // Create a Fabric.js Group - let Fabric.js handle the positioning
        // Fabric.js will automatically calculate the group bounds from the objects
        const group = new fabric.Group(objects, {
            // Don't set left/top - let Fabric calculate from children
            originX: 'center',
            originY: 'center',
            // Make the group behave as a single unit (not interactive children)
            subTargetCheck: false,
            // Add identification data
            data: { id: groupElement.id, type: 'group' },
            // Ensure group is selectable and movable
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
        });

        // The objects are automatically removed from canvas when added to group
        // But we need to ensure they're not duplicated
        objects.forEach(obj => {
            if (this.canvas!.contains(obj)) {
                this.canvas!.remove(obj);
            }
        });

        // Add to canvas
        this.canvas.add(group);

        // Track in object ID map
        this.objectIdMap.set(groupElement.id, group);

        // Select the new group
        this.canvas.setActiveObject(group);
        this.canvas.requestRenderAll();

        console.log('[FabricCanvas] Created group:', groupElement.id, 'with', objects.length, 'children',
            'at position:', group.left, group.top, 'dimensions:', group.width, group.height);

        return group;
    }

    /**
     * Ungroup a Fabric.js Group and restore individual objects
     */
    public ungroupObjects(groupId: string, restoredElements: CanvasElement[]): void {
        if (!this.canvas) return;

        const groupObj = this.objectIdMap.get(groupId) as fabric.Group | undefined;
        if (!groupObj) {
            console.warn('[FabricCanvas] Group not found for ungrouping:', groupId);
            return;
        }

        // Remove the group from canvas
        this.canvas.remove(groupObj);
        this.objectIdMap.delete(groupId);

        // Add each restored element back to canvas
        restoredElements.forEach(async (element) => {
            await this.addElement(element);
        });

        this.canvas.renderAll();

        console.log('[FabricCanvas] Ungrouped:', groupId, 'restored', restoredElements.length, 'elements');
    }

    /**
     * Add a group element (for loading saved groups)
     */
    public async addGroup(element: GroupElement): Promise<fabric.Group | null> {
        if (!this.canvas) return null;

        // Recursively create fabric objects for all children
        const childObjects: fabric.Object[] = [];

        // Sort children by zIndex to ensure correct stacking order
        const sortedChildren = [...element.children].sort((a, b) => a.zIndex - b.zIndex);

        for (const child of sortedChildren) {
            // Create the child element first (without adding to canvas directly)
            const childObj = await this.createChildObject(child);
            if (childObj) {
                childObjects.push(childObj);
            }
        }

        if (childObjects.length === 0) return null;

        // Create the group
        const group = new fabric.Group(childObjects, {
            left: element.transform.x,
            top: element.transform.y,
            originX: 'center',
            originY: 'center',
            angle: element.transform.rotation || 0,
            scaleX: element.transform.scaleX,
            scaleY: element.transform.scaleY,
            opacity: element.style.opacity,
            subTargetCheck: false,
            data: { id: element.id, type: 'group' },
            selectable: element.selectable,
            evented: !element.locked,
            hasControls: !element.locked,
            hasBorders: !element.locked,
            lockMovementX: element.locked,
            lockMovementY: element.locked,
            lockRotation: element.locked,
            lockScalingX: element.locked,
            lockScalingY: element.locked,
            visible: element.visible,
        });

        this.canvas.add(group);
        this.objectIdMap.set(element.id, group);

        console.log('[FabricCanvas] Added group:', element.id, 'with', childObjects.length, 'children');

        return group;
    }

    /**
     * Create a fabric object for a child element (without adding to main canvas)
     * Used internally for creating group children
     */
    private async createChildObject(element: CanvasElement): Promise<fabric.Object | null> {
        switch (element.type) {
            case 'text':
                return this.createTextObject(element as TextElement);
            case 'image':
                return await this.createImageObject(element as ImageElement);
            case 'shape':
                return this.createShapeObject(element as ShapeElement);
            case 'line':
                return this.createLineObject(element as LineElement);
            case 'sticker':
                return await this.createStickerObject(element as StickerElement);
            case 'group':
                // Handle nested groups recursively
                return this.createNestedGroup(element as GroupElement);
            default:
                console.warn(`Unknown child element type: ${element.type}`);
                return null;
        }
    }

    /**
     * Create a text object without adding to canvas
     */
    private createTextObject(element: TextElement): fabric.Textbox {
        const displayContent = element.textStyle.textTransform === 'uppercase'
            ? element.content.toUpperCase()
            : element.content;

        return new fabric.Textbox(displayContent, {
            left: element.transform.x,
            top: element.transform.y,
            width: element.transform.width || 300,
            scaleX: element.transform.scaleX || 1,
            scaleY: element.transform.scaleY || 1,
            fontFamily: element.textStyle.fontFamily,
            fontSize: element.textStyle.fontSize,
            fontWeight: element.textStyle.fontWeight as number,
            fontStyle: element.textStyle.fontStyle,
            textAlign: element.textStyle.textAlign,
            fill: element.style.fill as string,
            opacity: element.style.opacity,
            angle: element.transform.rotation,
            originX: 'center',
            originY: 'center',
            data: { id: element.id, type: 'text' },
        });
    }


    /**
     * Create an image object without adding to canvas
     */
    private async createImageObject(element: ImageElement): Promise<fabric.Image> {
        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(element.src, (img) => {
                if (!img) {
                    reject(new Error('Failed to load image'));
                    return;
                }

                const scaleX = (element.transform.width * element.transform.scaleX) / (img.width || 1);
                const scaleY = (element.transform.height * element.transform.scaleY) / (img.height || 1);

                img.set({
                    left: element.transform.x,
                    top: element.transform.y,
                    scaleX,
                    scaleY,
                    angle: element.transform.rotation,
                    opacity: element.style.opacity,
                    originX: 'center',
                    originY: 'center',
                    data: { id: element.id, type: 'image' },
                });

                resolve(img);
            }, { crossOrigin: 'anonymous' });
        });
    }

    /**
     * Create a shape object without adding to canvas
     */
    private createShapeObject(element: ShapeElement): fabric.Object {
        let shape: fabric.Object;

        // Create basic shapes - for complex shapes, use the full addShape logic
        switch (element.shapeType) {
            case 'circle':
                const radius = Math.min(element.transform.width, element.transform.height) / 2;
                shape = new fabric.Circle({
                    radius,
                    fill: element.style.fill as string,
                    stroke: element.style.stroke || undefined,
                    strokeWidth: element.style.strokeWidth,
                });
                break;
            case 'rectangle':
            case 'square':
            default:
                shape = new fabric.Rect({
                    width: element.transform.width,
                    height: element.transform.height,
                    fill: element.style.fill as string,
                    stroke: element.style.stroke || undefined,
                    strokeWidth: element.style.strokeWidth,
                    rx: element.style.cornerRadius,
                    ry: element.style.cornerRadius,
                });
                break;
        }

        shape.set({
            left: element.transform.x,
            top: element.transform.y,
            scaleX: element.transform.scaleX,
            scaleY: element.transform.scaleY,
            angle: element.transform.rotation,
            opacity: element.style.opacity,
            originX: 'center',
            originY: 'center',
            data: { id: element.id, type: 'shape' },
        });

        // Apply shadow if present (for glow effects)
        if (element.style.shadow) {
            shape.shadow = new fabric.Shadow({
                color: element.style.shadow.color,
                blur: element.style.shadow.blur,
                offsetX: element.style.shadow.offsetX,
                offsetY: element.style.shadow.offsetY,
            });
        }

        return shape;
    }

    /**
     * Create a line object without adding to canvas
     */
    private createLineObject(element: LineElement): fabric.Line {
        const line = new fabric.Line(
            [element.x1, element.y1, element.x2, element.y2],
            {
                stroke: element.strokeColor,
                strokeWidth: element.strokeWidth,
                originX: 'center',
                originY: 'center',
                data: { id: element.id, type: 'line' },
            }
        );

        return line;
    }

    /**
     * Create a nested group object
     */
    private async createNestedGroup(element: GroupElement): Promise<fabric.Group | null> {
        const childObjects: fabric.Object[] = [];

        // Sort children by zIndex to ensure correct stacking order
        const sortedChildren = [...element.children].sort((a, b) => a.zIndex - b.zIndex);

        for (const child of sortedChildren) {
            const childObj = await this.createChildObject(child);
            if (childObj) {
                childObjects.push(childObj);
            }
        }

        if (childObjects.length === 0) return null;

        return new fabric.Group(childObjects, {
            left: element.transform.x,
            top: element.transform.y,
            originX: 'center',
            originY: 'center',
            angle: element.transform.rotation || 0,
            scaleX: element.transform.scaleX,
            scaleY: element.transform.scaleY,
            opacity: element.style.opacity,
            subTargetCheck: false,
            data: { id: element.id, type: 'group' },
        });
    }

    /**
     * Create a sticker object without adding to canvas
     */
    private async createStickerObject(element: StickerElement): Promise<fabric.Object> {
        return new Promise((resolve, reject) => {
            // Parse SVG string to fabric objects
            fabric.loadSVGFromString(element.svgContent, (objects, options) => {
                // Create a group from the SVG objects
                const group = fabric.util.groupSVGElements(objects, options);

                // Set position and properties
                group.set({
                    left: element.transform.x,
                    top: element.transform.y,
                    scaleX: element.transform.scaleX * (element.transform.width / (group.width || 100)),
                    scaleY: element.transform.scaleY * (element.transform.height / (group.height || 100)),
                    angle: element.transform.rotation,
                    originX: element.transform.originX,
                    originY: element.transform.originY,
                    opacity: element.style.opacity,
                    selectable: element.selectable,
                    lockMovementX: element.locked,
                    lockMovementY: element.locked,
                    visible: element.visible,
                    data: { id: element.id, type: 'sticker' },
                    globalCompositeOperation: getCanvasBlendMode(element.blendMode || 'normal') || 'source-over',
                });

                // Apply shadow/glow if present (for neon glow frames)
                if (element.style.shadow) {
                    group.shadow = new fabric.Shadow({
                        color: element.style.shadow.color,
                        blur: element.style.shadow.blur,
                        offsetX: element.style.shadow.offsetX,
                        offsetY: element.style.shadow.offsetY,
                    });
                }

                resolve(group);
            });
        });
    }

    /**
     * Clear all objects
     */
    public clear(): void {
        if (!this.canvas) return;
        this.canvas.clear();
        this.objectIdMap.clear();
        this.elementBlendModes.clear();
    }

    /**
     * Render the canvas
     */
    public render(): void {
        if (!this.canvas) return;
        this.canvas.renderAll();
    }

    /**
     * Render canvas with custom blend modes applied
     * This method applies pixel-level blending for modes not supported by Canvas 2D API
     * Used for export to ensure all blend modes render correctly
     */
    public renderWithCustomBlendModes(): HTMLCanvasElement {
        if (!this.canvas) throw new Error('Canvas not initialized');

        const width = this.canvas.getWidth();
        const height = this.canvas.getHeight();

        // Create output canvas
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = width;
        outputCanvas.height = height;
        const outputCtx = outputCanvas.getContext('2d')!;

        // First, draw the background
        const bgColor = this.canvas.backgroundColor;
        if (bgColor && typeof bgColor === 'string') {
            outputCtx.fillStyle = bgColor;
            outputCtx.fillRect(0, 0, width, height);
        }

        // Get all objects sorted by z-index
        const objects = this.canvas.getObjects().slice().sort((a, b) => {
            const aIndex = this.canvas!.getObjects().indexOf(a);
            const bIndex = this.canvas!.getObjects().indexOf(b);
            return aIndex - bIndex;
        });

        // Import blend functions dynamically to avoid circular deps
        const { blendPixels, isNativeBlendMode, getCanvasBlendMode } = require('./BlendModes');

        for (const obj of objects) {
            if (!obj.visible) continue;

            const blendMode = (obj as any)._customBlendMode || obj.globalCompositeOperation || 'source-over';
            const isNative = blendMode === 'source-over' || isNativeBlendMode(blendMode);

            if (isNative) {
                // For native modes, just draw normally
                const nativeMode = getCanvasBlendMode(blendMode) || 'source-over';
                outputCtx.globalCompositeOperation = nativeMode;
                outputCtx.globalAlpha = obj.opacity || 1;

                // Render object to temp canvas
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                const tempCtx = tempCanvas.getContext('2d')!;
                obj.render(tempCtx);

                outputCtx.drawImage(tempCanvas, 0, 0);
                outputCtx.globalCompositeOperation = 'source-over';
                outputCtx.globalAlpha = 1;
            } else {
                // For custom modes, do pixel-level blending
                const opacity = obj.opacity || 1;

                // Render object to temp canvas
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                const tempCtx = tempCanvas.getContext('2d')!;
                obj.render(tempCtx);

                // Get image data
                const bottomData = outputCtx.getImageData(0, 0, width, height);
                const topData = tempCtx.getImageData(0, 0, width, height);
                const resultData = outputCtx.createImageData(width, height);

                // Blend each pixel
                for (let i = 0; i < bottomData.data.length; i += 4) {
                    const topR = topData.data[i];
                    const topG = topData.data[i + 1];
                    const topB = topData.data[i + 2];
                    const topA = topData.data[i + 3] / 255;

                    const bottomR = bottomData.data[i];
                    const bottomG = bottomData.data[i + 1];
                    const bottomB = bottomData.data[i + 2];
                    const bottomA = bottomData.data[i + 3] / 255;

                    if (topA === 0) {
                        // Top pixel is transparent, keep bottom
                        resultData.data[i] = bottomR;
                        resultData.data[i + 1] = bottomG;
                        resultData.data[i + 2] = bottomB;
                        resultData.data[i + 3] = bottomData.data[i + 3];
                    } else {
                        // Apply blend mode
                        const effectiveOpacity = topA * opacity;
                        const [r, g, b] = blendPixels(
                            topR, topG, topB,
                            bottomR, bottomG, bottomB,
                            effectiveOpacity,
                            blendMode
                        );

                        resultData.data[i] = r;
                        resultData.data[i + 1] = g;
                        resultData.data[i + 2] = b;
                        resultData.data[i + 3] = Math.round(Math.min(1, bottomA + effectiveOpacity) * 255);
                    }
                }

                outputCtx.putImageData(resultData, 0, 0);
            }
        }

        return outputCanvas;
    }

    /**
     * Export canvas to data URL
     */
    public toDataURL(options?: fabric.IDataURLOptions): string {
        if (!this.canvas) return '';
        return this.canvas.toDataURL(options);
    }

    /**
     * Export canvas to SVG
     */
    public toSVG(): string {
        if (!this.canvas) return '';
        return this.canvas.toSVG();
    }

    /**
     * Load page elements onto canvas
     */
    public async loadPage(page: Page): Promise<void> {
        console.log('[FabricCanvas] loadPage called for page:', page.id, page.name);
        console.log('[FabricCanvas] Page has', page.elements.length, 'elements');

        this.clear();

        if (!this.canvas) {
            console.error('[FabricCanvas] Canvas not initialized in loadPage');
            return;
        }

        // Set dimensions
        console.log('[FabricCanvas] Setting dimensions:', page.width, 'x', page.height);
        this.resize(page.width, page.height);

        // Set background
        console.log('[FabricCanvas] Setting background:', page.background.type);
        this.setBackground(page.background);

        // Sort elements by zIndex
        const sortedElements = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);
        console.log('[FabricCanvas] Elements sorted by zIndex');

        // Add elements
        for (let i = 0; i < sortedElements.length; i++) {
            const element = sortedElements[i];
            console.log(`[FabricCanvas] Adding element ${i + 1}/${sortedElements.length}: type=${element.type}, id=${element.id}`);
            try {
                await this.addElement(element);
                console.log(`[FabricCanvas] Element ${i + 1} added successfully`);
            } catch (error) {
                console.error(`[FabricCanvas] Failed to add element ${i + 1}:`, error);
                // Continue with other elements instead of failing completely
            }
        }

        console.log('[FabricCanvas] Rendering canvas...');
        this.render();
        console.log('[FabricCanvas] loadPage completed for page:', page.id);
    }

    /**
     * Add an element based on its type
     */
    public async addElement(element: CanvasElement): Promise<fabric.Object | null> {
        switch (element.type) {
            case 'text':
                return this.addText(element as TextElement);
            case 'image':
                return await this.addImage(element as ImageElement);
            case 'shape':
                return this.addShape(element as ShapeElement);
            case 'line':
                return this.addLine(element as LineElement);
            case 'sticker':
                return await this.addSticker(element as StickerElement);
            case 'group':
                return await this.addGroup(element as GroupElement);
            default:
                console.warn(`Unknown element type: ${element.type}`);
                return null;
        }
    }

    /**
     * Update element transform on the canvas
     */
    public updateElementTransform(id: string, transform: { x?: number; y?: number; scaleX?: number; scaleY?: number; rotation?: number }): void {
        const obj = this.objectIdMap.get(id);
        if (!obj || !this.canvas) return;

        if (transform.x !== undefined) obj.set('left', transform.x);
        if (transform.y !== undefined) obj.set('top', transform.y);
        if (transform.scaleX !== undefined) obj.set('scaleX', transform.scaleX);
        if (transform.scaleY !== undefined) obj.set('scaleY', transform.scaleY);
        if (transform.rotation !== undefined) obj.set('angle', transform.rotation);

        obj.setCoords();
        obj.setCoords();
        this.canvas.requestRenderAll();
    }

    /**
     * Update element style on the canvas
     */
    public updateElementStyle(id: string, style: { opacity?: number; fill?: string; stroke?: string; strokeWidth?: number }): void {
        const obj = this.objectIdMap.get(id);
        if (!obj || !this.canvas) return;

        if (style.opacity !== undefined) obj.set('opacity', style.opacity);
        if (style.fill !== undefined) obj.set('fill', style.fill);
        if (style.stroke !== undefined) obj.set('stroke', style.stroke);
        if (style.strokeWidth !== undefined) obj.set('strokeWidth', style.strokeWidth);

        this.canvas.requestRenderAll();
    }

    /**
     * Update element blend mode on the canvas
     * Uses BlendModes utility for proper Canvas 2D API mapping
     * Custom modes are tracked for real-time pixel-level blending
     */
    public updateElementBlendMode(id: string, blendMode: BlendMode): void {
        const obj = this.objectIdMap.get(id);
        if (!obj || !this.canvas) return;

        // Get the Canvas 2D API blend mode (always returns valid value, may be approximation for custom modes)
        const canvasBlendMode = getCanvasBlendMode(blendMode);

        // Apply the blend mode for fallback/native rendering
        obj.set('globalCompositeOperation', canvasBlendMode);

        // Store the original blend mode for accurate export rendering
        (obj as any)._blendMode = blendMode;

        // Track custom blend modes for real-time pixel-level rendering
        if (isCustomBlendMode(blendMode)) {
            this.elementBlendModes.set(id, blendMode);
        } else {
            // Remove from tracking if switching to native mode
            this.elementBlendModes.delete(id);
        }

        // Mark the object as dirty to force re-render
        obj.dirty = true;

        // Request a full canvas re-render (will trigger after:render hook for custom modes)
        this.canvas.requestRenderAll();
    }

    /**
     * Get canvas JSON representation
     */
    public toJSON(): object {
        if (!this.canvas) return {};
        return this.canvas.toJSON(['data']);
    }

    /**
     * Pan canvas
     */
    public pan(deltaX: number, deltaY: number): void {
        if (!this.canvas) return;
        const vpt = this.canvas.viewportTransform;
        if (vpt) {
            vpt[4] += deltaX;
            vpt[5] += deltaY;
            this.canvas.setViewportTransform(vpt);
        }
    }

    /**
     * Reset viewport
     */
    public resetViewport(): void {
        if (!this.canvas) return;
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        this.canvas.renderAll();
    }

    /**
     * Add a sticker element (SVG with editable colors)
     */
    public async addSticker(element: StickerElement): Promise<fabric.Object> {
        if (!this.canvas) throw new Error('Canvas not initialized');

        return new Promise((resolve, reject) => {
            // Parse SVG string to fabric objects
            fabric.loadSVGFromString(element.svgContent, (objects, options) => {
                if (!this.canvas) {
                    reject(new Error('Canvas not initialized'));
                    return;
                }

                // Create a group from the SVG objects
                const group = fabric.util.groupSVGElements(objects, options);

                // Set position and properties
                group.set({
                    left: element.transform.x,
                    top: element.transform.y,
                    scaleX: element.transform.scaleX * (element.transform.width / (group.width || 100)),
                    scaleY: element.transform.scaleY * (element.transform.height / (group.height || 100)),
                    angle: element.transform.rotation,
                    originX: element.transform.originX,
                    originY: element.transform.originY,
                    opacity: element.style.opacity,
                    selectable: element.selectable,
                    lockMovementX: element.locked,
                    lockMovementY: element.locked,
                    visible: element.visible,
                    data: { id: element.id, type: 'sticker' },
                    globalCompositeOperation: getCanvasBlendMode(element.blendMode || 'normal') || 'source-over',
                });

                // Apply shadow/glow if present (for neon glow frames)
                if (element.style.shadow) {
                    group.shadow = new fabric.Shadow({
                        color: element.style.shadow.color,
                        blur: element.style.shadow.blur,
                        offsetX: element.style.shadow.offsetX,
                        offsetY: element.style.shadow.offsetY,
                    });
                }

                this.canvas!.add(group);
                this.objectIdMap.set(element.id, group);

                resolve(group);
            });
        });
    }

    /**
     * Update sticker SVG content (when colors change)
     */
    public updateStickerSvg(id: string, newSvgContent: string): void {
        if (!this.canvas) return;

        const existingObj = this.objectIdMap.get(id);
        if (!existingObj) return;

        // Check if the object is currently selected
        const activeObject = this.canvas.getActiveObject();
        const wasSelected = activeObject === existingObj || (activeObject?.type === 'activeSelection' && (activeObject as any).contains(existingObj));

        // Store current transform properties including shadow for glow effect
        const currentProps = {
            left: existingObj.left,
            top: existingObj.top,
            scaleX: existingObj.scaleX,
            scaleY: existingObj.scaleY,
            angle: existingObj.angle,
            originX: existingObj.originX,
            originY: existingObj.originY,
            opacity: existingObj.opacity,
            selectable: existingObj.selectable,
            lockMovementX: existingObj.lockMovementX,
            lockMovementY: existingObj.lockMovementY,
            visible: existingObj.visible,
            data: (existingObj as any).data,
        };

        // Store shadow separately (for glow frames)
        const existingShadow = existingObj.shadow;

        // Remove old object
        this.canvas.remove(existingObj);

        // Parse new SVG and create replacement object
        fabric.loadSVGFromString(newSvgContent, (objects, options) => {
            if (!this.canvas) return;

            const group = fabric.util.groupSVGElements(objects, options);

            // Restore transform properties
            group.set(currentProps);

            // Restore shadow/glow effect if it existed
            if (existingShadow) {
                group.shadow = existingShadow;
            }

            this.canvas.add(group);
            this.objectIdMap.set(id, group);

            // Restore selection if it was selected
            if (wasSelected) {
                this.canvas.setActiveObject(group);
            }

            this.canvas.requestRenderAll();
        });
    }
}

// Singleton instance
let fabricCanvasInstance: FabricCanvas | null = null;

export const getFabricCanvas = (): FabricCanvas => {
    if (!fabricCanvasInstance) {
        fabricCanvasInstance = new FabricCanvas();
    }
    return fabricCanvasInstance;
};

export const resetFabricCanvas = (): void => {
    if (fabricCanvasInstance) {
        fabricCanvasInstance.dispose();
        fabricCanvasInstance = null;
    }
};
