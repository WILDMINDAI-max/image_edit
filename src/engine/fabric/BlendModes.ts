/**
 * BlendModes.ts - Custom blend mode implementations
 * 
 * Implements all Photoshop blend modes using per-pixel blending formulas.
 * For modes not natively supported by Canvas 2D API, we provide custom implementations.
 */

import { BlendMode } from '@/types/canvas';

// ============================================================
// COLOR CONVERSION UTILITIES
// ============================================================

/**
 * Convert RGB to HSL
 * @param r Red (0-1)
 * @param g Green (0-1)
 * @param b Blue (0-1)
 * @returns [h, s, l] where h is 0-360, s and l are 0-1
 */
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) {
        return [0, 0, l]; // achromatic
    }

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    let h: number;
    switch (max) {
        case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
        case g:
            h = ((b - r) / d + 2) / 6;
            break;
        default:
            h = ((r - g) / d + 4) / 6;
            break;
    }

    return [h * 360, s, l];
}

/**
 * Convert HSL to RGB
 * @param h Hue (0-360)
 * @param s Saturation (0-1)
 * @param l Lightness (0-1)
 * @returns [r, g, b] where each is 0-1
 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    if (s === 0) {
        return [l, l, l]; // achromatic
    }

    const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hNorm = h / 360;

    return [
        hue2rgb(p, q, hNorm + 1 / 3),
        hue2rgb(p, q, hNorm),
        hue2rgb(p, q, hNorm - 1 / 3)
    ];
}

// ============================================================
// BLEND MODE FORMULAS (per channel, values 0-1)
// ============================================================

/** Clamp value between 0 and 1 */
const clamp = (v: number): number => Math.max(0, Math.min(1, v));

// --- NORMAL GROUP ---

/** Normal: T */
export const blendNormal = (t: number, _b: number): number => t;

/** Dissolve: random transparency (handled specially in rendering) */
export const blendDissolve = (t: number, b: number, opacity: number): number => {
    return Math.random() < opacity ? t : b;
};

// --- DARKEN GROUP ---

/** Darken: min(T, B) */
export const blendDarken = (t: number, b: number): number => Math.min(t, b);

/** Multiply: T × B */
export const blendMultiply = (t: number, b: number): number => t * b;

/** Color Burn: 1 − (1 − B) / T */
export const blendColorBurn = (t: number, b: number): number => {
    if (t === 0) return 0;
    return clamp(1 - (1 - b) / t);
};

/** Linear Burn: B + T − 1 */
export const blendLinearBurn = (t: number, b: number): number => clamp(b + t - 1);

/** Darker Color: compare luminance, return darker pixel */
export const blendDarkerColor = (tR: number, tG: number, tB: number, bR: number, bG: number, bB: number): [number, number, number] => {
    const tLum = 0.299 * tR + 0.587 * tG + 0.114 * tB;
    const bLum = 0.299 * bR + 0.587 * bG + 0.114 * bB;
    return tLum < bLum ? [tR, tG, tB] : [bR, bG, bB];
};

// --- LIGHTEN GROUP ---

/** Lighten: max(T, B) */
export const blendLighten = (t: number, b: number): number => Math.max(t, b);

/** Screen: 1 − (1 − T) × (1 − B) */
export const blendScreen = (t: number, b: number): number => 1 - (1 - t) * (1 - b);

/** Color Dodge: B / (1 − T) */
export const blendColorDodge = (t: number, b: number): number => {
    if (t >= 1) return 1;
    return clamp(b / (1 - t));
};

/** Linear Dodge (Add): B + T */
export const blendLinearDodge = (t: number, b: number): number => clamp(b + t);

/** Lighter Color: compare luminance, return lighter pixel */
export const blendLighterColor = (tR: number, tG: number, tB: number, bR: number, bG: number, bB: number): [number, number, number] => {
    const tLum = 0.299 * tR + 0.587 * tG + 0.114 * tB;
    const bLum = 0.299 * bR + 0.587 * bG + 0.114 * bB;
    return tLum > bLum ? [tR, tG, tB] : [bR, bG, bB];
};

// --- CONTRAST GROUP ---

