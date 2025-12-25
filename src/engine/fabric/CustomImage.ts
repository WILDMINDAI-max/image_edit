// Custom Image
// Extended Fabric.js image object with advanced features

import { fabric } from 'fabric';
import { ImageFilter, CropData } from '@/types/canvas';

export interface CustomImageOptions {
    customId?: string;
    customFilters?: ImageFilter; // Renamed to avoid conflict with fabric.Image.filters
    cropData?: CropData | null;
    // Fabric.js base image options
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    angle?: number;
    opacity?: number;
    flipX?: boolean;
    flipY?: boolean;
    crossOrigin?: string;
    [key: string]: any; // Allow other fabric.Image properties
}

/**
 * Extended Image class with additional features
 */
export class CustomImage extends fabric.Image {
    public customId?: string;
    public customFilters?: ImageFilter;
    public cropData?: CropData | null;
    private originalElement?: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;

    constructor(
        element: string | HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
        options?: CustomImageOptions
    ) {
        super(element as HTMLImageElement, options);

        this.customId = options?.customId;
        this.customFilters = options?.customFilters;
        this.cropData = options?.cropData;

        // Store original element for reset
        if (element instanceof HTMLImageElement || element instanceof HTMLVideoElement || element instanceof HTMLCanvasElement) {
            this.originalElement = element;
        }
    }

    /**
     * Apply custom filters
     */
    public applyCustomFilters(filterConfig: Partial<ImageFilter>): void {
        this.customFilters = { ...this.customFilters, ...filterConfig } as ImageFilter;

        const filters: fabric.IBaseFilter[] = [];

        if (this.customFilters.brightness !== 0) {
            filters.push(new fabric.Image.filters.Brightness({
                brightness: this.customFilters.brightness / 100,
            }));
        }

        if (this.customFilters.contrast !== 0) {
            filters.push(new fabric.Image.filters.Contrast({
                contrast: this.customFilters.contrast / 100,
            }));
        }

        if (this.customFilters.saturation !== 0) {
            filters.push(new fabric.Image.filters.Saturation({
                saturation: this.customFilters.saturation / 100,
            }));
        }

        if (this.customFilters.blur > 0) {
            filters.push(new fabric.Image.filters.Blur({
                blur: this.customFilters.blur / 100,
            }));
        }

        if (this.customFilters.grayscale) {
            filters.push(new fabric.Image.filters.Grayscale());
        }

        if (this.customFilters.sepia) {
            filters.push(new fabric.Image.filters.Sepia());
        }

        if (this.customFilters.invert) {
            filters.push(new fabric.Image.filters.Invert());
        }

        // Apply HueRotation for temperature (approximate)
        if (this.customFilters.temperature !== 0) {
            filters.push(new fabric.Image.filters.HueRotation({
                rotation: this.customFilters.temperature / 100,
            }));
        }

        this.filters = filters;
        this.applyFilters();
        this.canvas?.renderAll();
    }

