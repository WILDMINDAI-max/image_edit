'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEditorStore, usePages, useActivePage } from '@/store/editorStore';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { Page } from '@/types/project';
import { TextElement, ImageElement } from '@/types/canvas';
import { loadGoogleFont, GOOGLE_FONTS } from '@/services/googleFonts';
import { applyImageAdjustments, hasActiveAdjustments } from '@/utils/imageAdjustments';
import { fabric } from 'fabric';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import {
    X,
    Download,
    Check,
    ChevronDown,
    Image as ImageIcon,
    FileType,
    Loader2,
    FileJson,
} from 'lucide-react';

type ExportFormat = 'png' | 'jpeg' | 'pdf' | 'json';

interface PageSelection {
    type: 'all' | 'current' | 'custom';
    selectedPageIds: string[];
}

export function ExportModal() {
    const isOpen = useEditorStore((state) => state.isExportModalOpen);
    const closeModal = useEditorStore((state) => state.closeExportModal);
    const project = useEditorStore((state) => state.project);
    const pages = usePages();
    const activePage = useActivePage();

    // Export settings
    const [format, setFormat] = useState<ExportFormat>('png');
    const [scale, setScale] = useState(1.5);
    const [pageSelection, setPageSelection] = useState<PageSelection>({
        type: 'all',
        selectedPageIds: [],
    });
    const [showPageDropdown, setShowPageDropdown] = useState(false);

    // Export state
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportMessage, setExportMessage] = useState('');
    const [transparentBackground, setTransparentBackground] = useState(false);

    // Initialize page selection when modal opens
    useEffect(() => {
        if (isOpen && pages.length > 0) {
            setPageSelection({
                type: 'all',
                selectedPageIds: pages.map(p => p.id),
            });
        }
    }, [isOpen, pages]);

    // Get pages to export based on selection (excludes hidden pages)
    const getPagesToExport = useCallback((): Page[] => {
        let pagesToExport: Page[];
        if (pageSelection.type === 'all') {
            pagesToExport = pages;
        } else if (pageSelection.type === 'current' && activePage) {
            pagesToExport = [activePage];
        } else {
            pagesToExport = pages.filter(p => pageSelection.selectedPageIds.includes(p.id));
        }
        // Filter out hidden pages - they should not be exported
        return pagesToExport.filter(p => !p.hidden);
    }, [pageSelection, pages, activePage]);

    // Calculate output dimensions
    const getOutputDimensions = () => {
        const baseWidth = activePage?.width || 1920;
        const baseHeight = activePage?.height || 1080;
        return {
            width: Math.round(baseWidth * scale),
            height: Math.round(baseHeight * scale),
        };
    };

    // Render a single page to blob
    const renderPageToBlob = async (page: Page): Promise<Blob> => {
        console.log('[ExportModal] renderPageToBlob started for page:', page.id, page.name);

        // Determine actual format based on transparent checkbox
        const actualFormat: 'png' | 'png-transparent' | 'jpeg' | 'pdf' | 'json' = format === 'png' && transparentBackground ? 'png-transparent' : format;

        const fabricCanvas = getFabricCanvas();
        console.log('[ExportModal] Got fabric canvas instance');

        const canvas = fabricCanvas.getCanvas();

        if (!canvas) {
            console.error('[ExportModal] Canvas not initialized!');
            throw new Error('Canvas not initialized');
        }
        console.log('[ExportModal] Canvas is initialized');

        // Save current state
        const currentPageId = project?.activePageId;
        console.log('[ExportModal] Current active page ID:', currentPageId);

        // Pre-load all fonts used in the page with their specific weights
        console.log('[ExportModal] Pre-loading fonts used in page...');
        const textElements = page.elements.filter(el => el.type === 'text') as TextElement[];

        // Collect all unique font+weight combinations and ensure they're loaded
        for (const textEl of textElements) {
            const fontFamily = textEl.textStyle?.fontFamily || 'Inter';
            const fontWeight = textEl.textStyle?.fontWeight || 400;

            console.log(`[ExportModal] Checking font: ${fontFamily} weight: ${fontWeight}`);

            // Create font specification string for FontFace API
            const fontSpec = `${fontWeight} 16px "${fontFamily}"`;

            // Check if this specific font+weight is already loaded
            const isLoaded = document.fonts.check(fontSpec);
            console.log(`[ExportModal] Font ${fontSpec} already loaded: ${isLoaded}`);

            if (!isLoaded) {
                // Try to load the font with CSS first
                const font = GOOGLE_FONTS.find(f => f.family === fontFamily);
                const variants = font?.variants || ['400'];
                const weightStr = String(fontWeight);
                const variantsToLoad = variants.includes(weightStr) ? [weightStr] : ['400', weightStr];

                try {
                    await loadGoogleFont(fontFamily, variantsToLoad);
                    console.log(`[ExportModal] Font CSS loaded: ${fontFamily} weight ${fontWeight}`);
                } catch (fontError) {
                    console.warn(`[ExportModal] CSS load warning for ${fontFamily}:`, fontError);
                }
            }

            // Wait for the font to be fully ready using FontFace API
            try {
                await document.fonts.load(fontSpec);
                console.log(`[ExportModal] Font ready: ${fontSpec}`);
            } catch (err) {
                console.warn(`[ExportModal] Font load warning for ${fontSpec}:`, err);
            }
        }

        // Wait for all fonts to be fully ready
        await document.fonts.ready;
        console.log('[ExportModal] All fonts are ready');

        // Additional delay to ensure font rendering is complete
        await new Promise(resolve => setTimeout(resolve, 200));

        // Load the page onto canvas
        console.log('[ExportModal] Loading page onto canvas...');
        try {
            await fabricCanvas.loadPage(page);
            console.log('[ExportModal] Page loaded successfully');
        } catch (loadError) {
            console.error('[ExportModal] Failed to load page:', loadError);
            throw loadError;
        }

        // Force canvas to re-render to apply fonts
        canvas.renderAll();

        // Wait again for fonts to be ready after canvas load (fonts may need re-application)
        await document.fonts.ready;

        // Extra delay for font rendering in canvas
        await new Promise(resolve => setTimeout(resolve, 300));

        // Force another render to ensure fonts are displayed correctly
        canvas.renderAll();

        // ========== RE-APPLY IMAGE ADJUSTMENTS FOR EXPORT ==========
        // Image adjustments (brightness, contrast, temperature, etc.) are stored in element.filters
        // but the canvas loads from element.src which may be the original unfiltered image.
        // We need to re-apply these adjustments to ensure exported images match canvas preview.
        console.log('[ExportModal] Re-applying image adjustments for export...');
        const imageElements = page.elements.filter(el => el.type === 'image') as ImageElement[];

        for (const imageEl of imageElements) {
            // Check if this image has active adjustments that need to be applied
            if (imageEl.filters && hasActiveAdjustments(imageEl.filters)) {
                console.log(`[ExportModal] Applying adjustments to image: ${imageEl.id}`);

                const fabricObj = fabricCanvas.getObjectById(imageEl.id) as fabric.Image | undefined;
                if (fabricObj) {
                    try {
                        // Get original source to apply adjustments to
                        const originalSrc = imageEl.originalSrc || imageEl.src;

                        // Create image element and apply adjustments
                        const originalImg = new window.Image();
                        originalImg.crossOrigin = 'anonymous';

                        await new Promise<void>((resolve, reject) => {
                            originalImg.onload = async () => {
                                try {
                                    // Apply all filter adjustments
                                    const processedSrc = await applyImageAdjustments(originalImg, imageEl.filters);

                                    // Update the fabric canvas image with processed result
                                    await new Promise<void>((innerResolve) => {
                                        fabric.Image.fromURL(processedSrc, (newImg) => {
                                            newImg.set({
                                                left: fabricObj.left,
                                                top: fabricObj.top,
                                                scaleX: fabricObj.scaleX,
                                                scaleY: fabricObj.scaleY,
                                                angle: fabricObj.angle,
                                                originX: fabricObj.originX,
                                                originY: fabricObj.originY,
                                                opacity: fabricObj.opacity,
                                                data: { id: imageEl.id, type: 'image' },
                                            });

                                            canvas.remove(fabricObj);
                                            canvas.add(newImg);
                                            fabricCanvas.setObjectById(imageEl.id, newImg);
                                            canvas.renderAll();

                                            console.log(`[ExportModal] Successfully applied adjustments to image: ${imageEl.id}`);
                                            innerResolve();
                                        }, { crossOrigin: 'anonymous' });
                                    });

                                    resolve();
                                } catch (err) {
                                    console.error(`[ExportModal] Failed to apply adjustments to image ${imageEl.id}:`, err);
                                    resolve(); // Continue with other images
                                }
                            };
                            originalImg.onerror = () => {
                                console.error(`[ExportModal] Failed to load original image for ${imageEl.id}`);
                                resolve(); // Continue with other images
                            };
                            originalImg.src = originalSrc;
                        });
                    } catch (err) {
                        console.error(`[ExportModal] Error processing adjustments for ${imageEl.id}:`, err);
                    }
                }
            }
        }
        console.log('[ExportModal] Image adjustments re-application complete');
        // ========== END RE-APPLY IMAGE ADJUSTMENTS ==========
        // Wait for images to load with timeout
        console.log('[ExportModal] Waiting for images to load...');
        await new Promise<void>((resolve) => {
            let attempts = 0;
            const maxAttempts = 100; // 5 seconds max (50ms * 100)

            const checkImages = () => {
                attempts++;
                const objects = canvas.getObjects();
                const images = objects.filter(obj => obj.type === 'image') as fabric.Image[];
                console.log(`[ExportModal] Image check attempt ${attempts}: Found ${images.length} images`);

                const allLoaded = images.every(img => {
                    const element = img.getElement();
                    const isLoaded = element && (element as HTMLImageElement).complete;
                    return isLoaded;
                });

                if (allLoaded || images.length === 0) {
                    console.log('[ExportModal] All images loaded or no images found');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.warn('[ExportModal] Image loading timeout reached, proceeding anyway');
                    resolve();
                } else {
                    setTimeout(checkImages, 50);
                }
            };
            checkImages();
        });

        // Small delay for rendering
        console.log('[ExportModal] Waiting for render stabilization...');
        await new Promise(resolve => setTimeout(resolve, 100));

        // Create export canvas
        console.log('[ExportModal] Creating export canvas...');
        const tempCanvas = document.createElement('canvas');
        const targetWidth = page.width * scale;
        const targetHeight = page.height * scale;
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
        console.log('[ExportModal] Export canvas size:', targetWidth, 'x', targetHeight);

        const ctx = tempCanvas.getContext('2d');

        if (!ctx) {
            console.error('[ExportModal] Could not create canvas context!');
            throw new Error('Could not create canvas context');
        }
        console.log('[ExportModal] Canvas context created');

        // Draw background if not transparent
        console.log('[ExportModal] Drawing background, format:', actualFormat);
        if (actualFormat !== 'png-transparent') {
            // Handle different background types
            if (page.background.type === 'solid') {
                console.log('[ExportModal] Drawing solid background:', page.background.color);
                ctx.fillStyle = page.background.color;
                ctx.fillRect(0, 0, targetWidth, targetHeight);
            } else if (page.background.type === 'gradient') {
                console.log('[ExportModal] Drawing gradient background');
                const bg = page.background;
                let canvasGradient: CanvasGradient;

                if (bg.gradientType === 'linear') {
                    const angle = (bg.angle || 0) * Math.PI / 180;
                    const x1 = targetWidth / 2 - Math.cos(angle) * targetWidth / 2;
                    const y1 = targetHeight / 2 - Math.sin(angle) * targetHeight / 2;
                    const x2 = targetWidth / 2 + Math.cos(angle) * targetWidth / 2;
                    const y2 = targetHeight / 2 + Math.sin(angle) * targetHeight / 2;
                    canvasGradient = ctx.createLinearGradient(x1, y1, x2, y2);
                } else {
                    canvasGradient = ctx.createRadialGradient(
                        targetWidth / 2, targetHeight / 2, 0,
                        targetWidth / 2, targetHeight / 2, Math.max(targetWidth, targetHeight) / 2
                    );
                }

                bg.colorStops.forEach((stop: { offset: number; color: string }) => {
                    canvasGradient.addColorStop(stop.offset, stop.color);
                });

                ctx.fillStyle = canvasGradient;
                ctx.fillRect(0, 0, targetWidth, targetHeight);
            } else {
                // Default white background
                console.log('[ExportModal] Drawing default white background');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, targetWidth, targetHeight);
            }
        } else {
            console.log('[ExportModal] Transparent background - skipping fill');
        }

        // For transparent PNG, we need to temporarily remove the canvas background
        // Save the current background state
        const originalBackground = canvas.backgroundColor;
        const originalBackgroundImage = canvas.backgroundImage;

        if (actualFormat === 'png-transparent') {
            console.log('[ExportModal] Temporarily removing canvas background for transparent export');
            canvas.backgroundColor = undefined;
            canvas.backgroundImage = undefined;
            canvas.renderAll();
        }

        // Get the data URL from fabric canvas
        // CRITICAL: The canvas is at WORKING scale, but we need to export at FULL (logical) scale
        // So the multiplier must account for: (targetSize) / (workingSize)
        // targetSize = page.width * exportScale
        // workingSize = canvas.width (which is page.width * workingScale)
        // multiplier = (page.width * exportScale) / (canvas.width) = exportScale / workingScale
        console.log('[ExportModal] Getting data URL from fabric canvas...');
        const workingScale = getFabricCanvas().getWorkingScale();
        const effectiveMultiplier = scale / workingScale;
        console.log('[ExportModal] workingScale:', workingScale, 'exportScale:', scale, 'effectiveMultiplier:', effectiveMultiplier);
        const dataUrl = canvas.toDataURL({
            format: actualFormat === 'jpeg' ? 'jpeg' : 'png',
            quality: actualFormat === 'jpeg' ? 0.92 : 1,
            multiplier: effectiveMultiplier,
        });
        console.log('[ExportModal] Data URL generated, length:', dataUrl.length);

        // Restore the canvas background after getting dataURL
        if (actualFormat === 'png-transparent') {
            console.log('[ExportModal] Restoring canvas background');
            canvas.backgroundColor = originalBackground;
            canvas.backgroundImage = originalBackgroundImage;
            canvas.renderAll();
        }

        // Load and draw the canvas content
        console.log('[ExportModal] Loading canvas image for final render...');
        await new Promise<void>((resolve, reject) => {
            const img = new window.Image();

            // Add timeout for image loading
            const timeout = setTimeout(() => {
                console.error('[ExportModal] Image loading timeout!');
                reject(new Error('Image loading timeout'));
            }, 10000); // 10 second timeout

            img.onload = () => {
                clearTimeout(timeout);
                console.log('[ExportModal] Canvas image loaded, drawing to export canvas');
                // For transparent PNG, first draw the fabric content
                // For others, we've already drawn the background
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                console.log('[ExportModal] Image drawn to export canvas');
                resolve();
            };
            img.onerror = (err) => {
                clearTimeout(timeout);
                console.error('[ExportModal] Failed to load canvas image:', err);
                reject(new Error('Failed to load canvas image'));
            };
            img.src = dataUrl;
        });

        // Convert to blob
        console.log('[ExportModal] Converting to blob...');
        return new Promise((resolve, reject) => {
            tempCanvas.toBlob(
                (blob) => {
                    if (blob) {
                        console.log('[ExportModal] Blob created successfully, size:', blob.size, 'bytes');
                        resolve(blob);
                    } else {
                        console.error('[ExportModal] Failed to create blob!');
                        reject(new Error('Failed to create blob'));
                    }
                },
                actualFormat === 'jpeg' ? 'image/jpeg' : 'image/png',
                actualFormat === 'jpeg' ? 0.92 : 1
            );
        });
    };

    // Export handler
    const handleExport = async () => {
        console.log('[ExportModal] handleExport called');
        const pagesToExport = getPagesToExport();
        console.log('[ExportModal] Pages to export:', pagesToExport.length, pagesToExport.map(p => p.id));

        if (pagesToExport.length === 0) {
            console.warn('[ExportModal] No pages to export!');
            return;
        }

        setIsExporting(true);
        setExportProgress(0);
        setExportMessage('Preparing export...');
        console.log('[ExportModal] Export started, format:', format, 'scale:', scale);

        try {
            // Helper to check if a string looks like a UUID
            const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

            // Get a proper filename (not UUID)
            let filename = project?.name || 'design';
            if (isUUID(filename)) {
                filename = 'design';
            }
            // Sanitize filename
            filename = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
            console.log('[ExportModal] Export filename:', filename);

            const fileExtension = format === 'jpeg' ? 'jpg' : format === 'pdf' ? 'pdf' : format === 'json' ? 'json' : 'png';
            console.log('[ExportModal] File extension:', fileExtension);

            // JSON Export handling - exports complete page data structure
            if (format === 'json') {
                console.log('[ExportModal] JSON export mode');
                setExportMessage('Preparing JSON template...');
                setExportProgress(20);

                const fabricCanvas = getFabricCanvas();

                // Sync text element properties from Fabric.js canvas to ensure all styles are captured
                setExportMessage('Syncing element properties...');
                setExportProgress(30);

                // Create the export data structure with synced properties
                const exportData = {
                    exportVersion: '1.0.0',
                    exportedAt: new Date().toISOString(),
                    // Export all selected pages with complete data
                    pages: pagesToExport.map(page => ({
                        // Page metadata
                        name: page.name,
                        width: page.width,
                        height: page.height,
                        dpi: page.dpi,
                        background: page.background,
                        // Complete elements array with synced properties from Fabric.js
                        elements: page.elements.map(el => {
                            // Deep clone base element
                            const clonedEl = JSON.parse(JSON.stringify(el));

                            // For text elements, sync the latest properties from Fabric.js canvas
                            if (el.type === 'text') {
                                const fabricObj = fabricCanvas.getObjectById(el.id) as any;
                                if (fabricObj) {
                                    // Sync textStyle from Fabric.js object
                                    clonedEl.textStyle = {
                                        ...clonedEl.textStyle,
                                        fontFamily: fabricObj.fontFamily || clonedEl.textStyle?.fontFamily || 'Poppins',
                                        fontSize: fabricObj.fontSize || clonedEl.textStyle?.fontSize || 24,
                                        fontWeight: fabricObj.fontWeight || clonedEl.textStyle?.fontWeight || 'normal',
                                        fontStyle: fabricObj.fontStyle || clonedEl.textStyle?.fontStyle || 'normal',
                                        textAlign: fabricObj.textAlign || clonedEl.textStyle?.textAlign || 'left',
                                        lineHeight: fabricObj.lineHeight || clonedEl.textStyle?.lineHeight || 1.2,
                                        letterSpacing: (fabricObj.charSpacing !== undefined ? fabricObj.charSpacing / 100 : clonedEl.textStyle?.letterSpacing) || 0,
                                        textDecoration: fabricObj.underline ? 'underline' : (fabricObj.linethrough ? 'line-through' : 'none'),
                                        textTransform: clonedEl.textStyle?.textTransform || 'none',
                                    };
                                    // Sync text content
                                    clonedEl.content = fabricObj.text || clonedEl.content;
                                    // Sync fill color
                                    if (fabricObj.fill) {
                                        clonedEl.style = {
                                            ...clonedEl.style,
                                            fill: fabricObj.fill,
                                        };
                                    }
                                    // Sync transform including origin points for exact positioning
                                    clonedEl.transform = {
                                        ...clonedEl.transform,
                                        x: fabricObj.left ?? clonedEl.transform.x,
                                        y: fabricObj.top ?? clonedEl.transform.y,
                                        width: fabricObj.width ?? clonedEl.transform.width,
                                        height: fabricObj.height ?? clonedEl.transform.height,
                                        scaleX: fabricObj.scaleX ?? clonedEl.transform.scaleX,
                                        scaleY: fabricObj.scaleY ?? clonedEl.transform.scaleY,
                                        rotation: fabricObj.angle ?? clonedEl.transform.rotation,
                                        originX: fabricObj.originX ?? clonedEl.transform.originX ?? 'center',
                                        originY: fabricObj.originY ?? clonedEl.transform.originY ?? 'center',
                                    };
                                    console.log(`[ExportModal] Synced text element ${el.id}: x=${clonedEl.transform.x}, y=${clonedEl.transform.y}, textStyle:`, clonedEl.textStyle);
                                }
                            }
                            // For other elements, sync transform from Fabric.js
                            else {
                                const fabricObj = fabricCanvas.getObjectById(el.id);
                                if (fabricObj) {
                                    clonedEl.transform = {
                                        ...clonedEl.transform,
                                        x: fabricObj.left ?? clonedEl.transform.x,
                                        y: fabricObj.top ?? clonedEl.transform.y,
                                        width: fabricObj.width ?? clonedEl.transform.width,
                                        height: fabricObj.height ?? clonedEl.transform.height,
                                        scaleX: fabricObj.scaleX ?? clonedEl.transform.scaleX,
                                        scaleY: fabricObj.scaleY ?? clonedEl.transform.scaleY,
                                        rotation: fabricObj.angle ?? clonedEl.transform.rotation,
                                        originX: fabricObj.originX ?? clonedEl.transform.originX ?? 'center',
                                        originY: fabricObj.originY ?? clonedEl.transform.originY ?? 'center',
                                    };
                                }
                            }

                            return clonedEl;
                        }),
                    })),
                    // Include project metadata if available
                    projectMetadata: project?.metadata || null,
                };

                setExportProgress(60);
                setExportMessage('Creating JSON file...');

                // Convert to formatted JSON string
                const jsonString = JSON.stringify(exportData, null, 2);
                const jsonBlob = new Blob([jsonString], { type: 'application/json' });

                console.log('[ExportModal] JSON export size:', jsonBlob.size, 'bytes');
                setExportProgress(100);

                // Download JSON
                const url = URL.createObjectURL(jsonBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${filename}_template.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                console.log('[ExportModal] JSON download triggered');
                setExportMessage('Download complete!');
            }
            // PDF Export handling
            else if (format === 'pdf') {
                console.log('[ExportModal] PDF export mode');
                setExportMessage('Creating PDF document...');

                const pdfDoc = await PDFDocument.create();
                console.log('[ExportModal] PDF document created');

                for (let i = 0; i < pagesToExport.length; i++) {
                    const page = pagesToExport[i];
                    console.log(`[ExportModal] Rendering page ${i + 1}/${pagesToExport.length} for PDF:`, page.id);
                    setExportMessage(`Rendering page ${i + 1} of ${pagesToExport.length}...`);
                    setExportProgress(Math.round((i / pagesToExport.length) * 80));

                    const blob = await renderPageToBlob(page);
                    console.log(`[ExportModal] Page ${i + 1} rendered, blob size:`, blob.size);

                    // Convert blob to array buffer and embed in PDF
                    const pngBytes = await blob.arrayBuffer();
                    console.log(`[ExportModal] Converting page ${i + 1} to PNG bytes, size:`, pngBytes.byteLength);
                    const pngImage = await pdfDoc.embedPng(pngBytes);
                    console.log(`[ExportModal] Page ${i + 1} PNG embedded in PDF`);

                    // Add PDF page with canvas dimensions
                    const pdfPage = pdfDoc.addPage([page.width * scale, page.height * scale]);
                    console.log(`[ExportModal] PDF page ${i + 1} added, dimensions:`, page.width * scale, 'x', page.height * scale);

                    // Draw image on page
                    pdfPage.drawImage(pngImage, {
                        x: 0,
                        y: 0,
                        width: page.width * scale,
                        height: page.height * scale,
                    });
                    console.log(`[ExportModal] Image drawn on PDF page ${i + 1}`);
                }

                console.log('[ExportModal] Saving PDF document...');
                setExportMessage('Saving PDF...');
                setExportProgress(90);

                const pdfBytes = await pdfDoc.save();
                console.log('[ExportModal] PDF saved, size:', pdfBytes.length, 'bytes');
                // Convert Uint8Array to a type that Blob accepts
                const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
                console.log('[ExportModal] PDF blob created, size:', pdfBlob.size);

                setExportProgress(100);

                // Download PDF
                console.log('[ExportModal] Creating PDF download link...');
                const url = URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${filename}.pdf`;
                document.body.appendChild(link);
                console.log('[ExportModal] Triggering PDF download...');
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                console.log('[ExportModal] PDF download triggered successfully');

                setExportMessage('Download complete!');
            } else if (pagesToExport.length === 1) {
                // Single page export (PNG/JPEG)
                console.log('[ExportModal] Single page export mode');
                setExportMessage('Rendering page...');

                console.log('[ExportModal] Starting renderPageToBlob...');
                const blob = await renderPageToBlob(pagesToExport[0]);
                console.log('[ExportModal] renderPageToBlob completed, blob size:', blob.size);

                setExportProgress(100);

                // Download
                console.log('[ExportModal] Creating download link...');
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${filename}.${fileExtension}`;
                document.body.appendChild(link);
                console.log('[ExportModal] Triggering download...');
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                console.log('[ExportModal] Download triggered successfully');

                setExportMessage('Download complete!');
            } else {
                // Multi-page export - create ZIP
                console.log('[ExportModal] Multi-page export mode, creating ZIP');
                setExportMessage('Creating ZIP file...');
                const zip = new JSZip();

                for (let i = 0; i < pagesToExport.length; i++) {
                    const page = pagesToExport[i];
                    console.log(`[ExportModal] Rendering page ${i + 1}/${pagesToExport.length}:`, page.id);
                    setExportMessage(`Rendering page ${i + 1} of ${pagesToExport.length}...`);
                    setExportProgress(Math.round((i / pagesToExport.length) * 80));

                    const blob = await renderPageToBlob(page);
                    console.log(`[ExportModal] Page ${i + 1} rendered, blob size:`, blob.size);
                    // Use Page_N format for consistent naming
                    const pageName = `Page_${i + 1}`;
                    zip.file(`${pageName}.${fileExtension}`, blob);
                }

                console.log('[ExportModal] Compressing ZIP...');
                setExportMessage('Compressing...');
                setExportProgress(90);

                const zipBlob = await zip.generateAsync({
                    type: 'blob',
                    compression: 'DEFLATE',
                    compressionOptions: { level: 6 }
                });
                console.log('[ExportModal] ZIP created, size:', zipBlob.size);

                setExportProgress(100);

                // Download ZIP
                console.log('[ExportModal] Creating ZIP download link...');
                const url = URL.createObjectURL(zipBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${filename}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                console.log('[ExportModal] ZIP download triggered');

                setExportMessage('Download complete!');
            }

            // Restore active page
            console.log('[ExportModal] Restoring active page...');
            if (project?.activePageId) {
                const fabricCanvas = getFabricCanvas();
                const activePageToRestore = pages.find(p => p.id === project.activePageId);
                if (activePageToRestore) {
                    await fabricCanvas.loadPage(activePageToRestore);
                    console.log('[ExportModal] Active page restored');
                }
            }

            // Close modal after short delay
            console.log('[ExportModal] Export complete, closing modal in 1 second');
            setTimeout(() => {
                setIsExporting(false);
                setExportProgress(0);
                setExportMessage('');
                closeModal();
            }, 1000);

        } catch (error) {
            console.error('Export failed:', error);
            setExportMessage('Export failed. Please try again.');
            setTimeout(() => {
                setIsExporting(false);
                setExportProgress(0);
                setExportMessage('');
            }, 2000);
        }
    };

    // Toggle page in selection
    const togglePageSelection = (pageId: string) => {
        setPageSelection(prev => {
            const newSelected = prev.selectedPageIds.includes(pageId)
                ? prev.selectedPageIds.filter(id => id !== pageId)
                : [...prev.selectedPageIds, pageId];

            return {
                type: 'custom',
                selectedPageIds: newSelected,
            };
        });
    };

    // Select all pages
    const selectAllPages = () => {
        setPageSelection({
            type: 'all',
            selectedPageIds: pages.map(p => p.id),
        });
        setShowPageDropdown(false);
    };

    // Select current page only
    const selectCurrentPage = () => {
        if (activePage) {
            setPageSelection({
                type: 'current',
                selectedPageIds: [activePage.id],
            });
        }
        setShowPageDropdown(false);
    };

    const { width: outputWidth, height: outputHeight } = getOutputDimensions();
    const pagesToExport = getPagesToExport();

    // Format options
    const formatOptions: { id: ExportFormat; name: string; description: string; icon: React.ReactNode; disabled?: boolean }[] = [
        { id: 'png', name: 'PNG', description: 'High quality image with optional transparent background', icon: <ImageIcon size={16} className="text-blue-500" /> },
        { id: 'jpeg', name: 'JPEG', description: 'Ideal for digital sharing and space-saving', icon: <FileType size={16} className="text-green-500" /> },
        { id: 'pdf', name: 'PDF', description: 'Ideal for documents or printing', icon: <FileType size={16} className="text-red-500" /> },
        { id: 'json', name: 'JSON Template', description: 'Export as template data for reuse (includes ALL features)', icon: <FileJson size={16} className="text-purple-500" /> },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={!isExporting ? closeModal : undefined}
            />

            {/* Export Loading Overlay */}
            {isExporting && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    {/* Secondary backdrop for loading overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Loading Popup */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-[400px] overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Gradient Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Download size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Exporting Your Design</h3>
                                    <p className="text-sm text-blue-100">Please wait while we prepare your files...</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Status Message */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Loader2 size={20} className="text-blue-600 animate-spin" />
                                    </div>
                                    {/* Pulse ring */}
                                    <div className="absolute inset-0 rounded-lg bg-blue-400/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">{exportMessage || 'Preparing export...'}</p>
                                    <p className="text-xs text-gray-500">
                                        {format === 'png' ? 'PNG' : format.toUpperCase()} • {outputWidth} × {outputHeight}px
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-medium text-blue-600">{Math.round(exportProgress)}%</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${exportProgress}%` }}
                                    />
                                </div>

                                {/* Progress Steps */}
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span className={exportProgress >= 0 ? 'text-blue-500' : ''}>Preparing</span>
                                    <span className={exportProgress >= 30 ? 'text-blue-500' : ''}>Rendering</span>
                                    <span className={exportProgress >= 70 ? 'text-blue-500' : ''}>Processing</span>
                                    <span className={exportProgress >= 100 ? 'text-blue-500' : ''}>Complete</span>
                                </div>
                            </div>

                            {/* Export Complete Message */}
                            {exportProgress === 100 && (
                                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <Check size={18} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-green-800">Export Complete!</p>
                                        <p className="text-xs text-green-600">Your download will start automatically.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-[480px] max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800">Download your project</h2>
                    <button
                        onClick={closeModal}
                        disabled={isExporting}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
                    {/* Page Selection Dropdown */}
                    <div className="mb-6 relative">
                        <button
                            onClick={() => setShowPageDropdown(!showPageDropdown)}
                            disabled={isExporting}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors disabled:opacity-50"
                        >
                            <span className="font-medium">
                                {pageSelection.type === 'all'
                                    ? `All pages (1 - ${pages.length})`
                                    : pageSelection.type === 'current'
                                        ? `Current page (${activePage?.name || 'Page 1'})`
                                        : `${pageSelection.selectedPageIds.length} page${pageSelection.selectedPageIds.length !== 1 ? 's' : ''} selected`
                                }
                            </span>
                            <ChevronDown size={20} className={`transition-transform ${showPageDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown */}
                        {showPageDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-700 rounded-xl shadow-xl z-10 overflow-hidden">
                                {/* All Pages */}
                                <button
                                    onClick={selectAllPages}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-600 text-white transition-colors"
                                >
                                    <span>All pages</span>
                                    {pageSelection.type === 'all' && (
                                        <Check size={18} className="text-blue-400" />
                                    )}
                                </button>

                                {/* Current Page */}
                                <button
                                    onClick={selectCurrentPage}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-600 text-white transition-colors"
                                >
                                    <span>Current page ({activePage?.name || 'Page 1'})</span>
                                    {pageSelection.type === 'current' && (
                                        <Check size={18} className="text-blue-400" />
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="border-t border-gray-600 my-1" />

                                {/* Individual Pages */}
                                {pages.map((page, index) => (
                                    <button
                                        key={page.id}
                                        onClick={() => togglePageSelection(page.id)}
                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-600 text-white transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-7 bg-gray-500 rounded flex items-center justify-center text-xs">
                                                {index + 1}
                                            </div>
                                            <span>{page.name || `Page ${index + 1}`}</span>
                                        </div>
                                        {pageSelection.selectedPageIds.includes(page.id) && (
                                            <Check size={18} className="text-blue-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Format Options */}
                    <div className="space-y-2">
                        {formatOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => !option.disabled && !isExporting && setFormat(option.id)}
                                disabled={option.disabled || isExporting}
                                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${format === option.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : option.disabled
                                        ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex-shrink-0 mt-0.5">
                                    {option.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-800">{option.name}</span>
                                        {option.disabled && (
                                            <span className="text-xs text-gray-400">(Coming soon)</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>

                                    {/* Scale slider for PNG */}
                                    {format === option.id && !option.disabled && option.id === 'png' && (
                                        <div className="mt-4 space-y-3">
                                            {/* Transparent Background Checkbox */}
                                            <label
                                                className="flex items-center gap-2 cursor-pointer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={transparentBackground}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        setTransparentBackground(e.target.checked);
                                                    }}
                                                    disabled={isExporting}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-700">Transparent background</span>
                                            </label>

                                            {/* Scale Slider */}
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="0.5"
                                                    max="4"
                                                    step="0.1"
                                                    value={scale}
                                                    onChange={(e) => setScale(parseFloat(e.target.value))}
                                                    disabled={isExporting}
                                                    className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
                                                />
                                                <span className="text-sm font-medium text-gray-600 w-10 text-right">
                                                    {scale}x
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {outputWidth} x {outputHeight}px
                                            </p>
                                        </div>
                                    )}

                                    {/* Scale slider for JPEG */}
                                    {format === option.id && !option.disabled && option.id === 'jpeg' && (
                                        <div className="mt-4 space-y-3">
                                            {/* Scale Slider */}
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="0.5"
                                                    max="4"
                                                    step="0.1"
                                                    value={scale}
                                                    onChange={(e) => setScale(parseFloat(e.target.value))}
                                                    disabled={isExporting}
                                                    className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
                                                />
                                                <span className="text-sm font-medium text-gray-600 w-10 text-right">
                                                    {scale}x
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {outputWidth} x {outputHeight}px
                                            </p>
                                        </div>
                                    )}

                                    {/* Scale slider for PDF */}
                                    {format === option.id && !option.disabled && option.id === 'pdf' && (
                                        <div className="mt-4 space-y-3">
                                            {/* Scale Slider */}
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="0.5"
                                                    max="4"
                                                    step="0.1"
                                                    value={scale}
                                                    onChange={(e) => setScale(parseFloat(e.target.value))}
                                                    disabled={isExporting}
                                                    className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
                                                />
                                                <span className="text-sm font-medium text-gray-600 w-10 text-right">
                                                    {scale}x
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {outputWidth} x {outputHeight}px
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {format === option.id && !option.disabled && (
                                    <Check size={20} className="text-blue-500 flex-shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer - Download Button */}
                <div className="px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={handleExport}
                        disabled={isExporting || pagesToExport.length === 0}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium text-white transition-all ${isExporting
                            ? 'bg-blue-400 cursor-wait'
                            : 'bg-blue-500 hover:bg-blue-600 active:scale-[0.98]'
                            }`}
                    >
                        <Download size={20} />
                        <span>Download</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
