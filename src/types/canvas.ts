// Canvas Element Type Definitions
// Core types for all canvas elements in the design editor

export type ElementType = 'text' | 'image' | 'shape' | 'line' | 'svg' | 'group' | 'chart' | 'video' | 'sticker';

export type ShapeType =
    // Lines (14 shapes)
    | 'solid-line'
    | 'dashed-line'
    | 'dotted-line'
    | 'line-arrow-right'
    | 'line-arrow-right-long'
    | 'dotted-arrow-right'
    | 'line-bar-arrow'
    | 'line-double-arrow'
    | 'dotted-double-arrow'
    | 'line-square-filled'
    | 'line-circle-filled'
    | 'line-diamond-filled'
    | 'line-square-outline'
    | 'line-circle-outline'
    // Basic shapes (22 Canva shapes)
    | 'square'
    | 'rounded-square'
    | 'circle'
    | 'triangle-up'
    | 'triangle-down'
    | 'diamond'
    | 'plus'
    | 'hexagon'
    | 'ticket'
    | 'parallelogram-left'
    | 'parallelogram-right'
    | 'trapezoid'
    | 'inverted-trapezoid'
    | 'u-shape'
    | 'arch'
    | 'rounded-bottom'
    | 'stadium'
    | 'right-triangle'
    | 'half-circle'
    | 'quarter-circle'
    | 'quarter-ring'
    | 'semi-ring'
    | 'concave-oval'
    | 'l-shape'
    | 'concave-square'
    | 'stairs'
    | 'shield-badge'
    | 'shield-curved'
    | 'quatrefoil-cross'
    | 'sparkle-4'
    | 'building-blocks-1'
    | 'building-blocks-2'
    | 'building-blocks-3'
    | 'blob-1'
    | 'blob-2'
    | 'blob-3'
    | 'blob-wavy'
    | 'blob-pear'
    | 'blob-abstract'
    // Legacy/compatibility
    | 'rectangle'
    | 'rounded-rectangle'
    | 'triangle'
    | 'polygon'
    | 'line'
    | 'arrow'
    | 'star'
    // Polygons
    | 'pentagon'
    | 'heptagon'
    | 'octagon'
    | 'nonagon'
    | 'decagon'
    | 'pointed-pentagon'
    | 'pointed-pentagon-left'
    | 'pointed-hexagon'
    | 'pointed-hexagon-left'
    | 'hexagon-horizontal'
    | 'octagon-chamfered'
    // Stars
    | 'star-4'
    | 'star-5'
    | 'star-6'
    | 'star-8'
    | 'star-12'
    | 'burst'
    | 'star-8-badge'
    | 'star-8-seal'
    | 'star-12-sharp'
    | 'star-8-wave'
    | 'starburst-12'
    | 'starburst-16'
    | 'starburst-24'
    | 'star-6-david'
    | 'star-8-compass'
    | 'star-9-sharp'
    | 'star-10-thin'
    | 'seal-24'
    // Flowcharts
    | 'flowchart-process'
    | 'flowchart-terminal'
    | 'flowchart-rectangle'
    | 'flowchart-decision'
    | 'flowchart-document'
    | 'flowchart-data'
    | 'flowchart-manual'
    | 'flowchart-delay'
    | 'flowchart-extract'
    | 'flowchart-connector'
    | 'flowchart-merge'
    | 'flowchart-shield'
    | 'flowchart-flag'
    | 'flowchart-shield-rounded'
    | 'flowchart-bookmark'
    // Arrows
    | 'arrow-right'
    | 'arrow-left'
    | 'arrow-up'
    | 'arrow-down'
    | 'double-arrow-h'
    | 'double-arrow-v'
    | 'chevron-right'
    | 'chevron-left'
    // Callouts
    | 'speech-bubble-rect'
    | 'speech-bubble-round'
    | 'thought-bubble'
    | 'callout-box'
    // Symbols
    | 'heart'
    | 'cloud'
    | 'teardrop'
    | 'cross'
    | 'minus'
    | 'lightning'
    | 'moon'
    | 'sun'
    | 'quatrefoil'
    | 'hourglass'
    | 'pacman'
    | 'semicircle-left'
    | 'z-shape'
    | 'tag'
    | 'pinwheel'
    | 'double-diamond'
    | 'quatrefoil-frame'
    | 'flower-8-pointed'
    | 'flower-6-petal'
    | 'flower-8-rounded'
    | 'daisy'
    | 'clover-4'
    | 'leaf-4-petal'
    | 'leaf-simple'
    | 'wave'
    | 'banner-curved'
    // Custom
    | 'custom-path';

// Transform properties for positioning and scaling
export interface Transform {
    x: number;
    y: number;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
    rotation: number; // degrees
    skewX: number;
    skewY: number;
    originX: 'left' | 'center' | 'right';
    originY: 'top' | 'center' | 'bottom';
}

