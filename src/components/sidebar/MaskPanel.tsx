'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { MASK_SHAPES, MaskShapeDefinition } from '@/data/maskShapes';
import { MaskData, ImageElement } from '@/types/canvas';
import { useCanvasStore } from '@/store/canvasStore';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';

// SVG preview component for mask shapes (matching ElementsPanel.ShapePreview exactly)
function MaskShapePreview({ shape }: { shape: MaskShapeDefinition }) {
    return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
            <path d={shape.svgPath} fill="currentColor" />
        </svg>
    );
}

/**
 * MaskPanel - Left sidebar panel for image masking
 * Styled exactly like ElementsPanel (shapes sidebar)
 */
export function MaskPanel() {
    const [searchQuery, setSearchQuery] = useState('');

    const selectedIds = useCanvasStore((state) => state.selectedIds);
    const getElement = useCanvasStore((state) => state.getElement);
    const updateElement = useCanvasStore((state) => state.updateElement);

    // Get the selected image element
    const selectedElement = selectedIds.length === 1 ? getElement(selectedIds[0]) : null;
    const imageElement = selectedElement?.type === 'image' ? (selectedElement as ImageElement) : null;

    // Filter shapes by search query
    const filteredShapes = searchQuery
        ? MASK_SHAPES.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : MASK_SHAPES;

    const handleShapeClick = (shape: MaskShapeDefinition) => {
        if (!imageElement) return;

        const maskData: MaskData = {
            shapeId: shape.id,
            svgPath: shape.svgPath,
            shapeName: shape.name,
        };

        // Update element with mask data
        updateElement(imageElement.id, {
            mask: maskData,
        });

        // Apply mask to Fabric.js canvas
        const fabricCanvas = getFabricCanvas();
        fabricCanvas.applyImageMask(imageElement.id, maskData);
    };

    const handleRemoveMask = () => {
        if (!imageElement) return;

        // Remove mask from element
        updateElement(imageElement.id, {
            mask: null,
        });

        // Remove mask from Fabric.js canvas
        const fabricCanvas = getFabricCanvas();
        fabricCanvas.removeImageMask(imageElement.id);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header - matching ElementsPanel exactly */}
            <div className="p-4 border-b border-gray-100">
                <h2 className="text-gray-800 font-semibold text-lg">Mask Image</h2>
                <div className="mt-3 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search shapes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* No image selected message */}
                {!imageElement && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Search size={32} strokeWidth={1} />
                        <p className="mt-3 text-sm">Select an image to apply a mask</p>
                    </div>
                )}

                {/* Content when image is selected */}
                {imageElement && (
                    <>
                        {/* Category Header with Inline Remove Button */}
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-700">
                                Shapes ({filteredShapes.length})
                            </h3>

                            {imageElement.mask && (
                                <button
                                    onClick={handleRemoveMask}
                                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all"
                                    title="Remove current mask"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* Shape Grid - EXACTLY matching ElementsPanel */}
                        <div className="grid grid-cols-4 gap-2">
                            {filteredShapes.map((shape) => (
                                <button
                                    key={shape.id}
                                    onClick={() => handleShapeClick(shape)}
                                    className="w-16 h-16 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-200 flex items-center justify-center text-gray-700 hover:text-blue-600"
                                    title={shape.name}
                                >
                                    <MaskShapePreview shape={shape} />
                                </button>
                            ))}
                        </div>

                        {/* Empty state for search */}
                        {filteredShapes.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Search size={32} strokeWidth={1} />
                                <p className="mt-3 text-sm">No shapes found</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default MaskPanel;
