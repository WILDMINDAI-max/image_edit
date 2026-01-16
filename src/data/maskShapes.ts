// Mask Shapes Catalog
// Shapes optimized for image masking, curated from the main shapes catalog

export interface MaskShapeDefinition {
    id: string;
    name: string;
    category: 'basic' | 'polygons' | 'stars' | 'symbols' | 'arrows';
    svgPath: string; // Normalized to 100x100 viewBox
}

/**
 * Mask shapes catalog - curated shapes for image masking
 * All paths are normalized to 100x100 viewBox for consistent scaling
 */
export const MASK_SHAPES: MaskShapeDefinition[] = [
    // ==================
    // BASIC SHAPES (Row 1)
    // ==================
    {
        id: 'square',
        name: 'Square',
        category: 'basic',
        svgPath: 'M 5 5 L 95 5 L 95 95 L 5 95 Z',
    },
    {
        id: 'circle',
        name: 'Circle',
        category: 'basic',
        svgPath: 'M 50 5 A 45 45 0 1 1 50 95 A 45 45 0 1 1 50 5 Z',
    },
    {
        id: 'star-5',
        name: '5-Point Star',
        category: 'stars',
        svgPath: 'M 50 5 L 61 38 L 95 38 L 68 59 L 79 95 L 50 73 L 21 95 L 32 59 L 5 38 L 39 38 Z',
    },
    {
        id: 'triangle-up',
        name: 'Triangle Up',
        category: 'basic',
        svgPath: 'M 50 5 L 95 95 L 5 95 Z',
    },

    // Row 2
    {
        id: 'diamond',
        name: 'Diamond',
        category: 'basic',
        svgPath: 'M 50 5 L 95 50 L 50 95 L 5 50 Z',
    },
    {
        id: 'pentagon',
        name: 'Pentagon',
        category: 'polygons',
        svgPath: 'M 50 5 L 95 38 L 79 90 L 21 90 L 5 38 Z',
    },
    {
        id: 'hexagon',
        name: 'Hexagon',
        category: 'polygons',
        svgPath: 'M 25 5 L 75 5 L 95 50 L 75 95 L 25 95 L 5 50 Z',
    },
    {
        id: 'octagon',
        name: 'Octagon',
        category: 'polygons',
        svgPath: 'M 30 5 L 70 5 L 95 30 L 95 70 L 70 95 L 30 95 L 5 70 L 5 30 Z',
    },

    // Row 3
    {
        id: 'plus',
        name: 'Plus',
        category: 'basic',
        svgPath: 'M 35 5 L 65 5 L 65 35 L 95 35 L 95 65 L 65 65 L 65 95 L 35 95 L 35 65 L 5 65 L 5 35 L 35 35 Z',
    },
    {
        id: 'heart',
        name: 'Heart',
        category: 'symbols',
        svgPath: 'M 50 90 C 15 60 5 35 25 20 C 38 12 50 20 50 30 C 50 20 62 12 75 20 C 95 35 85 60 50 90 Z',
    },
    {
        id: 'arrow-right',
        name: 'Arrow Right',
        category: 'arrows',
        svgPath: 'M 5 35 L 55 35 L 55 15 L 95 50 L 55 85 L 55 65 L 5 65 Z',
    },
    {
        id: 'arrow-down',
        name: 'Arrow Down',
        category: 'arrows',
        svgPath: 'M 35 5 L 65 5 L 65 55 L 85 55 L 50 95 L 15 55 L 35 55 Z',
    },

    // Row 4
    {
        id: 'star-4',
        name: '4-Point Star',
        category: 'stars',
        svgPath: 'M 50 5 L 60 40 L 95 50 L 60 60 L 50 95 L 40 60 L 5 50 L 40 40 Z',
    },
    {
        id: 'star-6',
        name: '6-Point Star',
        category: 'stars',
        svgPath: 'M 50 5 L 60 35 L 93 25 L 75 50 L 93 75 L 60 65 L 50 95 L 40 65 L 7 75 L 25 50 L 7 25 L 40 35 Z',
    },
    {
        id: 'star-8',
        name: '8-Point Star',
        category: 'stars',
        svgPath: 'M 50 5 L 57 38 L 85 15 L 62 43 L 95 50 L 62 57 L 85 85 L 57 62 L 50 95 L 43 62 L 15 85 L 38 57 L 5 50 L 38 43 L 15 15 L 43 38 Z',
    },
    {
        id: 'burst',
        name: 'Burst',
        category: 'stars',
        svgPath: 'M 50 5 L 54 42 L 73 10 L 58 42 L 90 27 L 58 45 L 95 50 L 58 55 L 90 73 L 58 58 L 73 90 L 54 58 L 50 95 L 46 58 L 27 90 L 42 58 L 10 73 L 42 55 L 5 50 L 42 45 L 10 27 L 42 42 L 27 10 L 46 42 Z',
    },

    // Row 5
    {
        id: 'cloud',
        name: 'Cloud',
        category: 'symbols',
        svgPath: 'M 25 75 C 5 75 5 55 20 50 C 15 35 30 25 45 30 C 50 15 75 15 80 35 C 95 35 95 55 80 60 C 95 75 75 85 60 75 Z',
    },
    {
        id: 'teardrop',
        name: 'Teardrop',
        category: 'symbols',
        svgPath: 'M 50 5 C 50 5 85 50 85 65 C 85 85 70 95 50 95 C 30 95 15 85 15 65 C 15 50 50 5 50 5 Z',
    },
    {
        id: 'half-circle',
        name: 'Half Circle',
        category: 'basic',
        svgPath: 'M 5 50 A 45 45 0 0 1 95 50 L 5 50 Z',
    },
    {
        id: 'quarter-circle',
        name: 'Quarter Circle',
        category: 'basic',
        svgPath: 'M 5 95 L 5 5 A 90 90 0 0 1 95 95 Z',
    },

    // Row 6
    {
        id: 'triangle-down',
        name: 'Triangle Down',
        category: 'basic',
        svgPath: 'M 10 10 L 90 10 L 50 90 Z',
    },
    {
        id: 'right-triangle',
        name: 'Right Triangle',
        category: 'basic',
        svgPath: 'M 5 95 L 5 5 L 95 95 Z',
    },
    {
        id: 'trapezoid',
        name: 'Trapezoid',
        category: 'basic',
        svgPath: 'M 20 5 L 80 5 L 95 95 L 5 95 Z',
    },
    {
        id: 'parallelogram',
        name: 'Parallelogram',
        category: 'basic',
        svgPath: 'M 25 5 L 95 5 L 75 95 L 5 95 Z',
    },

    // Row 7
    {
        id: 'pointed-pentagon',
        name: 'Pointed Pentagon',
        category: 'polygons',
        svgPath: 'M 5 5 L 70 5 L 95 50 L 70 95 L 5 95 Z',
    },
    {
        id: 'chevron-right',
        name: 'Chevron Right',
        category: 'arrows',
        svgPath: 'M 5 5 L 65 5 L 95 50 L 65 95 L 5 95 L 35 50 Z',
    },
    {
        id: 'cross',
        name: 'Cross',
        category: 'symbols',
        svgPath: 'M 35 5 L 65 5 L 65 35 L 95 35 L 95 65 L 65 65 L 65 95 L 35 95 L 35 65 L 5 65 L 5 35 L 35 35 Z',
    },
    {
        id: 'shield',
        name: 'Shield',
        category: 'symbols',
        svgPath: 'M 50 5 Q 80 5 95 20 L 95 55 Q 95 85 50 95 Q 5 85 5 55 L 5 20 Q 20 5 50 5 Z',
    },
];

/**
 * Get mask shape by ID
 */
export function getMaskShape(id: string): MaskShapeDefinition | undefined {
    return MASK_SHAPES.find(shape => shape.id === id);
}

/**
 * Get all mask shapes grouped by category
 */
export function getMaskShapesByCategory(): Record<string, MaskShapeDefinition[]> {
    const grouped: Record<string, MaskShapeDefinition[]> = {};

    MASK_SHAPES.forEach(shape => {
        if (!grouped[shape.category]) {
            grouped[shape.category] = [];
        }
        grouped[shape.category].push(shape);
    });

    return grouped;
}