// Style properties for visual appearance
export interface Style {
    fill: string | GradientFill | null;
    stroke: string | null;
    strokeWidth: number;
    opacity: number;
    shadow: Shadow | null;
    cornerRadius: number;
}

export interface Shadow {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
}

export interface GradientFill {
    type: 'linear' | 'radial';
    colorStops: Array<{ offset: number; color: string }>;
    angle?: number; // for linear gradients
    r1?: number; // for radial gradients
    r2?: number;
}

// Layer blending modes - ALL Photoshop/Photopea blend modes
// Ordered exactly like Photoshop for UI consistency
export type BlendMode =
    // Normal Group
    | 'normal'
    | 'dissolve'
    // Darken Group
    | 'darken'
    | 'multiply'
    | 'color-burn'
    | 'linear-burn'
    | 'darker-color'
    // Lighten Group
    | 'lighten'
    | 'screen'
    | 'color-dodge'
    | 'linear-dodge'
    | 'lighter-color'
    // Contrast Group
    | 'overlay'
    | 'soft-light'
    | 'hard-light'
    | 'vivid-light'
    | 'linear-light'
    | 'pin-light'
    | 'hard-mix'
    // Inversion Group
    | 'difference'
    | 'exclusion'
    | 'subtract'
    | 'divide'
    // Color Group (HSL-based)
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity';

// Base element interface - all elements extend this
export interface BaseElement {
    id: string;
    type: ElementType;
    name: string;
    transform: Transform;
    style: Style;
    locked: boolean;
    visible: boolean;
    selectable: boolean;
    zIndex: number;
    blendMode: BlendMode; // Layer blending mode
    metadata?: Record<string, unknown>;
}

// Text element specific properties
export interface TextStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: number | 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textDecoration: 'none' | 'underline' | 'line-through';
    textAlign: 'left' | 'center' | 'right' | 'justify';
    lineHeight: number;
    letterSpacing: number;
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export type TextEffectType =
    | 'none'
    | 'shadow'
    | 'lift'
    | 'hollow'
    | 'splice'
    | 'outline'
    | 'echo'
    | 'glitch'
    | 'neon'
    | 'background';

// Shape effect types (can be combined with style effects)
export type TextShapeType = 'none' | 'curved';

export interface TextEffect {
    type: TextEffectType; // Style effect type
    shapeType?: TextShapeType; // Shape effect type (independent from style)
    // Shadow effect settings
    shadowColor?: string;
    shadowOpacity?: number; // 0-100
    shadowDistance?: number; // 0-100
    shadowBlur?: number; // 0-100
    shadowAngle?: number; // 0-360 degrees
    // Outline effect settings
    outlineColor?: string;
    outlineWidth?: number; // 1-100
    // Lift effect settings (combination of shadow + slight offset)
    liftDistance?: number; // 0-50
    liftBlur?: number; // 0-50
    // Hollow effect settings (just stroke, no fill)
    hollowColor?: string;
    hollowWidth?: number; // 1-20
    // Echo effect settings
    echoColor?: string;
    echoOffset?: number; // 1-50
    echoLayers?: number; // 1-10
    // Splice effect settings (split with shadow)
    spliceColor?: string;
    spliceOffset?: number; // 1-50
    spliceDirection?: 'horizontal' | 'vertical' | 'diagonal';
    // Glitch effect settings
    glitchIntensity?: number; // 1-50
    glitchColor1?: string;
    glitchColor2?: string;
    // Neon effect settings
    neonColor?: string;
    neonIntensity?: number; // 1-100 (glow amount)
    // Background effect settings (text with background box)
    backgroundColor?: string;
    backgroundPadding?: number; // 0-50
    backgroundRadius?: number; // 0-50
    // Curved effect settings
    curveAmount?: number; // -360 to 360 degrees (negative = curve down, positive = curve up)
    curveRadius?: number; // 50-500 (radius of the curve)
}

export interface TextElement extends BaseElement {
    type: 'text';
    content: string;
    textStyle: TextStyle;
    effect: TextEffect;
    editable: boolean;
}

// Image element specific properties
export interface ImageFilter {
    brightness: number; // -100 to 100
    contrast: number; // -100 to 100
    saturation: number; // -100 to 100
    blur: number; // 0 to 100
    temperature: number; // -100 to 100
    tint: number; // -100 to 100
    highlights: number; // -100 to 100
    shadows: number; // -100 to 100
    whites: number; // -100 to 100
    blacks: number; // -100 to 100
    vibrance: number; // -100 to 100
    clarity: number; // -100 to 100
    sharpness: number; // 0 to 100
    vignette: number; // -100 to 100
    grayscale: boolean;
    sepia: boolean;
    invert: boolean;
    filterPreset: string | null; // e.g., 'fresco', 'bali', 'nordic', etc.
}

