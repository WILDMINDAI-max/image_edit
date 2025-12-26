'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';
import { getLibraryPage, getUploadsPage, LibraryItem, UploadItem } from '@/utils/libraryApi';
import { getDisplayUrl, getFullResUrl } from '@/utils/thumb';

type TabType = 'generations' | 'uploads';

export function LibraryPanel() {
    const [activeTab, setActiveTab] = useState<TabType>('generations');
    const [searchQuery, setSearchQuery] = useState('');

    // Library (generations) state
    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const [libraryNextCursor, setLibraryNextCursor] = useState<string | number | undefined>();
    const [libraryHasMore, setLibraryHasMore] = useState(false);
    const [libraryLoading, setLibraryLoading] = useState(false);
    const hasLoadedLibraryRef = useRef(false);

    // Uploads state
    const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
    const [uploadNextCursor, setUploadNextCursor] = useState<string | number | undefined>();
    const [uploadHasMore, setUploadHasMore] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const hasLoadedUploadsRef = useRef(false);

    const listRef = useRef<HTMLDivElement>(null);
    const isLoadingMoreRef = useRef(false);

    const addImageElement = useCanvasStore((state) => state.addImageElement);

    // Load library items on mount or tab change
    useEffect(() => {
        if (activeTab !== 'generations') return;
        if (hasLoadedLibraryRef.current) return;

        const loadLibrary = async () => {
            setLibraryLoading(true);
            try {
                const result = await getLibraryPage(50, undefined, 'image');
                console.log('[LibraryPanel] Loaded library:', {
                    itemsCount: result.items.length,
                    hasMore: result.hasMore,
                });
                setLibraryItems(result.items);
                setLibraryNextCursor(result.nextCursor);
                setLibraryHasMore(result.hasMore);
                hasLoadedLibraryRef.current = true;
            } catch (error) {
                console.error('[LibraryPanel] Error loading library:', error);
            } finally {
                setLibraryLoading(false);
            }
        };

        loadLibrary();
    }, [activeTab]);

    // Load uploads when tab changes to uploads
    useEffect(() => {
        if (activeTab !== 'uploads') return;
        if (hasLoadedUploadsRef.current) return;

        const loadUploads = async () => {
            setUploadLoading(true);
            try {
                const result = await getUploadsPage(50, undefined, 'image');
                console.log('[LibraryPanel] Loaded uploads:', {
                    itemsCount: result.items.length,
                    hasMore: result.hasMore,
                });
                setUploadItems(result.items);
                setUploadNextCursor(result.nextCursor);
                setUploadHasMore(result.hasMore);
                hasLoadedUploadsRef.current = true;
            } catch (error) {
                console.error('[LibraryPanel] Error loading uploads:', error);
            } finally {
                setUploadLoading(false);
            }
        };

        loadUploads();
    }, [activeTab]);

    // Handle scroll for infinite loading
    const handleScroll = useCallback(async (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;

        const currentHasMore = activeTab === 'generations' ? libraryHasMore : uploadHasMore;
        const currentLoading = activeTab === 'generations' ? libraryLoading : uploadLoading;
        const currentNextCursor = activeTab === 'generations' ? libraryNextCursor : uploadNextCursor;

        if (currentLoading || isLoadingMoreRef.current || !currentHasMore) {
            return;
        }

        const scrollBottom = el.scrollTop + el.clientHeight;
        const scrollHeight = el.scrollHeight;
        const nearBottom = scrollBottom >= scrollHeight - 200;

        if (!nearBottom) return;

        isLoadingMoreRef.current = true;

        try {
            if (activeTab === 'generations') {
                setLibraryLoading(true);
                const result = await getLibraryPage(50, currentNextCursor, 'image');
                setLibraryItems(prev => {
                    const existingIds = new Set(prev.map(item => item.id));
                    const newItems = result.items.filter(item => !existingIds.has(item.id));
                    return [...prev, ...newItems];
                });
                setLibraryNextCursor(result.nextCursor);
                setLibraryHasMore(result.hasMore);
                setLibraryLoading(false);
            } else {
                setUploadLoading(true);
                const result = await getUploadsPage(50, currentNextCursor, 'image');
                setUploadItems(prev => {
                    const existingIds = new Set(prev.map(item => item.id));
                    const newItems = result.items.filter(item => !existingIds.has(item.id));
                    return [...prev, ...newItems];
                });
                setUploadNextCursor(result.nextCursor);
                setUploadHasMore(result.hasMore);
                setUploadLoading(false);
            }
        } catch (error) {
            console.error('[LibraryPanel] Error loading more:', error);
            if (activeTab === 'generations') setLibraryLoading(false);
            else setUploadLoading(false);
        } finally {
            isLoadingMoreRef.current = false;
        }
    }, [activeTab, libraryHasMore, uploadHasMore, libraryLoading, uploadLoading, libraryNextCursor, uploadNextCursor]);

    // Handle adding image to canvas
    const handleAddImage = (item: LibraryItem | UploadItem) => {
        const fullUrl = getFullResUrl(item);
        if (!fullUrl) {
            console.error('[LibraryPanel] No valid URL for item:', item);
            return;
        }

        addImageElement(fullUrl, {
            transform: {
                x: 200,
                y: 200,
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

    // Get display items based on tab
    const displayItems = activeTab === 'generations' ? libraryItems : uploadItems;
    const loading = activeTab === 'generations' ? libraryLoading : uploadLoading;
    const hasMore = activeTab === 'generations' ? libraryHasMore : uploadHasMore;

    // Filter by search
    const filteredItems = displayItems.filter(item => {
        if (!searchQuery) return true;
        const prompt = (item as LibraryItem).prompt || '';
        return prompt.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 pb-2">
                <h2 className="text-lg font-semibold text-gray-800">Library</h2>

                {/* Tabs */}
                <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('generations')}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'generations'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Generations
                    </button>
                    <button
                        onClick={() => setActiveTab('uploads')}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'uploads'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Uploads
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by prompt..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-400 text-gray-800 placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Content */}
            <div
                ref={listRef}
                className="flex-1 overflow-y-auto p-4 custom-scrollbar"
                onScroll={handleScroll}
            >
                {/* Loading state */}
                {loading && filteredItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-3" />
                        <p className="text-sm">Loading {activeTab}...</p>
                    </div>
                )}

                {/* Empty state */}
                {!loading && filteredItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <p className="text-sm">
                            {searchQuery
                                ? 'No items match your search'
                                : activeTab === 'generations'
                                    ? 'No generations yet'
                                    : 'No uploads yet'
                            }
                        </p>
                        <p className="text-xs mt-1 text-gray-300">
                            {!searchQuery && activeTab === 'generations' && 'Generate images to see them here'}
                            {!searchQuery && activeTab === 'uploads' && 'Upload images to see them here'}
                        </p>
                    </div>
                )}

                {/* Image grid */}
                {filteredItems.length > 0 && (
                    <>
                        <div className="grid grid-cols-2 gap-2">
                            {filteredItems.map((item, index) => {
                                const displayUrl = getDisplayUrl(item);
                                const key = `${activeTab}-${item.id}-${index}`;

                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleAddImage(item)}
                                        className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-violet-400 transition-all bg-gray-50"
                                    >
                                        {displayUrl ? (
                                            <img
                                                src={displayUrl}
                                                alt={(item as LibraryItem).prompt || 'Image'}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                No preview
                                            </div>
                                        )}
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded">
                                                Add to canvas
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Load more indicator */}
                        {hasMore && (
                            <div className="flex items-center justify-center py-4 text-gray-400 text-xs">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Loading more...
                                    </>
                                ) : (
                                    'Scroll to load more'
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
