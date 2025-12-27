'use client';

import { useState } from 'react';
import { Search, ArrowLeft, ChevronRight } from 'lucide-react';
import { ElementsPanel } from './ElementsPanel';
import { IconsPanel } from './IconsPanel';
import { StickersPanel } from './StickersPanel';

type AssetCategory = 'main' | 'shapes' | 'graphics' | 'stickers' | 'icons';

// Category card data
const CATEGORIES = [
    {
        id: 'shapes' as const,
        name: 'Shapes',
        description: 'Basic shapes, polygons, arrows & more',
        bgColor: 'bg-cyan-100',
        iconBg: 'bg-cyan-200',
        preview: (
            <svg viewBox="0 0 80 80" className="w-16 h-16">
                {/* Pentagon */}
                <polygon points="40,8 72,30 60,68 20,68 8,30" fill="#5BA8A0" />
                {/* Triangle */}
                <polygon points="35,45 65,75 5,75" fill="#E879A9" />
            </svg>
        ),
    },
    {
        id: 'graphics' as const,
        name: 'Graphics',
        description: 'Illustrations, icons & decorations',
        bgColor: 'bg-amber-100',
        iconBg: 'bg-amber-200',
        preview: (
            <svg viewBox="0 0 80 80" className="w-16 h-16">
                {/* Sunflower */}
                <circle cx="40" cy="40" r="15" fill="#8B4513" />
                {/* Petals */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                    <ellipse
                        key={i}
                        cx="40"
                        cy="15"
                        rx="8"
                        ry="15"
                        fill="#FFD700"
                        transform={`rotate(${angle} 40 40)`}
                    />
                ))}
                <circle cx="40" cy="40" r="12" fill="#654321" />
            </svg>
        ),
    },
    {
        id: 'stickers' as const,
        name: 'Stickers',
        description: 'Fun stickers & emoji graphics',
        bgColor: 'bg-green-100',
        iconBg: 'bg-green-200',
        preview: (
            <svg viewBox="0 0 80 80" className="w-16 h-16">
                {/* Smiley face */}
                <circle cx="40" cy="40" r="30" fill="#FFE135" />
                <circle cx="30" cy="35" r="4" fill="#333" />
                <circle cx="50" cy="35" r="4" fill="#333" />
                <path d="M 25 50 Q 40 65 55 50" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 'icons' as const,
        name: 'Icons',
        description: 'UI icons, symbols & pictograms',
        bgColor: 'bg-violet-100',
        iconBg: 'bg-violet-200',
        preview: (
            <svg viewBox="0 0 80 80" className="w-16 h-16">
                {/* Home icon */}
                <path d="M40 12 L70 38 L70 68 L50 68 L50 48 L30 48 L30 68 L10 68 L10 38 Z" fill="#7C3AED" />
                {/* Heart icon overlaid */}
                <path d="M55 30 C55 22 65 22 65 30 C65 38 55 46 55 46 C55 46 45 38 45 30 C45 22 55 22 55 30 Z" fill="#EC4899" />
                {/* Star accent */}
                <polygon points="22,18 24,24 30,24 25,28 27,34 22,30 17,34 19,28 14,24 20,24" fill="#FCD34D" />
            </svg>
        ),
    },
];

