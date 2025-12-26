'use client';

import { useState, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useEditorStore } from '@/store/editorStore';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { SHAPE_CATALOG, getShapeCategories, CATEGORY_LABELS, ShapeDefinition, ShapeCategory } from '@/types/shapes';

/**
 * Generate star polygon points string using the same algorithm as FabricCanvas.generateStarPoints
 * This ensures sidebar icons match the canvas rendering exactly.
 * 
 * @param numPoints - Number of star points
 * @param innerRadiusRatio - Inner radius as ratio of outer radius (0-1)
 * @param size - Total size of the viewBox (default 100)
 */
function generateStarPointsString(numPoints: number, innerRadiusRatio: number, size: number = 100): string {
    const center = size / 2;
    const outerRadius = (size / 2) - 5; // Leave small margin
    const innerRadius = outerRadius * innerRadiusRatio;
    const angle = Math.PI / numPoints;

    const points: string[] = [];
    for (let i = 0; i < 2 * numPoints; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = center + radius * Math.cos(i * angle - Math.PI / 2);
        const y = center + radius * Math.sin(i * angle - Math.PI / 2);
        points.push(`${Math.round(x)},${Math.round(y)}`);
    }

    return points.join(' ');
}

// SVG preview component for shapes
function ShapePreview({ shape }: { shape: ShapeDefinition }) {
    // For lines category, use stroke rendering with proper end caps
    if (shape.category === 'lines' && shape.svgPath) {
        const isDashed = shape.lineStyle?.dashPattern === 'dashed';
        const isLongDashed = (shape.lineStyle?.dashPattern as any) === 'long-dashed';
        const isDotted = shape.lineStyle?.dashPattern === 'dotted';
        const dashArray = isDashed ? '8,4' : isLongDashed ? '16,8' : isDotted ? '2,4' : undefined;
        const strokeLinecap = isDotted ? 'round' : 'butt';

        const startCap = shape.lineStyle?.startCap || 'none';
        const endCap = shape.lineStyle?.endCap || 'none';
        const isFilled = shape.lineStyle?.capFill === 'filled';

        // Helper function to draw decorations
        const renderDecoration = (type: string, x: number, y: number, rotation: number) => {
            const size = 8;
            const key = `${type}-${x}-${y}`;

            switch (type) {
                case 'arrow':
                    return (
                        <g key={key} transform={`translate(${x},${y}) rotate(${rotation})`}>
                            <polygon
                                points={`${size},0 ${-size * 0.6},${-size * 0.7} ${-size * 0.6},${size * 0.7}`}
                                fill={isFilled ? 'currentColor' : 'none'}
                                stroke={isFilled ? 'none' : 'currentColor'}
                                strokeWidth="2"
                            />
                        </g>
                    );
                case 'bar':
                    return (
                        <g key={key} transform={`translate(${x},${y}) rotate(${rotation})`}>
                            <line x1="0" y1={-size} x2="0" y2={size} stroke="currentColor" strokeWidth="2" />
                        </g>
                    );
                case 'circle':
                    return (
                        <circle
                            key={key}
                            cx={x} cy={y} r={size * 0.5}
                            fill={isFilled ? 'currentColor' : 'none'}
                            stroke={isFilled ? 'none' : 'currentColor'}
                            strokeWidth="2"
                        />
                    );
                case 'square':
                    return (
                        <rect
                            key={key}
                            x={x - size * 0.5} y={y - size * 0.5}
                            width={size} height={size}
                            fill={isFilled ? 'currentColor' : 'none'}
                            stroke={isFilled ? 'none' : 'currentColor'}
                            strokeWidth="2"
                        />
                    );
                case 'diamond':
                    return (
                        <g key={key} transform={`translate(${x},${y}) rotate(45)`}>
                            <rect
                                x={-size * 0.4} y={-size * 0.4}
                                width={size * 0.8} height={size * 0.8}
                                fill={isFilled ? 'currentColor' : 'none'}
                                stroke={isFilled ? 'none' : 'currentColor'}
                                strokeWidth="2"
                            />
                        </g>
                    );
                default:
                    return null;
            }
        };

        return (
            <svg viewBox="0 0 100 100" className="w-16 h-16">
                {/* Main line */}
                <line
                    x1="20" y1="50" x2="80" y2="50"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={dashArray}
                    strokeLinecap={strokeLinecap as any}
                />
                {/* Start decoration */}
                {startCap !== 'none' && renderDecoration(startCap, 20, 50, 180)}
                {/* End decoration */}
                {endCap !== 'none' && renderDecoration(endCap, 80, 50, 0)}
            </svg>
        );
    }

    // For parametric shapes, show simple icons
    const getParametricIcon = () => {
        switch (shape.id) {
            // Basic shapes - new IDs
            case 'square':
            case 'rectangle':
                return <rect x="20" y="20" width="60" height="60" rx="0" fill="currentColor" />;
            case 'rounded-square':
            case 'rounded-rectangle':
                return <rect x="20" y="20" width="60" height="60" rx="12" fill="currentColor" />;
            case 'circle':
                return <circle cx="50" cy="50" r="30" fill="currentColor" />;
            case 'triangle-up':
            case 'triangle':
                return <polygon points="50,15 85,85 15,85" fill="currentColor" />;
            case 'pentagon':
                return <polygon points="50,15 90,40 75,85 25,85 10,40" fill="currentColor" />;
            case 'hexagon':
                return <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="currentColor" />;
            case 'hexagon-horizontal':
                return <polygon points="5,50 25,10 75,10 95,50 75,90 25,90" fill="currentColor" />;
            case 'heptagon':
                return <polygon points="50,10 85,25 95,60 75,90 25,90 5,60 15,25" fill="currentColor" />;
            case 'octagon':
                return <polygon points="35,10 65,10 90,35 90,65 65,90 35,90 10,65 10,35" fill="currentColor" />;
            case 'octagon-chamfered':
                return <polygon points="25,5 75,5 95,25 95,75 75,95 25,95 5,75 5,25" fill="currentColor" />;
            case 'nonagon':
                // 9-sided polygon
                return <polygon points="50,10 76,19 89,43 85,70 64,88 36,88 15,70 11,43 24,19" fill="currentColor" />;
            case 'decagon':
                // 10-sided polygon
                return <polygon points="50,10 74,18 88,38 88,62 74,82 50,90 26,82 12,62 12,38 26,18" fill="currentColor" />;
            case 'diamond':
                return <polygon points="50,10 90,50 50,90 10,50" fill="currentColor" />;
            // STARS - Using dynamic generation to match canvas exactly
            // The ratios match FabricCanvas.addShape: star-5=0.4, star-4=0.4, star-6=0.5, star-8=0.5, star-12=0.6, burst=0.7
            case 'star':
            case 'star-5':
                return <polygon points={generateStarPointsString(5, 0.4)} fill="currentColor" />;
            case 'star-4':
                return <polygon points={generateStarPointsString(4, 0.4)} fill="currentColor" />;
            case 'star-6':
                return <polygon points={generateStarPointsString(6, 0.5)} fill="currentColor" />;
            case 'star-8':
                return <polygon points={generateStarPointsString(8, 0.5)} fill="currentColor" />;
            case 'star-12':
                return <polygon points={generateStarPointsString(12, 0.6)} fill="currentColor" />;
            case 'burst':
                return <polygon points={generateStarPointsString(16, 0.7)} fill="currentColor" />;
            case 'star-12-sharp':
                return <polygon points={generateStarPointsString(12, 0.7)} fill="currentColor" />;
            case 'starburst-12':
                return <polygon points={generateStarPointsString(12, 0.5)} fill="currentColor" />;
            case 'starburst-16':
                return <polygon points={generateStarPointsString(16, 0.8)} fill="currentColor" />;
            case 'starburst-24':
                return <polygon points={generateStarPointsString(24, 0.85)} fill="currentColor" />;
            case 'star-9-sharp':
                return <polygon points={generateStarPointsString(9, 0.4)} fill="currentColor" />;
            case 'star-10-thin':
                return <polygon points={generateStarPointsString(10, 0.3)} fill="currentColor" />;
            case 'seal-24':
                return <polygon points={generateStarPointsString(24, 0.9)} fill="currentColor" />;
            case 'line':
                return <line x1="15" y1="50" x2="85" y2="50" stroke="currentColor" strokeWidth="4" />;
            default:
                return null;
        }
    };

    return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
            {shape.type === 'svg' && shape.svgPath ? (
                <path d={shape.svgPath} fill="currentColor" />
            ) : (
                getParametricIcon()
            )}
        </svg>
    );
}

