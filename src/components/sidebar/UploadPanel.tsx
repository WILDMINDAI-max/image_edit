'use client';

import { useRef, useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { Upload, X } from 'lucide-react';

export function UploadPanel() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploads, setUploads] = useState<string[]>([]);
    const addImageElement = useCanvasStore((state) => state.addImageElement);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target?.result as string;
                    setUploads((prev) => [...prev, dataUrl]);
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const handleAddImage = (src: string) => {
        addImageElement(src, {
            transform: {
                x: 100,
                y: 100,
                width: 200,
                height: 200,
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
                    Upload Image
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                />

                {/* Uploaded Images */}
                {uploads.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Your Uploads</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {uploads.map((src, index) => (
                                <div
                                    key={index}
                                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group border border-gray-200 hover:border-violet-400 transition-colors"
                                >
                                    <img
                                        src={src}
                                        alt={`Upload ${index + 1}`}
                                        onClick={() => handleAddImage(src)}
                                        className="w-full h-full object-cover"
                                    />
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
                        <p className="text-gray-300 text-[10px] mt-1">Upload images to use in your design</p>
                    </div>
                )}
            </div>
        </div>
    );
}
