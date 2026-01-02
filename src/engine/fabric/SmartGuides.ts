// Smart Guides System
// Provides alignment guides and distance indicators similar to Canva/Figma
// Used during object moving/scaling to help users align elements precisely

import { fabric } from 'fabric';

// Types for guide visualization
export interface GuideLine {
    orientation: 'horizontal' | 'vertical';
    position: number;  // x for vertical lines, y for horizontal lines
    start: number;     // start coordinate (y for vertical, x for horizontal)
    end: number;       // end coordinate
    type: 'edge' | 'center' | 'canvas-edge' | 'canvas-center';
}

export interface DistanceIndicator {
    x: number;
    y: number;
    distance: number;
    orientation: 'horizontal' | 'vertical';
}

export interface SnapResult {
    snapX: number | null;  // If not null, snap to this X position
    snapY: number | null;  // If not null, snap to this Y position
    guideLines: GuideLine[];
    distanceIndicators: DistanceIndicator[];
}

export interface ObjectBounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
    centerX: number;
    centerY: number;
    width: number;
    height: number;
}

// Visual style constants
export const GUIDE_STYLES = {
    lineColor: '#c026d3',      // Magenta
    lineWidth: 1,
    lineDash: [4, 4],
    distanceBgColor: '#8b5cf6', // Purple
    distanceTextColor: '#ffffff',
    distanceFontSize: 10,
    distancePadding: { x: 6, y: 3 },
    distanceBorderRadius: 4,
};

export class SmartGuides {
    private canvas: fabric.Canvas;
    private snapThreshold: number = 8;  // Pixels within which snapping occurs
    private enabled: boolean = true;

    // Active guides state (rendered after each movement)
    private activeGuideLines: GuideLine[] = [];
    private activeDistanceIndicators: DistanceIndicator[] = [];

    constructor(canvas: fabric.Canvas, options?: { snapThreshold?: number }) {
        this.canvas = canvas;
        if (options?.snapThreshold) {
            this.snapThreshold = options.snapThreshold;
        }
    }

    /**
     * Enable or disable smart guides
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        if (!enabled) {
            this.clearGuides();
        }
    }

    /**
     * Check if smart guides are enabled
     */
    public isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Get bounds of a Fabric object
     */
    private getObjectBounds(obj: fabric.Object): ObjectBounds {
        const bound = obj.getBoundingRect(true, true);
        return {
            left: bound.left,
            top: bound.top,
            right: bound.left + bound.width,
            bottom: bound.top + bound.height,
            centerX: bound.left + bound.width / 2,
            centerY: bound.top + bound.height / 2,
            width: bound.width,
            height: bound.height,
        };
    }

    /**
     * Get canvas bounds for snapping to canvas edges and center
     */
    private getCanvasBounds(): ObjectBounds {
        const width = this.canvas.getWidth();
        const height = this.canvas.getHeight();
        return {
            left: 0,
            top: 0,
            right: width,
            bottom: height,
            centerX: width / 2,
            centerY: height / 2,
            width,
            height,
        };
    }

