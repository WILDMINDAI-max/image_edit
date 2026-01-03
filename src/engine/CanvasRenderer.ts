// Canvas Renderer
// High-resolution rendering and export utilities

import { fabric } from 'fabric';
import { getFabricCanvas } from './fabric/FabricCanvas';
import { Page } from '@/types/project';

export interface RenderOptions {
    scale?: number;
    quality?: number;
    format?: 'png' | 'jpeg' | 'webp';
    backgroundColor?: string;
    width?: number;
    height?: number;
}

export interface TileRenderOptions extends RenderOptions {
    tileSize?: number;
    overlap?: number;
}

export class CanvasRenderer {
    private fabricCanvas = getFabricCanvas();

    /**
     * Render canvas to data URL
     */
    public renderToDataURL(options: RenderOptions = {}): string {
        const canvas = this.fabricCanvas.getCanvas();
        if (!canvas) return '';

        return canvas.toDataURL({
            format: options.format || 'png',
            quality: options.quality || 1,
            multiplier: options.scale || 1,
        });
    }

    /**
     * Render canvas to Blob
     */
    public async renderToBlob(options: RenderOptions = {}): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const canvas = this.fabricCanvas.getCanvas();
            if (!canvas) {
                reject(new Error('Canvas not initialized'));
                return;
            }

            // Create a temporary canvas for export
            // Use LOGICAL dimensions (full size) not working dimensions (scaled)
            const tempCanvas = document.createElement('canvas');
            const logicalDimensions = this.fabricCanvas.getLogicalDimensions();
            const width = options.width || logicalDimensions.width;
            const height = options.height || logicalDimensions.height;
            const scale = options.scale || 1;

            tempCanvas.width = width * scale;
            tempCanvas.height = height * scale;

            const ctx = tempCanvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Fill background
            if (options.backgroundColor) {
                ctx.fillStyle = options.backgroundColor;
                ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            }

            // Render Fabric canvas to temp canvas
            // Use a multiplier that accounts for both scale AND workingScale
            const workingScale = this.fabricCanvas.getWorkingScale();
            const effectiveMultiplier = (scale * width) / (canvas.width! / workingScale);
            const dataUrl = canvas.toDataURL({
                format: options.format || 'png',
                quality: options.quality || 1,
                multiplier: effectiveMultiplier,
            });

            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                tempCanvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to create blob'));
                        }
                    },
                    `image/${options.format || 'png'}`,
                    options.quality || 1
                );
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = dataUrl;
        });
    }

    /**
     * Render for 8K export using tiled rendering
     */
    public async renderHighResolution(options: TileRenderOptions = {}): Promise<Blob> {
        const canvas = this.fabricCanvas.getCanvas();
        if (!canvas) {
            throw new Error('Canvas not initialized');
        }

        const tileSize = options.tileSize || 2048;
        const scale = options.scale || 4; // 4x for 8K from 1080p
        const overlap = options.overlap || 0;

        const originalWidth = canvas.width!;
        const originalHeight = canvas.height!;
        const targetWidth = originalWidth * scale;
        const targetHeight = originalHeight * scale;

        // Create high-res output canvas
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = targetWidth;
        outputCanvas.height = targetHeight;
        const outputCtx = outputCanvas.getContext('2d');

        if (!outputCtx) {
            throw new Error('Could not get output canvas context');
        }

        // Calculate number of tiles
        const tilesX = Math.ceil(targetWidth / tileSize);
        const tilesY = Math.ceil(targetHeight / tileSize);

        // Render each tile
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                const tileX = x * tileSize;
                const tileY = y * tileSize;
                const tileW = Math.min(tileSize, targetWidth - tileX);
                const tileH = Math.min(tileSize, targetHeight - tileY);

                // Calculate source region
                const srcX = tileX / scale;
                const srcY = tileY / scale;
                const srcW = tileW / scale;
                const srcH = tileH / scale;

                // Create tile canvas
                const tileCanvas = document.createElement('canvas');
                tileCanvas.width = tileW;
                tileCanvas.height = tileH;
                const tileCtx = tileCanvas.getContext('2d');

                if (!tileCtx) continue;

                // Export this region from Fabric
                const tileDataUrl = canvas.toDataURL({
                    format: 'png',
                    quality: 1,
                    multiplier: scale,
                    left: srcX,
                    top: srcY,
                    width: srcW,
                    height: srcH,
                });

                // Draw tile to output
                await new Promise<void>((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        outputCtx.drawImage(
                            img,
                            0, 0, tileW, tileH,
                            tileX, tileY, tileW, tileH
                        );
                        resolve();
                    };
                    img.src = tileDataUrl;
                });
            }
        }

        // Convert to blob
        return new Promise((resolve, reject) => {
            outputCanvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create high-res blob'));
                    }
                },
                `image/${options.format || 'png'}`,
                options.quality || 1
            );
        });
    }

    /**
     * Render to SVG string
     */
    public renderToSVG(): string {
        return this.fabricCanvas.toSVG();
    }

    /**
     * Render specific page
     */
    public async renderPage(page: Page, options: RenderOptions = {}): Promise<Blob> {
        // Load page first
        await this.fabricCanvas.loadPage(page);

        // Wait for images to load
        await this.waitForImages();

        // Render
        return this.renderToBlob(options);
    }

    /**
     * Wait for all images to load
     */
    private async waitForImages(): Promise<void> {
        const canvas = this.fabricCanvas.getCanvas();
        if (!canvas) return;

        const objects = canvas.getObjects();
        const imagePromises: Promise<void>[] = [];

        objects.forEach((obj) => {
            if (obj.type === 'image') {
                const img = obj as fabric.Image;
                if (img.getElement()) {
                    const element = img.getElement();
                    if (element instanceof HTMLImageElement && !element.complete) {
                        imagePromises.push(
                            new Promise((resolve) => {
                                element.onload = () => resolve();
                                element.onerror = () => resolve();
                            })
                        );
                    }
                }
            }
        });

        await Promise.all(imagePromises);
    }

    /**
     * Render frame for animation (returns ImageData)
     */
    public renderFrame(): ImageData | null {
        const canvas = this.fabricCanvas.getCanvas();
        if (!canvas) return null;

        const ctx = canvas.getContext();
        return ctx.getImageData(0, 0, canvas.width!, canvas.height!);
    }

    /**
     * Get canvas dimensions (returns LOGICAL dimensions, not working dimensions)
     */
    public getDimensions(): { width: number; height: number } {
        // Return logical (target) dimensions, not working (scaled) dimensions
        return this.fabricCanvas.getLogicalDimensions();
    }
}

// Singleton
let rendererInstance: CanvasRenderer | null = null;

export const getCanvasRenderer = (): CanvasRenderer => {
    if (!rendererInstance) {
        rendererInstance = new CanvasRenderer();
    }
    return rendererInstance;
};
