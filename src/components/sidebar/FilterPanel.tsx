'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useEditorStore } from '@/store/editorStore';
import { ImageElement, ImageFilter, createDefaultImageFilter } from '@/types/canvas';
import {
    FILTER_PRESETS,
    FILTER_CATEGORIES,
    ADJUSTMENT_SLIDERS,
    getPresetsByCategory,
    createResetFilters
} from '@/utils/imageFilters';
import { COLOUR_POP_FILTERS, applyColourPopFilter, getColourPopFilter } from '@/utils/colourPopFilters';
import { MONO_FILTERS, applyMonoFilter, getMonoFilter } from '@/utils/monoFilters';
import { VINTAGE_FILTERS, applyVintageFilter, getVintageFilter } from '@/utils/vintageFilters';
import { SOFT_FILTERS, applySoftFilter, getSoftFilter } from '@/utils/softFilters';
import { NATURAL_FILTERS, applyNaturalFilter, getNaturalFilter } from '@/utils/naturalFilters';
import { WARM_FILTERS, applyWarmFilter, getWarmFilter } from '@/utils/warmFilters';
import { COOL_FILTERS, applyCoolFilter, getCoolFilter } from '@/utils/coolFilters';
import { VIVID_FILTERS, applyVividFilter, getVividFilter } from '@/utils/vividFilters';
// LUT filters use simple adjustment values, no separate import needed
import { applyImageAdjustments, hasActiveAdjustments } from '@/utils/imageAdjustments';
import { readCubeFile, applyCustomLUT, ParsedLUT } from '@/utils/cubeLutParser';
import { X, RotateCcw, Upload } from 'lucide-react';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { fabric } from 'fabric';

