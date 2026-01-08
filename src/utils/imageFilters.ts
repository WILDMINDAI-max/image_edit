// Image Filters Utilities
// Canva-like filter presets and adjustment processing

import { ImageFilter } from '@/types/canvas';

/**
 * Filter Preset Definitions
 * Each preset contains modified filter values for a specific look
 */
export interface FilterPreset {
    id: string;
    name: string;
    category: 'natural' | 'warm' | 'cool' | 'vivid' | 'soft' | 'vintage' | 'mono' | 'colorpop' | 'lut';
    values: Partial<ImageFilter>;
}

// All filter presets organized by category
export const FILTER_PRESETS: FilterPreset[] = [
    // PURE (formerly NATURAL) - light contrast, balanced saturation, clean tones
    { id: 'fresco', name: 'Clear', category: 'natural', values: { contrast: 10, saturation: 5, clarity: 10 } },
    { id: 'belvedere', name: 'Deep', category: 'natural', values: { contrast: 8, brightness: 5, vibrance: 10 } },
    { id: 'flint', name: 'Stone', category: 'natural', values: { contrast: 5, saturation: -5, clarity: 15 } },
    { id: 'luna', name: 'Moon', category: 'natural', values: { brightness: 5, contrast: 5, shadows: 10 } },
    { id: 'aero', name: 'Air', category: 'natural', values: { clarity: 20, contrast: 10, vibrance: 5 } },
    { id: 'myst', name: 'Haze', category: 'natural', values: { brightness: 10, contrast: -5, saturation: -10 } },

    // SUN (formerly WARM) - warm temperature shift, golden highlights
    { id: 'bali', name: 'Coast', category: 'warm', values: { temperature: 25, saturation: 10, vibrance: 15 } },
    { id: 'capri', name: 'Golden', category: 'warm', values: { temperature: 20, contrast: 10, highlights: 10 } },
    { id: 'latte', name: 'Cream', category: 'warm', values: { temperature: 30, brightness: 5, saturation: -5 } },
    { id: 'bronz', name: 'Amber', category: 'warm', values: { temperature: 35, contrast: 15, vibrance: 10 } },
    { id: 'sandi', name: 'Desert', category: 'warm', values: { temperature: 20, highlights: 15, saturation: 5 } },
    { id: 'sangri', name: 'Ruby', category: 'warm', values: { temperature: 25, tint: 5, contrast: 10 } },

    // ICE (formerly COOL) - cool temperature, blue/cyan shadows
    { id: 'scandi', name: 'Nord', category: 'cool', values: { temperature: -15, contrast: 5, clarity: 10 } },
    { id: 'nordic', name: 'Frost', category: 'cool', values: { temperature: -20, saturation: -5, shadows: -10 } },
    { id: 'astro', name: 'Cosmic', category: 'cool', values: { temperature: -25, contrast: 15, vibrance: 10 } },
    { id: 'arctic', name: 'Ice', category: 'cool', values: { temperature: -30, brightness: 10, saturation: -10 } },
    { id: 'polar', name: 'Cold', category: 'cool', values: { temperature: -20, highlights: 15, contrast: 5 } },
    { id: 'tundra', name: 'Gray', category: 'cool', values: { temperature: -25, saturation: -15, clarity: 15 } },

    // BOLD (formerly VIVID) - high saturation, strong contrast
    { id: 'chroma', name: 'Boost', category: 'vivid', values: { saturation: 40, vibrance: 30, contrast: 15 } },
    { id: 'rustiq', name: 'Earth', category: 'vivid', values: { saturation: 30, temperature: 10, contrast: 20 } },
    { id: 'eldar', name: 'Bright', category: 'vivid', values: { saturation: 35, clarity: 20, vibrance: 25 } },
    { id: 'zeal', name: 'Impact', category: 'vivid', values: { saturation: 45, contrast: 20, brightness: 5 } },
    { id: 'aria', name: 'Vivid', category: 'vivid', values: { vibrance: 40, saturation: 25, highlights: 10 } },
    { id: 'stark', name: 'Hard', category: 'vivid', values: { contrast: 30, saturation: 20, clarity: 25 } },

    // DREAM (formerly SOFT) - reduced contrast, pastel tones
    { id: 'aura', name: 'Glow', category: 'soft', values: { contrast: -15, brightness: 10, saturation: -10 } },
    { id: 'hazel', name: 'Fog', category: 'soft', values: { contrast: -10, temperature: 5, shadows: 15 } },
    { id: 'whimsi', name: 'Soft', category: 'soft', values: { saturation: -15, brightness: 15, contrast: -20 } },
    { id: 'rose', name: 'Blush', category: 'soft', values: { tint: 10, contrast: -10, saturation: -5 } },
    { id: 'oceanic', name: 'Breeze', category: 'soft', values: { temperature: -10, contrast: -15, saturation: -10 } },
    { id: 'nimbus', name: 'Cloud', category: 'soft', values: { brightness: 20, contrast: -20, clarity: -10 } },

    // FILM (formerly VINTAGE) - faded blacks, sepia warmth, film-like
    { id: 'vinto', name: 'Old', category: 'vintage', values: { blacks: 20, temperature: 15, saturation: -15 } },
    { id: 'fade', name: 'Matte', category: 'vintage', values: { blacks: 30, contrast: -10, saturation: -20 } },
    { id: 'antiq', name: 'Sepia', category: 'vintage', values: { sepia: true, blacks: 15, temperature: 20 } },
    { id: 'nostalg', name: 'Memory', category: 'vintage', values: { temperature: 10, blacks: 25, vibrance: -20 } },
    { id: 'dream', name: 'Dreamy', category: 'vintage', values: { brightness: 10, blacks: 20, saturation: -25 } },
    { id: 'retro', name: 'Analog', category: 'vintage', values: { temperature: 15, contrast: 10, blacks: 15 } },

    // Black & White (formerly MONO) - grayscale with contrast control
    { id: 'classic', name: 'Mono', category: 'mono', values: { grayscale: true, contrast: 10 } },
    { id: 'ink', name: 'Ink', category: 'mono', values: { grayscale: true, contrast: 30, blacks: -10 } },
    { id: 'noir', name: 'Noir', category: 'mono', values: { grayscale: true, contrast: 40, vignette: 30 } },
    { id: 'film', name: 'Grain', category: 'mono', values: { grayscale: true, blacks: 15, contrast: 15 } },
    { id: 'newspaper', name: 'Print', category: 'mono', values: { grayscale: true, contrast: 50 } },
    { id: 'slate', name: 'Urban', category: 'mono', values: { grayscale: true, contrast: 5, brightness: 10 } },

    // NEON (formerly COLOUR POP) - bold hue mapping, neon tones
    { id: 'outrun', name: 'Neon', category: 'colorpop', values: { saturation: 50, contrast: 25, tint: 20 } },
    { id: 'heatwave', name: 'Heat', category: 'colorpop', values: { temperature: -30, saturation: 50, contrast: 25 } },
    { id: 'amethyst', name: 'Purple', category: 'colorpop', values: { tint: 30, saturation: 35, contrast: 15 } },
    { id: 'minty', name: 'Mint', category: 'colorpop', values: { temperature: -30, saturation: 30, vibrance: 35 } },
    { id: 'hibiscus', name: 'Pink', category: 'colorpop', values: { tint: 35, saturation: 45, temperature: 10 } },
    { id: 'poster', name: 'Graphic', category: 'colorpop', values: { contrast: 50, saturation: 30, clarity: 30 } },
    { id: 'xpro-', name: 'X-Dark', category: 'colorpop', values: { temperature: -15, contrast: 25, blacks: 20, saturation: -10 } },
    { id: 'xpro+', name: 'X-Light', category: 'colorpop', values: { temperature: 25, contrast: 30, saturation: 20, vibrance: 25 } },

    // LUT (Cinematic) - Professional color grading presets (12 presets)
    { id: 'lut-natural', name: 'Natural', category: 'lut', values: { brightness: 5, contrast: 5, vibrance: 10, saturation: 5, clarity: 10 } },
    { id: 'lut-bright', name: 'Bright', category: 'lut', values: { brightness: 20, contrast: -5, highlights: 15, vibrance: 15, saturation: 10 } },
    { id: 'lut-cinematic', name: 'Cinematic', category: 'lut', values: { temperature: -5, brightness: -5, contrast: 30, saturation: -10, clarity: 20, vignette: 25 } },
    { id: 'lut-teal-orange', name: 'Teal Orange', category: 'lut', values: { temperature: 15, tint: -10, contrast: 20, vibrance: 20, saturation: 15, vignette: 15 } },
    { id: 'lut-vibrant', name: 'Vibrant', category: 'lut', values: { brightness: 5, contrast: 15, vibrance: 35, saturation: 25, clarity: 20 } },
    { id: 'lut-matte', name: 'Matte', category: 'lut', values: { temperature: 10, brightness: 10, contrast: -15, saturation: -15, blacks: 25 } },
    { id: 'lut-warm', name: 'Warm', category: 'lut', values: { temperature: 35, tint: 5, brightness: 5, contrast: 10, vibrance: 15 } },
    { id: 'lut-cool', name: 'Cool', category: 'lut', values: { temperature: -30, contrast: 15, vibrance: 10, clarity: 15, vignette: 10 } },
    { id: 'lut-vintage', name: 'Vintage', category: 'lut', values: { temperature: 20, contrast: -5, saturation: -20, vignette: 20, blacks: 20 } },
    { id: 'lut-moody', name: 'Moody', category: 'lut', values: { temperature: -10, brightness: -15, contrast: 25, saturation: -10, clarity: 25, vignette: 35 } },
    { id: 'lut-bw', name: 'B&W', category: 'lut', values: { brightness: 5, contrast: 20, saturation: -100, clarity: 15, vignette: 15, grayscale: true } },
    { id: 'lut-hdr', name: 'HDR', category: 'lut', values: { contrast: 25, highlights: -20, vibrance: 30, saturation: 20, clarity: 40, sharpness: 15 } },
];

