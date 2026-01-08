// .cube LUT File Parser and Applicator
// Parses .cube LUT files and applies 3D color transformations to images

/**
 * Parsed LUT data structure
 */
export interface ParsedLUT {
    title: string;
    size: number;           // LUT size (e.g., 17, 33, 65)
    domainMin: [number, number, number];
    domainMax: [number, number, number];
    data: Float32Array;     // Flattened RGB data: [r,g,b, r,g,b, ...]
}

/**
 * Parse a .cube LUT file content
 */
export function parseCubeLUT(content: string): ParsedLUT | null {
    try {
        const lines = content.split('\n');
        let title = 'Custom LUT';
        let size = 0;
        let domainMin: [number, number, number] = [0, 0, 0];
        let domainMax: [number, number, number] = [1, 1, 1];
        const dataLines: number[] = [];

        for (const line of lines) {
            const trimmed = line.trim();

            // Skip empty lines and comments
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Parse metadata
            if (trimmed.startsWith('TITLE')) {
                // Extract title from quotes
                const match = trimmed.match(/TITLE\s+"([^"]+)"/i) || trimmed.match(/TITLE\s+(\S+)/i);
                if (match) title = match[1];
                continue;
            }

            if (trimmed.startsWith('LUT_3D_SIZE')) {
                const match = trimmed.match(/LUT_3D_SIZE\s+(\d+)/i);
                if (match) size = parseInt(match[1], 10);
                continue;
            }

            if (trimmed.startsWith('DOMAIN_MIN')) {
                const match = trimmed.match(/DOMAIN_MIN\s+([\d.eE+-]+)\s+([\d.eE+-]+)\s+([\d.eE+-]+)/i);
                if (match) {
                    domainMin = [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])];
                }
                continue;
            }

            if (trimmed.startsWith('DOMAIN_MAX')) {
                const match = trimmed.match(/DOMAIN_MAX\s+([\d.eE+-]+)\s+([\d.eE+-]+)\s+([\d.eE+-]+)/i);
                if (match) {
                    domainMax = [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])];
                }
                continue;
            }

            // Skip other metadata lines
            if (trimmed.match(/^[A-Z_]+/)) continue;

            // Parse data lines (RGB triplets)
            const values = trimmed.split(/\s+/).map(v => parseFloat(v));
            if (values.length >= 3 && !isNaN(values[0])) {
                dataLines.push(values[0], values[1], values[2]);
            }
        }

        // Validate LUT
        if (size === 0) {
            // Try to infer size from data
            const cubeCount = dataLines.length / 3;
            size = Math.round(Math.pow(cubeCount, 1 / 3));
        }

        const expectedSize = size * size * size * 3;
        if (dataLines.length < expectedSize) {
            console.warn(`LUT data incomplete: expected ${expectedSize}, got ${dataLines.length}`);
        }

        return {
            title,
            size,
            domainMin,
            domainMax,
            data: new Float32Array(dataLines),
        };
    } catch (error) {
        console.error('Failed to parse .cube LUT file:', error);
        return null;
    }
}

/**
 * Trilinear interpolation to sample the 3D LUT
 */
function trilinearInterpolate(
    lut: ParsedLUT,
    r: number,
    g: number,
    b: number
): [number, number, number] {
    const size = lut.size;
    const data = lut.data;

    // Normalize input to 0-1 range based on domain
    const rNorm = (r - lut.domainMin[0]) / (lut.domainMax[0] - lut.domainMin[0]);
    const gNorm = (g - lut.domainMin[1]) / (lut.domainMax[1] - lut.domainMin[1]);
    const bNorm = (b - lut.domainMin[2]) / (lut.domainMax[2] - lut.domainMin[2]);

    // Scale to LUT coordinates
    const rScaled = Math.max(0, Math.min(size - 1.001, rNorm * (size - 1)));
    const gScaled = Math.max(0, Math.min(size - 1.001, gNorm * (size - 1)));
    const bScaled = Math.max(0, Math.min(size - 1.001, bNorm * (size - 1)));

    // Get integer and fractional parts
    const r0 = Math.floor(rScaled);
    const g0 = Math.floor(gScaled);
    const b0 = Math.floor(bScaled);
    const r1 = Math.min(r0 + 1, size - 1);
    const g1 = Math.min(g0 + 1, size - 1);
    const b1 = Math.min(b0 + 1, size - 1);

    const rFrac = rScaled - r0;
    const gFrac = gScaled - g0;
    const bFrac = bScaled - b0;

    // Helper to get LUT value at (ri, gi, bi)
    const getLutValue = (ri: number, gi: number, bi: number, channel: number): number => {
        // .cube files are ordered: B varies fastest, then G, then R
        const index = (ri * size * size + gi * size + bi) * 3 + channel;
        return data[index] || 0;
    };

    // Trilinear interpolation for each channel
    const interpolateChannel = (channel: number): number => {
        // 8 corner values
        const c000 = getLutValue(r0, g0, b0, channel);
        const c001 = getLutValue(r0, g0, b1, channel);
        const c010 = getLutValue(r0, g1, b0, channel);
        const c011 = getLutValue(r0, g1, b1, channel);
        const c100 = getLutValue(r1, g0, b0, channel);
        const c101 = getLutValue(r1, g0, b1, channel);
        const c110 = getLutValue(r1, g1, b0, channel);
        const c111 = getLutValue(r1, g1, b1, channel);

        // Interpolate along B axis
        const c00 = c000 * (1 - bFrac) + c001 * bFrac;
        const c01 = c010 * (1 - bFrac) + c011 * bFrac;
        const c10 = c100 * (1 - bFrac) + c101 * bFrac;
        const c11 = c110 * (1 - bFrac) + c111 * bFrac;

        // Interpolate along G axis
        const c0 = c00 * (1 - gFrac) + c01 * gFrac;
        const c1 = c10 * (1 - gFrac) + c11 * gFrac;

        // Interpolate along R axis
        return c0 * (1 - rFrac) + c1 * rFrac;
    };

    return [
        interpolateChannel(0),
        interpolateChannel(1),
        interpolateChannel(2),
    ];
}

/**
 * Apply custom .cube LUT to an image
 */
export async function applyCustomLUT(
    imgElement: HTMLImageElement,
    lut: ParsedLUT
): Promise<string> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
            resolve(imgElement.src);
            return;
        }

        const width = imgElement.naturalWidth || imgElement.width;
        const height = imgElement.naturalHeight || imgElement.height;

        canvas.width = width;
        canvas.height = height;

        // Draw original image
        ctx.drawImage(imgElement, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;
            const a = data[i + 3];

            // Skip transparent pixels
            if (a < 10) continue;

            // Apply LUT transformation via trilinear interpolation
            const [newR, newG, newB] = trilinearInterpolate(lut, r, g, b);

            // Store result (clamped to 0-255)
            data[i] = Math.max(0, Math.min(255, Math.round(newR * 255)));
            data[i + 1] = Math.max(0, Math.min(255, Math.round(newG * 255)));
            data[i + 2] = Math.max(0, Math.min(255, Math.round(newB * 255)));
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
    });
}

/**
 * Read a .cube file from a File object
 */
export async function readCubeFile(file: File): Promise<ParsedLUT | null> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content) {
                const lut = parseCubeLUT(content);
                resolve(lut);
            } else {
                resolve(null);
            }
        };

        reader.onerror = () => {
            console.error('Failed to read .cube file');
            resolve(null);
        };

        reader.readAsText(file);
    });
}
