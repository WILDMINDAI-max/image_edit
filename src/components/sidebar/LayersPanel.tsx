'use client';

import { useState, useMemo } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useActivePage } from '@/store/editorStore';
import { Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown, Trash2, Layers, LayoutGrid, Palette, Group, Copy } from 'lucide-react';
import { CanvasElement, BlendMode } from '@/types/canvas';
import { PageBackground } from '@/types/project';
import { BlendModeSelector } from './BlendModeSelector';

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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const updateElement = useCanvasStore((state) => state.updateElement);

    const activePage = useActivePage();
    const selectedIds = useCanvasStore((state) => state.selectedIds);
    const select = useCanvasStore((state) => state.select);
    const toggleVisibility = useCanvasStore((state) => state.toggleVisibility);
    const lockElement = useCanvasStore((state) => state.lockElement);
    const unlockElement = useCanvasStore((state) => state.unlockElement);
    const bringForward = useCanvasStore((state) => state.bringForward);
    const sendBackward = useCanvasStore((state) => state.sendBackward);
    const removeElement = useCanvasStore((state) => state.removeElement);
    const updateBlendMode = useCanvasStore((state) => state.updateBlendMode);
    const groupElements = useCanvasStore((state) => state.groupElements);
    const duplicateElements = useCanvasStore((state) => state.duplicateElements);

    // ... (keep existing filtering/sorting logic items 68-87)

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

    // ... (keep getBackgroundStyle and renderBackgroundLayer items 91-198)
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
                {/* Background indicator */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-200">
                    <Palette size={14} className="text-gray-500" />
                </div>

                {/* Thumbnail */}
                <div
                    className="relative w-8 h-8 rounded-md overflow-hidden border border-gray-200 flex-shrink-0 shadow-sm"
                    style={bgStyle}
                >
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
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-700 truncate font-medium">
                            Background
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${hasBackgroundImage
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-gray-100 text-gray-500'
                            }`}>
                            {typeLabel}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    // ... (keep getTypeBadge)
    const getTypeBadge = (type: string) => {
        const badges: Record<string, { label: string; color: string }> = {
            image: { label: 'IMG', color: 'bg-emerald-100 text-emerald-600' },
            text: { label: 'TXT', color: 'bg-blue-100 text-blue-600' },
            shape: { label: 'SHP', color: 'bg-orange-100 text-orange-600' },
            svg: { label: 'SVG', color: 'bg-pink-100 text-pink-600' },
            line: { label: 'LINE', color: 'bg-slate-100 text-slate-600' },
        };
        const badge = badges[type] || { label: 'ELM', color: 'bg-gray-100 text-gray-600' };
        return (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    // Handle renaming
    const startEditing = (element: CanvasElement) => {
        setEditingId(element.id);
        setEditingName(element.name || `Layer ${sortedElements.findIndex(e => e.id === element.id) + 1}`);
    };

    const saveName = () => {
        if (editingId && editingName.trim()) {
            updateElement(editingId, { name: editingName.trim() });
        }
        setEditingId(null);
        setEditingName('');
    };

    // Render a single layer item
    const renderLayerItem = (element: CanvasElement, index: number) => {
        const isSelected = selectedIds.includes(element.id);
        const isEditing = editingId === element.id;

        return (
            <div
                key={element.id}
                onClick={(e) => {
                    if (isEditing) return;
                    // Ctrl/Cmd+Click adds to selection, normal click replaces selection
                    const addToSelection = e.ctrlKey || e.metaKey;
                    select(element.id, addToSelection);
                }}
                className={`
                    group relative flex items-center gap-3 p-2.5 rounded-xl cursor-pointer
                    transition-all duration-150 border
                    ${isSelected
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}
                `}
            >
                {/* Thumbnail */}
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                    {element.type === 'image' ? (
                        <img
                            src={element.src}
                            alt={element.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center text-gray-400">
                            {element.type === 'text' && <span className="text-lg font-bold">Aa</span>}
                            {element.type === 'shape' && <div className="w-5 h-5 bg-gray-300 rounded-sm" />}
                            {element.type === 'svg' && <Layers size={18} />}
                            {element.type === 'line' && <div className="w-6 h-0.5 bg-gray-300 transform -rotate-45" />}
                        </div>
                    )}

                    {/* Status Icons Overlay */}
                    <div className="absolute bottom-0 right-0 flex p-0.5 gap-0.5">
                        {!element.visible && (
                            <div className="bg-gray-800/75 rounded p-0.5 text-white">
                                <EyeOff size={8} />
                            </div>
                        )}
                        {element.locked && (
                            <div className="bg-amber-500/90 rounded p-0.5 text-white">
                                <Lock size={8} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center h-10">
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={saveName}
                                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 bg-white border border-blue-300 rounded px-1.5 py-0.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                        ) : (
                            <span
                                className="text-sm text-gray-700 truncate font-medium select-none"
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(element);
                                }}
                            >
                                {element.name || `Layer ${sortedElements.length - index}`}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                        {getTypeBadge(element.type)}
                        <span className="text-[10px] text-gray-400 font-mono">
                            {Math.round(element.transform.width)}×{Math.round(element.transform.height)}
                        </span>
                    </div>
                </div>

                {/* Visibility Toggle */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(element.id);
                    }}
                    className={`
                        p-1.5 rounded-md transition-all flex-shrink-0
                        ${element.visible
                            ? 'text-gray-300 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100'
                            : 'text-gray-600 bg-gray-100 opacity-100'}
                    `}
                    title={element.visible ? "Hide Layer" : "Show Layer"}
                >
                    {element.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>

                {/* Selected Indicator - Blue Dot */}
                {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-200" />
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-slate-50/50">
            {/* Header */}
            <div className="p-4 pb-2 bg-white border-b border-gray-100">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-semibold text-gray-800">Layers</h2>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                        {displayElements.length}
                    </span>
                </div>

                {/* Blend Mode Selector - shows when element is selected */}
                {selectedIds.length > 0 && (() => {
                    const selectedElement = sortedElements.find(el => el.id === selectedIds[0]);
                    if (!selectedElement) return null;
                    return (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500">Blend Mode</span>
                                <BlendModeSelector
                                    value={selectedElement.blendMode || 'normal'}
                                    onChange={(mode: BlendMode) => updateBlendMode(selectedElement.id, mode)}
                                    compact
                                />
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Tab Switcher - Cleaner Look */}
            <div className="px-4 py-3 bg-white border-b border-gray-100 shadow-sm z-10">
                <div className="flex p-0.5 bg-gray-100 rounded-lg">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`
                            flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all
                            ${activeTab === 'all'
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'}
                        `}
                    >
                        <LayoutGrid size={12} />
                        All Layers
                    </button>
                    <button
                        onClick={() => setActiveTab('overlapping')}
                        className={`
                            flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all
                            ${activeTab === 'overlapping'
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'}
                        `}
                    >
                        <Layers size={12} />
                        Stacked
                    </button>
                </div>
            </div>

            {/* Layers List */}
            <div className="flex-1 overflow-y-auto px-3 py-3 custom-scrollbar space-y-2">
                {displayElements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Layers size={32} className="text-gray-300 mb-3" />
                        <p className="text-sm font-medium text-gray-500">No layers found</p>
                    </div>
                ) : (
                    displayElements.map((element, index) => renderLayerItem(element, index))
                )}

                {/* Background Layer */}
                {activeTab === 'all' && activePage && (
                    <div className="pt-2">
                        {renderBackgroundLayer()}
                    </div>
                )}
            </div>

            {/* Footer Actions - Expanded */}
            {selectedIds.length > 0 && (() => {
                // Get all selected elements
                const selectedElements = sortedElements.filter(el => selectedIds.includes(el.id));
                if (selectedElements.length === 0) return null;

                // For single selection, check position for reorder buttons
                const isSingleSelection = selectedIds.length === 1;
                const selectedIndex = isSingleSelection ? sortedElements.findIndex(el => el.id === selectedIds[0]) : -1;
                const isAtTop = isSingleSelection && selectedIndex === 0;
                const isAtBottom = isSingleSelection && selectedIndex === sortedElements.length - 1;

                // Check if all selected elements share visibility/lock state
                const allVisible = selectedElements.every(el => el.visible);
                const allHidden = selectedElements.every(el => !el.visible);
                const allLocked = selectedElements.every(el => el.locked);
                const allUnlocked = selectedElements.every(el => !el.locked);

                return (
                    <div className="p-3 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                        {/* Selection count indicator */}
                        {selectedIds.length > 1 && (
                            <div className="mb-2 text-center">
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                    {selectedIds.length} items selected
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between gap-1">
                            {/* Visibility & Lock Group */}
                            <div className="flex items-center gap-0.5 bg-gray-50 p-0.5 rounded-lg border border-gray-100">
                                <button
                                    onClick={() => {
                                        // Toggle visibility for all selected elements
                                        selectedIds.forEach(id => toggleVisibility(id));
                                    }}
                                    className={`p-1.5 rounded-md transition-all ${allHidden
                                        ? 'bg-gray-200 text-gray-600'
                                        : 'hover:bg-white hover:text-blue-600 hover:shadow-sm text-gray-400'}`}
                                    title={allVisible ? "Hide All Selected" : "Show All Selected"}
                                >
                                    {allVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                                </button>
                                <div className="w-px h-3 bg-gray-200" />
                                <button
                                    onClick={() => {
                                        // Toggle lock for all selected elements
                                        if (allLocked) {
                                            selectedIds.forEach(id => unlockElement(id));
                                        } else {
                                            selectedIds.forEach(id => lockElement(id));
                                        }
                                    }}
                                    className={`p-1.5 rounded-md transition-all ${allLocked
                                        ? 'bg-amber-100 text-amber-600'
                                        : 'hover:bg-white hover:text-amber-600 hover:shadow-sm text-gray-400'}`}
                                    title={allLocked ? "Unlock All Selected" : "Lock All Selected"}
                                >
                                    {allLocked ? <Lock size={14} /> : <Unlock size={14} />}
                                </button>
                            </div>

                            {/* Reorder, Group, Duplicate & Delete Group */}
                            <div className="flex items-center gap-0.5 bg-gray-50 p-0.5 rounded-lg border border-gray-100">
                                <button
                                    onClick={() => {
                                        if (isSingleSelection) bringForward(selectedIds[0]);
                                    }}
                                    disabled={!isSingleSelection || isAtTop}
                                    className={`p-1.5 rounded-md transition-all ${!isSingleSelection || isAtTop
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'hover:bg-white hover:text-blue-600 hover:shadow-sm text-gray-500'}`}
                                    title={isSingleSelection ? "Bring Forward" : "Select single item to reorder"}
                                >
                                    <ChevronUp size={14} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (isSingleSelection) sendBackward(selectedIds[0]);
                                    }}
                                    disabled={!isSingleSelection || isAtBottom}
                                    className={`p-1.5 rounded-md transition-all ${!isSingleSelection || isAtBottom
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'hover:bg-white hover:text-blue-600 hover:shadow-sm text-gray-500'}`}
                                    title={isSingleSelection ? "Send Backward" : "Select single item to reorder"}
                                >
                                    <ChevronDown size={14} />
                                </button>
                                <div className="w-px h-3 bg-gray-200" />
                                <button
                                    onClick={() => groupElements(selectedIds)}
                                    disabled={selectedIds.length < 2}
                                    className={`p-1.5 rounded-md transition-all ${selectedIds.length < 2
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'hover:bg-white hover:text-purple-600 hover:shadow-sm text-gray-500'}`}
                                    title={selectedIds.length < 2 ? "Select 2+ items to group" : "Group Selected"}
                                >
                                    <Group size={14} />
                                </button>
                                <button
                                    onClick={() => duplicateElements(selectedIds)}
                                    className="p-1.5 rounded-md hover:bg-white hover:text-green-600 hover:shadow-sm text-gray-400 transition-all"
                                    title={`Duplicate ${selectedIds.length > 1 ? 'All Selected' : 'Layer'}`}
                                >
                                    <Copy size={14} />
                                </button>
                                <div className="w-px h-3 bg-gray-200" />
                                <button
                                    onClick={() => removeElement(selectedIds)}
                                    className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 hover:shadow-sm text-gray-400 transition-all"
                                    title={`Delete ${selectedIds.length > 1 ? 'All Selected' : 'Layer'}`}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
