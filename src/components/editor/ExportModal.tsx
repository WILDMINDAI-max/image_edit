'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEditorStore, usePages, useActivePage } from '@/store/editorStore';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { Page } from '@/types/project';
import { fabric } from 'fabric';
import JSZip from 'jszip';
import {
    X,
    Download,
    Check,
    ChevronDown,
    Image as ImageIcon,
    FileType,
    Loader2,
} from 'lucide-react';

type ExportFormat = 'png' | 'png-transparent' | 'jpeg' | 'pdf';

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

    // Initialize page selection when modal opens
    useEffect(() => {
        if (isOpen && pages.length > 0) {
            setPageSelection({
                type: 'all',
                selectedPageIds: pages.map(p => p.id),
            });
        }
    }, [isOpen, pages]);

    // Get pages to export based on selection
    const getPagesToExport = useCallback((): Page[] => {
        if (pageSelection.type === 'all') {
            return pages;
        } else if (pageSelection.type === 'current' && activePage) {
            return [activePage];
        } else {
            return pages.filter(p => pageSelection.selectedPageIds.includes(p.id));
        }
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
        const fabricCanvas = getFabricCanvas();
        const canvas = fabricCanvas.getCanvas();

        if (!canvas) {
            throw new Error('Canvas not initialized');
        }

        // Save current state
        const currentPageId = project?.activePageId;

        // Load the page onto canvas
        await fabricCanvas.loadPage(page);

        // Wait for images to load
        await new Promise<void>((resolve) => {
            const checkImages = () => {
                const objects = canvas.getObjects();
                const images = objects.filter(obj => obj.type === 'image') as fabric.Image[];
                const allLoaded = images.every(img => {
                    const element = img.getElement();
                    return element && (element as HTMLImageElement).complete;
                });
                if (allLoaded || images.length === 0) {
                    resolve();
                } else {
                    setTimeout(checkImages, 50);
                }
            };
            checkImages();
        });

        // Small delay for rendering
        await new Promise(resolve => setTimeout(resolve, 100));

        // Create export canvas
        const tempCanvas = document.createElement('canvas');
        const targetWidth = page.width * scale;
        const targetHeight = page.height * scale;
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
        const ctx = tempCanvas.getContext('2d');

        if (!ctx) {
            throw new Error('Could not create canvas context');
        }

        // Draw background if not transparent
        if (format !== 'png-transparent') {
            // Handle different background types
            if (page.background.type === 'solid') {
                ctx.fillStyle = page.background.color;
                ctx.fillRect(0, 0, targetWidth, targetHeight);
            } else if (page.background.type === 'gradient') {
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
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, targetWidth, targetHeight);
            }
        }

        // Get the data URL from fabric canvas
        const dataUrl = canvas.toDataURL({
            format: format === 'jpeg' ? 'jpeg' : 'png',
            quality: format === 'jpeg' ? 0.92 : 1,
            multiplier: scale,
        });

        // Load and draw the canvas content
        await new Promise<void>((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => {
                // For transparent PNG, first draw the fabric content
                // For others, we've already drawn the background
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                resolve();
            };
            img.onerror = () => reject(new Error('Failed to load canvas image'));
            img.src = dataUrl;
        });

        // Convert to blob
        return new Promise((resolve, reject) => {
            tempCanvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob'));
                    }
                },
                format === 'jpeg' ? 'image/jpeg' : 'image/png',
                format === 'jpeg' ? 0.92 : 1
            );
        });
    };

    // Export handler
    const handleExport = async () => {
        const pagesToExport = getPagesToExport();
        if (pagesToExport.length === 0) return;

        setIsExporting(true);
        setExportProgress(0);
        setExportMessage('Preparing export...');

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

            const fileExtension = format === 'jpeg' ? 'jpg' : 'png';

            if (pagesToExport.length === 1) {
                // Single page export
                setExportMessage('Rendering page...');
                const blob = await renderPageToBlob(pagesToExport[0]);
                setExportProgress(100);

                // Download
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${filename}.${fileExtension}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                setExportMessage('Download complete!');
            } else {
                // Multi-page export - create ZIP
                setExportMessage('Creating ZIP file...');
                const zip = new JSZip();

                for (let i = 0; i < pagesToExport.length; i++) {
                    const page = pagesToExport[i];
                    setExportMessage(`Rendering page ${i + 1} of ${pagesToExport.length}...`);
                    setExportProgress(Math.round((i / pagesToExport.length) * 80));

                    const blob = await renderPageToBlob(page);
                    // Use Page_N format for consistent naming
                    const pageName = `Page_${i + 1}`;
                    zip.file(`${pageName}.${fileExtension}`, blob);
                }

                setExportMessage('Compressing...');
                setExportProgress(90);

                const zipBlob = await zip.generateAsync({
                    type: 'blob',
                    compression: 'DEFLATE',
                    compressionOptions: { level: 6 }
                });

                setExportProgress(100);

                // Download ZIP
                const url = URL.createObjectURL(zipBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${filename}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                setExportMessage('Download complete!');
            }

            // Restore active page
            if (project?.activePageId) {
                const fabricCanvas = getFabricCanvas();
                const activePageToRestore = pages.find(p => p.id === project.activePageId);
                if (activePageToRestore) {
                    await fabricCanvas.loadPage(activePageToRestore);
                }
            }

            // Close modal after short delay
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
        { id: 'png', name: 'PNG', description: 'To keep high quality in complex images and illustrations', icon: <ImageIcon size={16} className="text-blue-500" /> },
        { id: 'png-transparent', name: 'PNG (without background)', description: 'Ideal for logos and web assets', icon: <ImageIcon size={16} className="text-blue-500" /> },
        { id: 'jpeg', name: 'JPEG', description: 'Ideal for digital sharing and space-saving', icon: <FileType size={16} className="text-green-500" />, disabled: true },
        { id: 'pdf', name: 'PDF', description: 'Ideal for documents or printing', icon: <FileType size={16} className="text-red-500" />, disabled: true },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeModal}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-[480px] max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800">Download your project</h2>
                    <button
                        onClick={closeModal}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
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
                                onClick={() => !option.disabled && setFormat(option.id)}
                                disabled={option.disabled}
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
                                    {format === option.id && !option.disabled && (option.id === 'png' || option.id === 'png-transparent') && (
                                        <div className="mt-4">
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="0.5"
                                                    max="4"
                                                    step="0.1"
                                                    value={scale}
                                                    onChange={(e) => setScale(parseFloat(e.target.value))}
                                                    className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                />
                                                <span className="text-sm font-medium text-gray-600 w-10 text-right">
                                                    {scale}x
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">
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
                        {isExporting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>{exportMessage || 'Exporting...'}</span>
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                <span>Download</span>
                            </>
                        )}
                    </button>

                    {/* Progress bar */}
                    {isExporting && (
                        <div className="mt-3">
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${exportProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