export function AssetsPanel() {
    const [activeCategory, setActiveCategory] = useState<AssetCategory>('main');
    const [searchQuery, setSearchQuery] = useState('');

    if (activeCategory === 'shapes') {
        return (
            <div className="h-full flex flex-col bg-white">
                {/* Header with back arrow */}
                <div className="p-4 border-b border-gray-100">
                    <button
                        onClick={() => setActiveCategory('main')}
                        className="flex items-center gap-2 text-gray-800 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <h2 className="font-semibold text-lg">Shapes</h2>
                    </button>
                    {/* Search bar */}
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
                {/* Shapes content from ElementsPanel */}
                <div className="flex-1 overflow-hidden">
                    <ElementsPanel searchQuery={searchQuery} />
                </div>
            </div>
        );
    }

    // Graphics category - coming soon
    if (activeCategory === 'graphics') {
        return (
            <div className="h-full flex flex-col bg-white">
                <div className="p-4 border-b border-gray-100">
                    <button
                        onClick={() => setActiveCategory('main')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-3"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm font-medium">Back to Assets</span>
                    </button>
                    <h2 className="text-gray-800 font-semibold text-lg">Graphics</h2>
                </div>
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-8 h-8 text-amber-600" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                            </svg>
                        </div>
                        <h3 className="text-gray-700 font-semibold mb-2">Coming Soon</h3>
                        <p className="text-gray-500 text-sm">Graphics library will be available soon</p>
                    </div>
                </div>
            </div>
        );
    }

    // Stickers category - full panel
    if (activeCategory === 'stickers') {
        return (
            <div className="h-full flex flex-col bg-white">
                {/* Header with back arrow */}
                <div className="p-4 border-b border-gray-100">
                    <button
                        onClick={() => setActiveCategory('main')}
                        className="flex items-center gap-2 text-gray-800 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <h2 className="font-semibold text-lg">Stickers</h2>
                    </button>
                    {/* Search bar */}
                    <div className="mt-3 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search stickers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                        />
                    </div>
                </div>
                {/* Stickers content */}
                <div className="flex-1 overflow-hidden">
                    <StickersPanel searchQuery={searchQuery} />
                </div>
            </div>
        );
    }

    // Icons category - full panel like Shapes
    if (activeCategory === 'icons') {
        return (
            <div className="h-full flex flex-col bg-white">
                {/* Header with back arrow */}
                <div className="p-4 border-b border-gray-100">
                    <button
                        onClick={() => setActiveCategory('main')}
                        className="flex items-center gap-2 text-gray-800 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <h2 className="font-semibold text-lg">Icons</h2>
                    </button>
                    {/* Search bar */}
                    <div className="mt-3 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search icons..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                        />
                    </div>
                </div>
                {/* Icons content */}
                <div className="flex-1 overflow-hidden">
                    <IconsPanel searchQuery={searchQuery} />
                </div>
            </div>
        );
    }

    // Main assets view with browse categories
    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 pb-2">
                <h2 className="text-lg font-semibold text-gray-800">Assets</h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* Categories Grid */}
                <div className="mb-6">
                    <div className="grid grid-cols-3 gap-3">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className="group flex flex-col items-center"
                            >
                                {/* Stacked card effect */}
                                <div className="relative mb-2">
                                    {/* Back card */}
                                    <div className={`absolute -right-1 -bottom-1 w-[70px] h-[70px] ${cat.bgColor} rounded-xl opacity-60 rotate-6`} />
                                    {/* Front card */}
                                    <div className={`relative w-[70px] h-[70px] ${cat.iconBg} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                                        {cat.preview}
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple shape icon component
function ShapeIcon({ shapeId }: { shapeId: string }) {
    const iconMap: Record<string, React.ReactNode> = {
        rectangle: <rect x="20" y="25" width="60" height="50" fill="currentColor" />,
        circle: <circle cx="50" cy="50" r="30" fill="currentColor" />,
        triangle: <polygon points="50,15 85,85 15,85" fill="currentColor" />,
        star: <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill="currentColor" />,
        heart: <path d="M 50 88 C 20 65 5 50 5 30 C 5 15 18 5 32 5 C 42 5 50 12 50 12 C 50 12 58 5 68 5 C 82 5 95 15 95 30 C 95 50 80 65 50 88 Z" fill="currentColor" />,
        hexagon: <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="currentColor" />,
        'arrow-right': <path d="M 10 40 L 60 40 L 60 20 L 90 50 L 60 80 L 60 60 L 10 60 Z" fill="currentColor" />,
        cloud: <path d="M 25 75 C 10 75 5 65 5 55 C 5 45 15 38 25 40 C 25 25 40 15 55 20 C 65 10 85 15 90 30 C 98 35 98 55 88 60 C 95 70 85 80 75 75 L 25 75 Z" fill="currentColor" />,
    };

    return (
        <svg viewBox="0 0 100 100" className="w-7 h-7">
            {iconMap[shapeId] || <rect x="20" y="20" width="60" height="60" fill="currentColor" />}
        </svg>
    );
}
