'use client';

import { useState } from 'react';
import { Search, Layout, Loader2 } from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';
import { useEditorStore } from '@/store/editorStore';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { CanvasElement, TextElement, ShapeElement, ImageElement } from '@/types/canvas';
import { loadGoogleFont, GOOGLE_FONTS } from '@/services/googleFonts';
// Replace static import with hook and types
import { useTemplatesHierarchy, TemplateData, TemplateCategory, TemplateTheme } from '@/hooks/useTemplates';

export function TemplatesPanel() {
    const { categories, loading, error } = useTemplatesHierarchy();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const addElement = useCanvasStore((state) => state.addElement);
    const updatePage = useEditorStore((state) => state.updatePage);
    const project = useEditorStore((state) => state.project);

    // Create a complete element with all required fields
    const createCompleteElement = (partial: any, index: number): CanvasElement => {
        // ... (Keep existing logic, assuming partial matches CanvasElement structure)
        const baseTransform = {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            skewX: 0,
            skewY: 0,
            originX: 'center' as const,
            originY: 'center' as const,
            ...partial.transform,
        };

        const baseStyle = {
            fill: '#000000',
            stroke: null,
            strokeWidth: 0,
            opacity: 1,
            shadow: null,
            cornerRadius: 0,
            ...partial.style,
        };

        const baseElement = {
            id: crypto.randomUUID(),
            name: partial.name || `Element ${index + 1}`,
            locked: false,
            visible: true,
            selectable: true,
            zIndex: partial.zIndex || (index + 1),
            transform: baseTransform,
            style: baseStyle,
        };

        if (partial.type === 'text' || partial.type === 'i-text') {
            const textPartial = partial as Partial<TextElement>;
            return {
                ...baseElement,
                type: 'text',
                content: textPartial.content || 'Text',
                editable: true,
                textStyle: {
                    fontFamily: 'Poppins',
                    fontSize: 24,
                    fontWeight: 400,
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    textAlign: 'left',
                    lineHeight: 1.4,
                    letterSpacing: 0,
                    textTransform: 'none',
                    ...textPartial.textStyle,
                },
                effect: textPartial.effect || { type: 'none' },
            } as TextElement;
        }

        if (partial.type === 'shape' || partial.type === 'rect' || partial.type === 'circle' || partial.type === 'triangle') {
            const shapePartial = partial as Partial<ShapeElement>;
            // Map fabric types to our internal types if needed
            const shapeType = partial.type === 'rect' ? 'rectangle' : partial.type;

            return {
                ...baseElement,
                type: 'shape',
                shapeType: shapePartial.shapeType || shapeType || 'rectangle',
                points: shapePartial.points,
            } as ShapeElement;
        }

        if (partial.type === 'image') {
            const imagePartial = partial as Partial<ImageElement>;
            return {
                ...baseElement,
                type: 'image',
                src: imagePartial.src || '',
                originalSrc: imagePartial.originalSrc || imagePartial.src || '',
                filters: {
                    brightness: 0,
                    contrast: 0,
                    saturation: 0,
                    blur: 0,
                    temperature: 0,
                    tint: 0,
                    highlights: 0,
                    shadows: 0,
                    whites: 0,
                    blacks: 0,
                    vibrance: 0,
                    clarity: 0,
                    sharpness: 0,
                    vignette: 0,
                    grayscale: false,
                    sepia: false,
                    invert: false,
                    filterPreset: null,
                    ...imagePartial.filters,
                },
                crop: imagePartial.crop || null,
                colorReplace: imagePartial.colorReplace || null,
                crossOrigin: 'anonymous',
                isBackground: imagePartial.isBackground || false,
                blendMode: 'normal',
            } as ImageElement;
        }

        // Default fallback
        return {
            ...baseElement,
            type: partial.type || 'shape',
        } as CanvasElement;
    };

    // Load template onto canvas
    const loadTemplate = async (template: TemplateData) => {
        if (!project) return;

        // Load any Google Fonts used in the template
        const fontLoadPromises: Promise<void>[] = [];
        const usedFonts = new Set<string>();

        template.elements.forEach(el => {
            if ((el.type === 'text' || el.type === 'i-text') && el.textStyle?.fontFamily) {
                const style = el.textStyle;
                const family = style.fontFamily;

                // Create a unique key for font+weight
                const weight = style.fontWeight || 'normal';
                const weightStr = typeof weight === 'number' ? String(weight) : (weight === 'bold' ? '700' : '400');
                const key = `${family}:${weightStr}`;

                if (!usedFonts.has(key)) {
                    usedFonts.add(key);
                    const fontDef = GOOGLE_FONTS.find(f => f.family === family);
                    if (fontDef) {
                        const variantToLoad = fontDef.variants.includes(weightStr) ? weightStr : '400';
                        fontLoadPromises.push(loadGoogleFont(family, [variantToLoad]));
                    }
                }
            }
        });

        if (fontLoadPromises.length > 0) {
            console.log(`[TemplatesPanel] Loading ${fontLoadPromises.length} fonts for template...`);
            await Promise.all(fontLoadPromises);
        }

        // Create complete elements from template - sort by zIndex
        // Ensure keys are mapped if coming from Fabric object structure (e.g., camelCase)
        const completeElements = template.elements
            .map((el, idx) => createCompleteElement(el, idx))
            .sort((a, b) => a.zIndex - b.zIndex);

        // Build a proper Page object for loadPage
        const templatePage = {
            id: project.activePageId,
            name: template.name,
            width: template.width,
            height: template.height,
            dpi: 72,
            background: template.background,
            elements: completeElements,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        // Update page in store with dimensions, background, and elements
        updatePage(project.activePageId, {
            width: template.width,
            height: template.height,
            background: template.background,
            elements: completeElements,
        });

        // Use the proper loadPage method which handles z-index sorting and async image loading
        setTimeout(async () => {
            const fabricCanvas = getFabricCanvas();
            await fabricCanvas.loadPage(templatePage);
        }, 100);
    };

    // Filter categories and themes based on search and selection
    const filterCategories = (): TemplateCategory[] => {
        if (!categories) return [];
        let filtered = categories;

        // 1. Filter by Category Selection
        if (selectedCategory !== 'all') {
            filtered = categories.filter(c => c.id === selectedCategory);
        }

        // 2. Filter by Search Query
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered
                .map(category => {
                    const filteredThemes = category.themes
                        .map(theme => {
                            const filteredTemplates = theme.templates.filter(t =>
                                t.name.toLowerCase().includes(lowerQuery)
                            );
                            return { ...theme, templates: filteredTemplates };
                        })
                        .filter(theme =>
                            theme.name.toLowerCase().includes(lowerQuery) ||
                            theme.templates.length > 0
                        );
                    return { ...category, themes: filteredThemes };
                })
                .filter(category =>
                    category.name.toLowerCase().includes(lowerQuery) ||
                    category.themes.length > 0
                );
            return filtered;
        }

        return filtered;
    };

    const filteredCategories = filterCategories();

    // Render theme section
    const renderTheme = (theme: TemplateTheme) => (
        <div key={theme.id} className="mb-6">
            <h4 className="text-gray-900 font-semibold text-sm mb-3">
                {theme.name}
            </h4>
            {theme.templates.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                    {theme.templates.map((template) => (
                        <div
                            key={template.id}
                            onClick={() => loadTemplate(template)}
                            className="aspect-[4/5] rounded-xl overflow-hidden border border-gray-200 hover:border-violet-500 hover:shadow-md cursor-pointer transition-all duration-200 group bg-white"
                        >
                            <div className="w-full h-[80%] flex flex-col overflow-hidden relative bg-gray-50">
                                {template.thumbnail ? (
                                    <img
                                        src={template.thumbnail}
                                        alt={template.name}
                                        className="w-full h-full object-contain p-2"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            ((e.target as HTMLImageElement).nextSibling as HTMLElement).style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="w-full h-full flex items-center justify-center absolute inset-0 -z-10"
                                    style={{
                                        display: template.thumbnail ? 'none' : 'flex',
                                        backgroundColor: (template.background && template.background.type === 'solid') ? template.background.color : '#f8f9fa'
                                    }}
                                >
                                    <span className="text-gray-300 text-2xl font-bold opacity-20">{template.name.charAt(0)}</span>
                                </div>
                            </div>
                            <div className="w-full h-[20%] flex items-center justify-start px-3 bg-white relative z-10 border-t border-gray-50">
                                <span className="text-gray-700 text-[10px] font-medium truncate w-full group-hover:text-violet-600 transition-colors">
                                    {template.name}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );

    // Render category content
    const renderCategoryContent = (category: TemplateCategory) => (
        <div key={category.id} className="mb-8">
            {selectedCategory === 'all' && (
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    {category.name}
                </h3>
            )}
            <div className="space-y-6">
                {category.themes.map(theme => renderTheme(theme))}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center flex-col gap-2 text-gray-400">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-xs">Loading templates...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center text-red-400 text-sm">
                Failed to load templates
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="px-4 pt-4 pb-2">
                <h2 className="text-gray-900 font-bold text-lg mb-4">Templates</h2>
                <div className="relative mb-2">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                </div>
            </div>

            {/* Horizontal Categories Tabs */}
            <div className="px-4 pb-2 border-b border-gray-100/50">
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 mask-fade-right">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`
                            whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex-shrink-0
                            ${selectedCategory === 'all'
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                    >
                        All
                    </button>
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`
                                whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex-shrink-0
                                ${selectedCategory === category.id
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                            `}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {filteredCategories.map(category => renderCategoryContent(category))}

                {/* Empty state */}
                {filteredCategories.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Layout size={40} strokeWidth={1.5} className="mb-3 opacity-50" />
                        <p className="text-sm">No templates found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