    /**
     * Calculate snap points and guides when moving an object
     * Call this during object:moving event
     */
    public calculateSnap(movingObject: fabric.Object): SnapResult {
        if (!this.enabled) {
            return { snapX: null, snapY: null, guideLines: [], distanceIndicators: [] };
        }

        const movingBounds = this.getObjectBounds(movingObject);
        const canvasBounds = this.getCanvasBounds();

        // Collect all target snap points from other objects and canvas
        const allTargetBounds: { bounds: ObjectBounds; isCanvas: boolean }[] = [];

        // Add canvas as a target
        allTargetBounds.push({ bounds: canvasBounds, isCanvas: true });

        // Add all other objects as targets
        const allObjects = this.canvas.getObjects();
        for (const obj of allObjects) {
            // Skip the moving object and any non-selectable objects
            if (obj === movingObject) continue;
            if (obj.data?.type === 'guide') continue;  // Skip guide objects if any

            allTargetBounds.push({ bounds: this.getObjectBounds(obj), isCanvas: false });
        }

        // Find alignments
        const guideLines: GuideLine[] = [];
        let snapX: number | null = null;
        let snapY: number | null = null;
        let closestDeltaX = this.snapThreshold + 1;
        let closestDeltaY = this.snapThreshold + 1;

        // Moving object snap points (edges and center)
        const movingSnapPointsX = [
            { value: movingBounds.left, type: 'left' as const },
            { value: movingBounds.centerX, type: 'center' as const },
            { value: movingBounds.right, type: 'right' as const },
        ];

        const movingSnapPointsY = [
            { value: movingBounds.top, type: 'top' as const },
            { value: movingBounds.centerY, type: 'center' as const },
            { value: movingBounds.bottom, type: 'bottom' as const },
        ];

        for (const { bounds: targetBounds, isCanvas } of allTargetBounds) {
            // Target snap points
            const targetSnapPointsX = [
                { value: targetBounds.left, type: 'edge' as const },
                { value: targetBounds.centerX, type: 'center' as const },
                { value: targetBounds.right, type: 'edge' as const },
            ];

            const targetSnapPointsY = [
                { value: targetBounds.top, type: 'edge' as const },
                { value: targetBounds.centerY, type: 'center' as const },
                { value: targetBounds.bottom, type: 'edge' as const },
            ];

            // Check X alignments (vertical lines)
            for (const movingPoint of movingSnapPointsX) {
                for (const targetPoint of targetSnapPointsX) {
                    const delta = Math.abs(movingPoint.value - targetPoint.value);
                    if (delta < this.snapThreshold && delta < closestDeltaX) {
                        closestDeltaX = delta;
                        // Calculate snap offset based on which point of moving object is snapping
                        const offset = targetPoint.value - movingPoint.value;
                        snapX = (movingObject.left || 0) + offset;

                        // Determine guide line type
                        let guideType: GuideLine['type'];
                        if (isCanvas) {
                            guideType = targetPoint.type === 'center' ? 'canvas-center' : 'canvas-edge';
                        } else {
                            guideType = targetPoint.type === 'center' ? 'center' : 'edge';
                        }

                        // Add vertical guide line
                        guideLines.push({
                            orientation: 'vertical',
                            position: targetPoint.value,
                            start: Math.min(movingBounds.top, targetBounds.top) - 20,
                            end: Math.max(movingBounds.bottom, targetBounds.bottom) + 20,
                            type: guideType,
                        });
                    }
                }
            }

            // Check Y alignments (horizontal lines)
            for (const movingPoint of movingSnapPointsY) {
                for (const targetPoint of targetSnapPointsY) {
                    const delta = Math.abs(movingPoint.value - targetPoint.value);
                    if (delta < this.snapThreshold && delta < closestDeltaY) {
                        closestDeltaY = delta;
                        // Calculate snap offset based on which point of moving object is snapping
                        const offset = targetPoint.value - movingPoint.value;
                        snapY = (movingObject.top || 0) + offset;

                        // Determine guide line type
                        let guideType: GuideLine['type'];
                        if (isCanvas) {
                            guideType = targetPoint.type === 'center' ? 'canvas-center' : 'canvas-edge';
                        } else {
                            guideType = targetPoint.type === 'center' ? 'center' : 'edge';
                        }

                        // Add horizontal guide line
                        guideLines.push({
                            orientation: 'horizontal',
                            position: targetPoint.value,
                            start: Math.min(movingBounds.left, targetBounds.left) - 20,
                            end: Math.max(movingBounds.right, targetBounds.right) + 20,
                            type: guideType,
                        });
                    }
                }
            }
        }

        // Calculate distance indicators for nearby objects (when not aligned)
        const distanceIndicators = this.calculateDistanceIndicators(movingBounds, allTargetBounds);

        // Store active guides for rendering
        this.activeGuideLines = guideLines;
        this.activeDistanceIndicators = distanceIndicators;

        return { snapX, snapY, guideLines, distanceIndicators };
    }

    /**
     * Calculate distance indicators between moving object and nearby objects
     */
    private calculateDistanceIndicators(
        movingBounds: ObjectBounds,
        targets: { bounds: ObjectBounds; isCanvas: boolean }[]
    ): DistanceIndicator[] {
        const indicators: DistanceIndicator[] = [];
        const distanceThreshold = 150; // Only show distances within this range

        for (const { bounds: targetBounds, isCanvas } of targets) {
            if (isCanvas) continue; // Don't show distance to canvas

            // Check if objects overlap - if so, skip distance indicators
            const overlapX = !(movingBounds.right < targetBounds.left || movingBounds.left > targetBounds.right);
            const overlapY = !(movingBounds.bottom < targetBounds.top || movingBounds.top > targetBounds.bottom);

            if (overlapX && overlapY) continue; // Objects overlap

            // Horizontal distance (when objects are side by side)
            if (overlapY) {
                let distance: number;
                let x: number;

                if (movingBounds.right < targetBounds.left) {
                    // Moving object is to the left
                    distance = targetBounds.left - movingBounds.right;
                    x = movingBounds.right + distance / 2;
                } else if (movingBounds.left > targetBounds.right) {
                    // Moving object is to the right
                    distance = movingBounds.left - targetBounds.right;
                    x = targetBounds.right + distance / 2;
                } else {
                    continue;
                }

                if (distance > 0 && distance < distanceThreshold) {
                    const y = Math.max(movingBounds.top, targetBounds.top) +
                        Math.min(movingBounds.height, targetBounds.height) / 2;
                    indicators.push({
                        x,
                        y,
                        distance: Math.round(distance),
                        orientation: 'horizontal',
                    });
                }
            }

            // Vertical distance (when objects are stacked)
            if (overlapX) {
                let distance: number;
                let y: number;

                if (movingBounds.bottom < targetBounds.top) {
                    // Moving object is above
                    distance = targetBounds.top - movingBounds.bottom;
                    y = movingBounds.bottom + distance / 2;
                } else if (movingBounds.top > targetBounds.bottom) {
                    // Moving object is below
                    distance = movingBounds.top - targetBounds.bottom;
                    y = targetBounds.bottom + distance / 2;
                } else {
                    continue;
                }

                if (distance > 0 && distance < distanceThreshold) {
                    const x = Math.max(movingBounds.left, targetBounds.left) +
                        Math.min(movingBounds.width, targetBounds.width) / 2;
                    indicators.push({
                        x,
                        y,
                        distance: Math.round(distance),
                        orientation: 'vertical',
                    });
                }
            }
        }

        return indicators;
    }