// Category names for display
export const FILTER_CATEGORIES = [
    { id: 'natural', name: 'Pure' },
    { id: 'warm', name: 'Sun' },
    { id: 'cool', name: 'Ice' },
    { id: 'vivid', name: 'Bold' },
    { id: 'soft', name: 'Dream' },
    { id: 'vintage', name: 'Film' },
    { id: 'mono', name: 'B&W' },
    { id: 'colorpop', name: 'Neon' },
    { id: 'lut', name: 'Cinematic' },
] as const;

/**
 * Get filter preset by ID
 */
export function getFilterPreset(id: string): FilterPreset | undefined {
    return FILTER_PRESETS.find(preset => preset.id === id);
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: string): FilterPreset[] {
    return FILTER_PRESETS.filter(preset => preset.category === category);
}

/**
 * Apply filter preset to current filters
 */
export function applyPresetToFilters(preset: FilterPreset, currentFilters: ImageFilter): ImageFilter {
    return {
        ...currentFilters,
        ...preset.values,
        filterPreset: preset.id,
    };
}

/**
 * Reset all filters to default values
 */
export function createResetFilters(): ImageFilter {
    return {
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
    };
}

/**
 * Adjustment slider definitions  
 */
export const ADJUSTMENT_SLIDERS = [
    { id: 'temperature', label: 'Temperature', min: -100, max: 100, step: 1 },
    { id: 'tint', label: 'Tint', min: -100, max: 100, step: 1 },
    { id: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1 },
    { id: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1 },
    { id: 'highlights', label: 'Highlights', min: -100, max: 100, step: 1 },
    { id: 'vibrance', label: 'Vibrance', min: -100, max: 100, step: 1 },
    { id: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1 },
    { id: 'clarity', label: 'Clarity', min: -100, max: 100, step: 1 },
    { id: 'sharpness', label: 'Sharpness', min: 0, max: 100, step: 1 },
    { id: 'vignette', label: 'Vignette', min: -100, max: 100, step: 1 },
] as const;