// Category row component with horizontal scroll
function CategoryRow({
    category,
    shapes,
    isExpanded,
    onToggle,
    onAddShape
}: {
    category: ShapeCategory;
    shapes: ShapeDefinition[];
    isExpanded: boolean;
    onToggle: () => void;
    onAddShape: (shapeId: string, svgPath?: string) => void;
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
                        {CATEGORY_LABELS[category]} ({shapes.length})
                    </h3>
                </button>
                {/* Right scroll arrow - only show when collapsed and has more than 4 shapes */}
                {!isExpanded && shapes.length > 4 && (
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
                    {shapes.map((shape) => (
                        <button
                            key={shape.id}
                            onClick={() => onAddShape(shape.id, shape.svgPath)}
                            className="flex-shrink-0 w-16 h-16 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-200 flex items-center justify-center text-gray-700 hover:text-blue-600"
                            title={shape.name}
                        >
                            <ShapePreview shape={shape} />
                        </button>
                    ))}
                </div>
            )}

            {/* Expanded: Full Grid */}
            {isExpanded && (
                <div className="grid grid-cols-4 gap-2">
                    {shapes.map((shape) => (
                        <button
                            key={shape.id}
                            onClick={() => onAddShape(shape.id, shape.svgPath)}
                            className="w-16 h-16 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-200 flex items-center justify-center text-gray-700 hover:text-blue-600"
                            title={shape.name}
                        >
                            <ShapePreview shape={shape} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function ElementsPanel({ searchQuery: externalSearchQuery }: { searchQuery?: string } = {}) {
    const addShapeElement = useCanvasStore((state) => state.addShapeElement);
    const addLineElement = useCanvasStore((state) => state.addLineElement);
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<ShapeCategory>>(
        new Set()
    );

    // Use external search query if provided, otherwise use internal
    const searchQuery = externalSearchQuery ?? internalSearchQuery;
    const showHeader = externalSearchQuery === undefined;

    const handleAddShape = (shapeId: string, svgPath?: string) => {
        // Get canvas dimensions to center the shape
        const project = useEditorStore.getState().project;
        const activePage = project?.pages.find(p => p.id === project.activePageId);
        const canvasWidth = activePage?.width || 1080;
        const canvasHeight = activePage?.height || 1080;

        // Check if this is a line shape
        const shapeDef = SHAPE_CATALOG.find(s => s.id === shapeId);
        if (shapeDef?.category === 'lines' && shapeDef.lineStyle) {
            // Construct complete LineStyle with defaults
            const lineStyle = {
                dashPattern: shapeDef.lineStyle.dashPattern || 'solid',
                startCap: shapeDef.lineStyle.startCap || 'none',
                endCap: shapeDef.lineStyle.endCap || 'none',
                capFill: shapeDef.lineStyle.capFill || 'filled',
            } as const;

            // Use addLineElement for proper line handling with endpoint controls
            addLineElement(lineStyle, {
                x1: canvasWidth / 2 - 100,
                y1: canvasHeight / 2,
                x2: canvasWidth / 2 + 100,
                y2: canvasHeight / 2,
                strokeColor: '#1a1a1a',
                strokeWidth: 4,
            });
            return;
        }

        // Regular shapes
        addShapeElement(shapeId, {
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
            svgPath: svgPath,
        });
    };

    const toggleCategory = (category: ShapeCategory) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    // Filter shapes by search query
    const filteredShapes = searchQuery
        ? SHAPE_CATALOG.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : SHAPE_CATALOG;

    // Group by category
    const shapesByCategory = getShapeCategories().map(({ category, shapes }) => ({
        category,
        shapes: shapes.filter(s => filteredShapes.includes(s)),
    })).filter(g => g.shapes.length > 0);

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header - only show when not embedded in AssetsPanel */}
            {showHeader && (
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-gray-800 font-semibold text-lg">Shapes</h2>
                    <div className="mt-3 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search shapes..."
                            value={internalSearchQuery}
                            onChange={(e) => setInternalSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                        />
                    </div>
                </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {shapesByCategory.map(({ category, shapes }) => (
                    <CategoryRow
                        key={category}
                        category={category}
                        shapes={shapes}
                        isExpanded={expandedCategories.has(category)}
                        onToggle={() => toggleCategory(category)}
                        onAddShape={handleAddShape}
                    />
                ))}

                {/* Empty state */}
                {filteredShapes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Search size={32} strokeWidth={1} />
                        <p className="mt-3 text-sm">No shapes found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