    /**
     * Reset all filters
     */
    public resetFilters(): void {
        this.customFilters = {
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

        this.filters = [];
        this.applyFilters();
        this.canvas?.renderAll();
    }

    /**
     * Apply crop
     */
    public applyCrop(cropData: CropData): void {
        this.cropData = cropData;

        this.clipPath = new fabric.Rect({
            left: cropData.x,
            top: cropData.y,
            width: cropData.width,
            height: cropData.height,
            absolutePositioned: true,
        });

        this.canvas?.renderAll();
    }

    /**
     * Remove crop
     */
    public removeCrop(): void {
        this.cropData = null;
        this.clipPath = undefined;
        this.canvas?.renderAll();
    }

    /**
     * Set opacity
     */
    public setImageOpacity(opacity: number): void {
        this.opacity = Math.max(0, Math.min(1, opacity));
        this.canvas?.renderAll();
    }

    /**
     * Flip horizontal
     */
    public flipHorizontal(): void {
        this.flipX = !this.flipX;
        this.canvas?.renderAll();
    }

    /**
     * Flip vertical
     */
    public flipVertical(): void {
        this.flipY = !this.flipY;
        this.canvas?.renderAll();
    }

    /**
     * Rotate by degrees
     */
    public rotateBy(degrees: number): void {
        const currentAngle = this.angle || 0;
        this.angle = (currentAngle + degrees) % 360;
        this.canvas?.renderAll();
    }

    /**
     * Get filter configuration
     */
    public getFilterConfig(): ImageFilter {
        return this.customFilters || {
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
     * Override toObject to include custom properties
     */
    public toObject(propertiesToInclude?: string[]): object {
        return {
            ...super.toObject(propertiesToInclude),
            customId: this.customId,
            customFilters: this.customFilters,
            cropData: this.cropData,
        };
    }

    /**
     * Static method to load from URL
     */
    static fromURL(
        url: string,
        callback?: (image: CustomImage) => void,
        options?: CustomImageOptions
    ): CustomImage {
        let result: CustomImage | null = null;

        fabric.Image.fromURL(
            url,
            (img) => {
                const customImg = new CustomImage(img.getElement(), {
                    ...options,
                    ...img.toObject(),
                });

                if (options?.customFilters) {
                    customImg.applyCustomFilters(options.customFilters);
                }

                result = customImg;
                callback?.(customImg);
            },
            { crossOrigin: 'anonymous' }
        );

        // Return a placeholder instance (will be updated via callback)
        return result || new CustomImage('data:image/gif;base64,R0lGODlhAQABAAAAACw=', options);
    }
}

// Register custom class with Fabric
(fabric as unknown as Record<string, unknown>).CustomImage = CustomImage;

/**
 * Filter preset definitions
 */
export interface FilterPreset {
    name: string;
    config: Partial<ImageFilter>;
    thumbnail?: string;
}

/**
 * Built-in filter presets
 */
export const FILTER_PRESETS: FilterPreset[] = [
    {
        name: 'Original',
        config: {
            brightness: 0,
            contrast: 0,
            saturation: 0,
        },
    },
    {
        name: 'Vivid',
        config: {
            brightness: 10,
            contrast: 15,
            saturation: 30,
        },
    },
    {
        name: 'Dramatic',
        config: {
            brightness: -5,
            contrast: 30,
            saturation: -10,
        },
    },
    {
        name: 'Warm',
        config: {
            brightness: 5,
            temperature: 30,
            saturation: 10,
        },
    },
    {
        name: 'Cool',
        config: {
            brightness: 0,
            temperature: -30,
            saturation: 5,
        },
    },
    {
        name: 'Fade',
        config: {
            brightness: 15,
            contrast: -15,
            saturation: -20,
        },
    },
    {
        name: 'B&W',
        config: {
            grayscale: true,
            contrast: 10,
        },
    },
    {
        name: 'Sepia',
        config: {
            sepia: true,
            brightness: 5,
        },
    },
    {
        name: 'High Contrast',
        config: {
            contrast: 50,
            saturation: 0,
        },
    },
    {
        name: 'Soft',
        config: {
            brightness: 10,
            contrast: -10,
            blur: 5,
        },
    },
];

/**
 * Helper to load image from file
 */
export const loadImageFromFile = (
    file: File,
    callback: (image: CustomImage) => void,
    options?: CustomImageOptions
): void => {
    const reader = new FileReader();

    reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        CustomImage.fromURL(dataUrl, callback, options);
    };

    reader.readAsDataURL(file);
};

/**
 * Helper to load image from URL with proxy support
 */
export const loadImageWithCORS = async (
    url: string,
    options?: CustomImageOptions
): Promise<CustomImage> => {
    return new Promise((resolve, reject) => {
        CustomImage.fromURL(
            url,
            (img) => {
                if (img) {
                    resolve(img);
                } else {
                    reject(new Error('Failed to load image'));
                }
            },
            { ...options, crossOrigin: 'anonymous' } as CustomImageOptions
        );
    });
};
