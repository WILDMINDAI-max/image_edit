// Export PDF
// PDF generation using pdf-lib

import { PDFDocument, rgb, PageSizes } from 'pdf-lib';
import { Page } from '@/types/project';
import { PDFExportSettings } from '@/types/export';
import { getCanvasRenderer } from '../CanvasRenderer';

export interface PDFExportResult {
    blob: Blob;
    pageCount: number;
    size: number;
}

/**
 * Convert hex color to RGB values (0-1 range)
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
        };
    }
    return { r: 0, g: 0, b: 0 };
};

/**
 * Export single canvas to PDF
 */
export const exportToPDF = async (
    settings: Partial<PDFExportSettings> = {}
): Promise<PDFExportResult> => {
    console.log('[exportPDF] Starting PDF export with settings:', settings);

    const renderer = getCanvasRenderer();
    console.log('[exportPDF] Got canvas renderer');

    const dimensions = renderer.getDimensions();
    console.log('[exportPDF] Canvas dimensions:', dimensions);

    // Create PDF document
    console.log('[exportPDF] Creating PDF document...');
    const pdfDoc = await PDFDocument.create();
    console.log('[exportPDF] PDF document created');

    // Add page with canvas dimensions
    const page = pdfDoc.addPage([dimensions.width, dimensions.height]);
    console.log('[exportPDF] PDF page added, dimensions:', dimensions.width, 'x', dimensions.height);

    // Render canvas to PNG
    const scale = settings.quality === 'maximum' ? 2 : 1;
    console.log('[exportPDF] Rendering canvas to PNG with scale:', scale);
    const pngBlob = await renderer.renderToBlob({
        format: 'png',
        scale,
        quality: 1,
    });
    console.log('[exportPDF] PNG blob created, size:', pngBlob.size, 'bytes');

    // Embed image into PDF
    console.log('[exportPDF] Embedding PNG into PDF...');
    const pngBytes = await pngBlob.arrayBuffer();
    const pngImage = await pdfDoc.embedPng(pngBytes);
    console.log('[exportPDF] PNG embedded successfully');

    // Draw image on page
    console.log('[exportPDF] Drawing image on PDF page...');
    page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: dimensions.width,
        height: dimensions.height,
    });
    console.log('[exportPDF] Image drawn on PDF page');

    // Save PDF
    console.log('[exportPDF] Saving PDF...');
    const pdfBytes = await pdfDoc.save();
    console.log('[exportPDF] PDF saved, size:', pdfBytes.length, 'bytes');

    // Convert Uint8Array to a type that Blob accepts
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    console.log('[exportPDF] PDF blob created, size:', blob.size);

    const result = {
        blob,
        pageCount: 1,
        size: blob.size,
    };
    console.log('[exportPDF] Export complete. Page count:', result.pageCount);

    return result;
};

/**
 * Export multiple pages to PDF
 */
export const exportPagesToPDF = async (
    pages: Page[],
    settings: Partial<PDFExportSettings> = {}
): Promise<PDFExportResult> => {
    console.log('[exportPagesToPDF] Starting multi-page PDF export. Total pages:', pages.length);
    console.log('[exportPagesToPDF] Settings:', settings);

    const renderer = getCanvasRenderer();
    console.log('[exportPagesToPDF] Got canvas renderer');

    // Create PDF document
    console.log('[exportPagesToPDF] Creating PDF document...');
    const pdfDoc = await PDFDocument.create();
    console.log('[exportPagesToPDF] PDF document created');

    const scale = settings.quality === 'maximum' ? 2 : 1;
    console.log('[exportPagesToPDF] Using scale:', scale);

    // Add each page
    for (let i = 0; i < pages.length; i++) {
        const canvasPage = pages[i];
        console.log(`[exportPagesToPDF] Processing page ${i + 1}/${pages.length}:`, canvasPage.id);

        // Render page
        console.log(`[exportPagesToPDF] Rendering page ${i + 1} to PNG...`);
        const pngBlob = await renderer.renderPage(canvasPage, {
            format: 'png',
            scale,
            quality: 1,
        });
        console.log(`[exportPagesToPDF] Page ${i + 1} PNG blob created, size:`, pngBlob.size, 'bytes');

        // Add PDF page with canvas dimensions
        const pdfPage = pdfDoc.addPage([canvasPage.width, canvasPage.height]);
        console.log(`[exportPagesToPDF] PDF page ${i + 1} added, dimensions:`, canvasPage.width, 'x', canvasPage.height);

        // Embed and draw image
        console.log(`[exportPagesToPDF] Embedding PNG into PDF page ${i + 1}...`);
        const pngBytes = await pngBlob.arrayBuffer();
        const pngImage = await pdfDoc.embedPng(pngBytes);
        console.log(`[exportPagesToPDF] PNG embedded for page ${i + 1}`);

        pdfPage.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: canvasPage.width,
            height: canvasPage.height,
        });
        console.log(`[exportPagesToPDF] Image drawn on PDF page ${i + 1}`);
    }

    // Save PDF
    console.log('[exportPagesToPDF] Saving PDF document...');
    const pdfBytes = await pdfDoc.save();
    console.log('[exportPagesToPDF] PDF saved, size:', pdfBytes.length, 'bytes');

    // Convert Uint8Array to a type that Blob accepts
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    console.log('[exportPagesToPDF] PDF blob created, size:', blob.size);

    const result = {
        blob,
        pageCount: pages.length,
        size: blob.size,
    };
    console.log('[exportPagesToPDF] Export complete. Page count:', result.pageCount);

    return result;
};

