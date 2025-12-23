'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useActivePage } from '@/store/editorStore';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { TextElement } from '@/types/canvas';
import { X, Search, ChevronRight, Check, Loader2 } from 'lucide-react';
import {
    GOOGLE_FONTS,
    FONT_CATEGORIES,
    FontCategory,
    loadGoogleFont,
    searchFonts,
    getFontVariants,
    getWeightName,
} from '@/services/googleFonts';

interface FontsPanelProps {
    onClose: () => void;
}

// Global set of loaded fonts to persist across re-renders
const globalLoadedFonts = new Set<string>(['Inter', 'Roboto', 'Poppins']);

export function FontsPanel({ onClose }: FontsPanelProps) {
    const selectedIds = useCanvasStore((state) => state.selectedIds);
    const updateElement = useCanvasStore((state) => state.updateElement);
    const activePage = useActivePage();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<FontCategory | null>(null);
    const [expandedFont, setExpandedFont] = useState<string | null>(null);
    const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set(globalLoadedFonts));
    const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set());
    const [recentFonts, setRecentFonts] = useState<string[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Get selected text element
    const selectedElement = useMemo(() => {
        if (selectedIds.length !== 1 || !activePage) return null;
        const element = activePage.elements.find((el) => el.id === selectedIds[0]);
        if (element?.type === 'text') return element as TextElement;
        return null;
    }, [selectedIds, activePage]);

    const currentFontFamily = selectedElement?.textStyle?.fontFamily || 'Inter';
    const currentFontWeight = selectedElement?.textStyle?.fontWeight || 400;

    // Filter fonts based on search and category
    const filteredFonts = useMemo(() => {
        if (searchQuery) {
            return searchFonts(searchQuery, activeCategory || undefined);
        }
        if (activeCategory) {
            return GOOGLE_FONTS.filter(f => f.category === activeCategory);
        }
        return GOOGLE_FONTS;
    }, [searchQuery, activeCategory]);

    // Load a font
    const loadFont = useCallback(async (family: string) => {
        if (globalLoadedFonts.has(family) || loadingFonts.has(family)) return;

        setLoadingFonts(prev => new Set([...prev, family]));

        try {
            await loadGoogleFont(family, ['400']);
            globalLoadedFonts.add(family);
            setLoadedFonts(prev => new Set([...prev, family]));
        } catch (error) {
            console.error('Failed to load font:', family, error);
        } finally {
            setLoadingFonts(prev => {
                const next = new Set(prev);
                next.delete(family);
                return next;
            });
        }
    }, [loadingFonts]);

    // Load initial batch of fonts
    useEffect(() => {
        const loadInitialFonts = async () => {
            const initialFonts = filteredFonts.slice(0, 30);
            for (const font of initialFonts) {
                if (!globalLoadedFonts.has(font.family)) {
                    loadFont(font.family);
                }
            }
        };
        loadInitialFonts();
    }, [filteredFonts, loadFont]);

    // Handle font selection
    const handleSelectFont = async (family: string) => {
        if (!selectedElement) return;

        const font = GOOGLE_FONTS.find(f => f.family === family);
        const variants = font?.variants || ['400'];

        // Load the font with all variants
        await loadGoogleFont(family, variants);
        globalLoadedFonts.add(family);
        setLoadedFonts(prev => new Set([...prev, family]));

        // Update the element
        updateElement(selectedElement.id, {
            textStyle: {
                ...selectedElement.textStyle,
                fontFamily: family,
            },
        });

        // Update Fabric canvas
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(selectedElement.id);
        if (fabricObj && 'fontFamily' in fabricObj) {
            (fabricObj as any).fontFamily = family;
            fabricObj.dirty = true;
            fabricCanvas.getCanvas()?.renderAll();
        }

        // Add to recent fonts
        setRecentFonts(prev => {
            const filtered = prev.filter(f => f !== family);
            return [family, ...filtered].slice(0, 5);
        });
    };

    // Handle weight selection
    const handleSelectWeight = async (weight: string) => {
        if (!selectedElement) return;

        const numWeight = parseInt(weight) || 400;

        updateElement(selectedElement.id, {
            textStyle: {
                ...selectedElement.textStyle,
                fontWeight: numWeight,
            },
        });

        // Update Fabric canvas
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(selectedElement.id);
        if (fabricObj && 'fontWeight' in fabricObj) {
            (fabricObj as any).fontWeight = numWeight;
            fabricObj.dirty = true;
            fabricCanvas.getCanvas()?.renderAll();
        }
    };

    // No text selected state
    if (!selectedElement) {
        return (
            <div className="w-80 h-full flex flex-col bg-white border-l border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-gray-800 font-semibold text-sm">Fonts</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                        <X size={14} className="text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-gray-400 text-sm text-center">
                        Select a text element to change its font
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 h-full flex flex-col bg-white border-l border-gray-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-gray-800 font-semibold text-sm">Fonts</h2>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                    <X size={14} className="text-gray-500" />
                </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-100">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search fonts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Category filters */}
            <div className="px-3 py-2 border-b border-gray-100">
                <div className="flex gap-1.5 overflow-x-auto">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`px-2.5 py-1 text-[10px] font-medium rounded-full whitespace-nowrap transition-colors ${activeCategory === null
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    {FONT_CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-2.5 py-1 text-[10px] font-medium rounded-full whitespace-nowrap transition-colors ${activeCategory === cat.id
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Font list */}
            <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
                {/* Recent fonts section */}
                {recentFonts.length > 0 && !searchQuery && !activeCategory && (
                    <div className="p-3 border-b border-gray-100">
                        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Recently Used
                        </h4>
                        {recentFonts.map((family) => (
                            <FontItem
                                key={`recent-${family}`}
                                family={family}
                                isSelected={currentFontFamily === family}
                                isLoaded={loadedFonts.has(family)}
                                isLoading={loadingFonts.has(family)}
                                isExpanded={expandedFont === family}
                                currentWeight={currentFontWeight}
                                onSelect={() => handleSelectFont(family)}
                                onExpand={() => setExpandedFont(expandedFont === family ? null : family)}
                                onSelectWeight={handleSelectWeight}
                                onLoad={() => loadFont(family)}
                            />
                        ))}
                    </div>
                )}

                {/* All fonts */}
                <div className="p-3">
                    <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        {activeCategory ? FONT_CATEGORIES.find(c => c.id === activeCategory)?.label : 'All Fonts'} ({filteredFonts.length})
                    </h4>
                    {filteredFonts.map((font) => (
                        <FontItem
                            key={font.family}
                            family={font.family}
                            isSelected={currentFontFamily === font.family}
                            isLoaded={loadedFonts.has(font.family)}
                            isLoading={loadingFonts.has(font.family)}
                            isExpanded={expandedFont === font.family}
                            currentWeight={currentFontWeight}
                            onSelect={() => handleSelectFont(font.family)}
                            onExpand={() => setExpandedFont(expandedFont === font.family ? null : font.family)}
                            onSelectWeight={handleSelectWeight}
                            onLoad={() => loadFont(font.family)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Font item component with intersection observer
interface FontItemProps {
    family: string;
    isSelected: boolean;
    isLoaded: boolean;
    isLoading: boolean;
    isExpanded: boolean;
    currentWeight: number | string;
    onSelect: () => void;
    onExpand: () => void;
    onSelectWeight: (weight: string) => void;
    onLoad: () => void;
}

function FontItem({ family, isSelected, isLoaded, isLoading, isExpanded, currentWeight, onSelect, onExpand, onSelectWeight, onLoad }: FontItemProps) {
    const ref = useRef<HTMLDivElement>(null);
    const variants = getFontVariants(family);
    const hasVariants = variants.length > 1;

    // Use intersection observer to load font when visible
    useEffect(() => {
        if (isLoaded || isLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoad();
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [isLoaded, isLoading, onLoad]);

    return (
        <div className="mb-1" ref={ref}>
            <div
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
            >
                {/* Expand button */}
                {hasVariants ? (
                    <button
                        onClick={onExpand}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                        <ChevronRight
                            size={12}
                            className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                    </button>
                ) : (
                    <div className="w-6" />
                )}

                {/* Font name - always show in font family when loaded */}
                <button
                    onClick={onSelect}
                    className="flex-1 text-left"
                    style={isLoaded ? { fontFamily: `"${family}", sans-serif` } : undefined}
                >
                    <span className="text-sm text-gray-800">{family}</span>
                </button>

                {/* Loading indicator */}
                {isLoading && (
                    <Loader2 size={14} className="text-gray-400 animate-spin" />
                )}

                {/* Selected check */}
                {isSelected && !isLoading && (
                    <Check size={14} className="text-blue-500" />
                )}
            </div>

            {/* Variants dropdown */}
            {isExpanded && hasVariants && (
                <div className="ml-6 mt-1 space-y-0.5">
                    {variants.map((variant) => {
                        const weightNum = parseInt(variant);
                        const isWeightSelected = isSelected && Number(currentWeight) === weightNum;

                        return (
                            <button
                                key={variant}
                                onClick={() => {
                                    onSelect();
                                    onSelectWeight(variant);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-xs transition-colors ${isWeightSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                                style={isLoaded ? { fontFamily: `"${family}", sans-serif`, fontWeight: weightNum } : undefined}
                            >
                                <span>{getWeightName(variant)}</span>
                                <span className="text-gray-400">{variant}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

