// Export PNG
// PNG/JPG export utilities

import { getCanvasRenderer, RenderOptions } from '../CanvasRenderer';
import { Page } from '@/types/project';
import { ImageExportSettings, QUALITY_SCALE_MAP, QUALITY_JPEG_MAP } from '@/types/export';

export interface PNGExportResult {
    blob: Blob;
    dataUrl: string;
    width: number;
    height: number;
    size: number;
}

/**
 * Export canvas to PNG
 */
export const exportToPNG = async (
    settings: Partial<ImageExportSettings> = {}
): Promise<PNGExportResult> => {
    console.log('[exportPNG] Starting PNG export with settings:', settings);

    const renderer = getCanvasRenderer();
    console.log('[exportPNG] Got canvas renderer:', renderer);

    const dimensions = renderer.getDimensions();
    console.log('[exportPNG] Canvas dimensions:', dimensions);

    const scale = settings.scale || QUALITY_SCALE_MAP[settings.quality || 'high'];
    console.log('[exportPNG] Using scale:', scale, 'for quality:', settings.quality || 'high');

    const options: RenderOptions = {
        format: 'png',
        scale,
        quality: 1, // PNG is lossless
        backgroundColor: settings.transparentBackground ? undefined : '#ffffff',
    };
    console.log('[exportPNG] Render options:', options);

    console.log('[exportPNG] Rendering to blob...');
    const blob = await renderer.renderToBlob(options);
    console.log('[exportPNG] Blob created, size:', blob.size, 'bytes');

    console.log('[exportPNG] Rendering to data URL...');
    const dataUrl = renderer.renderToDataURL(options);
    console.log('[exportPNG] Data URL created, length:', dataUrl.length);

    const result = {
        blob,
        dataUrl,
        width: dimensions.width * scale,
        height: dimensions.height * scale,
        size: blob.size,
    };
    console.log('[exportPNG] Export complete. Result dimensions:', result.width, 'x', result.height);

    return result;
};

/**
 * Export canvas to JPG
 */
export const exportToJPG = async (
    settings: Partial<ImageExportSettings> = {}
): Promise<PNGExportResult> => {
    console.log('[exportJPG] Starting JPG export with settings:', settings);

    const renderer = getCanvasRenderer();
    console.log('[exportJPG] Got canvas renderer:', renderer);

    const dimensions = renderer.getDimensions();
    console.log('[exportJPG] Canvas dimensions:', dimensions);

    const scale = settings.scale || QUALITY_SCALE_MAP[settings.quality || 'high'];
    const quality = QUALITY_JPEG_MAP[settings.quality || 'high'];
    console.log('[exportJPG] Using scale:', scale, 'quality:', quality);

    const options: RenderOptions = {
        format: 'jpeg',
        scale,
        quality,
        backgroundColor: '#ffffff', // JPG doesn't support transparency
    };
    console.log('[exportJPG] Render options:', options);

    console.log('[exportJPG] Rendering to blob...');
    const blob = await renderer.renderToBlob(options);
    console.log('[exportJPG] Blob created, size:', blob.size, 'bytes');

    console.log('[exportJPG] Rendering to data URL...');
    const dataUrl = renderer.renderToDataURL(options);
    console.log('[exportJPG] Data URL created, length:', dataUrl.length);

    const result = {
        blob,
        dataUrl,
        width: dimensions.width * scale,
        height: dimensions.height * scale,
        size: blob.size,
    };
    console.log('[exportJPG] Export complete. Result dimensions:', result.width, 'x', result.height);

    return result;
};

/**
 * Export single page to PNG
 */
