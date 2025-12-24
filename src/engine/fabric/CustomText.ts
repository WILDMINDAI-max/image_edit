// Custom Text
// Extended Fabric.js text object with rich formatting support

import { fabric } from 'fabric';
import { TextEffect, TextStyle } from '@/types/canvas';

export interface CustomTextOptions extends fabric.ITextboxOptions {
    customId?: string;
    effect?: TextEffect;
    textStyle?: Partial<TextStyle>;
}

/**
 * Extended Textbox class with additional features
 * Uses Textbox instead of IText for proper text wrapping and reflow
 */
export class CustomText extends fabric.Textbox {
    public customId?: string;
    public effect?: TextEffect;
    public customTextStyle?: Partial<TextStyle>;
    private _curveAmount: number = 0;
    private _bgPadding: number = 0;
    private _bgRadius: number = 0;
    private _bgColor: string = '';

    constructor(text: string, options?: CustomTextOptions) {
        // Set default width if not provided for proper text wrapping
        const opts = {
            ...options,
            width: options?.width || 300,
            splitByGrapheme: true, // Better handling of long words
        };
        super(text, opts);

        this.customId = options?.customId;
        this.effect = options?.effect;
        this.customTextStyle = options?.textStyle;

        if (this.effect) {
            this.applyEffect(this.effect);
        }
    }

    /**
     * Override initDimensions to account for curve
     */
    initDimensions(): void {
        super.initDimensions();
        if ((this as any)._curveAmount && (this as any)._curveAmount !== 0) {
            this._updateCurvedDimensions();
        }
    }

    /**
     * Update dimensions based on curve
     */
    private _updateCurvedDimensions(): void {
        const text = this.text || '';
        if (!text) return;

        // Use same logic as render to get radius
        // Fabric stores charSpacing in thousands of em unit
        const charSpacing = (this.charSpacing || 0) / 1000 * (this.fontSize || 40);

        // Calculate raw text width
        const ctx = (this.canvas as any)?.contextContainer || (fabric.util.createCanvasElement() as HTMLCanvasElement).getContext('2d');
        if (!ctx) return;

        ctx.font = (this as any)._getFontDeclaration ? (this as any)._getFontDeclaration() :
            `${this.fontStyle || 'normal'} ${this.fontWeight || 'normal'} ${this.fontSize || 40}px ${this.fontFamily || 'Times New Roman'}`;

        let totalWidth = 0;
        for (let i = 0; i < text.length; i++) {
            totalWidth += ctx.measureText(text[i]).width + charSpacing;
        }
        if (text.length > 0) totalWidth -= charSpacing;

        // Arc calculations
        const angleDegrees = Math.abs(this._curveAmount);
        const angleRadians = Math.max(0.0001, angleDegrees * (Math.PI / 180));
        const radius = totalWidth / angleRadians;

        // Calculate Bounding Box
        // Width:
        // If angle >= 180, width is full diameter (2*radius)
        // If angle < 180, width is chord length (2*r*sin(angle/2))
        let bboxWidth = 0;
        if (angleDegrees >= 180) {
            bboxWidth = radius * 2;
        } else {
            bboxWidth = 2 * radius * Math.sin(angleRadians / 2);
        }

        // Height:
        // Sagitta (arc height) = r * (1 - cos(angle/2))
        // We add font size to cover the text height roughly
        const sagitta = radius * (1 - Math.cos(angleRadians / 2));
        const bboxHeight = sagitta + (this.fontSize || 40);

        // Update dimensions
        this.width = bboxWidth;
        this.height = bboxHeight;

        // IMPORTANT: Update offsets so drawing stays centered in box
        // Fabric draws relative to (-width/2, -height/2)
        // Our render logic centers at (0,0) (offset by radius)

        // We may need to tweak pathOffset to ensure centering
        (this as any).pathOffset = new fabric.Point(this.width / 2, this.height / 2);

        // Mark coords as dirty to trigger re-calc of control points
        this.setCoords();
    }

    /**
     * Override _render to support curved text and custom backgrounds
     */
    _render(ctx: CanvasRenderingContext2D): void {
        // Draw custom background with padding and roundness if set
        if (this._bgColor && this._bgColor !== '') {
            this._renderCustomBackground(ctx);
        }

        // If no curve effect, render normally
        if (!this._curveAmount || this._curveAmount === 0) {
            super._render(ctx);
            return;
        }

        // Draw curved text
        this._renderCurvedText(ctx);
    }