/** Overlay: if B < 0.5: 2×T×B, else: 1 − 2×(1−T)×(1−B) */
export const blendOverlay = (t: number, b: number): number => {
    return b < 0.5 ? 2 * t * b : 1 - 2 * (1 - t) * (1 - b);
};

/** Soft Light: (1 − 2T) × B² + 2T × B */
export const blendSoftLight = (t: number, b: number): number => {
    return (1 - 2 * t) * b * b + 2 * t * b;
};

/** Hard Light: if T < 0.5: 2×T×B, else: 1 − 2×(1−T)×(1−B) */
export const blendHardLight = (t: number, b: number): number => {
    return t < 0.5 ? 2 * t * b : 1 - 2 * (1 - t) * (1 - b);
};

/** Vivid Light: if T < 0.5: ColorBurn, else: ColorDodge */
export const blendVividLight = (t: number, b: number): number => {
    if (t < 0.5) {
        const t2 = 2 * t;
        if (t2 === 0) return 0;
        return clamp(1 - (1 - b) / t2);
    } else {
        const t2 = 2 * (1 - t);
        if (t2 === 0) return 1;
        return clamp(b / t2);
    }
};

/** Linear Light: B + 2T − 1 */
export const blendLinearLight = (t: number, b: number): number => clamp(b + 2 * t - 1);

/** Pin Light: if T < 0.5: min(B, 2T), else: max(B, 2T−1) */
export const blendPinLight = (t: number, b: number): number => {
    return t < 0.5 ? Math.min(b, 2 * t) : Math.max(b, 2 * t - 1);
};

/** Hard Mix: step(0.5, LinearLight) - posterizes to 0 or 1 */
export const blendHardMix = (t: number, b: number): number => {
    const linearLight = b + 2 * t - 1;
    return linearLight < 0.5 ? 0 : 1;
};

// --- INVERSION GROUP ---

/** Difference: |B − T| */
export const blendDifference = (t: number, b: number): number => Math.abs(b - t);

/** Exclusion: B + T − 2×B×T */
export const blendExclusion = (t: number, b: number): number => b + t - 2 * b * t;

/** Subtract: B − T */
export const blendSubtract = (t: number, b: number): number => clamp(b - t);

/** Divide: B / T */
export const blendDivide = (t: number, b: number): number => {
    if (t === 0) return 1; // Avoid division by zero
    return clamp(b / t);
};

// --- COLOR GROUP (HSL-based) ---

/** Hue: Hue from T, Saturation and Lightness from B */
export const blendHue = (tR: number, tG: number, tB: number, bR: number, bG: number, bB: number): [number, number, number] => {
    const [tH] = rgbToHsl(tR, tG, tB);
    const [_, bS, bL] = rgbToHsl(bR, bG, bB);
    return hslToRgb(tH, bS, bL);
};

/** Saturation: Saturation from T, Hue and Lightness from B */
export const blendSaturation = (tR: number, tG: number, tB: number, bR: number, bG: number, bB: number): [number, number, number] => {
    const [_, tS] = rgbToHsl(tR, tG, tB);
    const [bH, __, bL] = rgbToHsl(bR, bG, bB);
    return hslToRgb(bH, tS, bL);
};

/** Color: Hue and Saturation from T, Lightness from B */
export const blendColor = (tR: number, tG: number, tB: number, bR: number, bG: number, bB: number): [number, number, number] => {
    const [tH, tS] = rgbToHsl(tR, tG, tB);
    const [_, __, bL] = rgbToHsl(bR, bG, bB);
    return hslToRgb(tH, tS, bL);
};

/** Luminosity: Lightness from T, Hue and Saturation from B */
export const blendLuminosity = (tR: number, tG: number, tB: number, bR: number, bG: number, bB: number): [number, number, number] => {
    const [_, __, tL] = rgbToHsl(tR, tG, tB);
    const [bH, bS] = rgbToHsl(bR, bG, bB);
    return hslToRgb(bH, bS, tL);
};

// ============================================================
// MAIN BLEND FUNCTION
// ============================================================

/**
 * Blend two pixels using the specified blend mode
 * @param topR Top layer red (0-255)
 * @param topG Top layer green (0-255)
 * @param topB Top layer blue (0-255)
 * @param bottomR Bottom layer red (0-255)
 * @param bottomG Bottom layer green (0-255)
 * @param bottomB Bottom layer blue (0-255)
 * @param opacity Top layer opacity (0-1)
 * @param mode Blend mode
 * @returns [r, g, b] result (0-255)
 */