export interface CropData {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Color replacement effect for images (Canva-like color replace)
export interface ColorReplaceEffect {
    enabled: boolean;
    targetColor: string; // Target color to apply (hex format)
    intensity: number; // 0-100, how strong the effect is
    preserveBackground: boolean; // Whether to try to preserve background
    blendMode: 'hue' | 'multiply' | 'screen' | 'overlay'; // How to blend the color
}

export interface ImageElement extends BaseElement {
    type: 'image';
    src: string;
    originalSrc: string;
    filters: ImageFilter;
    crop: CropData | null;
    colorReplace: ColorReplaceEffect | null;
    crossOrigin: 'anonymous' | 'use-credentials' | null;
    // Background mode tracking
    isBackground?: boolean; // True if image is set as canvas background
    originalTransform?: Transform; // Original transform before setting as background
}

// Shape element specific properties
export interface ShapeElement extends BaseElement {
    type: 'shape';
    shapeType: ShapeType;
    points?: number; // for polygons and stars
    innerRadius?: number; // for stars (0-1 ratio)
    svgPath?: string; // for custom SVG path shapes
}

// Line style for line elements
export interface LineStyle {
    dashPattern: 'solid' | 'dashed' | 'dotted';
    startCap: 'none' | 'arrow' | 'bar' | 'circle' | 'square' | 'diamond';
    endCap: 'none' | 'arrow' | 'bar' | 'circle' | 'square' | 'diamond';
    capFill: 'filled' | 'outline';
}

// Line element with endpoint coordinates (Canva-style)
export interface LineElement extends BaseElement {
    type: 'line';
    // Endpoint coordinates (in canvas space)
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    // Line styling
    lineStyle: LineStyle;
    strokeWidth: number;
    strokeColor: string;
}

// SVG element specific properties
export interface SVGElement extends BaseElement {
    type: 'svg';
    svgContent: string;
    originalColors: string[];
    currentColors: string[];
}

// Group element for grouping multiple elements
export interface GroupElement extends BaseElement {
    type: 'group';
    children: CanvasElement[];
}

// Chart element placeholder
export interface ChartElement extends BaseElement {
    type: 'chart';
    chartType: 'bar' | 'line' | 'pie' | 'doughnut';
    data: unknown; // Chart.js data structure
    options: unknown; // Chart.js options
}

// Sticker element with editable colors
export interface StickerElement extends BaseElement {
    type: 'sticker';
    stickerId: string;                    // Reference to sticker definition
    svgContent: string;                   // Current SVG with applied colors
    originalSvgContent: string;           // Original SVG template
    colorMap: Record<string, string>;     // Maps original colors to current colors
    category: string;                     // Sticker category
}

// Union type for all canvas elements
export type CanvasElement =
    | TextElement
    | ImageElement
    | ShapeElement
    | LineElement
    | SVGElement
    | GroupElement
    | ChartElement
    | StickerElement;

// Default values factory
export const createDefaultTransform = (): Transform => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    skewX: 0,
    skewY: 0,
    originX: 'center',
    originY: 'center',
});

export const createDefaultStyle = (): Style => ({
    fill: '#000000',
    stroke: null,
    strokeWidth: 0,
    opacity: 1,
    shadow: null,
    cornerRadius: 0,
});

export const createDefaultTextStyle = (): TextStyle => ({
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    lineHeight: 1.4,
    letterSpacing: 0,
    textTransform: 'none',
});

export const createDefaultImageFilter = (): ImageFilter => ({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    vibrance: 0,
    clarity: 0,
    sharpness: 0,
    vignette: 0,
    grayscale: false,
    sepia: false,
    invert: false,
    filterPreset: null,
});

export const createDefaultTextEffect = (): TextEffect => ({
    type: 'none',
    shapeType: 'none',
    // Shadow defaults
    shadowColor: '#000000',
    shadowOpacity: 50,
    shadowDistance: 5,
    shadowBlur: 10,
    shadowAngle: 45,
    // Outline defaults
    outlineColor: '#000000',
    outlineWidth: 2,
    // Lift defaults
    liftDistance: 8,
    liftBlur: 15,
    // Hollow defaults
    hollowColor: '#000000',
    hollowWidth: 2,
    // Echo defaults
    echoColor: '#cccccc',
    echoOffset: 5,
    echoLayers: 3,
    // Splice defaults
    spliceColor: '#cccccc',
    spliceOffset: 3,
    spliceDirection: 'diagonal',
    // Glitch defaults
    glitchIntensity: 5,
    glitchColor1: '#00ffff',
    glitchColor2: '#ff00ff',
    // Neon defaults
    neonColor: '#ff00ff',
    neonIntensity: 30,
    // Background defaults
    backgroundColor: '#f0f0f0',
    backgroundPadding: 10,
    backgroundRadius: 5,
    // Curved defaults
    curveAmount: 0,
});
