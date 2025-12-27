'use client';

import { useState, useMemo, useRef } from 'react';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';
import { useEditorStore } from '@/store/editorStore';
import {
    STICKER_CATALOG,
    STICKER_CATEGORY_LABELS,
    getStickerCategories,
    searchStickers,
    extractColorsFromSvg,
    StickerCategory,
    StickerDefinition,
} from '@/types/stickers';

// Sticker preview component
function StickerPreview({ sticker }: { sticker: StickerDefinition }) {
    return (
        <div
            className="w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: sticker.svgContent }}
        />
    );
}

// Category Row component - matches ElementsPanel/IconsPanel style
function StickerCategoryRow({
    category,
    stickers,
    isExpanded,
    onToggle,
    onAddSticker,
}: {
    category: StickerCategory;
    stickers: StickerDefinition[];
    isExpanded: boolean;
    onToggle: () => void;
    onAddSticker: (sticker: StickerDefinition) => void;
}) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    return (
        <div className="mb-4">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={onToggle}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                >
                    {isExpanded ? (
                        <ChevronDown size={14} />
                    ) : (
                        <ChevronRight size={14} />
                    )}
                    <h3 className="text-sm font-semibold">
                        {STICKER_CATEGORY_LABELS[category]} ({stickers.length})
                    </h3>
                </button>
                {/* Right scroll arrow - only show when collapsed and has more than 3 stickers */}
                {!isExpanded && stickers.length > 3 && (
                    <button
                        onClick={scrollRight}
                        className="p-1 text-gray-500 hover:text-gray-800 transition-colors"
                        title="Scroll right"
                    >
                        <ChevronRight size={18} />
                    </button>
                )}
            </div>

            {/* Collapsed: Horizontal Scrollable Row */}
            {!isExpanded && (
                <div
                    ref={scrollContainerRef}
                    className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {stickers.map((sticker) => (
                        <button
                            key={sticker.id}
                            onClick={() => onAddSticker(sticker)}
                            className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-50 hover:bg-blue-50 cursor-pointer transition-all duration-200 flex items-center justify-center p-1 hover:shadow-md"
                            title={sticker.name}
                        >
                            <StickerPreview sticker={sticker} />
                        </button>
                    ))}
                </div>
            )}

            {/* Expanded: Full Grid */}
            {isExpanded && (
                <div className="grid grid-cols-3 gap-2">
                    {stickers.map((sticker) => (
                        <button
                            key={sticker.id}
                            onClick={() => onAddSticker(sticker)}
                            className="w-full aspect-square rounded-lg bg-gray-50 hover:bg-blue-50 cursor-pointer transition-all duration-200 flex items-center justify-center p-2 hover:shadow-md"
                            title={sticker.name}
                        >
                            <StickerPreview sticker={sticker} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

interface StickersPanelProps {
    searchQuery?: string;
}

export function StickersPanel({ searchQuery = '' }: StickersPanelProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<StickerCategory>>(new Set());
    const addStickerElement = useCanvasStore((state) => state.addStickerElement);

    const toggleCategory = (categoryId: StickerCategory) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    // Filter stickers based on search query
    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return getStickerCategories();

        const matchingStickers = searchStickers(searchQuery);
        const categories = getStickerCategories();

        return categories.map(cat => ({
            ...cat,
            stickers: cat.stickers.filter(s => matchingStickers.includes(s)),
        })).filter(cat => cat.stickers.length > 0);
    }, [searchQuery]);

    // Add sticker to canvas
    const handleAddSticker = (sticker: StickerDefinition) => {
        // Get canvas dimensions to center the sticker
        const project = useEditorStore.getState().project;
        const activePage = project?.pages.find(p => p.id === project.activePageId);
        const canvasWidth = activePage?.width || 1080;
        const canvasHeight = activePage?.height || 1080;

        // Extract colors from the sticker SVG
        const colors = extractColorsFromSvg(sticker.svgContent);

        // Create initial color map (original color -> same color)
        const colorMap: Record<string, string> = {};
        colors.forEach(color => {
            colorMap[color] = color;
        });

        addStickerElement(sticker.id, {
            name: `Sticker (${sticker.name})`,
            stickerId: sticker.id,
            svgContent: sticker.svgContent,
            originalSvgContent: sticker.svgContent,
            colorMap,
            category: sticker.category,
            transform: {
                x: canvasWidth / 2,
                y: canvasHeight / 2,
                width: 150,
                height: 150,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                skewX: 0,
                skewY: 0,
                originX: 'center',
                originY: 'center',
            },
            style: {
                fill: null,
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                shadow: null,
                cornerRadius: 0,
            },
        });
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {filteredCategories.map(({ category, stickers }) => (
                    <StickerCategoryRow
                        key={category}
                        category={category}
                        stickers={stickers}
                        isExpanded={expandedCategories.has(category)}
                        onToggle={() => toggleCategory(category)}
                        onAddSticker={handleAddSticker}
                    />
                ))}

                {/* Empty state */}
                {filteredCategories.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Search size={32} strokeWidth={1} />
                        <p className="mt-3 text-sm">No stickers found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
