'use client';

import { useRef, useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { Upload, X } from 'lucide-react';

// Type for tracking uploads - distinguish between images and SVGs
interface UploadItem {
    dataUrl: string;
    type: 'image' | 'svg';
    svgContent?: string; // Original SVG content for SVG files
    fileName?: string;
}

// Helper to check if file is SVG
const isSvgFile = (file: File): boolean => {
    return file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
};

// Helper to truncate filename
const truncateFileName = (name: string, maxLength: number = 20): string => {
    if (name.length <= maxLength) return name;
    const extensionIndex = name.lastIndexOf('.');
    const extension = extensionIndex !== -1 ? name.slice(extensionIndex) : '';
    const nameWithoutExt = extensionIndex !== -1 ? name.slice(0, extensionIndex) : name;

    // Check if name is still too long after removing extension
    if (nameWithoutExt.length + extension.length <= maxLength) return name;

    return `${nameWithoutExt.slice(0, maxLength - 3 - extension.length)}...${extension}`;
};



// Helper to extract viewBox from SVG
const extractViewBox = (svgContent: string): { width: number; height: number } => {
    const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/i);
    if (viewBoxMatch) {
        const parts = viewBoxMatch[1].split(/\s+/).map(Number);
        if (parts.length >= 4) {
            return { width: parts[2], height: parts[3] };
        }
    }

    // Try width/height attributes
    const widthMatch = svgContent.match(/width=["'](\d+)/i);
    const heightMatch = svgContent.match(/height=["'](\d+)/i);

    return {
        width: widthMatch ? parseInt(widthMatch[1]) : 24,
        height: heightMatch ? parseInt(heightMatch[1]) : 24
    };
};

export function UploadPanel() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const addImageElement = useCanvasStore((state) => state.addImageElement);
    const addStickerElement = useCanvasStore((state) => state.addStickerElement);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                if (isSvgFile(file)) {
                    // Read SVG as text to extract paths
                    const textReader = new FileReader();
                    textReader.onload = (event) => {
                        const svgContent = event.target?.result as string;

                        // Also read as data URL for preview
                        const dataUrlReader = new FileReader();
                        dataUrlReader.onload = (dataEvent) => {
                            const dataUrl = dataEvent.target?.result as string;
                            setUploads((prev) => [...prev, {
                                dataUrl,
                                type: 'svg',
                                svgContent,
                                fileName: file.name
                            }]);
                        };
                        dataUrlReader.readAsDataURL(file);
                    };
                    textReader.readAsText(file);
                } else {
                    // Regular image - read as data URL
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const dataUrl = event.target?.result as string;
                        setUploads((prev) => [...prev, {
                            dataUrl,
                            type: 'image',
                            fileName: file.name
                        }]);
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    };

    const handleAddUpload = (upload: UploadItem) => {
        // Get canvas dimensions to center the element
        const fabricCanvas = getFabricCanvas();
        const canvas = fabricCanvas.getCanvas();
        const canvasWidth = canvas?.getWidth() || 1080;
        const canvasHeight = canvas?.getHeight() || 1080;

        if (upload.type === 'svg' && upload.svgContent) {
            const viewBox = extractViewBox(upload.svgContent);
            const displayName = upload.fileName ? truncateFileName(upload.fileName) : 'Uploaded';

            // Use addStickerElement for full SVG support (colors, groups)
            addStickerElement(`upload-${Date.now()}`, {
                name: `SVG (${displayName})`,
                svgContent: upload.svgContent,
                originalSvgContent: upload.svgContent,
                category: 'uploaded',
                transform: {
                    x: canvasWidth / 2,
                    y: canvasHeight / 2,
                    width: 200, // Default width for stickers
                    height: 200 * (viewBox.height / viewBox.width),
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    skewX: 0,
                    skewY: 0,
                    originX: 'center',
                    originY: 'center',
                },
                style: {
                    fill: null, // Let SVG colors take precedence
                    stroke: null,
                    strokeWidth: 0,
                    opacity: 1,
                    shadow: null,
                    cornerRadius: 0,
                },
            });
        } else {
            // Regular image
            handleAddAsImage(upload.dataUrl, canvasWidth, canvasHeight);
        }
    };

    const handleAddAsImage = (src: string, canvasWidth: number, canvasHeight: number) => {
        // Load image first to get natural dimensions for correct aspect ratio
        const img = new Image();
        img.onload = () => {
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;
            const aspectRatio = naturalWidth / naturalHeight;

            // Base size - fit within 300px on the larger dimension
            const maxSize = 300;
            let width: number;
            let height: number;

            if (aspectRatio >= 1) {
                // Landscape or square
                width = maxSize;
                height = maxSize / aspectRatio;
            } else {
                // Portrait
                height = maxSize;
                width = maxSize * aspectRatio;
            }

            addImageElement(src, {
                transform: {
                    x: canvasWidth / 2,
                    y: canvasHeight / 2,
                    width,
                    height,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    skewX: 0,
                    skewY: 0,
                    originX: 'center',
                    originY: 'center',
                },
            });
        };
        img.onerror = () => {
            // Fallback to square if image fails
            addImageElement(src, {
                transform: {
                    x: canvasWidth / 2,
                    y: canvasHeight / 2,
                    width: 300,
                    height: 300,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    skewX: 0,
                    skewY: 0,
                    originX: 'center',
                    originY: 'center',
                },
            });
        };
        img.src = src;
    };

    const handleRemoveUpload = (index: number) => {
        setUploads((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 pb-2">
                <h2 className="text-lg font-semibold text-gray-800">Uploads</h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                {/* Upload Button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors font-medium text-sm"
                >
                    <Upload size={16} />
                    Upload Image or SVG
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.svg"
                    multiple
                    onChange={handleFileSelect}
                />

                {/* Uploaded Files */}
                {uploads.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Your Uploads</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {uploads.map((upload, index) => (
                                <div
                                    key={index}
                                    className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group border transition-colors ${upload.type === 'svg'
                                        ? 'border-blue-200 hover:border-blue-400'
                                        : 'border-gray-200 hover:border-violet-400'
                                        }`}
                                >
                                    <img
                                        src={upload.dataUrl}
                                        alt={`Upload ${index + 1}`}
                                        onClick={() => handleAddUpload(upload)}
                                        className="w-full h-full object-contain p-1"
                                    />
                                    {/* SVG badge */}
                                    {upload.type === 'svg' && (
                                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-[9px] font-medium rounded">
                                            SVG
                                        </span>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveUpload(index);
                                        }}
                                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} className="text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {uploads.length === 0 && (
                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-xs">No uploads yet</p>
                        <p className="text-gray-300 text-[10px] mt-1">Upload images or SVGs to use in your design</p>
                    </div>
                )}
            </div>
        </div>
    );
}
