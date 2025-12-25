// Shape Catalog - Canva-style shape definitions
// Contains all shape categories with parametric/SVG definitions

export type ShapeCategory =
    | 'lines'
    | 'basic'
    | 'polygons'
    | 'stars'
    | 'arrows'
    | 'callouts'
    | 'symbols';

export interface ShapeDefinition {
    id: string;
    name: string;
    category: ShapeCategory;
    type: 'parametric' | 'svg';
    // For parametric shapes
    fabricType?: 'rect' | 'circle' | 'triangle' | 'polygon' | 'line' | 'path';
    params?: {
        sides?: number;        // polygon sides
        points?: number;       // star points
        innerRadius?: number;  // star inner radius (0-1 ratio)
        cornerRadius?: number; // rounded corners
    };
    // For SVG path shapes (normalized to 100x100 viewBox)
    svgPath?: string;
    // For line shapes
    lineStyle?: {
        dashPattern?: 'solid' | 'dashed' | 'dotted';
        startCap?: 'none' | 'arrow' | 'bar' | 'circle' | 'square' | 'diamond';
        endCap?: 'none' | 'arrow' | 'bar' | 'circle' | 'square' | 'diamond';
        capFill?: 'filled' | 'outline';
    };
}

// ============================================
// SHAPE CATALOG - All Canva-style shapes
// ============================================