export function blendPixels(
    topR: number, topG: number, topB: number,
    bottomR: number, bottomG: number, bottomB: number,
    opacity: number,
    mode: BlendMode
): [number, number, number] {
    // Normalize to 0-1
    const tR = topR / 255;
    const tG = topG / 255;
    const tB = topB / 255;
    const bR = bottomR / 255;
    const bG = bottomG / 255;
    const bB = bottomB / 255;

    let rR: number, rG: number, rB: number;

    // Apply blend mode
    switch (mode) {
        case 'normal':
            rR = tR; rG = tG; rB = tB;
            break;
        case 'dissolve':
            // Dissolve uses random transparency
            if (Math.random() < opacity) {
                return [topR, topG, topB];
            }
            return [bottomR, bottomG, bottomB];

        // Darken group
        case 'darken':
            rR = blendDarken(tR, bR);
            rG = blendDarken(tG, bG);
            rB = blendDarken(tB, bB);
            break;
        case 'multiply':
            rR = blendMultiply(tR, bR);
            rG = blendMultiply(tG, bG);
            rB = blendMultiply(tB, bB);
            break;
        case 'color-burn':
            rR = blendColorBurn(tR, bR);
            rG = blendColorBurn(tG, bG);
            rB = blendColorBurn(tB, bB);
            break;
        case 'linear-burn':
            rR = blendLinearBurn(tR, bR);
            rG = blendLinearBurn(tG, bG);
            rB = blendLinearBurn(tB, bB);
            break;
        case 'darker-color':
            [rR, rG, rB] = blendDarkerColor(tR, tG, tB, bR, bG, bB);
            break;

        // Lighten group
        case 'lighten':
            rR = blendLighten(tR, bR);
            rG = blendLighten(tG, bG);
            rB = blendLighten(tB, bB);
            break;
        case 'screen':
            rR = blendScreen(tR, bR);
            rG = blendScreen(tG, bG);
            rB = blendScreen(tB, bB);
            break;
        case 'color-dodge':
            rR = blendColorDodge(tR, bR);
            rG = blendColorDodge(tG, bG);
            rB = blendColorDodge(tB, bB);
            break;
        case 'linear-dodge':
            rR = blendLinearDodge(tR, bR);
            rG = blendLinearDodge(tG, bG);
            rB = blendLinearDodge(tB, bB);
            break;
        case 'lighter-color':
            [rR, rG, rB] = blendLighterColor(tR, tG, tB, bR, bG, bB);
            break;

        // Contrast group
        case 'overlay':
            rR = blendOverlay(tR, bR);
            rG = blendOverlay(tG, bG);
            rB = blendOverlay(tB, bB);
            break;
        case 'soft-light':
            rR = blendSoftLight(tR, bR);
            rG = blendSoftLight(tG, bG);
            rB = blendSoftLight(tB, bB);
            break;
        case 'hard-light':
            rR = blendHardLight(tR, bR);
            rG = blendHardLight(tG, bG);
            rB = blendHardLight(tB, bB);
            break;
        case 'vivid-light':
            rR = blendVividLight(tR, bR);
            rG = blendVividLight(tG, bG);
            rB = blendVividLight(tB, bB);
            break;
        case 'linear-light':
            rR = blendLinearLight(tR, bR);
            rG = blendLinearLight(tG, bG);
            rB = blendLinearLight(tB, bB);
            break;
        case 'pin-light':
            rR = blendPinLight(tR, bR);
            rG = blendPinLight(tG, bG);
            rB = blendPinLight(tB, bB);
            break;
        case 'hard-mix':
            rR = blendHardMix(tR, bR);
            rG = blendHardMix(tG, bG);
            rB = blendHardMix(tB, bB);
            break;

        // Inversion group
        case 'difference':
            rR = blendDifference(tR, bR);
            rG = blendDifference(tG, bG);
            rB = blendDifference(tB, bB);
            break;
        case 'exclusion':
            rR = blendExclusion(tR, bR);
            rG = blendExclusion(tG, bG);
            rB = blendExclusion(tB, bB);
            break;
        case 'subtract':
            rR = blendSubtract(tR, bR);
            rG = blendSubtract(tG, bG);
            rB = blendSubtract(tB, bB);
            break;
        case 'divide':
            rR = blendDivide(tR, bR);
            rG = blendDivide(tG, bG);
            rB = blendDivide(tB, bB);
            break;

        // Color group (HSL-based)
        case 'hue':
            [rR, rG, rB] = blendHue(tR, tG, tB, bR, bG, bB);
            break;
        case 'saturation':
            [rR, rG, rB] = blendSaturation(tR, tG, tB, bR, bG, bB);
            break;
        case 'color':
            [rR, rG, rB] = blendColor(tR, tG, tB, bR, bG, bB);
            break;
        case 'luminosity':
            [rR, rG, rB] = blendLuminosity(tR, tG, tB, bR, bG, bB);
            break;

        default:
            rR = tR; rG = tG; rB = tB;
    }

    // Apply opacity: Final = B × (1 − opacity) + BlendResult × opacity
    const finalR = bR * (1 - opacity) + rR * opacity;
    const finalG = bG * (1 - opacity) + rG * opacity;
    const finalB = bB * (1 - opacity) + rB * opacity;

    // Convert back to 0-255
    return [
        Math.round(clamp(finalR) * 255),
        Math.round(clamp(finalG) * 255),
        Math.round(clamp(finalB) * 255)
    ];
}

