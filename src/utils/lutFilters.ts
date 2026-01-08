// LUT Presets - Simple adjustment-based presets
// These work by applying predefined values to the adjustment sliders

import { ImageFilter } from '@/types/canvas';

/**
 * LUT Preset Definition
 * Each preset contains values for the adjustment sliders
 */
export interface LUTPreset {
    id: string;
    name: string;
    description: string;
    // Adjustment values (same as the sliders)
    values: Partial<ImageFilter>;
}

// 12 Professional LUT Presets
export const LUT_PRESETS: LUTPreset[] = [
    {
        id: 'natural',
        name: 'Natural',
        description: 'Clean, natural look with balanced tones',
        values: {
            temperature: 0,
            tint: 0,
            brightness: 5,
            contrast: 5,
            highlights: 0,
            vibrance: 10,
            saturation: 5,
            clarity: 10,
            sharpness: 5,
            vignette: 0,
        },
    },
    {
        id: 'bright',
        name: 'Bright',
        description: 'Bright and airy look',
        values: {
            temperature: 5,
            tint: 0,
            brightness: 20,
            contrast: -5,
            highlights: 15,
            vibrance: 15,
            saturation: 10,
            clarity: 5,
            sharpness: 0,
            vignette: -10,
        },
    },
    {
        id: 'cinematic',
        name: 'Cinematic',
        description: 'Hollywood film look with rich contrast',
        values: {
            temperature: -5,
            tint: 0,
            brightness: -5,
            contrast: 30,
            highlights: -10,
            vibrance: 5,
            saturation: -10,
            clarity: 20,
            sharpness: 10,
            vignette: 25,
        },
    },
    {
        id: 'teal-orange',
        name: 'Teal & Orange',
        description: 'Popular blockbuster color grade',
        values: {
            temperature: 15,
            tint: -10,
            brightness: 0,
            contrast: 20,
            highlights: 10,
            vibrance: 20,
            saturation: 15,
            clarity: 15,
            sharpness: 5,
            vignette: 15,
        },
    },
    {
        id: 'vibrant',
        name: 'Vibrant',
        description: 'Punchy colors with high saturation',
        values: {
            temperature: 5,
            tint: 0,
            brightness: 5,
            contrast: 15,
            highlights: 5,
            vibrance: 35,
            saturation: 25,
            clarity: 20,
            sharpness: 10,
            vignette: 0,
        },
    },
    {
        id: 'matte',
        name: 'Matte',
        description: 'Faded film look with lifted blacks',
        values: {
            temperature: 10,
            tint: 0,
            brightness: 10,
            contrast: -15,
            highlights: -10,
            vibrance: -10,
            saturation: -15,
            clarity: -10,
            sharpness: 0,
            vignette: 0,
            blacks: 25,
        },
    },
    {
        id: 'warm',
        name: 'Warm',
        description: 'Golden, warm tones',
        values: {
            temperature: 35,
            tint: 5,
            brightness: 5,
            contrast: 10,
            highlights: 10,
            vibrance: 15,
            saturation: 10,
            clarity: 5,
            sharpness: 0,
            vignette: 0,
        },
    },
    {
        id: 'cool',
        name: 'Cool',
        description: 'Blue, cool atmosphere',
        values: {
            temperature: -30,
            tint: 0,
            brightness: 0,
            contrast: 15,
            highlights: 5,
            vibrance: 10,
            saturation: 5,
            clarity: 15,
            sharpness: 5,
            vignette: 10,
        },
    },
    {
        id: 'vintage',
        name: 'Vintage',
        description: 'Retro film emulation',
        values: {
            temperature: 20,
            tint: 5,
            brightness: 5,
            contrast: -5,
            highlights: -5,
            vibrance: -15,
            saturation: -20,
            clarity: -5,
            sharpness: 0,
            vignette: 20,
            blacks: 20,
        },
    },
    {
        id: 'moody',
        name: 'Moody',
        description: 'Dark, atmospheric look',
        values: {
            temperature: -10,
            tint: 0,
            brightness: -15,
            contrast: 25,
            highlights: -15,
            vibrance: -5,
            saturation: -10,
            clarity: 25,
            sharpness: 10,
            vignette: 35,
        },
    },
    {
        id: 'bw',
        name: 'Black & White',
        description: 'Classic monochrome',
        values: {
            temperature: 0,
            tint: 0,
            brightness: 5,
            contrast: 20,
            highlights: 10,
            vibrance: 0,
            saturation: -100,
            clarity: 15,
            sharpness: 10,
            vignette: 15,
            grayscale: true,
        },
    },
    {
        id: 'hdr',
        name: 'HDR',
        description: 'High dynamic range look',
        values: {
            temperature: 0,
            tint: 0,
            brightness: 0,
            contrast: 25,
            highlights: -20,
            vibrance: 30,
            saturation: 20,
            clarity: 40,
            sharpness: 15,
            vignette: 0,
        },
    },
];

/**
 * Get LUT preset by ID
 */
export function getLUTPreset(id: string): LUTPreset | undefined {
    return LUT_PRESETS.find(p => p.id === id);
}

/**
 * Apply LUT preset to current filters
 */
export function applyLUTPreset(preset: LUTPreset, currentFilters: ImageFilter): ImageFilter {
    return {
        ...currentFilters,
        ...preset.values,
        filterPreset: preset.id,
    };
}