    /**
     * Clear all active guides
     */
    public clearGuides(): void {
        this.activeGuideLines = [];
        this.activeDistanceIndicators = [];
    }

    /**
     * Get active guide lines for rendering
     */
    public getActiveGuideLines(): GuideLine[] {
        return this.activeGuideLines;
    }

    /**
     * Get active distance indicators for rendering
     */
    public getActiveDistanceIndicators(): DistanceIndicator[] {
        return this.activeDistanceIndicators;
    }

    /**
     * Render guides on canvas context
     * Call this in after:render callback
     */
    public renderGuides(ctx: CanvasRenderingContext2D): void {
        if (!this.enabled) return;

        ctx.save();

        // Render guide lines
        for (const line of this.activeGuideLines) {
            ctx.beginPath();
            ctx.strokeStyle = GUIDE_STYLES.lineColor;
            ctx.lineWidth = GUIDE_STYLES.lineWidth;
            ctx.setLineDash(GUIDE_STYLES.lineDash);

            if (line.orientation === 'vertical') {
                ctx.moveTo(line.position, line.start);
                ctx.lineTo(line.position, line.end);
            } else {
                ctx.moveTo(line.start, line.position);
                ctx.lineTo(line.end, line.position);
            }

            ctx.stroke();
        }

        // Render distance indicators
        ctx.setLineDash([]);  // Reset dash for badges

        for (const indicator of this.activeDistanceIndicators) {
            this.renderDistanceBadge(ctx, indicator);
        }

        ctx.restore();
    }

    /**
     * Render a single distance badge
     */
    private renderDistanceBadge(ctx: CanvasRenderingContext2D, indicator: DistanceIndicator): void {
        const text = `${indicator.distance}`;
        ctx.font = `${GUIDE_STYLES.distanceFontSize}px Inter, system-ui, sans-serif`;
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = GUIDE_STYLES.distanceFontSize;

        const badgeWidth = textWidth + GUIDE_STYLES.distancePadding.x * 2;
        const badgeHeight = textHeight + GUIDE_STYLES.distancePadding.y * 2;

        const badgeX = indicator.x - badgeWidth / 2;
        const badgeY = indicator.y - badgeHeight / 2;

        // Draw background
        ctx.fillStyle = GUIDE_STYLES.distanceBgColor;
        ctx.beginPath();
        this.roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, GUIDE_STYLES.distanceBorderRadius);
        ctx.fill();

        // Draw text
        ctx.fillStyle = GUIDE_STYLES.distanceTextColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, indicator.x, indicator.y);

        // Draw connecting lines for distance indicator
        ctx.strokeStyle = GUIDE_STYLES.distanceBgColor;
        ctx.lineWidth = 1;

        if (indicator.orientation === 'horizontal') {
            // Draw horizontal connecting lines
            const lineY = indicator.y;
            ctx.beginPath();
            ctx.moveTo(indicator.x - indicator.distance / 2, lineY);
            ctx.lineTo(badgeX - 2, lineY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(badgeX + badgeWidth + 2, lineY);
            ctx.lineTo(indicator.x + indicator.distance / 2, lineY);
            ctx.stroke();
        } else {
            // Draw vertical connecting lines
            const lineX = indicator.x;
            ctx.beginPath();
            ctx.moveTo(lineX, indicator.y - indicator.distance / 2);
            ctx.lineTo(lineX, badgeY - 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(lineX, badgeY + badgeHeight + 2);
            ctx.lineTo(lineX, indicator.y + indicator.distance / 2);
            ctx.stroke();
        }
    }

    /**
     * Helper to draw rounded rectangle (for older browsers/canvas without roundRect)
     */
    private roundRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
    ): void {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

// Singleton instance - to be initialized when FabricCanvas is created
let smartGuidesInstance: SmartGuides | null = null;

export function initSmartGuides(canvas: fabric.Canvas, options?: { snapThreshold?: number }): SmartGuides {
    smartGuidesInstance = new SmartGuides(canvas, options);
    return smartGuidesInstance;
}

export function getSmartGuides(): SmartGuides | null {
    return smartGuidesInstance;
}

export function disposeSmartGuides(): void {
    if (smartGuidesInstance) {
        smartGuidesInstance.clearGuides();
        smartGuidesInstance = null;
    }
}
