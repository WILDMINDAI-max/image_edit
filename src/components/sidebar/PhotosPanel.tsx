'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';

// Stock images - using Unsplash for high-quality free images
const STOCK_IMAGES = [
    {
        id: '1',
        src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
        alt: 'Mountain landscape',
        category: 'nature',
    },
    {
        id: '2',
        src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        alt: 'Portrait',
        category: 'people',
    },
    {
        id: '3',
        src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
        thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200',
        alt: 'Technology',
        category: 'technology',
    },
    {
        id: '4',
        src: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400',
        thumb: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=200',
        alt: 'Workspace',
        category: 'business',
    },
    {
        id: '5',
        src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400',
        thumb: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200',
        alt: 'Forest',
        category: 'nature',
    },
    {
        id: '6',
        src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
        thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200',
        alt: 'Night mountain',
        category: 'nature',
    },
    {
        id: '7',
        src: 'https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=400',
        thumb: 'https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=200',
        alt: 'Abstract',
        category: 'abstract',
    },
    {
        id: '8',
        src: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400',
        thumb: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200',
        alt: 'Office',
        category: 'business',
    },
    {
        id: '9',
        src: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400',
        thumb: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=200',
        alt: 'Lake',
        category: 'nature',
    },
    {
        id: '10',
        src: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=400',
        thumb: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=200',
        alt: 'Sunset',
        category: 'nature',
    },
    {
        id: '11',
        src: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400',
        thumb: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
        alt: 'Building',
        category: 'architecture',
    },
    {
        id: '12',
        src: 'https://images.unsplash.com/photo-1517948430535-1e2469d314fe?w=400',
        thumb: 'https://images.unsplash.com/photo-1517948430535-1e2469d314fe?w=200',
        alt: 'Food',
        category: 'food',
    },
];

const CATEGORIES = ['all', 'nature', 'people', 'business', 'technology', 'abstract', 'architecture', 'food'];

export function PhotosPanel() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const addImageElement = useCanvasStore((state) => state.addImageElement);

    const filteredImages = STOCK_IMAGES.filter((img) => {
        const matchesSearch = img.alt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || img.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAddImage = (src: string) => {
        // Load image first to get natural dimensions for correct aspect ratio
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;
            const aspectRatio = naturalWidth / naturalHeight;

            // Base size - fit within 300px on the larger dimension
            const maxSize = 300;
            let width: number;
            let height: number;

            if (aspectRatio >= 1) {
                // Landscape or square
                width = maxSize;
                height = maxSize / aspectRatio;
            } else {
                // Portrait
                height = maxSize;
                width = maxSize * aspectRatio;
            }

            addImageElement(src, {
                transform: {
                    x: 540,
                    y: 540,
                    width,
                    height,
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
        img.onerror = () => {
            // Fallback to default size if image fails to load
            addImageElement(src, {
                transform: {
                    x: 540,
                    y: 540,
                    width: 300,
                    height: 300,
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
        img.src = src;
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 pb-2">
                <h2 className="text-lg font-semibold text-gray-800">Photos</h2>
                <p className="text-xs text-gray-500 mt-0.5">Free stock images</p>
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search photos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="px-4 pb-3">
                <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`
                                px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors
                                ${activeCategory === category
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
                            `}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Images Grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                <div className="grid grid-cols-2 gap-2">
                    {filteredImages.map((image) => (
                        <div
                            key={image.id}
                            onClick={() => handleAddImage(image.src)}
                            className="group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border border-gray-200 hover:border-blue-400 transition-colors"
                        >
                            <img
                                src={image.thumb}
                                alt={image.alt}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-[10px] truncate">{image.alt}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredImages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <p className="text-sm">No photos found</p>
                        <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                )}
            </div>
        </div>
    );
}