export const exportPageToPNG = async (
    page: Page,
    settings: Partial<ImageExportSettings> = {}
): Promise<PNGExportResult> => {
    console.log('[exportPageToPNG] Starting page export. Page ID:', page.id, 'Page name:', page.name);
    console.log('[exportPageToPNG] Page dimensions:', page.width, 'x', page.height);
    console.log('[exportPageToPNG] Settings:', settings);

    const renderer = getCanvasRenderer();
    console.log('[exportPageToPNG] Got canvas renderer');

    const scale = settings.scale || QUALITY_SCALE_MAP[settings.quality || 'high'];
    console.log('[exportPageToPNG] Using scale:', scale);

    const renderOptions = {
        format: 'png' as const,
        scale,
        quality: 1,
        backgroundColor: settings.transparentBackground ? undefined : '#ffffff',
    };
    console.log('[exportPageToPNG] Render options:', renderOptions);

    console.log('[exportPageToPNG] Rendering page to blob...');
    const blob = await renderer.renderPage(page, renderOptions);
    console.log('[exportPageToPNG] Blob created, size:', blob.size, 'bytes');

    const result = {
        blob,
        dataUrl: URL.createObjectURL(blob),
        width: page.width * scale,
        height: page.height * scale,
        size: blob.size,
    };
    console.log('[exportPageToPNG] Export complete. Result dimensions:', result.width, 'x', result.height);

    return result;
};

/**
 * Export multiple pages to PNG (returns zip file placeholder)
 */
export const exportPagesToPNG = async (
    pages: Page[],
    settings: Partial<ImageExportSettings> = {}
): Promise<{ pages: PNGExportResult[]; totalSize: number }> => {
    console.log('[exportPagesToPNG] Starting multi-page export. Total pages:', pages.length);
    console.log('[exportPagesToPNG] Settings:', settings);

    const results: PNGExportResult[] = [];
    let totalSize = 0;

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        console.log(`[exportPagesToPNG] Exporting page ${i + 1}/${pages.length}: ${page.name || page.id}`);
        const result = await exportPageToPNG(page, settings);
        results.push(result);
        totalSize += result.size;
        console.log(`[exportPagesToPNG] Page ${i + 1} exported. Size: ${result.size} bytes`);
    }

    console.log('[exportPagesToPNG] All pages exported. Total size:', totalSize, 'bytes');
    return { pages: results, totalSize };
};

/**
 * Export high-resolution (8K) image
 */
export const exportHighResolution = async (
    settings: Partial<ImageExportSettings> = {}
): Promise<PNGExportResult> => {
    console.log('[exportHighRes] Starting high resolution export with settings:', settings);

    const renderer = getCanvasRenderer();
    console.log('[exportHighRes] Got canvas renderer');

    const dimensions = renderer.getDimensions();
    console.log('[exportHighRes] Canvas dimensions:', dimensions);

    // Use tiled rendering for 8K
    const scale = settings.quality === 'maximum' ? 4 : 2;
    console.log('[exportHighRes] Using scale:', scale, 'for quality:', settings.quality || 'default');

    const renderOptions = {
        format: 'png' as const,
        scale,
        quality: 1,
    };
    console.log('[exportHighRes] Render options:', renderOptions);

    console.log('[exportHighRes] Rendering high resolution to blob...');
    const blob = await renderer.renderHighResolution(renderOptions);
    console.log('[exportHighRes] Blob created, size:', blob.size, 'bytes');

    const result = {
        blob,
        dataUrl: URL.createObjectURL(blob),
        width: dimensions.width * scale,
        height: dimensions.height * scale,
        size: blob.size,
    };
    console.log('[exportHighRes] Export complete. Result dimensions:', result.width, 'x', result.height);

    return result;
};

/**
 * Download exported image
 */
export const downloadImage = (
    blob: Blob,
    filename: string,
    format: 'png' | 'jpg' = 'png'
): void => {
    console.log('[downloadImage] Starting download. Filename:', filename, 'Format:', format);
    console.log('[downloadImage] Blob size:', blob.size, 'bytes, type:', blob.type);

    const url = URL.createObjectURL(blob);
    console.log('[downloadImage] Created object URL:', url);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    console.log('[downloadImage] Download link created:', link.download);

    document.body.appendChild(link);
    console.log('[downloadImage] Triggering download...');
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('[downloadImage] Download initiated, cleanup complete');
};
