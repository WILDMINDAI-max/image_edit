'use client';

import { useState, useMemo } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useActivePage } from '@/store/editorStore';
import { Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown, Trash2, Layers, LayoutGrid, Palette } from 'lucide-react';
import { CanvasElement } from '@/types/canvas';
import { PageBackground } from '@/types/project';

type TabType = 'all' | 'overlapping';

// Calculate element bounds considering transform properties
function getElementBounds(element: CanvasElement) {
    const { x, y, width, height, scaleX, scaleY } = element.transform;
    const scaledWidth = width * scaleX;
    const scaledHeight = height * scaleY;

    return {
        left: x - scaledWidth / 2,
        right: x + scaledWidth / 2,
        top: y - scaledHeight / 2,
        bottom: y + scaledHeight / 2,
    };
}

// Check if two elements overlap using AABB collision detection
function checkOverlap(el1: CanvasElement, el2: CanvasElement): boolean {
    const bounds1 = getElementBounds(el1);
    const bounds2 = getElementBounds(el2);

    return !(
        bounds1.right < bounds2.left ||
        bounds1.left > bounds2.right ||
        bounds1.bottom < bounds2.top ||
        bounds1.top > bounds2.bottom
    );
}

// Get all elements that overlap with at least one other element
function getOverlappingElements(elements: CanvasElement[]): CanvasElement[] {
    const overlappingIds = new Set<string>();

    for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
            if (checkOverlap(elements[i], elements[j])) {
                overlappingIds.add(elements[i].id);
                overlappingIds.add(elements[j].id);
            }
        }
    }

    return elements.filter(el => overlappingIds.has(el.id));
}

