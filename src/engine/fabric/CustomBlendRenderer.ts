/**
 * CustomBlendRenderer.ts
 * 
 * Provides real-time pixel-level blending for custom blend modes in Fabric.js
 * This renderer intercepts after each layer is drawn and applies the correct blend formula
 */

import { BlendMode } from '@/types/canvas';
import { blendPixels, isCustomBlendMode } from './BlendModes';

/**
 * Apply custom blend mode to a fabric object by rendering with pixel blending
 * This is called by the modified object _render methods for custom blend modes
 */
export function applyCustomBlendMode(
    ctx: CanvasRenderingContext2D,
    objectCanvas: HTMLCanvasElement,
    blendMode: BlendMode,
    opacity: number,
    x: number,
    y: number,
    width: number,
    height: number
): void {
    // Get the current canvas content (background/layers below)
    const bottomImageData = ctx.getImageData(x, y, width, height);

    // Get the object's rendered content
    const objectCtx = objectCanvas.getContext('2d')!;
    const topImageData = objectCtx.getImageData(0, 0, width, height);

    // Create result image data
    const resultData = ctx.createImageData(width, height);

    // Blend each pixel
    for (let i = 0; i < bottomImageData.data.length; i += 4) {
        const topR = topImageData.data[i];
        const topG = topImageData.data[i + 1];
        const topB = topImageData.data[i + 2];
        const topA = topImageData.data[i + 3] / 255;

        const bottomR = bottomImageData.data[i];
        const bottomG = bottomImageData.data[i + 1];
        const bottomB = bottomImageData.data[i + 2];
        const bottomA = bottomImageData.data[i + 3] / 255;

        if (topA === 0) {
            // Top pixel is transparent, keep bottom
            resultData.data[i] = bottomR;
            resultData.data[i + 1] = bottomG;
            resultData.data[i + 2] = bottomB;
            resultData.data[i + 3] = bottomImageData.data[i + 3];
        } else {
            // Apply blend mode
            const effectiveOpacity = topA * opacity;
            const [r, g, b] = blendPixels(
                topR, topG, topB,
                bottomR, bottomG, bottomB,
                effectiveOpacity,
                blendMode
            );

            resultData.data[i] = r;
            resultData.data[i + 1] = g;
            resultData.data[i + 2] = b;
            resultData.data[i + 3] = Math.round(Math.min(1, bottomA + effectiveOpacity) * 255);
        }
    }

    // Put the blended result back
    ctx.putImageData(resultData, x, y);
}

/**
 * Render a single object with custom blend mode
 * Creates a temporary canvas, renders the object, then blends it with the main canvas
 * 
 * NOTE: This function is called AFTER Fabric.js has already rendered the object.
 * The object is already on the canvas with a fallback blend mode.
 * We need to:
 * 1. Capture the area where the object was rendered
 * 2. Re-render the object with proper custom blending
 * 3. Replace the fallback render with the correctly blended version
 */
export function renderObjectWithCustomBlend(
    mainCtx: CanvasRenderingContext2D,
    object: fabric.Object,
    blendMode: BlendMode,
    canvasWidth: number,
    canvasHeight: number
): void {
    // Skip if not a custom blend mode or object not visible
    if (!isCustomBlendMode(blendMode) || !object.visible) {
        return;
    }

    // Get object bounding box using absolute coordinates (ignoring viewport transform)
    // This ensures we get the correct canvas coordinates, not screen coordinates
    const bounds = object.getBoundingRect(true, true);
    const x = Math.max(0, Math.floor(bounds.left));
    const y = Math.max(0, Math.floor(bounds.top));
    const width = Math.min(canvasWidth - x, Math.ceil(bounds.width) + 4);
    const height = Math.min(canvasHeight - y, Math.ceil(bounds.height) + 4);

    if (width <= 0 || height <= 0) return;

    // Step 1: Capture the background BEFORE the object was rendered
    // We need to get the background without this object to blend correctly
    // Since object is already rendered, we need to save and temporarily hide it

    // Create temporary canvas for the object only
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d')!;

    // Translate to render at correct position within temp canvas
    tempCtx.translate(-x, -y);

    // Render the object to temp canvas with normal blend mode
    const originalGCO = object.globalCompositeOperation;
    const originalOpacity = object.opacity;
    object.globalCompositeOperation = 'source-over';
    object.opacity = 1; // Full opacity for temp render, we'll apply opacity in blending
    object.render(tempCtx);
    object.globalCompositeOperation = originalGCO;
    object.opacity = originalOpacity;

    // Reset translation
    tempCtx.setTransform(1, 0, 0, 1, 0, 0);

    // Step 2: The current mainCtx already has the object rendered with fallback mode
    // For custom blend modes, the fallback is already a reasonable approximation
    // We just need to check if we have meaningful content to blend

    // Get the temp canvas content to check if there's anything to blend
    const tempData = tempCtx.getImageData(0, 0, width, height);
    let hasContent = false;
    for (let i = 3; i < tempData.data.length; i += 4) {
        if (tempData.data[i] > 0) {
            hasContent = true;
            break;
        }
    }

    // If no content, nothing to do
    if (!hasContent) return;

    // Step 3: For custom blend modes during real-time preview,
    // the native fallback is already applied by Fabric.js.
    // We only need custom blending for EXPORT (renderWithCustomBlendModes).
    // During real-time rendering, the fallback approximation is sufficient.
    // 
    // This function was causing duplicate rendering because:
    // 1. Fabric renders object with fallback blend mode
    // 2. This function renders it AGAIN with custom blending
    // 
    // The fix: During after:render, we should NOT re-render.
    // Custom blending is only needed for static export.
    // 
    // Therefore, this function should be a no-op for real-time preview.
    // The actual custom blending happens in renderWithCustomBlendModes() 
    // which is used for export only.

    // DISABLED: Real-time custom blending causes duplicate rendering
    // The fallback blend mode approximation is used for preview instead
    return;
}

/**
 * Process all objects with custom blend modes after initial render
 * This is meant to be called as a post-processing step
 */
export function applyCustomBlendModesToCanvas(
    canvas: fabric.Canvas,
    elementBlendModes: Map<string, BlendMode>
): void {
    const ctx = canvas.getContext();
    if (!ctx) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    const objects = canvas.getObjects();

    for (const obj of objects) {
        const id = (obj as any).data?.id;
        if (!id) continue;

        const blendMode = elementBlendModes.get(id);
        if (!blendMode || !isCustomBlendMode(blendMode)) continue;

        renderObjectWithCustomBlend(ctx, obj, blendMode, canvasWidth, canvasHeight);
    }
}
