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

// Reuse sticker preview logic
function StickerPreview({ sticker }: { sticker: StickerDefinition }) {
    return (
        <div
            className="w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: sticker.svgContent }}
        />
    );
}

// Category Row component
function GraphicsCategoryRow({
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
                            className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-50 hover:bg-amber-50 cursor-pointer transition-all duration-200 flex items-center justify-center p-2 hover:shadow-md border border-transparent hover:border-amber-200"
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
                            className="w-full aspect-square rounded-lg bg-gray-50 hover:bg-amber-50 cursor-pointer transition-all duration-200 flex items-center justify-center p-3 hover:shadow-md border border-transparent hover:border-amber-200"
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

interface GraphicsPanelProps {
    searchQuery?: string;
}

const GRAPHICS_CATEGORIES: StickerCategory[] = ['gradients', 'abstract', 'decorations', '3d', 'liquid', 'badges', 'frames'];

export function GraphicsPanel({ searchQuery = '' }: GraphicsPanelProps) {
    // Default open all for graphics since there are fewer categories initially
    const [expandedCategories, setExpandedCategories] = useState<Set<StickerCategory>>(new Set(['gradients', 'abstract']));
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

    // Filter graphics based on search query
    const filteredCategories = useMemo(() => {
        const categories = getStickerCategories().filter(cat => GRAPHICS_CATEGORIES.includes(cat.category));

        if (!searchQuery.trim()) return categories;

        const matchingStickers = searchStickers(searchQuery);

        return categories.map(cat => ({
            ...cat,
            stickers: cat.stickers.filter(s => matchingStickers.includes(s)),
        })).filter(cat => cat.stickers.length > 0);
    }, [searchQuery]);

    // Add graphic to canvas (reuses addStickerElement)
    const handleAddGraphic = (sticker: StickerDefinition) => {
        const project = useEditorStore.getState().project;
        const activePage = project?.pages.find(p => p.id === project.activePageId);
        const canvasWidth = activePage?.width || 1080;
        const canvasHeight = activePage?.height || 1080;

        const colors = extractColorsFromSvg(sticker.svgContent);
        const colorMap: Record<string, string> = {};
        colors.forEach(color => {
            colorMap[color] = color;
        });

        // Check if this is a glow sticker - add shadow effect for neon glow
        const isGlowSticker = sticker.tags.includes('glow') || sticker.tags.includes('glowing') || sticker.tags.includes('neon');

        // For glow stickers, use second color as glow color (first is frame color)
        // Format: defaultColors[0] = frame color, defaultColors[1] = glow color
        let glowColor = '#0066FF'; // Default blue glow
        if (sticker.defaultColors && sticker.defaultColors.length > 1) {
            glowColor = sticker.defaultColors[1];  // Use second color as glow
        } else if (sticker.defaultColors && sticker.defaultColors.length > 0) {
            glowColor = sticker.defaultColors[0];  // Fallback to first color
        }

        // Debug: log the style with shadow
        const styleWithShadow = {
            fill: null,
            stroke: null,
            strokeWidth: 0,
            opacity: 1,
            shadow: isGlowSticker ? {
                color: glowColor,
                blur: 200,  // Strong blur for prominent neon glow effect
                offsetX: 0,
                offsetY: 0,
            } : null,
            cornerRadius: 0,
        };

        addStickerElement(sticker.id, {
            name: `Graphic (${sticker.name})`,
            stickerId: sticker.id,
            svgContent: sticker.svgContent,
            originalSvgContent: sticker.svgContent,
            colorMap,
            category: sticker.category,
            transform: {
                x: canvasWidth / 2,
                y: canvasHeight / 2,
                width: 300, // Graphics default to larger size
                height: 300,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                skewX: 0,
                skewY: 0,
                originX: 'center',
                originY: 'center',
            },
            style: styleWithShadow,
        });
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {filteredCategories.map(({ category, stickers }) => (
                    <GraphicsCategoryRow
                        key={category}
                        category={category}
                        stickers={stickers}
                        isExpanded={expandedCategories.has(category)}
                        onToggle={() => toggleCategory(category)}
                        onAddSticker={handleAddGraphic}
                    />
                ))}

                {filteredCategories.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Search size={32} strokeWidth={1} />
                        <p className="mt-3 text-sm">No graphics found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