export const SHAPE_CATALOG: ShapeDefinition[] = [
    // ==================
    // LINES (14 shapes) - Canva-style with filled paths
    // ==================
    // Row 1 - Basic Line Styles
    {
        id: 'solid-line',
        name: 'Solid Line',
        category: 'lines',
        type: 'svg',
        // Thick horizontal line as filled rectangle
        svgPath: 'M 5 47 L 95 47 L 95 53 L 5 53 Z',
        lineStyle: { dashPattern: 'solid', startCap: 'none', endCap: 'none' },
    },
    {
        id: 'dashed-line',
        name: 'Dashed Line',
        category: 'lines',
        type: 'svg',
        // Dashed line segments as filled rectangles
        svgPath: 'M 5 47 L 20 47 L 20 53 L 5 53 Z M 28 47 L 43 47 L 43 53 L 28 53 Z M 51 47 L 66 47 L 66 53 L 51 53 Z M 74 47 L 89 47 L 89 53 L 74 53 Z',
        lineStyle: { dashPattern: 'dashed', startCap: 'none', endCap: 'none' },
    },
    {
        id: 'dotted-line',
        name: 'Dotted Line',
        category: 'lines',
        type: 'svg',
        // Dotted line as circles
        svgPath: 'M 8 50 A 4 4 0 1 1 8 50.01 Z M 20 50 A 4 4 0 1 1 20 50.01 Z M 32 50 A 4 4 0 1 1 32 50.01 Z M 44 50 A 4 4 0 1 1 44 50.01 Z M 56 50 A 4 4 0 1 1 56 50.01 Z M 68 50 A 4 4 0 1 1 68 50.01 Z M 80 50 A 4 4 0 1 1 80 50.01 Z M 92 50 A 4 4 0 1 1 92 50.01 Z',
        lineStyle: { dashPattern: 'dotted', startCap: 'none', endCap: 'none' },
    },
    // Row 2 - Single Arrow Lines
    {
        id: 'line-arrow-right',
        name: 'Arrow Right',
        category: 'lines',
        type: 'svg',
        // Line with filled arrowhead at end
        svgPath: 'M 5 47 L 78 47 L 78 53 L 5 53 Z M 75 35 L 95 50 L 75 65 Z',
        lineStyle: { dashPattern: 'solid', startCap: 'none', endCap: 'arrow' },
    },
    {
        id: 'line-arrow-right-thin',
        name: 'Thin Arrow Right',
        category: 'lines',
        type: 'svg',
        // Thinner line with arrowhead
        svgPath: 'M 5 48 L 80 48 L 80 52 L 5 52 Z M 78 40 L 95 50 L 78 60 Z',
        lineStyle: { dashPattern: 'solid', startCap: 'none', endCap: 'arrow' },
    },
    {
        id: 'dotted-arrow-right',
        name: 'Dotted Arrow Right',
        category: 'lines',
        type: 'svg',
        // Dotted line with filled arrowhead
        svgPath: 'M 8 50 A 3 3 0 1 1 8 50.01 Z M 18 50 A 3 3 0 1 1 18 50.01 Z M 28 50 A 3 3 0 1 1 28 50.01 Z M 38 50 A 3 3 0 1 1 38 50.01 Z M 48 50 A 3 3 0 1 1 48 50.01 Z M 58 50 A 3 3 0 1 1 58 50.01 Z M 68 50 A 3 3 0 1 1 68 50.01 Z M 75 38 L 95 50 L 75 62 Z',
        lineStyle: { dashPattern: 'dotted', startCap: 'none', endCap: 'arrow' },
    },
    // Row 3 - Double / Directional Arrows
    {
        id: 'line-bar-arrow',
        name: 'Bar to Arrow',
        category: 'lines',
        type: 'svg',
        // Vertical bar on left + line + arrowhead on right
        svgPath: 'M 5 35 L 5 65 L 12 65 L 12 35 Z M 12 47 L 78 47 L 78 53 L 12 53 Z M 75 35 L 95 50 L 75 65 Z',
        lineStyle: { dashPattern: 'solid', startCap: 'bar', endCap: 'arrow' },
    },
    {
        id: 'line-double-arrow',
        name: 'Double Arrow',
        category: 'lines',
        type: 'svg',
        // Arrows on both ends
        svgPath: 'M 5 50 L 25 35 L 25 65 Z M 22 47 L 78 47 L 78 53 L 22 53 Z M 75 35 L 95 50 L 75 65 Z',
        lineStyle: { dashPattern: 'solid', startCap: 'arrow', endCap: 'arrow' },
    },
    {
        id: 'dotted-double-arrow',
        name: 'Dotted Double Arrow',
        category: 'lines',
        type: 'svg',
        // Dotted line with arrows on both ends
        svgPath: 'M 5 50 L 22 38 L 22 62 Z M 28 50 A 3 3 0 1 1 28 50.01 Z M 38 50 A 3 3 0 1 1 38 50.01 Z M 50 50 A 3 3 0 1 1 50 50.01 Z M 62 50 A 3 3 0 1 1 62 50.01 Z M 72 50 A 3 3 0 1 1 72 50.01 Z M 78 38 L 95 50 L 78 62 Z',
        lineStyle: { dashPattern: 'dotted', startCap: 'arrow', endCap: 'arrow' },
    },
    // Row 4 - Filled Endpoints
    {
        id: 'line-square-filled',
        name: 'Square Endpoints',
        category: 'lines',
        type: 'svg',
        // Filled squares on both ends
        svgPath: 'M 5 38 L 5 62 L 20 62 L 20 38 Z M 18 47 L 82 47 L 82 53 L 18 53 Z M 80 38 L 80 62 L 95 62 L 95 38 Z',
        lineStyle: { dashPattern: 'solid', startCap: 'square', endCap: 'square', capFill: 'filled' },
    },
    {
        id: 'line-circle-filled',
        name: 'Circle Endpoints',
        category: 'lines',
        type: 'svg',
        // Filled circles on both ends
        svgPath: 'M 12 50 m -10 0 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0 M 20 47 L 80 47 L 80 53 L 20 53 Z M 88 50 m -10 0 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0',
        lineStyle: { dashPattern: 'solid', startCap: 'circle', endCap: 'circle', capFill: 'filled' },
    },
    {
        id: 'line-diamond-filled',
        name: 'Diamond Endpoints',
        category: 'lines',
        type: 'svg',
        // Filled diamonds on both ends
        svgPath: 'M 12 50 L 5 58 L 12 66 L 19 58 Z M 17 47 L 83 47 L 83 53 L 17 53 Z M 88 50 L 81 58 L 88 66 L 95 58 Z',
        lineStyle: { dashPattern: 'solid', startCap: 'diamond', endCap: 'diamond', capFill: 'filled' },
    },
    // Row 5 - Outline Endpoints
    {
        id: 'line-square-outline',
        name: 'Square Outline Endpoints',
        category: 'lines',
        type: 'svg',
        // Outline squares on both ends (hollow)
        svgPath: 'M 5 38 L 5 62 L 20 62 L 20 38 Z M 8 41 L 17 41 L 17 59 L 8 59 Z M 19 47 L 81 47 L 81 53 L 19 53 Z M 80 38 L 80 62 L 95 62 L 95 38 Z M 83 41 L 92 41 L 92 59 L 83 59 Z',
        lineStyle: { dashPattern: 'solid', startCap: 'square', endCap: 'square', capFill: 'outline' },
    },
    {
        id: 'line-circle-outline',
        name: 'Circle Outline Endpoints',
        category: 'lines',
        type: 'svg',
        // Outline circles on both ends (hollow) - using fill-rule evenodd
        svgPath: 'M 12 50 m -10 0 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0 M 12 50 m -6 0 a 6 6 0 1 1 12 0 a 6 6 0 1 1 -12 0 M 20 47 L 80 47 L 80 53 L 20 53 Z M 88 50 m -10 0 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0 M 88 50 m -6 0 a 6 6 0 1 1 12 0 a 6 6 0 1 1 -12 0',
        lineStyle: { dashPattern: 'solid', startCap: 'circle', endCap: 'circle', capFill: 'outline' },
    },

    // ==================
    // BASIC SHAPES (22 shapes - Complete Canva set)
    // ==================
    // Row 1
    {
        id: 'square',
        name: 'Square',
        category: 'basic',
        type: 'parametric',
        fabricType: 'rect',
    },
    {
        id: 'rounded-square',
        name: 'Rounded Square',
        category: 'basic',
        type: 'parametric',
        fabricType: 'rect',
        params: { cornerRadius: 15 },
    },
    {
        id: 'circle',
        name: 'Circle',
        category: 'basic',
        type: 'parametric',
        fabricType: 'circle',
    },
    // Row 2
    {
        id: 'triangle-up',
        name: 'Triangle Up',
        category: 'basic',
        type: 'parametric',
        fabricType: 'triangle',
    },
    {
        id: 'triangle-down',
        name: 'Triangle Down',
        category: 'basic',
        type: 'svg',
        svgPath: 'M 10 10 L 90 10 L 50 90 Z',
    },
    {
        id: 'diamond',
        name: 'Diamond',
        category: 'basic',
        type: 'svg',
        svgPath: 'M 50 5 L 95 50 L 50 95 L 5 50 Z',
    },
    // Row 3
    {
        id: 'plus',
        name: 'Plus',
        category: 'basic',
        type: 'svg',
        svgPath: 'M 35 5 L 65 5 L 65 35 L 95 35 L 95 65 L 65 65 L 65 95 L 35 95 L 35 65 L 5 65 L 5 35 L 35 35 Z',
    },
    {
        id: 'hexagon',
        name: 'Hexagon',
        category: 'basic',
        type: 'svg',
        // Horizontal hexagon with flat top and bottom
        svgPath: 'M 25 5 L 75 5 L 95 50 L 75 95 L 25 95 L 5 50 Z',
    },
    {
        id: 'ticket',
        name: 'Ticket',
        category: 'basic',
        type: 'svg',
        // Rectangle with curved corner cuts at all 4 corners
        svgPath: 'M 15 5 L 85 5 Q 95 5 95 15 L 95 15 Q 85 15 85 25 L 85 75 Q 85 85 95 85 L 95 85 Q 95 95 85 95 L 15 95 Q 5 95 5 85 L 5 85 Q 15 85 15 75 L 15 25 Q 15 15 5 15 L 5 15 Q 5 5 15 5 Z',
    },
    // Row 4
    {
        id: 'parallelogram-left',
        name: 'Parallelogram Left',
        category: 'basic',
        type: 'svg',
        svgPath: 'M 25 5 L 95 5 L 75 95 L 5 95 Z',
    },
    {
        id: 'parallelogram-right',
        name: 'Parallelogram Right',
        category: 'basic',
        type: 'svg',
        svgPath: 'M 5 5 L 75 5 L 95 95 L 25 95 Z',
    },
    {
        id: 'trapezoid',
        name: 'Trapezoid',
        category: 'basic',
        type: 'svg',
        svgPath: 'M 20 5 L 80 5 L 95 95 L 5 95 Z',
    },
    // Row 5
    {
        id: 'inverted-trapezoid',
        name: 'Inverted Trapezoid',
        category: 'basic',
        type: 'svg',
        svgPath: 'M 5 5 L 95 5 L 80 95 L 20 95 Z',
    },
    {
        id: 'u-shape',
        name: 'U Shape',
        category: 'basic',
        type: 'svg',
        svgPath: 'M 10 5 L 30 5 L 30 65 Q 30 85 50 85 Q 70 85 70 65 L 70 5 L 90 5 L 90 70 Q 90 95 50 95 Q 10 95 10 70 Z',
    },
    {
        id: 'arch',
        name: 'Arch',
        category: 'basic',
        type: 'svg',
        svgPath: 'M 5 95 L 5 35 Q 5 5 50 5 Q 95 5 95 35 L 95 95 L 70 95 L 70 40 Q 70 25 50 25 Q 30 25 30 40 L 30 95 Z',
    },
    {
        id: 'rounded-bottom',
        name: 'Rounded Bottom',
        category: 'basic',
        type: 'svg',
        // Solid filled U shape (rectangle with rounded bottom)
        svgPath: 'M 5 5 L 95 5 L 95 50 Q 95 95 50 95 Q 5 95 5 50 Z',
    },
    {
        id: 'stadium',
        name: 'Stadium',
        category: 'basic',
        type: 'svg',
        // Solid filled arch (rectangle with rounded top)
        svgPath: 'M 5 95 L 5 50 Q 5 5 50 5 Q 95 5 95 50 L 95 95 Z',
    },
    // Row 6
    {
        id: 'right-triangle',
        name: 'Right Triangle',
        category: 'basic',
        type: 'svg',
        svgPath: 'M 5 95 L 5 5 L 95 95 Z',
    },
    {
        id: 'half-circle',
        name: 'Half Circle',
        category: 'basic',
        type: 'svg',
        svgPath: 'M 5 50 A 45 45 0 0 1 95 50 L 5 50 Z',
    },
    {
        id: 'quarter-circle',
        name: 'Quarter Circle',
        category: 'basic',
        type: 'svg',
        svgPath: 'M 5 95 L 5 5 A 90 90 0 0 1 95 95 Z',
    },
    // Row 7
    {
        id: 'quarter-ring',
        name: 'Quarter Ring',
        category: 'basic',
        type: 'svg',
        // True annulus sector: concentric arcs with same center at (5, 95)
        // Outer arc (R=90): from (95,95) to (5,5) counter-clockwise
        // Radial line inward to inner arc
        // Inner arc (r=35): from (5,60) to (40,95) clockwise (reverse direction)
        svgPath: 'M 95 95 A 90 90 0 0 0 5 5 L 5 60 A 35 35 0 0 1 40 95 Z',
    },
    {
        id: 'semi-ring',
        name: 'Semi Ring',
        category: 'basic',
        type: 'svg',
        svgPath: 'M 5 50 A 45 45 0 0 1 95 50 L 75 50 A 25 25 0 0 0 25 50 Z',
    },

    // ==================
    // POLYGONS
    // ==================
    {
        id: 'pentagon',
        name: 'Pentagon',
        category: 'polygons',
        type: 'parametric',
        fabricType: 'polygon',
        params: { sides: 5 },
    },
    {
        id: 'hexagon',
        name: 'Hexagon',
        category: 'polygons',
        type: 'parametric',
        fabricType: 'polygon',
        params: { sides: 6 },
    },
    {
        id: 'heptagon',
        name: 'Heptagon',
        category: 'polygons',
        type: 'parametric',
        fabricType: 'polygon',
        params: { sides: 7 },
    },
    {
        id: 'octagon',
        name: 'Octagon',
        category: 'polygons',
        type: 'parametric',
        fabricType: 'polygon',
        params: { sides: 8 },
    },
    {
        id: 'nonagon',
        name: 'Nonagon',
        category: 'polygons',
        type: 'parametric',
        fabricType: 'polygon',
        params: { sides: 9 },
    },
    {
        id: 'decagon',
        name: 'Decagon',
        category: 'polygons',
        type: 'parametric',
        fabricType: 'polygon',
        params: { sides: 10 },
    },

    // ==================
    // STARS
    // ==================
    {
        id: 'star-4',
        name: '4-Point Star',
        category: 'stars',
        type: 'parametric',
        fabricType: 'polygon',
        params: { points: 4, innerRadius: 0.4 },
    },
    {
        id: 'star-5',
        name: '5-Point Star',
        category: 'stars',
        type: 'parametric',
        fabricType: 'polygon',
        params: { points: 5, innerRadius: 0.4 },
    },
    {
        id: 'star-6',
        name: '6-Point Star',
        category: 'stars',
        type: 'parametric',
        fabricType: 'polygon',
        params: { points: 6, innerRadius: 0.5 },
    },
    {
        id: 'star-8',
        name: '8-Point Star',
        category: 'stars',
        type: 'parametric',
        fabricType: 'polygon',
        params: { points: 8, innerRadius: 0.5 },
    },
    {
        id: 'star-12',
        name: '12-Point Star',
        category: 'stars',
        type: 'parametric',
        fabricType: 'polygon',
        params: { points: 12, innerRadius: 0.6 },
    },
    {
        id: 'burst',
        name: 'Burst',
        category: 'stars',
        type: 'parametric',
        fabricType: 'polygon',
        params: { points: 16, innerRadius: 0.7 },
    },

    // ==================
    // ARROWS
    // ==================
    {
        id: 'arrow-right',
        name: 'Arrow Right',
        category: 'arrows',
        type: 'svg',
        svgPath: 'M 10 40 L 60 40 L 60 20 L 90 50 L 60 80 L 60 60 L 10 60 Z',
    },
    {
        id: 'arrow-left',
        name: 'Arrow Left',
        category: 'arrows',
        type: 'svg',
        svgPath: 'M 90 40 L 40 40 L 40 20 L 10 50 L 40 80 L 40 60 L 90 60 Z',
    },
    {
        id: 'arrow-up',
        name: 'Arrow Up',
        category: 'arrows',
        type: 'svg',
        svgPath: 'M 40 90 L 40 40 L 20 40 L 50 10 L 80 40 L 60 40 L 60 90 Z',
    },
    {
        id: 'arrow-down',
        name: 'Arrow Down',
        category: 'arrows',
        type: 'svg',
        svgPath: 'M 40 10 L 40 60 L 20 60 L 50 90 L 80 60 L 60 60 L 60 10 Z',
    },
    {
        id: 'double-arrow-h',
        name: 'Double Arrow Horizontal',
        category: 'arrows',
        type: 'svg',
        svgPath: 'M 10 50 L 30 30 L 30 40 L 70 40 L 70 30 L 90 50 L 70 70 L 70 60 L 30 60 L 30 70 Z',
    },
    {
        id: 'double-arrow-v',
        name: 'Double Arrow Vertical',
        category: 'arrows',
        type: 'svg',
        svgPath: 'M 50 10 L 70 30 L 60 30 L 60 70 L 70 70 L 50 90 L 30 70 L 40 70 L 40 30 L 30 30 Z',
    },
    {
        id: 'chevron-right',
        name: 'Chevron Right',
        category: 'arrows',
        type: 'svg',
        svgPath: 'M 10 10 L 60 10 L 90 50 L 60 90 L 10 90 L 40 50 Z',
    },
    {
        id: 'chevron-left',
        name: 'Chevron Left',
        category: 'arrows',
        type: 'svg',
        svgPath: 'M 90 10 L 40 10 L 10 50 L 40 90 L 90 90 L 60 50 Z',
    },

    // ==================
    // CALLOUTS (Speech Bubbles)
    // ==================
    {
        id: 'speech-bubble-rect',
        name: 'Speech Bubble',
        category: 'callouts',
        type: 'svg',
        svgPath: 'M 10 10 L 90 10 Q 95 10 95 15 L 95 55 Q 95 60 90 60 L 40 60 L 25 80 L 30 60 L 10 60 Q 5 60 5 55 L 5 15 Q 5 10 10 10 Z',
    },
    {
        id: 'speech-bubble-round',
        name: 'Round Speech Bubble',
        category: 'callouts',
        type: 'svg',
        svgPath: 'M 50 10 C 80 10 95 25 95 40 C 95 55 80 65 55 65 L 35 85 L 40 65 C 15 63 5 50 5 40 C 5 25 20 10 50 10 Z',
    },
    {
        id: 'thought-bubble',
        name: 'Thought Bubble',
        category: 'callouts',
        type: 'svg',
        svgPath: 'M 50 5 C 75 5 90 18 90 35 C 90 52 75 65 50 65 C 25 65 10 52 10 35 C 10 18 25 5 50 5 Z M 25 70 A 8 8 0 1 1 25 86 A 8 8 0 1 1 25 70 Z M 15 85 A 5 5 0 1 1 15 95 A 5 5 0 1 1 15 85 Z',
    },
    {
        id: 'callout-box',
        name: 'Callout Box',
        category: 'callouts',
        type: 'svg',
        svgPath: 'M 5 15 Q 5 5 15 5 L 85 5 Q 95 5 95 15 L 95 60 Q 95 70 85 70 L 50 70 L 35 90 L 35 70 L 15 70 Q 5 70 5 60 Z',
    },

    // ==================
    // SYMBOLS
    // ==================
    {
        id: 'heart',
        name: 'Heart',
        category: 'symbols',
        type: 'svg',
        svgPath: 'M 50 88 C 20 65 5 50 5 30 C 5 15 18 5 32 5 C 42 5 50 12 50 12 C 50 12 58 5 68 5 C 82 5 95 15 95 30 C 95 50 80 65 50 88 Z',
    },
    {
        id: 'cloud',
        name: 'Cloud',
        category: 'symbols',
        type: 'svg',
        svgPath: 'M 25 75 C 10 75 5 65 5 55 C 5 45 15 38 25 40 C 25 25 40 15 55 20 C 65 10 85 15 90 30 C 98 35 98 55 88 60 C 95 70 85 80 75 75 L 25 75 Z',
    },
    {
        id: 'teardrop',
        name: 'Teardrop',
        category: 'symbols',
        type: 'svg',
        svgPath: 'M 50 5 C 50 5 90 50 90 70 C 90 88 72 95 50 95 C 28 95 10 88 10 70 C 10 50 50 5 50 5 Z',
    },
    {
        id: 'cross',
        name: 'Cross',
        category: 'symbols',
        type: 'svg',
        svgPath: 'M 35 5 L 65 5 L 65 35 L 95 35 L 95 65 L 65 65 L 65 95 L 35 95 L 35 65 L 5 65 L 5 35 L 35 35 Z',
    },
    {
        id: 'plus',
        name: 'Plus',
        category: 'symbols',
        type: 'svg',
        svgPath: 'M 40 10 L 60 10 L 60 40 L 90 40 L 90 60 L 60 60 L 60 90 L 40 90 L 40 60 L 10 60 L 10 40 L 40 40 Z',
    },
    {
        id: 'minus',
        name: 'Minus',
        category: 'symbols',
        type: 'svg',
        svgPath: 'M 10 40 L 90 40 L 90 60 L 10 60 Z',
    },
    {
        id: 'lightning',
        name: 'Lightning',
        category: 'symbols',
        type: 'svg',
        svgPath: 'M 55 5 L 25 45 L 45 45 L 35 95 L 75 50 L 52 50 L 70 5 Z',
    },
    {
        id: 'moon',
        name: 'Moon',
        category: 'symbols',
        type: 'svg',
        svgPath: 'M 60 5 C 30 5 5 30 5 55 C 5 80 30 95 55 95 C 40 85 35 65 45 45 C 55 25 75 15 60 5 Z',
    },
    {
        id: 'sun',
        name: 'Sun',
        category: 'symbols',
        type: 'svg',
        svgPath: 'M 50 30 A 20 20 0 1 1 50 70 A 20 20 0 1 1 50 30 Z M 50 5 L 50 15 M 50 85 L 50 95 M 5 50 L 15 50 M 85 50 L 95 50 M 18 18 L 25 25 M 75 75 L 82 82 M 82 18 L 75 25 M 25 75 L 18 82',
    },
];

// Get shapes by category
export const getShapesByCategory = (category: ShapeCategory): ShapeDefinition[] => {
    return SHAPE_CATALOG.filter(shape => shape.category === category);
};

// Get all categories with their shapes
export const getShapeCategories = (): { category: ShapeCategory; shapes: ShapeDefinition[] }[] => {
    const categories: ShapeCategory[] = ['lines', 'basic', 'polygons', 'stars', 'arrows', 'callouts', 'symbols'];
    return categories.map(category => ({
        category,
        shapes: getShapesByCategory(category),
    }));
};

// Category display names
export const CATEGORY_LABELS: Record<ShapeCategory, string> = {
    lines: 'Lines',
    basic: 'Basic Shapes',
    polygons: 'Polygons',
    stars: 'Stars',
    arrows: 'Arrows',
    callouts: 'Callouts',
    symbols: 'Symbols',
};