export function FilterPanel() {
    const selectedIds = useCanvasStore((state) => state.selectedIds);
    const getElement = useCanvasStore((state) => state.getElement);
    const updateElement = useCanvasStore((state) => state.updateElement);
    const closeRightPanel = useEditorStore((state) => state.closeRightPanel);

    const [activeCategory, setActiveCategory] = useState<string>('natural');
    const [isProcessing, setIsProcessing] = useState(false);
    const [filterPreviews, setFilterPreviews] = useState<Record<string, string>>({});
    const [customLUT, setCustomLUT] = useState<{ name: string; lut: ParsedLUT } | null>(null);

    // Debounce timer for smooth slider adjustments
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isSliderDraggingRef = useRef(false);
    const lutInputRef = useRef<HTMLInputElement>(null);

    // Get selected image element
    const imageElement = useMemo(() => {
        if (selectedIds.length !== 1) return null;
        const element = getElement(selectedIds[0]);
        if (!element || element.type !== 'image') return null;
        return element as ImageElement;
    }, [selectedIds, getElement]);

    // Get current filters
    const currentFilters = useMemo(() => {
        if (!imageElement) return createDefaultImageFilter();
        return imageElement.filters || createDefaultImageFilter();
    }, [imageElement]);

    // Get presets for active category
    const categoryPresets = useMemo(() => {
        return getPresetsByCategory(activeCategory);
    }, [activeCategory]);

    // Generate filter preview thumbnails
    const generateFilterPreviews = useCallback(async () => {
        if (!imageElement) {
            setFilterPreviews({});
            return;
        }

        const originalSrc = imageElement.originalSrc || imageElement.src;
        const previewSize = 60; // Small preview size for performance

        // Create small preview image
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = async () => {
            const previews: Record<string, string> = {};

            // Create a small canvas for preview generation
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            // Scale down for preview
            const scale = Math.min(previewSize / img.width, previewSize / img.height);
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);

            // Generate preview for each preset in category
            for (const preset of categoryPresets) {
                try {
                    // Draw scaled image
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // Apply basic filter effect based on category
                    if (activeCategory === 'mono') {
                        // Grayscale
                        for (let i = 0; i < data.length; i += 4) {
                            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                            data[i] = data[i + 1] = data[i + 2] = gray;
                        }
                    } else if (activeCategory === 'warm') {
                        // Warm tint
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] = Math.min(255, data[i] * 1.1); // R
                            data[i + 2] = Math.max(0, data[i + 2] * 0.9); // B
                        }
                    } else if (activeCategory === 'cool') {
                        // Cool tint
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] = Math.max(0, data[i] * 0.9); // R
                            data[i + 2] = Math.min(255, data[i + 2] * 1.1); // B
                        }
                    } else if (activeCategory === 'vivid') {
                        // Boost saturation
                        for (let i = 0; i < data.length; i += 4) {
                            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                            data[i] = Math.min(255, gray + (data[i] - gray) * 1.5);
                            data[i + 1] = Math.min(255, gray + (data[i + 1] - gray) * 1.5);
                            data[i + 2] = Math.min(255, gray + (data[i + 2] - gray) * 1.5);
                        }
                    } else if (activeCategory === 'soft') {
                        // Soft/faded look
                        for (let i = 0; i < data.length; i += 4) {
                            data[i] = Math.min(255, data[i] + 20);
                            data[i + 1] = Math.min(255, data[i + 1] + 20);
                            data[i + 2] = Math.min(255, data[i + 2] + 20);
                        }
                    } else if (activeCategory === 'vintage') {
                        // Sepia/vintage
                        for (let i = 0; i < data.length; i += 4) {
                            const r = data[i], g = data[i + 1], b = data[i + 2];
                            data[i] = Math.min(255, r * 0.9 + 30);
                            data[i + 1] = Math.min(255, g * 0.8 + 20);
                            data[i + 2] = Math.min(255, b * 0.7 + 10);
                        }
                    } else if (activeCategory === 'colorpop') {
                        // Neon/saturated
                        for (let i = 0; i < data.length; i += 4) {
                            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                            data[i] = Math.min(255, gray + (data[i] - gray) * 1.8);
                            data[i + 1] = Math.min(255, gray + (data[i + 1] - gray) * 1.8);
                            data[i + 2] = Math.min(255, gray + (data[i + 2] - gray) * 1.8);
                        }
                    } else if (activeCategory === 'lut') {
                        // Cinematic teal-orange look
                        for (let i = 0; i < data.length; i += 4) {
                            const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
                            // Shadows get teal, highlights get orange
                            if (lum < 0.5) {
                                data[i] = Math.max(0, data[i] - 15);
                                data[i + 2] = Math.min(255, data[i + 2] + 20);
                            } else {
                                data[i] = Math.min(255, data[i] + 20);
                                data[i + 2] = Math.max(0, data[i + 2] - 10);
                            }
                        }
                    }

                    ctx.putImageData(imageData, 0, 0);
                    previews[preset.id] = canvas.toDataURL('image/jpeg', 0.7);
                } catch (error) {
                    console.error('Preview generation error:', error);
                }
            }

            setFilterPreviews(previews);
        };

        img.src = originalSrc;
    }, [imageElement, activeCategory, categoryPresets]);

    // Generate previews when image or category changes
    useEffect(() => {
        generateFilterPreviews();
    }, [generateFilterPreviews]);


    // Apply filter changes
    const applyFilters = (newFilters: Partial<ImageFilter>) => {
        if (!imageElement) return;

        const updatedFilters = {
            ...currentFilters,
            ...newFilters,
        };

        updateElement(imageElement.id, {
            filters: updatedFilters,
        });

        // Apply to Fabric.js canvas
        applyFiltersToCanvas(imageElement.id, updatedFilters);
    };

    // Apply filter preset
    const applyPreset = async (presetId: string) => {
        const preset = FILTER_PRESETS.find(p => p.id === presetId);
        if (!preset || !imageElement) return;

        // Check if this is a Colour Pop filter (needs advanced processing)
        if (preset.category === 'colorpop') {
            const colourPopFilter = getColourPopFilter(presetId);
            if (colourPopFilter) {
                setIsProcessing(true);

                // Get the fabric object for position info
                const fabricCanvas = getFabricCanvas();
                const fabricObj = fabricCanvas.getObjectById(imageElement.id) as fabric.Image | undefined;

                if (fabricObj) {
                    try {
                        // IMPORTANT: Load the ORIGINAL image, not the current canvas state
                        // This ensures non-destructive editing
                        const originalSrc = imageElement.originalSrc || imageElement.src;

                        // Create a fresh image element from original source
                        const originalImg = new Image();
                        originalImg.crossOrigin = 'anonymous';

                        originalImg.onload = async () => {
                            try {
                                // Apply Colour Pop filter to ORIGINAL image
                                const newSrc = await applyColourPopFilter(originalImg, colourPopFilter);

                                // Update element with processed image
                                updateElement(imageElement.id, {
                                    src: newSrc,
                                    filters: {
                                        ...createResetFilters(),
                                        ...preset.values,
                                        filterPreset: presetId,
                                    },
                                });

                                // Update Fabric.js canvas with new image
                                const canvas = fabricCanvas.getCanvas();
                                if (canvas) {
                                    fabric.Image.fromURL(newSrc, (img) => {
                                        img.set({
                                            left: fabricObj.left,
                                            top: fabricObj.top,
                                            scaleX: fabricObj.scaleX,
                                            scaleY: fabricObj.scaleY,
                                            angle: fabricObj.angle,
                                            originX: fabricObj.originX,
                                            originY: fabricObj.originY,
                                            opacity: fabricObj.opacity,
                                            data: { id: imageElement.id, type: 'image' },
                                        });

                                        canvas.remove(fabricObj);
                                        canvas.add(img);
                                        fabricCanvas.setObjectById(imageElement.id, img);
                                        canvas.setActiveObject(img);
                                        canvas.renderAll();

                                        setIsProcessing(false);
                                    }, { crossOrigin: 'anonymous' });
                                } else {
                                    setIsProcessing(false);
                                }
                            } catch (error) {
                                console.error('Colour Pop filter failed:', error);
                                setIsProcessing(false);
                            }
                        };

                        originalImg.onerror = () => {
                            console.error('Failed to load original image');
                            setIsProcessing(false);
                        };

                        originalImg.src = originalSrc;
                        return; // Exit here, async handlers take care of the rest

                    } catch (error) {
                        console.error('Colour Pop filter failed:', error);
                        setIsProcessing(false);
                    }
                }
                setIsProcessing(false);
                return;
            }
        }

        // Check if this is a MONO filter (needs advanced grayscale processing)
        if (preset.category === 'mono') {
            const monoFilter = getMonoFilter(presetId);
            if (monoFilter) {
                setIsProcessing(true);

                const fabricCanvas = getFabricCanvas();
                const fabricObj = fabricCanvas.getObjectById(imageElement.id) as fabric.Image | undefined;

                if (fabricObj) {
                    try {
                        const originalSrc = imageElement.originalSrc || imageElement.src;

                        const originalImg = new Image();
                        originalImg.crossOrigin = 'anonymous';

                        originalImg.onload = async () => {
                            try {
                                const newSrc = await applyMonoFilter(originalImg, monoFilter);

                                updateElement(imageElement.id, {
                                    src: newSrc,
                                    filters: {
                                        ...createResetFilters(),
                                        ...preset.values,
                                        filterPreset: presetId,
                                    },
                                });

                                const canvas = fabricCanvas.getCanvas();
                                if (canvas) {
                                    fabric.Image.fromURL(newSrc, (img) => {
                                        img.set({
                                            left: fabricObj.left,
                                            top: fabricObj.top,
                                            scaleX: fabricObj.scaleX,
                                            scaleY: fabricObj.scaleY,
                                            angle: fabricObj.angle,
                                            originX: fabricObj.originX,
                                            originY: fabricObj.originY,
                                            opacity: fabricObj.opacity,
                                            data: { id: imageElement.id, type: 'image' },
                                        });

                                        canvas.remove(fabricObj);
                                        canvas.add(img);
                                        fabricCanvas.setObjectById(imageElement.id, img);
                                        canvas.setActiveObject(img);
                                        canvas.renderAll();

                                        setIsProcessing(false);
                                    }, { crossOrigin: 'anonymous' });
                                } else {
                                    setIsProcessing(false);
                                }
                            } catch (error) {
                                console.error('MONO filter failed:', error);
                                setIsProcessing(false);
                            }
                        };

                        originalImg.onerror = () => {
                            console.error('Failed to load original image');
                            setIsProcessing(false);
                        };

                        originalImg.src = originalSrc;
                        return;

                    } catch (error) {
                        console.error('MONO filter failed:', error);
                        setIsProcessing(false);
                    }
                }
                setIsProcessing(false);
                return;
            }
        }

        // Check if this is a VINTAGE filter (needs warm color grading)
        if (preset.category === 'vintage') {
            const vintageFilter = getVintageFilter(presetId);
            if (vintageFilter) {
                setIsProcessing(true);

                const fabricCanvas = getFabricCanvas();
                const fabricObj = fabricCanvas.getObjectById(imageElement.id) as fabric.Image | undefined;

                if (fabricObj) {
                    try {
                        const originalSrc = imageElement.originalSrc || imageElement.src;

                        const originalImg = new Image();
                        originalImg.crossOrigin = 'anonymous';

                        originalImg.onload = async () => {
                            try {
                                const newSrc = await applyVintageFilter(originalImg, vintageFilter);

                                updateElement(imageElement.id, {
                                    src: newSrc,
                                    filters: {
                                        ...createResetFilters(),
                                        ...preset.values,
                                        filterPreset: presetId,
                                    },
                                });

                                const canvas = fabricCanvas.getCanvas();
                                if (canvas) {
                                    fabric.Image.fromURL(newSrc, (img) => {
                                        img.set({
                                            left: fabricObj.left,
                                            top: fabricObj.top,
                                            scaleX: fabricObj.scaleX,
                                            scaleY: fabricObj.scaleY,
                                            angle: fabricObj.angle,
                                            originX: fabricObj.originX,
                                            originY: fabricObj.originY,
                                            opacity: fabricObj.opacity,
                                            data: { id: imageElement.id, type: 'image' },
                                        });

                                        canvas.remove(fabricObj);
                                        canvas.add(img);
                                        fabricCanvas.setObjectById(imageElement.id, img);
                                        canvas.setActiveObject(img);
                                        canvas.renderAll();

                                        setIsProcessing(false);
                                    }, { crossOrigin: 'anonymous' });
                                } else {
                                    setIsProcessing(false);
                                }
                            } catch (error) {
                                console.error('VINTAGE filter failed:', error);
                                setIsProcessing(false);
                            }
                        };

                        originalImg.onerror = () => {
                            console.error('Failed to load original image');
                            setIsProcessing(false);
                        };

                        originalImg.src = originalSrc;
                        return;

                    } catch (error) {
                        console.error('VINTAGE filter failed:', error);
                        setIsProcessing(false);
                    }
                }
                setIsProcessing(false);
                return;
            }
        }

        // Check if this is a SOFT filter (needs gentle color grading)
        if (preset.category === 'soft') {
            const softFilter = getSoftFilter(presetId);
            if (softFilter) {
                setIsProcessing(true);

                const fabricCanvas = getFabricCanvas();
                const fabricObj = fabricCanvas.getObjectById(imageElement.id) as fabric.Image | undefined;

                if (fabricObj) {
                    try {
                        const originalSrc = imageElement.originalSrc || imageElement.src;

                        const originalImg = new Image();
                        originalImg.crossOrigin = 'anonymous';

                        originalImg.onload = async () => {
                            try {
                                const newSrc = await applySoftFilter(originalImg, softFilter);

                                updateElement(imageElement.id, {
                                    src: newSrc,
                                    filters: {
                                        ...createResetFilters(),
                                        ...preset.values,
                                        filterPreset: presetId,
                                    },
                                });

                                const canvas = fabricCanvas.getCanvas();
                                if (canvas) {
                                    fabric.Image.fromURL(newSrc, (img) => {
                                        img.set({
                                            left: fabricObj.left,
                                            top: fabricObj.top,
                                            scaleX: fabricObj.scaleX,
                                            scaleY: fabricObj.scaleY,
                                            angle: fabricObj.angle,
                                            originX: fabricObj.originX,
                                            originY: fabricObj.originY,
                                            opacity: fabricObj.opacity,
                                            data: { id: imageElement.id, type: 'image' },
                                        });

                                        canvas.remove(fabricObj);
                                        canvas.add(img);
                                        fabricCanvas.setObjectById(imageElement.id, img);
                                        canvas.setActiveObject(img);
                                        canvas.renderAll();

                                        setIsProcessing(false);
                                    }, { crossOrigin: 'anonymous' });
                                } else {
                                    setIsProcessing(false);
                                }
                            } catch (error) {
                                console.error('SOFT filter failed:', error);
                                setIsProcessing(false);
                            }
                        };

                        originalImg.onerror = () => {
                            console.error('Failed to load original image');
                            setIsProcessing(false);
                        };

                        originalImg.src = originalSrc;
                        return;

                    } catch (error) {
                        console.error('SOFT filter failed:', error);
                        setIsProcessing(false);
                    }
                }
                setIsProcessing(false);
                return;
            }
        }

        // Helper function for applying pixel-based filters
        const applyPixelFilter = async (
            filterFn: (img: HTMLImageElement, filter: any) => Promise<string>,
            getFilterFn: (id: string) => any
        ) => {
            const filter = getFilterFn(presetId);
            if (!filter) return false;

            setIsProcessing(true);

            const fabricCanvas = getFabricCanvas();
            const fabricObj = fabricCanvas.getObjectById(imageElement.id) as fabric.Image | undefined;

            if (fabricObj) {
                try {
                    const originalSrc = imageElement.originalSrc || imageElement.src;

                    const originalImg = new Image();
                    originalImg.crossOrigin = 'anonymous';

                    originalImg.onload = async () => {
                        try {
                            const newSrc = await filterFn(originalImg, filter);

                            updateElement(imageElement.id, {
                                src: newSrc,
                                filters: {
                                    ...createResetFilters(),
                                    ...preset.values,
                                    filterPreset: presetId,
                                },
                            });

                            const canvas = fabricCanvas.getCanvas();
                            if (canvas) {
                                fabric.Image.fromURL(newSrc, (img) => {
                                    img.set({
                                        left: fabricObj.left,
                                        top: fabricObj.top,
                                        scaleX: fabricObj.scaleX,
                                        scaleY: fabricObj.scaleY,
                                        angle: fabricObj.angle,
                                        originX: fabricObj.originX,
                                        originY: fabricObj.originY,
                                        opacity: fabricObj.opacity,
                                        data: { id: imageElement.id, type: 'image' },
                                    });

                                    canvas.remove(fabricObj);
                                    canvas.add(img);
                                    fabricCanvas.setObjectById(imageElement.id, img);
                                    canvas.setActiveObject(img);
                                    canvas.renderAll();

                                    setIsProcessing(false);
                                }, { crossOrigin: 'anonymous' });
                            } else {
                                setIsProcessing(false);
                            }
                        } catch (error) {
                            console.error('Filter failed:', error);
                            setIsProcessing(false);
                        }
                    };

                    originalImg.onerror = () => {
                        console.error('Failed to load original image');
                        setIsProcessing(false);
                    };

                    originalImg.src = originalSrc;
                    return true;

                } catch (error) {
                    console.error('Filter failed:', error);
                    setIsProcessing(false);
                }
            }
            setIsProcessing(false);
            return false;
        };

        // Check for Natural filter
        if (preset.category === 'natural') {
            applyPixelFilter(applyNaturalFilter, getNaturalFilter);
            return;
        }

        // Check for Warm filter
        if (preset.category === 'warm') {
            applyPixelFilter(applyWarmFilter, getWarmFilter);
            return;
        }

        // Check for Cool filter
        if (preset.category === 'cool') {
            applyPixelFilter(applyCoolFilter, getCoolFilter);
            return;
        }

        // Check for Vivid filter
        if (preset.category === 'vivid') {
            applyPixelFilter(applyVividFilter, getVividFilter);
            return;
        }

        // Check for LUT preset - LUTs use simple adjustment values
        if (preset.category === 'lut') {
            // Just apply the preset values like other filters
            const newFilters = {
                ...createResetFilters(),
                ...preset.values,
                filterPreset: presetId,
            };
            applyFilters(newFilters);
            return;
        }

        // Fallback for any other filters
        const newFilters = {
            ...createResetFilters(),
            ...preset.values,
            filterPreset: presetId,
        };

        applyFilters(newFilters);
    };

    // Reset only filter preset - keep adjustment values
    const resetFilters = async () => {
        if (!imageElement) return;

        // Get original image source
        const originalSrc = imageElement.originalSrc || imageElement.src;

        // Preserve current adjustment values, only clear filter preset
        const preservedFilters = {
            ...currentFilters,
            filterPreset: null, // Clear the selected filter preset
        };

        // Update store with original src but keep adjustments
        updateElement(imageElement.id, {
            src: originalSrc,
            filters: preservedFilters,
        });

        // Restore original image on canvas
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(imageElement.id) as fabric.Image | undefined;

        if (fabricObj) {
            fabric.Image.fromURL(originalSrc, async (img) => {
                img.set({
                    left: fabricObj.left,
                    top: fabricObj.top,
                    scaleX: fabricObj.scaleX,
                    scaleY: fabricObj.scaleY,
                    angle: fabricObj.angle,
                    originX: fabricObj.originX,
                    originY: fabricObj.originY,
                    opacity: fabricObj.opacity,
                    data: { id: imageElement.id, type: 'image' },
                });

                const canvas = fabricCanvas.getCanvas();
                if (canvas) {
                    canvas.remove(fabricObj);
                    canvas.add(img);
                    fabricCanvas.setObjectById(imageElement.id, img);
                    canvas.setActiveObject(img);
                    canvas.renderAll();

                    // Re-apply adjustments if any exist
                    if (hasActiveAdjustments(preservedFilters)) {
                        // Trigger adjustment re-application via slider handler
                        setTimeout(() => {
                            applyFiltersToCanvas(imageElement.id, preservedFilters);
                        }, 100);
                    }
                }
            }, { crossOrigin: 'anonymous' });
        }
    };

    // Apply filters to Fabric.js canvas using pixel-based processing
    const applyFiltersToCanvas = async (elementId: string, filters: ImageFilter) => {
        if (!imageElement) return;

        // Check if any adjustments need to be applied
        if (!hasActiveAdjustments(filters)) {
            // No active adjustments, just render normally
            const fabricCanvas = getFabricCanvas();
            const canvas = fabricCanvas.getCanvas();
            if (canvas) canvas.renderAll();
            return;
        }

        setIsProcessing(true);

        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(elementId) as fabric.Image | undefined;

        if (fabricObj) {
            try {
                // Use original image source for non-destructive editing
                const originalSrc = imageElement.originalSrc || imageElement.src;

                const originalImg = new Image();
                originalImg.crossOrigin = 'anonymous';

                originalImg.onload = async () => {
                    try {
                        // Apply all adjustments using pixel processor
                        const newSrc = await applyImageAdjustments(originalImg, filters);

                        // Update element (store only, not src since we want non-destructive)
                        updateElement(elementId, { filters });

                        // Update Fabric.js canvas with processed image
                        const canvas = fabricCanvas.getCanvas();
                        if (canvas) {
                            fabric.Image.fromURL(newSrc, (img) => {
                                img.set({
                                    left: fabricObj.left,
                                    top: fabricObj.top,
                                    scaleX: fabricObj.scaleX,
                                    scaleY: fabricObj.scaleY,
                                    angle: fabricObj.angle,
                                    originX: fabricObj.originX,
                                    originY: fabricObj.originY,
                                    opacity: fabricObj.opacity,
                                    data: { id: elementId, type: 'image' },
                                });

                                canvas.remove(fabricObj);
                                canvas.add(img);
                                fabricCanvas.setObjectById(elementId, img);
                                canvas.setActiveObject(img);
                                canvas.renderAll();

                                setIsProcessing(false);
                            }, { crossOrigin: 'anonymous' });
                        } else {
                            setIsProcessing(false);
                        }
                    } catch (error) {
                        console.error('Adjustment failed:', error);
                        setIsProcessing(false);
                    }
                };

                originalImg.onerror = () => {
                    console.error('Failed to load original image');
                    setIsProcessing(false);
                };

                originalImg.src = originalSrc;

            } catch (error) {
                console.error('Adjustment failed:', error);
                setIsProcessing(false);
            }
        } else {
            setIsProcessing(false);
        }
    };

    // Handle slider change with debouncing for smooth experience
    const handleSliderChange = (id: string, value: number) => {
        if (!imageElement) return;

        // Update store immediately for UI feedback
        const updatedFilters = {
            ...currentFilters,
            [id]: value,
            filterPreset: null,
        };

        updateElement(imageElement.id, { filters: updatedFilters });

        // Clear existing debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Debounce canvas update for smooth dragging
        isSliderDraggingRef.current = true;
        debounceTimerRef.current = setTimeout(async () => {
            isSliderDraggingRef.current = false;

            // Apply adjustments to canvas without showing loader
            const fabricCanvas = getFabricCanvas();
            const fabricObj = fabricCanvas.getObjectById(imageElement.id) as fabric.Image | undefined;

            if (fabricObj && hasActiveAdjustments(updatedFilters)) {
                try {
                    const originalSrc = imageElement.originalSrc || imageElement.src;

                    const originalImg = new Image();
                    originalImg.crossOrigin = 'anonymous';

                    originalImg.onload = async () => {
                        const newSrc = await applyImageAdjustments(originalImg, updatedFilters);

                        const canvas = fabricCanvas.getCanvas();
                        if (canvas) {
                            fabric.Image.fromURL(newSrc, (img) => {
                                img.set({
                                    left: fabricObj.left,
                                    top: fabricObj.top,
                                    scaleX: fabricObj.scaleX,
                                    scaleY: fabricObj.scaleY,
                                    angle: fabricObj.angle,
                                    originX: fabricObj.originX,
                                    originY: fabricObj.originY,
                                    opacity: fabricObj.opacity,
                                    data: { id: imageElement.id, type: 'image' },
                                });

                                canvas.remove(fabricObj);
                                canvas.add(img);
                                fabricCanvas.setObjectById(imageElement.id, img);
                                canvas.setActiveObject(img);
                                canvas.renderAll();
                            }, { crossOrigin: 'anonymous' });
                        }
                    };

                    originalImg.src = originalSrc;
                } catch (error) {
                    console.error('Slider adjustment failed:', error);
                }
            }
        }, 300); // 300ms debounce for smooth slider
    };

    if (!imageElement) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-base font-semibold text-gray-800">Filters</h2>
                    <button
                        onClick={closeRightPanel}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-gray-500 text-sm text-center">
                        Select an image to apply filters
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
                <h2 className="text-base font-semibold text-gray-800">Filters</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={resetFilters}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Reset all filters"
                    >
                        <RotateCcw size={16} className="text-gray-500" />
                    </button>
                    <button
                        onClick={closeRightPanel}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    >
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Filter Presets Section */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-700">Presets</h3>
                        <button
                            onClick={() => lutInputRef.current?.click()}
                            disabled={isProcessing || !imageElement}
                            title="Add Custom LUT"
                            className="w-5 h-5 flex items-center justify-center rounded hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                className="text-green-500"
                            >
                                <path
                                    d="M7 1v12M1 7h12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {FILTER_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`
                                    px-2.5 py-1 text-xs font-medium rounded-full transition-colors
                                    ${activeCategory === cat.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }
                                `}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Processing indicator */}
                    {isProcessing && (
                        <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-lg">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-blue-600">Applying filter...</span>
                        </div>
                    )}

                    {/* Preset Grid */}
                    <div className="grid grid-cols-4 gap-2">
                        {categoryPresets.map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => applyPreset(preset.id)}
                                disabled={isProcessing}
                                className={`
                                    p-2 rounded-lg text-center transition-all border-2
                                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                                    ${currentFilters.filterPreset === preset.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-transparent bg-gray-50 hover:bg-gray-100'
                                    }
                                `}
                            >
                                {/* Filter Preview Image */}
                                <div className="w-full aspect-square rounded mb-1.5 overflow-hidden bg-gray-100">
                                    {filterPreviews[preset.id] ? (
                                        <img
                                            src={filterPreviews[preset.id]}
                                            alt={preset.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : imageElement ? (
                                        <img
                                            src={imageElement.originalSrc || imageElement.src}
                                            alt={preset.name}
                                            className="w-full h-full object-cover opacity-50"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                                    )}
                                </div>
                                <span className="text-xs font-medium text-gray-700 truncate block">{preset.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Add Custom LUT Button - Only shown for Cinematic (lut) category */}
                    {activeCategory === 'lut' && (
                        <div className="mt-4">
                            <input
                                type="file"
                                ref={lutInputRef}
                                accept=".cube,.3dl"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file || !imageElement) return;

                                    setIsProcessing(true);

                                    try {
                                        // Parse the .cube file
                                        const lut = await readCubeFile(file);
                                        if (!lut) {
                                            alert('Failed to parse LUT file. Please ensure it is a valid .cube file.');
                                            setIsProcessing(false);
                                            return;
                                        }

                                        // Store the custom LUT
                                        setCustomLUT({ name: file.name.replace(/\.[^/.]+$/, ''), lut });

                                        // Apply LUT to image
                                        const originalSrc = imageElement.originalSrc || imageElement.src;
                                        const img = new Image();
                                        img.crossOrigin = 'anonymous';

                                        img.onload = async () => {
                                            try {
                                                const newSrc = await applyCustomLUT(img, lut);

                                                // Update element
                                                updateElement(imageElement.id, {
                                                    src: newSrc,
                                                    filters: {
                                                        ...createResetFilters(),
                                                        filterPreset: 'custom-lut',
                                                    },
                                                });

                                                // Update Fabric.js canvas
                                                const fabricCanvas = getFabricCanvas();
                                                const fabricObj = fabricCanvas.getObjectById(imageElement.id) as any;

                                                if (fabricObj) {
                                                    const canvas = fabricCanvas.getCanvas();
                                                    if (canvas) {
                                                        fabric.Image.fromURL(newSrc, (newImg) => {
                                                            newImg.set({
                                                                left: fabricObj.left,
                                                                top: fabricObj.top,
                                                                scaleX: fabricObj.scaleX,
                                                                scaleY: fabricObj.scaleY,
                                                                angle: fabricObj.angle,
                                                                originX: fabricObj.originX,
                                                                originY: fabricObj.originY,
                                                                opacity: fabricObj.opacity,
                                                                data: { id: imageElement.id, type: 'image' },
                                                            });

                                                            canvas.remove(fabricObj);
                                                            canvas.add(newImg);
                                                            fabricCanvas.setObjectById(imageElement.id, newImg);
                                                            canvas.setActiveObject(newImg);
                                                            canvas.renderAll();

                                                            setIsProcessing(false);
                                                        }, { crossOrigin: 'anonymous' });
                                                    } else {
                                                        setIsProcessing(false);
                                                    }
                                                } else {
                                                    setIsProcessing(false);
                                                }
                                            } catch (error) {
                                                console.error('Failed to apply LUT:', error);
                                                setIsProcessing(false);
                                            }
                                        };

                                        img.onerror = () => {
                                            console.error('Failed to load image for LUT application');
                                            setIsProcessing(false);
                                        };

                                        img.src = originalSrc;
                                    } catch (error) {
                                        console.error('Error applying custom LUT:', error);
                                        setIsProcessing(false);
                                    }

                                    // Reset file input
                                    if (lutInputRef.current) {
                                        lutInputRef.current.value = '';
                                    }
                                }}
                            />

                            {customLUT && (
                                <div className="mt-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
                                    <p className="text-xs text-purple-700">
                                        <span className="font-medium">Active LUT:</span> {customLUT.name}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Adjustments Section */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-700">Adjustments</h3>
                        <button
                            onClick={async () => {
                                if (!imageElement) return;

                                // Reset only adjustment values, keep filter preset
                                const resetAdjustments = {
                                    ...currentFilters,
                                    temperature: 0,
                                    tint: 0,
                                    brightness: 0,
                                    contrast: 0,
                                    highlights: 0,
                                    vibrance: 0,
                                    saturation: 0,
                                    clarity: 0,
                                    sharpness: 0,
                                    vignette: 0,
                                };

                                // Update store with reset adjustments
                                updateElement(imageElement.id, {
                                    filters: resetAdjustments,
                                });

                                // Restore the filtered image (without adjustments) on canvas
                                // The imageElement.src contains the filter-applied image
                                const fabricCanvas = getFabricCanvas();
                                const fabricObj = fabricCanvas.getObjectById(imageElement.id) as fabric.Image | undefined;

                                if (fabricObj) {
                                    const canvas = fabricCanvas.getCanvas();
                                    if (canvas) {
                                        // Use current src (which has filter applied, not originalSrc)
                                        fabric.Image.fromURL(imageElement.src, (img) => {
                                            img.set({
                                                left: fabricObj.left,
                                                top: fabricObj.top,
                                                scaleX: fabricObj.scaleX,
                                                scaleY: fabricObj.scaleY,
                                                angle: fabricObj.angle,
                                                originX: fabricObj.originX,
                                                originY: fabricObj.originY,
                                                opacity: fabricObj.opacity,
                                                data: { id: imageElement.id, type: 'image' },
                                            });

                                            canvas.remove(fabricObj);
                                            canvas.add(img);
                                            fabricCanvas.setObjectById(imageElement.id, img);
                                            canvas.setActiveObject(img);
                                            canvas.renderAll();
                                        }, { crossOrigin: 'anonymous' });
                                    }
                                }
                            }}
                            className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="space-y-4">
                        {ADJUSTMENT_SLIDERS.map((slider) => {
                            const value = currentFilters[slider.id as keyof ImageFilter] as number || 0;
                            return (
                                <div key={slider.id}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="text-xs font-medium text-gray-600">
                                            {slider.label}
                                        </label>
                                        <span className="text-xs text-gray-500 w-8 text-right">
                                            {value}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={slider.min}
                                        max={slider.max}
                                        step={slider.step}
                                        value={value}
                                        onChange={(e) => handleSliderChange(slider.id, Number(e.target.value))}
                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