/**
 * Export for print with bleed and crop marks
 */
export const exportPrintPDF = async (
    pages: Page[],
    settings: PDFExportSettings
): Promise<PDFExportResult> => {
    const renderer = getCanvasRenderer();
    const bleedSize = settings.bleedSize || 9; // 3mm = ~9pt

    // Create PDF document
    const pdfDoc = await PDFDocument.create();

    for (const canvasPage of pages) {
        // Calculate page size with bleed
        const pageWidth = canvasPage.width + (settings.includeBleed ? bleedSize * 2 : 0);
        const pageHeight = canvasPage.height + (settings.includeBleed ? bleedSize * 2 : 0);

        const pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);

        // Render page
        const pngBlob = await renderer.renderPage(canvasPage, {
            format: 'png',
            scale: 2, // High quality for print
            quality: 1,
        });

        // Embed and draw image
        const pngBytes = await pngBlob.arrayBuffer();
        const pngImage = await pdfDoc.embedPng(pngBytes);

        pdfPage.drawImage(pngImage, {
            x: settings.includeBleed ? bleedSize : 0,
            y: settings.includeBleed ? bleedSize : 0,
            width: canvasPage.width,
            height: canvasPage.height,
        });

        // Draw crop marks if enabled
        if (settings.cropMarks) {
            const markLength = 18; // ~6mm
            const markOffset = settings.includeBleed ? bleedSize : 0;
            const { r, g, b } = hexToRgb('#000000');

            // Top-left
            pdfPage.drawLine({
                start: { x: markOffset - markLength, y: pageHeight - markOffset },
                end: { x: markOffset, y: pageHeight - markOffset },
                thickness: 0.5,
                color: rgb(r, g, b),
            });
            pdfPage.drawLine({
                start: { x: markOffset, y: pageHeight - markOffset },
                end: { x: markOffset, y: pageHeight - markOffset + markLength },
                thickness: 0.5,
                color: rgb(r, g, b),
            });

            // Top-right
            pdfPage.drawLine({
                start: { x: pageWidth - markOffset, y: pageHeight - markOffset },
                end: { x: pageWidth - markOffset + markLength, y: pageHeight - markOffset },
                thickness: 0.5,
                color: rgb(r, g, b),
            });
            pdfPage.drawLine({
                start: { x: pageWidth - markOffset, y: pageHeight - markOffset },
                end: { x: pageWidth - markOffset, y: pageHeight - markOffset + markLength },
                thickness: 0.5,
                color: rgb(r, g, b),
            });

            // Bottom-left
            pdfPage.drawLine({
                start: { x: markOffset - markLength, y: markOffset },
                end: { x: markOffset, y: markOffset },
                thickness: 0.5,
                color: rgb(r, g, b),
            });
            pdfPage.drawLine({
                start: { x: markOffset, y: markOffset },
                end: { x: markOffset, y: markOffset - markLength },
                thickness: 0.5,
                color: rgb(r, g, b),
            });

            // Bottom-right
            pdfPage.drawLine({
                start: { x: pageWidth - markOffset, y: markOffset },
                end: { x: pageWidth - markOffset + markLength, y: markOffset },
                thickness: 0.5,
                color: rgb(r, g, b),
            });
            pdfPage.drawLine({
                start: { x: pageWidth - markOffset, y: markOffset },
                end: { x: pageWidth - markOffset, y: markOffset - markLength },
                thickness: 0.5,
                color: rgb(r, g, b),
            });
        }
    }

    // Save PDF
    console.log('[exportPrintPDF] Saving PDF document...');
    const pdfBytes = await pdfDoc.save();
    console.log('[exportPrintPDF] PDF saved, size:', pdfBytes.length, 'bytes');

    // Convert Uint8Array to a type that Blob accepts
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    console.log('[exportPrintPDF] PDF blob created, size:', blob.size);

    const result = {
        blob,
        pageCount: pages.length,
        size: blob.size,
    };
    console.log('[exportPrintPDF] Export complete. Page count:', result.pageCount);

    return result;
};

/**
 * Download PDF file
 */
export const downloadPDF = (blob: Blob, filename: string): void => {
    console.log('[downloadPDF] Starting download. Filename:', filename);
    console.log('[downloadPDF] Blob size:', blob.size, 'bytes, type:', blob.type);

    const url = URL.createObjectURL(blob);
    console.log('[downloadPDF] Created object URL:', url);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    console.log('[downloadPDF] Download link created:', link.download);

    document.body.appendChild(link);
    console.log('[downloadPDF] Triggering download...');
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('[downloadPDF] Download initiated, cleanup complete');
};