    /**
     * Render custom background with padding and border radius
     */
    private _renderCustomBackground(ctx: CanvasRenderingContext2D): void {
        const padding = this._bgPadding || 0;
        const radius = this._bgRadius || 0;
        const width = (this.width || 0) + padding * 2;
        const height = (this.height || 0) + padding * 2;
        const x = -(this.width || 0) / 2 - padding;
        const y = -(this.height || 0) / 2 - padding;

        ctx.save();
        ctx.fillStyle = this._bgColor;

        // Draw rounded rectangle
        ctx.beginPath();
        if (radius > 0) {
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
        } else {
            ctx.rect(x, y, width, height);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /**
     * Render text along an arc path (like Canva)
     */
    private _renderCurvedText(ctx: CanvasRenderingContext2D): void {
        const text = this.text || '';
        if (!text) return;

        ctx.save();

        // Use Fabric's internal font string generation if possible, else fallback
        // The cast to 'any' allows accessing protected _getFontDeclaration
        ctx.font = (this as any)._getFontDeclaration ? (this as any)._getFontDeclaration() :
            `${this.fontStyle || 'normal'} ${this.fontWeight || 'normal'} ${this.fontSize || 40}px ${this.fontFamily || 'Times New Roman'}`;

        ctx.fillStyle = (this.fill as string) || '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Apply stroke if set
        if (this.stroke && this.strokeWidth) {
            ctx.strokeStyle = this.stroke as string;
            ctx.lineWidth = this.strokeWidth;
        }

        // Calculate total text width including char spacing
        // Fabric stores charSpacing in thousands of em unit
        const charSpacing = (this.charSpacing || 0) / 1000 * (this.fontSize || 40);

        let totalWidth = 0;
        const charWidths: number[] = [];

        for (let i = 0; i < text.length; i++) {
            // Measure width of each character
            const width = ctx.measureText(text[i]).width + charSpacing;
            charWidths.push(width);
            totalWidth += width;
        }

        // Remove trailing spacing from total width
        if (text.length > 0) {
            totalWidth -= charSpacing;
        }

        // Calculate arc parameters
        // curveAmount: -360 to 360 degrees
        // Treat 360 as a full circle
        const angleDegrees = Math.abs(this._curveAmount || 0);
        // Clamp minimum angle to avoid division by zero
        const angleRadians = Math.max(0.0001, angleDegrees * (Math.PI / 180));

        // Radius = ArcLength / AngleRadians
        const radius = totalWidth / angleRadians;

        // Determine if curving up or down
        const isUp = this._curveAmount > 0;

        // Start angle: we sweep centered around 0
        let currentAngle = -angleRadians / 2;

        // Draw each character
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charWidth = charWidths[i]; // includes spacing
            const actualCharWidth = charWidth - charSpacing;

            // The character occupies a segment of the arc
            const charSegmentAngle = charWidth / radius;

            // We want to center the character within its segment
            // But we also need to account for spacing
            // Effectively, move forward by half the char's width
            const charCenterAngle = currentAngle + ((actualCharWidth / 2) / radius);

            // Calculate position
            // To vertically center the whole shape:
            // The arc sagitta (height) = radius * (1 - cos(angle/2))
            const arcHeight = radius * (1 - Math.cos(angleRadians / 2));

            let x: number, y: number, rotation: number;

            if (isUp) {
                // Center at (0, radius) relative to arc top.
                x = radius * Math.sin(charCenterAngle);
                y = (radius - radius * Math.cos(charCenterAngle)) - (arcHeight / 2);
                rotation = charCenterAngle;
            } else {
                // Down curve
                x = radius * Math.sin(charCenterAngle);
                y = -(radius - radius * Math.cos(charCenterAngle)) + (arcHeight / 2);
                rotation = -charCenterAngle;
            }

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);

            ctx.fillText(char, 0, 0);
            if (this.stroke && this.strokeWidth) {
                ctx.strokeText(char, 0, 0);
            }

            ctx.restore();

            // Advance angle by the full segment (width + spacing)
            currentAngle += charSegmentAngle;
        }

        ctx.restore();
    }