export function LayersPanel() {
    const [activeTab, setActiveTab] = useState<TabType>('all');

    const activePage = useActivePage();
    const selectedIds = useCanvasStore((state) => state.selectedIds);
    const select = useCanvasStore((state) => state.select);
    const toggleVisibility = useCanvasStore((state) => state.toggleVisibility);
    const lockElement = useCanvasStore((state) => state.lockElement);
    const unlockElement = useCanvasStore((state) => state.unlockElement);
    const bringForward = useCanvasStore((state) => state.bringForward);
    const sendBackward = useCanvasStore((state) => state.sendBackward);
    const removeElement = useCanvasStore((state) => state.removeElement);

    const elements = activePage?.elements || [];

    // Filter out elements that are set as background (they'll show in the background layer)
    const nonBackgroundElements = elements.filter(
        (el) => !(el.type === 'image' && (el as any).isBackground === true)
    );

    const sortedElements = [...nonBackgroundElements].sort((a, b) => b.zIndex - a.zIndex);

    // Calculate overlapping elements (only for non-background elements)
    const overlappingElements = useMemo(() => {
        return getOverlappingElements(nonBackgroundElements);
    }, [nonBackgroundElements]);

    // Get sorted overlapping elements
    const sortedOverlappingElements = useMemo(() => {
        const overlappingIds = new Set(overlappingElements.map(el => el.id));
        return sortedElements.filter(el => overlappingIds.has(el.id));
    }, [sortedElements, overlappingElements]);

    // Select which elements to display based on active tab
    const displayElements = activeTab === 'all' ? sortedElements : sortedOverlappingElements;

    // Get background preview style
    const getBackgroundStyle = (bg: PageBackground): React.CSSProperties => {
        if (bg.type === 'solid') {
            return { backgroundColor: bg.color };
        } else if (bg.type === 'gradient') {
            if (bg.gradientType === 'linear') {
                const stops = bg.colorStops.map(s => `${s.color} ${s.offset * 100}%`).join(', ');
                return { background: `linear-gradient(${bg.angle || 0}deg, ${stops})` };
            } else {
                const stops = bg.colorStops.map(s => `${s.color} ${s.offset * 100}%`).join(', ');
                return { background: `radial-gradient(circle, ${stops})` };
            }
        } else if (bg.type === 'image') {
            return { backgroundImage: `url(${bg.src})`, backgroundSize: 'cover', backgroundPosition: 'center' };
        }
        return { backgroundColor: '#ffffff' };
    };

    // Render background layer item
    const renderBackgroundLayer = () => {
        if (!activePage) return null;

        // Check if any image element is set as background
        const backgroundImage = elements.find(
            (el) => el.type === 'image' && (el as any).isBackground === true
        ) as any;

        const bg = activePage.background;

        // Determine what to show: background image element takes priority
        const hasBackgroundImage = !!backgroundImage;
        const bgStyle = hasBackgroundImage
            ? { backgroundImage: `url(${backgroundImage.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : getBackgroundStyle(bg);

        // Determine the type label and description
        let typeLabel = bg.type.toUpperCase();
        let description = '';

        if (hasBackgroundImage) {
            typeLabel = 'IMAGE';
            description = backgroundImage.name || 'Background image';
        } else if (bg.type === 'solid') {
            description = bg.color;
        } else if (bg.type === 'gradient') {
            description = `${bg.gradientType} gradient`;
        } else if (bg.type === 'image') {
            description = 'Image background';
        }

        return (
            <div
                className="
                    group relative flex items-center gap-3 p-3 rounded-xl cursor-default
                    transition-all duration-150 border bg-gray-50 border-gray-200
                "
            >
                {/* Background indicator - diagonal stripes */}
                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gray-200">
                    <Palette size={12} className="text-gray-500" />
                </div>

                {/* Thumbnail - showing actual background */}
                <div
                    className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 shadow-sm"
                    style={bgStyle}
                >
                    {/* Diagonal stripes overlay for white/transparent backgrounds */}
                    {!hasBackgroundImage && bg.type === 'solid' && bg.color.toLowerCase() === '#ffffff' && (
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{
                                background: 'repeating-linear-gradient(45deg, #e5e5e5, #e5e5e5 2px, transparent 2px, transparent 6px)'
                            }}
                        />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-700 truncate font-medium">
                            Background
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${hasBackgroundImage
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-gray-100 text-gray-500'
                            }`}>
                            {typeLabel}
                        </span>
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                        {description}
                    </div>
                </div>

                {/* Decorative diagonal stripes on the right */}
                <div className="flex items-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" className="text-gray-300">
                        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
                            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                        <rect width="20" height="20" fill="url(#diagonalHatch)" />
                    </svg>
                </div>
            </div>
        );
    };

    // Get element type badge
    const getTypeBadge = (type: string) => {
        const badges: Record<string, { label: string; color: string }> = {
            image: { label: 'IMG', color: 'bg-emerald-100 text-emerald-600' },
            text: { label: 'TXT', color: 'bg-blue-100 text-blue-600' },
            shape: { label: 'SHP', color: 'bg-orange-100 text-orange-600' },
            svg: { label: 'SVG', color: 'bg-pink-100 text-pink-600' },
        };
        const badge = badges[type] || { label: 'ELM', color: 'bg-gray-100 text-gray-600' };
        return (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    // Render a single layer item
    const renderLayerItem = (element: CanvasElement, index: number) => {
        const isSelected = selectedIds.includes(element.id);

        return (
            <div
                key={element.id}
                onClick={() => select(element.id)}
                className={`
                    group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer
                    transition-all duration-150 border
                    ${isSelected
                        ? 'bg-gradient-to-r from-violet-50 to-blue-50 border-violet-300 shadow-sm'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'}
                `}
            >
                {/* Layer Number */}
                <div className={`
                    w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold
                    ${isSelected ? 'bg-violet-200 text-violet-700' : 'bg-gray-200 text-gray-500'}
                `}>
                    {sortedElements.length - index}
                </div>

                {/* Thumbnail */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0 shadow-sm">
                    {element.type === 'image' ? (
                        <img
                            src={element.src}
                            alt={element.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            {element.type === 'text' && (
                                <span className="text-xl font-bold text-gray-400">Aa</span>
                            )}
                            {element.type === 'shape' && (
                                <div className="w-6 h-6 bg-gradient-to-br from-gray-300 to-gray-400 rounded-sm" />
                            )}
                            {element.type === 'svg' && (
                                <Layers size={20} className="text-gray-400" />
                            )}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-700 truncate font-medium">
                            {element.name || `Layer ${sortedElements.length - index}`}
                        </span>
                        {getTypeBadge(element.type)}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                        {Math.round(element.transform.width)} × {Math.round(element.transform.height)}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleVisibility(element.id);
                        }}
                        className={`
                            p-1.5 rounded-lg transition-colors
                            ${element.visible
                                ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'}
                        `}
                        title={element.visible ? 'Hide' : 'Show'}
                    >
                        {element.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            element.locked ? unlockElement(element.id) : lockElement(element.id);
                        }}
                        className={`
                            p-1.5 rounded-lg transition-colors
                            ${element.locked
                                ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}
                        `}
                        title={element.locked ? 'Unlock' : 'Lock'}
                    >
                        {element.locked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-violet-400 to-blue-400 rounded-r-full" />
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 pb-2">
                <h2 className="text-lg font-semibold text-gray-800">Layers</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                    {displayElements.length} {displayElements.length === 1 ? 'layer' : 'layers'}
                </p>
            </div>

            {/* Tab Switcher */}
            <div className="px-4 pb-3">
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                            transition-colors whitespace-nowrap
                            ${activeTab === 'all'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                    >
                        <LayoutGrid size={12} />
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('overlapping')}
                        className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                            transition-colors whitespace-nowrap
                            ${activeTab === 'overlapping'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                    >
                        <Layers size={12} />
                        Stacked
                        {overlappingElements.length > 0 && activeTab !== 'overlapping' && (
                            <span className="flex items-center justify-center w-4 h-4 text-[10px] bg-violet-500 text-white rounded-full ml-0.5">
                                {overlappingElements.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Layers List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                {displayElements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                            <Layers size={24} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">
                            {activeTab === 'all' ? 'No layers yet' : 'No stacked layers'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {activeTab === 'all'
                                ? 'Add elements to your canvas'
                                : 'Move elements to overlap'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {displayElements.map((element, index) => renderLayerItem(element, index))}
                    </div>
                )}

                {/* Background Layer - Always shown at bottom in 'all' tab */}
                {activeTab === 'all' && activePage && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        {renderBackgroundLayer()}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            {selectedIds.length > 0 && (() => {
                // Find the selected element's position in sorted elements
                const selectedElement = sortedElements.find(el => el.id === selectedIds[0]);
                const selectedIndex = sortedElements.findIndex(el => el.id === selectedIds[0]);

                // Disable up if at top (index 0), disable down if at bottom (last index)
                const isAtTop = selectedIndex === 0;
                const isAtBottom = selectedIndex === sortedElements.length - 1;

                return (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => bringForward(selectedIds[0])}
                                disabled={isAtTop}
                                className={`flex items-center justify-center py-2 px-4 border rounded-lg transition-colors ${isAtTop
                                    ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                                    : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-600'
                                    }`}
                                title="Bring Forward"
                            >
                                <ChevronUp size={16} />
                            </button>
                            <button
                                onClick={() => sendBackward(selectedIds[0])}
                                disabled={isAtBottom}
                                className={`flex items-center justify-center py-2 px-4 border rounded-lg transition-colors ${isAtBottom
                                    ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                                    : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-600'
                                    }`}
                                title="Send Backward"
                            >
                                <ChevronDown size={16} />
                            </button>
                            <button
                                onClick={() => removeElement(selectedIds)}
                                className="flex items-center justify-center py-2 px-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-500 transition-colors"
                                title="Delete Layer"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
