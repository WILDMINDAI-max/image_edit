// Fabric Canvas
// Core Fabric.js wrapper and initialization

import { fabric } from 'fabric';
import { CanvasElement, TextElement, ImageElement, ShapeElement } from '@/types/canvas';
import { Page, PageBackground } from '@/types/project';
import { CustomText } from './CustomText';

export interface FabricCanvasOptions {
    width: number;
    height: number;
    backgroundColor?: string;
    preserveObjectStacking?: boolean;
    selection?: boolean;
    controlsAboveOverlay?: boolean;
}

export class FabricCanvas {
    private canvas: fabric.Canvas | null = null;
    private containerElement: HTMLCanvasElement | null = null;
    private objectIdMap: Map<string, fabric.Object> = new Map();

    // Event callbacks
    public onSelectionChange?: (selectedIds: string[]) => void;
    public onObjectModified?: (id: string) => void;
    public onObjectUpdating?: (id: string) => void;
    public onObjectAdded?: (id: string) => void;
    public onObjectRemoved?: (id: string) => void;

    constructor() {
        this.objectIdMap = new Map();
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

        return this.canvas;
    }

    /**
     * Dispose of the canvas and clean up resources
     */
    public dispose(): void {
        if (this.canvas) {
            this.canvas.dispose();
            this.canvas = null;
        }
        this.objectIdMap.clear();
        this.containerElement = null;
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
            if (obj && obj.data?.id) {
                this.onObjectModified?.(obj.data.id);
            }
        });

        // Object updating events (during transform)
        const onUpdating = (e: fabric.IEvent<MouseEvent>) => {
            const obj = e.target as fabric.Object & { data?: { id: string } };
            if (obj && obj.data?.id) {
                this.onObjectUpdating?.(obj.data.id);
            }
        };

        this.canvas.on('object:scaling', onUpdating);
        this.canvas.on('object:rotating', onUpdating);
        this.canvas.on('object:moving', onUpdating);

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
    }

    /**
     * Setup custom control styling
     */
    /**
     * Setup custom control styling
     */
    private setupCustomControls(): void {
        // Customize control appearance
        fabric.Object.prototype.transparentCorners = false;
        fabric.Object.prototype.cornerColor = '#ffffff';
        fabric.Object.prototype.cornerStyle = 'circle';
        fabric.Object.prototype.borderColor = '#2563eb';
        fabric.Object.prototype.borderScaleFactor = 2;
        fabric.Object.prototype.padding = 10;
        fabric.Object.prototype.cornerStrokeColor = '#2563eb';

        // Render function for circular corner controls (tl, tr, bl, br)
        const renderCircleControl = (ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: fabric.Object) => {
            const size = 18; // Reduced from 24
            ctx.save();
            ctx.translate(left, top);
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#2563eb';
            ctx.stroke();
            ctx.restore();
        };

        // Render function for horizontal pill-shaped side controls (mt, mb)
        const renderPillControlH = (ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: fabric.Object) => {
            const width = 24;
            const height = 8;
            const radius = 4;

            ctx.save();
            ctx.translate(left, top);

            // Rotate the pill to match object rotation
            const angle = fabric.util.degreesToRadians(fabricObject.angle || 0);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.roundRect(-width / 2, -height / 2, width, height, radius);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#2563eb';
            ctx.stroke();
            ctx.restore();
        };

        // Render function for vertical pill-shaped side controls (ml, mr)
        const renderPillControlV = (ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: fabric.Object) => {
            const width = 8;
            const height = 24;
            const radius = 4;

            ctx.save();
            ctx.translate(left, top);

            // Rotate the pill to match object rotation
            const angle = fabric.util.degreesToRadians(fabricObject.angle || 0);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.roundRect(-width / 2, -height / 2, width, height, radius);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#2563eb';
            ctx.stroke();
            ctx.restore();
        };

        // Custom Rotation Control Renderer
        const renderRotationControl = (ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: fabric.Object) => {
            const size = 24; // Reduced from 32
            ctx.save();
            ctx.translate(left, top);

            // Blue circle background
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#2563eb';
            ctx.fill();

            // White refresh icon (scaled down)
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            // Draw an open circle arrow
            ctx.arc(0, 0, 6, 0.2 * Math.PI, 1.8 * Math.PI);
            ctx.stroke();

            // Arrowhead
            ctx.beginPath();
            ctx.moveTo(4, -4);
            ctx.lineTo(6, -6);
            ctx.lineTo(8, -3);
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
     * Resize the canvas
     */
    public resize(width: number, height: number): void {
        if (!this.canvas) return;

        this.canvas.setDimensions({ width, height });
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
     */
    public addText(element: TextElement): fabric.IText {
        if (!this.canvas) throw new Error('Canvas not initialized');

        // Use CustomText for rich text effects support
        const text = new CustomText(element.content, {
            left: element.transform.x,
            top: element.transform.y,
            width: element.transform.width,
            fontFamily: element.textStyle.fontFamily,
            fontSize: element.textStyle.fontSize,
            fontWeight: element.textStyle.fontWeight as number,
            fontStyle: element.textStyle.fontStyle,
            textAlign: element.textStyle.textAlign,
            lineHeight: element.textStyle.lineHeight,
            charSpacing: element.textStyle.letterSpacing * 100,
            fill: element.style.fill as string,
            stroke: element.style.stroke ?? undefined,
            strokeWidth: element.style.strokeWidth,
            opacity: element.style.opacity,
            angle: element.transform.rotation,
            scaleX: element.transform.scaleX,
            scaleY: element.transform.scaleY,
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
     */
    public async addImage(element: ImageElement): Promise<fabric.Image> {
        if (!this.canvas) throw new Error('Canvas not initialized');

        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(
                element.src,
                (img: fabric.Image) => {
                    if (!this.canvas) {
                        reject(new Error('Canvas not initialized'));
                        return;
                    }

                    img.set({
                        left: element.transform.x,
                        top: element.transform.y,
                        scaleX: element.transform.scaleX,
                        scaleY: element.transform.scaleY,
                        angle: element.transform.rotation,
                        originX: element.transform.originX,
                        originY: element.transform.originY,
                        opacity: element.style.opacity,
                        selectable: element.selectable,
                        lockMovementX: element.locked,
                        lockMovementY: element.locked,
                        visible: element.visible,
                        data: { id: element.id, type: 'image' },
                    });

                    // Apply filters
                    this.applyImageFilters(img, element);

                    this.canvas!.add(img);
                    this.objectIdMap.set(element.id, img);

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

        switch (element.shapeType) {
            case 'rectangle':
                shape = new fabric.Rect({
                    width: element.transform.width,
                    height: element.transform.height,
                    rx: element.style.cornerRadius,
                    ry: element.style.cornerRadius,
                });
                break;

            case 'circle':
                shape = new fabric.Circle({
                    radius: Math.min(element.transform.width, element.transform.height) / 2,
                });
                break;

            case 'triangle':
                shape = new fabric.Triangle({
                    width: element.transform.width,
                    height: element.transform.height,
                });
                break;

            case 'polygon':
                shape = new fabric.Polygon(
                    this.generatePolygonPoints(element.points || 6, 50),
                    {}
                );
                break;

            case 'line':
                shape = new fabric.Line([0, 0, element.transform.width, 0], {
                    strokeWidth: element.style.strokeWidth || 2,
                });
                break;

            case 'star':
                shape = new fabric.Polygon(
                    this.generateStarPoints(element.points || 5, 50, element.innerRadius || 25),
                    {}
                );
                break;

            default:
                shape = new fabric.Rect({
                    width: element.transform.width,
                    height: element.transform.height,
                });
        }

        shape.set({
            left: element.transform.x,
            top: element.transform.y,
            fill: element.style.fill as string,
            stroke: element.style.stroke ?? undefined,
            strokeWidth: element.style.strokeWidth,
            opacity: element.style.opacity,
            angle: element.transform.rotation,
            scaleX: element.transform.scaleX,
            scaleY: element.transform.scaleY,
            originX: element.transform.originX,
            originY: element.transform.originY,
            selectable: element.selectable,
            lockMovementX: element.locked,
            lockMovementY: element.locked,
            visible: element.visible,
            data: { id: element.id, type: 'shape' },
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
     * Clear all objects
     */
    public clear(): void {
        if (!this.canvas) return;
        this.canvas.clear();
        this.objectIdMap.clear();
    }

    /**
     * Render the canvas
     */
    public render(): void {
        if (!this.canvas) return;
        this.canvas.renderAll();
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
        this.clear();

        if (!this.canvas) return;

        // Set dimensions
        this.resize(page.width, page.height);

        // Set background
        this.setBackground(page.background);

        // Sort elements by zIndex
        const sortedElements = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);

        // Add elements
        for (const element of sortedElements) {
            await this.addElement(element);
        }

        this.render();
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
            // TODO: Add more element types
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
     * Get canvas JSON representation
     */
    public toJSON(): object {
        if (!this.canvas) return {};
        return this.canvas.toJSON(['data']);
    }

    /**
     * Set zoom level
     */
    public setZoom(zoom: number): void {
        if (!this.canvas) return;
        this.canvas.setZoom(zoom / 100);
        this.canvas.renderAll();
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