    /**
     * Apply text effect
     */
    public applyEffect(effect: TextEffect): void {
        this.effect = effect;

        // Reset STYLE effect properties only (not shape)
        // Shape effects (curved) are independent and handled separately
        this.shadow = undefined;
        this.stroke = undefined;
        this.strokeWidth = 0;
        this.textBackgroundColor = '';
        this._bgColor = '';
        this._bgPadding = 0;
        this._bgRadius = 0;
        (this as any).paintFirst = 'fill'; // Reset paint order

        // Restore fill color if it was set to transparent by hollow effect
        if (this.fill === 'transparent' || this.fill === '') {
            this.fill = (this.customTextStyle as any)?.fill || '#000000';
        }

        // Apply SHAPE effect based on shapeType
        if (effect.shapeType === 'curved') {
            const curveAmount = effect.curveAmount || 0;
            this._curveAmount = curveAmount;
            this._updateCurvedDimensions();
        } else {
            // Reset curve if shape is 'none'
            this._curveAmount = 0;
        }

        // Calculate shadow angle offset
        const getAngleOffsets = (angle: number, distance: number) => {
            const radians = (angle - 90) * (Math.PI / 180);
            return {
                offsetX: Math.cos(radians) * distance,
                offsetY: Math.sin(radians) * distance
            };
        };

        switch (effect.type) {
            case 'shadow': {
                const { offsetX, offsetY } = getAngleOffsets(
                    effect.shadowAngle || 45,
                    effect.shadowDistance || 5
                );
                const opacity = (effect.shadowOpacity || 50) / 100;
                const shadowColor = effect.shadowColor || '#000000';
                // Convert hex to rgba with opacity
                const r = parseInt(shadowColor.slice(1, 3), 16);
                const g = parseInt(shadowColor.slice(3, 5), 16);
                const b = parseInt(shadowColor.slice(5, 7), 16);

                this.shadow = new fabric.Shadow({
                    color: `rgba(${r},${g},${b},${opacity})`,
                    blur: effect.shadowBlur || 10,
                    offsetX,
                    offsetY,
                });
                break;
            }

            case 'lift': {
                this.shadow = new fabric.Shadow({
                    color: 'rgba(0,0,0,0.3)',
                    blur: effect.liftBlur || 15,
                    offsetX: 0,
                    offsetY: effect.liftDistance || 8,
                });
                break;
            }

            case 'hollow': {
                this.stroke = effect.hollowColor || '#000000';
                this.strokeWidth = effect.hollowWidth || 2;
                this.fill = 'transparent';
                break;
            }

            case 'splice': {
                const offset = effect.spliceOffset || 3;
                const color = effect.spliceColor || '#cccccc';
                // Create a shadow effect for the splice look
                this.shadow = new fabric.Shadow({
                    color: color,
                    blur: 0,
                    offsetX: offset,
                    offsetY: offset,
                });
                // Add outline for the main text
                this.stroke = color;
                this.strokeWidth = 1;
                break;
            }

            case 'outline': {
                this.stroke = effect.outlineColor || '#000000';
                this.strokeWidth = effect.outlineWidth || 2;
                (this as any).paintFirst = 'stroke';
                break;
            }

            case 'echo': {
                // Echo creates multiple layers using shadow
                const offset = effect.echoOffset || 5;
                const layers = effect.echoLayers || 3;
                const color = effect.echoColor || '#cccccc';
                // Create echo effect with blur to simulate multiple layers
                this.shadow = new fabric.Shadow({
                    color: color,
                    blur: layers * 2, // Blur increases with layers for smoother effect
                    offsetX: offset * layers,
                    offsetY: offset * layers,
                });
                // Add subtle stroke to make main text stand out
                this.stroke = color;
                this.strokeWidth = 0.5;
                break;
            }

            case 'glitch': {
                const intensity = effect.glitchIntensity || 5;
                const color1 = effect.glitchColor1 || '#00ffff';
                const color2 = effect.glitchColor2 || '#ff00ff';
                // Create glitch effect by offsetting with two colors
                // Using shadow for one color offset
                this.shadow = new fabric.Shadow({
                    color: color1,
                    blur: 0,
                    offsetX: -intensity,
                    offsetY: 0,
                });
                // Use stroke for the second color
                this.stroke = color2;
                this.strokeWidth = 1;
                break;
            }

            case 'neon': {
                const color = effect.neonColor || '#ff00ff';
                const intensity = effect.neonIntensity || 30;
                // Create neon glow effect
                this.shadow = new fabric.Shadow({
                    color: color,
                    blur: intensity,
                    offsetX: 0,
                    offsetY: 0,
                });
                // Set fill to the neon color for the glowing text
                this.stroke = color;
                this.strokeWidth = 1;
                break;
            }

            case 'background': {
                const bgColor = effect.backgroundColor || '#f0f0f0';
                const padding = effect.backgroundPadding || 10;
                const radius = effect.backgroundRadius || 5;

                // Store custom background properties for custom rendering
                this._bgColor = bgColor;
                this._bgPadding = padding;
                this._bgRadius = radius;

                // Clear textBackgroundColor since we're using custom render
                this.textBackgroundColor = '';
                break;
            }

            // Note: 'curved' is now handled via shapeType above, not as a style effect

            case 'none':
            default:
                // Reset style-specific properties only (not shape/curve)
                this.textBackgroundColor = '';
                // Note: _curveAmount is NOT reset here because it's a shape effect, not style
                break;
        }

        this.dirty = true;
        this.canvas?.renderAll();
    }