// ============================================================
// CANVAS API MAPPING
// ============================================================

/**
 * Map blend mode to Canvas 2D globalCompositeOperation
 * For modes not natively supported, use the closest visual approximation for preview
 * Export will use true pixel-level blending via renderWithCustomBlendModes()
 */
export const NATIVE_BLEND_MODES: Record<BlendMode, string> = {
    // Native modes (supported by Canvas 2D API)
    'normal': 'source-over',
    'darken': 'darken',
    'multiply': 'multiply',
    'color-burn': 'color-burn',
    'lighten': 'lighten',
    'screen': 'screen',
    'color-dodge': 'color-dodge',
    'overlay': 'overlay',
    'soft-light': 'soft-light',
    'hard-light': 'hard-light',
    'difference': 'difference',
    'exclusion': 'exclusion',
    'hue': 'hue',
    'saturation': 'saturation',
    'color': 'color',
    'luminosity': 'luminosity',

    // Custom modes - use closest visual approximation for real-time preview
    // True blend will be applied during export via pixel-level blending
    'dissolve': 'source-over',        // Will show as normal in preview
    'linear-burn': 'multiply',        // Similar darkening effect
    'darker-color': 'darken',         // Similar to darken
    'linear-dodge': 'screen',         // Similar lightening effect (also called "Add")
    'lighter-color': 'lighten',       // Similar to lighten
    'vivid-light': 'hard-light',      // Similar high-contrast effect
    'linear-light': 'hard-light',     // Similar contrast effect
    'pin-light': 'hard-light',        // Similar effect
    'hard-mix': 'difference',         // High contrast posterized look
    'subtract': 'difference',         // Inverse-like effect
    'divide': 'screen',               // Brightening effect
};

// List of modes that need custom pixel rendering for accurate export
export const CUSTOM_BLEND_MODES: BlendMode[] = [
    'dissolve',
    'linear-burn',
    'darker-color',
    'linear-dodge',
    'lighter-color',
    'vivid-light',
    'linear-light',
    'pin-light',
    'hard-mix',
    'subtract',
    'divide',
];

/**
 * Check if a blend mode is natively supported by Canvas 2D API
 * (without needing pixel-level custom blending)
 */
export function isNativeBlendMode(mode: BlendMode): boolean {
    return !CUSTOM_BLEND_MODES.includes(mode);
}

/**
 * Check if a blend mode requires custom pixel-level rendering
 */
export function isCustomBlendMode(mode: BlendMode): boolean {
    return CUSTOM_BLEND_MODES.includes(mode);
}

/**
 * Get the Canvas 2D globalCompositeOperation value for a blend mode
 * For custom modes, returns the closest visual approximation
 */
export function getCanvasBlendMode(mode: BlendMode): string {
    return NATIVE_BLEND_MODES[mode];
}

