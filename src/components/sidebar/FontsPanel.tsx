'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useActivePage, useEditorStore } from '@/store/editorStore';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { TextElement } from '@/types/canvas';
import { X, Search, ChevronRight, ChevronDown, Check, Loader2, Monitor, Plus, Trash2, Palette } from 'lucide-react';
import {
    GOOGLE_FONTS,
    FONT_CATEGORIES,
    FontCategory,
    FontTheme,
    FONT_THEME_GROUPS,
    loadGoogleFont,
    searchFonts,
    getFontVariants,
    getWeightName,
    getFontsByTheme,
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
    const [activeTheme, setActiveTheme] = useState<FontTheme | null>(null);
    const [showThemes, setShowThemes] = useState(false);
    const [expandedThemeGroup, setExpandedThemeGroup] = useState<string | null>(null);
    const [expandedFont, setExpandedFont] = useState<string | null>(null);
    const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set(globalLoadedFonts));
    const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set());
    const [recentFonts, setRecentFonts] = useState<string[]>([]);
    const [systemFonts, setSystemFonts] = useState<string[]>([]);
    const [systemFontsLoaded, setSystemFontsLoaded] = useState(false);
    const [loadingSystemFonts, setLoadingSystemFonts] = useState(false);
    const [showSystemFonts, setShowSystemFonts] = useState(false);
    const [customFonts, setCustomFonts] = useState<{ family: string; url: string }[]>([]);
    const fontInputRef = useRef<HTMLInputElement>(null);
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

    // Filter fonts based on search, category, and theme
    const filteredFonts = useMemo(() => {
        // If showing system fonts, filter system fonts instead
        if (showSystemFonts && systemFontsLoaded) {
            if (searchQuery) {
                return systemFonts
                    .filter(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(f => ({ family: f, variants: ['400'], category: 'system' as FontCategory }));
            }
            return systemFonts.map(f => ({ family: f, variants: ['400'], category: 'system' as FontCategory }));
        }

        // Theme-based filtering
        if (activeTheme) {
            const themeFonts = getFontsByTheme(activeTheme);
            if (searchQuery) {
                return themeFonts.filter(f => f.family.toLowerCase().includes(searchQuery.toLowerCase()));
            }
            return themeFonts;
        }

        // Search by font family name AND theme names
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            return GOOGLE_FONTS.filter(font => {
                // Match font family name
                const matchesFamily = font.family.toLowerCase().includes(lowerQuery);
                // Match any theme name
                const matchesTheme = font.themes?.some(theme =>
                    theme.toLowerCase().includes(lowerQuery) ||
                    theme.replace(/-/g, ' ').toLowerCase().includes(lowerQuery)
                );
                const matchesCategory = !activeCategory || font.category === activeCategory;
                return (matchesFamily || matchesTheme) && matchesCategory;
            });
        }
        if (activeCategory) {
            return GOOGLE_FONTS.filter(f => f.category === activeCategory);
        }
        return GOOGLE_FONTS;
    }, [searchQuery, activeCategory, activeTheme, showSystemFonts, systemFontsLoaded, systemFonts]);

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

    // Load system fonts using Local Font Access API
    const loadSystemFonts = async () => {
        if (systemFontsLoaded || loadingSystemFonts) return;

        setLoadingSystemFonts(true);

        try {
            // Check if the Local Font Access API is available
            if (!('queryLocalFonts' in window)) {
                alert('Your browser does not support local font access. Please use Chrome or Edge.');
                setLoadingSystemFonts(false);
                return;
            }

            // Request permission and get fonts
            // @ts-ignore - Local Font Access API is not yet in TypeScript
            const fonts = await window.queryLocalFonts();

            // Get unique font family names
            const fontFamilies = new Set<string>();
            for (const font of fonts) {
                fontFamilies.add(font.family);
            }

            const sortedFonts = Array.from(fontFamilies).sort((a, b) => a.localeCompare(b));
            setSystemFonts(sortedFonts);
            setSystemFontsLoaded(true);
            setShowSystemFonts(true);
            setActiveCategory(null);

            // Mark all system fonts as "loaded" since they're already on the system
            sortedFonts.forEach(f => globalLoadedFonts.add(f));
            setLoadedFonts(new Set(globalLoadedFonts));

            console.log(`[FontsPanel] Loaded ${sortedFonts.length} system fonts`);
        } catch (error) {
            console.error('Failed to load system fonts:', error);
            if ((error as Error).name === 'NotAllowedError') {
                alert('Permission to access local fonts was denied.');
            } else {
                alert('Failed to load system fonts. Please try again.');
            }
        } finally {
            setLoadingSystemFonts(false);
        }
    };

    // Handle custom font file upload
    const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        for (const file of Array.from(files)) {
            const validExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
            const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

            if (!validExtensions.includes(ext)) {
                alert(`Invalid file type: ${file.name}. Please select .ttf, .otf, .woff, or .woff2 files.`);
                continue;
            }

            try {
                // Create a blob URL for the font file
                const fontUrl = URL.createObjectURL(file);

                // Extract font family name from filename (remove extension)
                const fontFamily = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '').replace(/[_-]/g, ' ');

                // Create and load the font
                const fontFace = new FontFace(fontFamily, `url(${fontUrl})`);
                await fontFace.load();

                // Add to document fonts
                document.fonts.add(fontFace);

                // Add to custom fonts list
                setCustomFonts(prev => [...prev, { family: fontFamily, url: fontUrl }]);

                // Mark as loaded
                globalLoadedFonts.add(fontFamily);
                setLoadedFonts(prev => new Set([...prev, fontFamily]));

                console.log(`[FontsPanel] Custom font loaded: ${fontFamily}`);
            } catch (error) {
                console.error(`Failed to load font: ${file.name}`, error);
                alert(`Failed to load font: ${file.name}. Please make sure it's a valid font file.`);
            }
        }

        // Reset the input
        if (fontInputRef.current) {
            fontInputRef.current.value = '';
        }
    };

    // Handle font selection - optionally with a specific weight
    const handleSelectFont = async (family: string, weightToSet?: number) => {
        if (!selectedElement) return;

        const font = GOOGLE_FONTS.find(f => f.family === family);
        const isSystemFont = systemFonts.includes(family);

        // Only load from Google if it's a Google Font (not a system font)
        if (font && !isSystemFont) {
            const variants = font.variants || ['400'];
            try {
                await loadGoogleFont(family, variants);
            } catch (error) {
                console.warn(`[FontsPanel] Could not load Google font ${family}:`, error);
            }
        }

        // Mark as loaded (system fonts are always available)
        globalLoadedFonts.add(family);
        setLoadedFonts(prev => new Set([...prev, family]));

        // Get the current element from the store (fresh data) to avoid stale state issues
        const state = useEditorStore.getState();
        const activePage = state.project?.pages.find((p: { id: string }) => p.id === state.project?.activePageId);
        const currentElement = activePage?.elements.find((el: { id: string }) => el.id === selectedElement.id) as TextElement | undefined;

        if (!currentElement) return;

        // Update the element with fontFamily, and optionally fontWeight if provided
        const newTextStyle = {
            ...currentElement.textStyle,
            fontFamily: family,
            ...(weightToSet !== undefined ? { fontWeight: weightToSet } : {}),
        };

        console.log(`[FontsPanel] handleSelectFont - saving textStyle:`, JSON.stringify(newTextStyle));

        updateElement(selectedElement.id, {
            textStyle: newTextStyle,
        });

        // Update Fabric canvas
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(selectedElement.id);
        if (fabricObj && 'fontFamily' in fabricObj) {
            (fabricObj as any).fontFamily = family;
            if (weightToSet !== undefined) {
                (fabricObj as any).fontWeight = weightToSet;
            }
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

        console.log(`[FontsPanel] handleSelectWeight called with weight: ${weight}, numWeight: ${numWeight}`);
        console.log(`[FontsPanel] Current selectedElement.textStyle:`, JSON.stringify(selectedElement.textStyle));

        const newTextStyle = {
            ...selectedElement.textStyle,
            fontWeight: numWeight,
        };

        console.log(`[FontsPanel] New textStyle to save:`, JSON.stringify(newTextStyle));

        updateElement(selectedElement.id, {
            textStyle: newTextStyle,
        });

        // Update Fabric canvas
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(selectedElement.id);
        if (fabricObj && 'fontWeight' in fabricObj) {
            console.log(`[FontsPanel] Updating Fabric object fontWeight to: ${numWeight}`);
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
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search fonts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    {/* Add Font Icon */}
                    <button
                        onClick={() => fontInputRef.current?.click()}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center"
                        title="Add custom font from your computer"
                    >
                        <Plus size={18} className="text-green-500 hover:text-green-600" />
                    </button>
                    <input
                        ref={fontInputRef}
                        type="file"
                        accept=".ttf,.otf,.woff,.woff2"
                        multiple
                        onChange={handleFontUpload}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Category filters */}
            <div className="px-3 py-2 border-b border-gray-100">
                <div className="flex gap-1.5 overflow-x-auto custom-scrollbar">
                    {/* System Fonts - First */}
                    <button
                        onClick={() => {
                            if (!systemFontsLoaded) {
                                loadSystemFonts();
                            } else {
                                setShowSystemFonts(true);
                                setActiveCategory(null);
                                setActiveTheme(null);
                                setShowThemes(false);
                                setExpandedThemeGroup(null);
                            }
                        }}
                        disabled={loadingSystemFonts}
                        className={`px-2.5 py-1 text-[10px] font-medium rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${showSystemFonts
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {loadingSystemFonts ? (
                            <Loader2 size={10} className="animate-spin" />
                        ) : (
                            <Monitor size={10} />
                        )}
                        System
                    </button>
                    <button
                        onClick={() => { setActiveCategory(null); setShowSystemFonts(false); setActiveTheme(null); setShowThemes(false); setExpandedThemeGroup(null); }}
                        className={`px-2.5 py-1 text-[10px] font-medium rounded-full whitespace-nowrap transition-colors ${activeCategory === null && !showSystemFonts && !activeTheme && !expandedThemeGroup
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    {FONT_CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); setShowSystemFonts(false); setActiveTheme(null); setShowThemes(false); setExpandedThemeGroup(null); }}
                            className={`px-2.5 py-1 text-[10px] font-medium rounded-full whitespace-nowrap transition-colors ${activeCategory === cat.id && !showSystemFonts
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                    {/* Separator */}
                    <div className="w-px bg-gray-300 mx-1 my-0.5" />
                    {/* Theme Groups as scrollable buttons */}
                    {FONT_THEME_GROUPS.map((group) => (
                        <button
                            key={group.id}
                            onClick={() => {
                                setExpandedThemeGroup(expandedThemeGroup === group.id ? null : group.id);
                                setActiveCategory(null);
                                setShowSystemFonts(false);
                                setActiveTheme(null);
                                setShowThemes(false);
                            }}
                            className={`px-2.5 py-1 text-[10px] font-medium rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${expandedThemeGroup === group.id
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <span>{group.icon}</span>
                            {group.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Theme sub-items panel - shows when a theme group is selected */}
            {expandedThemeGroup && (
                <div className="px-3 py-2 border-b border-gray-100 bg-white">
                    <div className="flex flex-wrap gap-1.5">
                        {FONT_THEME_GROUPS.find(g => g.id === expandedThemeGroup)?.themes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => { setActiveTheme(theme.id); }}
                                className={`px-2.5 py-1 text-[10px] font-medium rounded-full whitespace-nowrap transition-colors ${activeTheme === theme.id
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-white text-gray-600 hover:bg-blue-50 border border-blue-200'
                                    }`}
                            >
                                {theme.label}
                            </button>
                        ))}
                    </div>
                    {activeTheme && (
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] text-blue-600 font-medium">
                                Showing fonts for: {FONT_THEME_GROUPS.flatMap(g => g.themes).find(t => t.id === activeTheme)?.label}
                            </span>
                            <button
                                onClick={() => setActiveTheme(null)}
                                className="text-blue-400 hover:text-blue-600"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Font list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar" ref={scrollContainerRef}>
                {/* Upload Fonts section */}
                {customFonts.length > 0 && !searchQuery && !showSystemFonts && (
                    <div className="p-3 border-b border-gray-100">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Upload Fonts
                        </h4>
                        {customFonts.map((font) => (
                            <div
                                key={`custom-${font.family}`}
                                className="flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded-md cursor-pointer group"
                            >
                                <button
                                    onClick={() => handleSelectFont(font.family)}
                                    className={`flex-1 text-left text-lg transition-colors ${currentFontFamily === font.family
                                        ? 'text-blue-600'
                                        : 'text-gray-700'
                                        }`}
                                    style={{ fontFamily: `"${font.family}", sans-serif` }}
                                >
                                    {font.family}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCustomFonts(prev => prev.filter(f => f.family !== font.family));
                                        globalLoadedFonts.delete(font.family);
                                        setLoadedFonts(prev => {
                                            const next = new Set(prev);
                                            next.delete(font.family);
                                            return next;
                                        });
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remove font"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recent fonts section */}
                {recentFonts.length > 0 && !searchQuery && !activeCategory && !showSystemFonts && (
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
                                onSelectWithWeight={(weight) => handleSelectFont(family, weight)}
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
                        {activeTheme
                            ? FONT_THEME_GROUPS.flatMap(g => g.themes).find(t => t.id === activeTheme)?.label
                            : activeCategory
                                ? FONT_CATEGORIES.find(c => c.id === activeCategory)?.label
                                : 'All Fonts'} ({filteredFonts.length})
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
                            onSelectWithWeight={(weight) => handleSelectFont(font.family, weight)}
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
    onSelectWithWeight: (weight: number) => void;  // For selecting font with specific weight
    onExpand: () => void;
    onSelectWeight: (weight: string) => void;
    onLoad: () => void;
}

function FontItem({ family, isSelected, isLoaded, isLoading, isExpanded, currentWeight, onSelect, onSelectWithWeight, onExpand, onSelectWeight, onLoad }: FontItemProps) {
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
                                    // Only call onSelectWithWeight - it handles both font and weight atomically
                                    onSelectWithWeight(weightNum);
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