    /**
     * Update text style
     */
    public updateTextStyle(style: Partial<TextStyle>): void {
        if (style.fontFamily) this.fontFamily = style.fontFamily;
        if (style.fontSize) this.fontSize = style.fontSize;
        if (style.fontWeight) this.fontWeight = style.fontWeight as number | string;
        if (style.fontStyle) this.fontStyle = style.fontStyle;
        if (style.textAlign) this.textAlign = style.textAlign;
        if (style.lineHeight) this.lineHeight = style.lineHeight;
        if (style.letterSpacing !== undefined) this.charSpacing = style.letterSpacing * 100;
        if (style.textDecoration) {
            this.underline = style.textDecoration === 'underline';
            this.linethrough = style.textDecoration === 'line-through';
        }

        this.customTextStyle = { ...this.customTextStyle, ...style };
        this.dirty = true;
        this.canvas?.renderAll();
    }

    /**
     * Get current text style
     */
    public getTextStyle(): TextStyle {
        return {
            fontFamily: this.fontFamily || 'Inter',
            fontSize: this.fontSize || 24,
            fontWeight: (this.fontWeight as number | 'normal' | 'bold') || 'normal',
            fontStyle: (this.fontStyle as 'normal' | 'italic') || 'normal',
            textDecoration: this.underline ? 'underline' : this.linethrough ? 'line-through' : 'none',
            textAlign: (this.textAlign as 'left' | 'center' | 'right' | 'justify') || 'left',
            lineHeight: this.lineHeight || 1.4,
            letterSpacing: (this.charSpacing || 0) / 100,
            textTransform: 'none',
        };
    }

    /**
     * Override toObject to include custom properties
     */
    public toObject(propertiesToInclude?: string[]): object {
        return {
            ...super.toObject(propertiesToInclude),
            customId: this.customId,
            effect: this.effect,
            customTextStyle: this.customTextStyle,
        };
    }

    /**
     * Static method to create from object
     */
    static fromObject(object: CustomTextOptions, callback?: (text: CustomText) => void): CustomText {
        const text = new CustomText(object.text || '', object);
        callback?.(text);
        return text;
    }
}

// Register custom class with Fabric
(fabric as unknown as Record<string, unknown>).CustomText = CustomText;

/**
 * Create gradient fill for text
 */
export const createTextGradient = (
    colors: string[],
    type: 'linear' | 'radial' = 'linear',
    angle: number = 0
): fabric.Gradient => {
    const colorStops: Record<string, string> = {};
    colors.forEach((color, index) => {
        colorStops[String(index / (colors.length - 1))] = color;
    });

    return new fabric.Gradient({
        type,
        coords: type === 'linear'
            ? {
                x1: 0,
                y1: 0,
                x2: Math.cos(angle * Math.PI / 180) * 100,
                y2: Math.sin(angle * Math.PI / 180) * 100,
            }
            : { x1: 50, y1: 50, r1: 0, x2: 50, y2: 50, r2: 50 },
        colorStops: Object.entries(colorStops).map(([offset, color]) => ({
            offset: parseFloat(offset),
            color,
        })),
    });
};

/**
 * Text preset type
 */
export interface TextPresetConfig {
    name: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number | 'normal' | 'bold';
    color: string;
    effect?: TextEffect;
}

/**
 * Built-in text presets
 */
export const TEXT_PRESETS: TextPresetConfig[] = [
    {
        name: 'Heading Bold',
        fontFamily: 'Inter',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    {
        name: 'Subheading',
        fontFamily: 'Inter',
        fontSize: 32,
        fontWeight: 600,
        color: '#333333',
    },
    {
        name: 'Body',
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 'normal',
        color: '#4a4a4a',
    },
    {
        name: 'Caption',
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: 'normal',
        color: '#666666',
    },
    {
        name: 'Neon Glow',
        fontFamily: 'Inter',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#00ff88',
        effect: { type: 'neon', neonColor: '#00ff88', neonIntensity: 30 },
    },
    {
        name: 'Shadow Pop',
        fontFamily: 'Inter',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
        effect: { type: 'shadow', shadowColor: '#000000', shadowOpacity: 50, shadowBlur: 15, shadowDistance: 8, shadowAngle: 45 },
    },
    {
        name: 'Outlined',
        fontFamily: 'Inter',
        fontSize: 36,
        fontWeight: 'bold',
        color: 'transparent',
        effect: { type: 'outline', outlineColor: '#000000', outlineWidth: 3 },
    },
];
