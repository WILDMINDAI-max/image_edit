'use client';

import { useMemo, useState, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useEditorStore, useActivePage } from '@/store/editorStore';
import { SolidBackground } from '@/types/project';
import { ImageElement, TextElement } from '@/types/canvas';
import { COLOR_PALETTE, applyColorReplacement } from '@/utils/colorReplace';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { fabric } from 'fabric';
import {
    Trash2,
    Copy,
    Clipboard,
    FlipHorizontal,
    FlipVertical,
    Lock,
    LockOpen,
    Group,
    Ungroup,
    SlidersHorizontal,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    CaseSensitive,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Minus,
    Plus,
    Palette,
} from 'lucide-react';

export function ContextToolbar() {
    const selectedIds = useCanvasStore((state) => state.selectedIds);
    const getElement = useCanvasStore((state) => state.getElement);
    const copy = useCanvasStore((state) => state.copy);
    const paste = useCanvasStore((state) => state.paste);
    const duplicateElements = useCanvasStore((state) => state.duplicateElements);
    const removeElement = useCanvasStore((state) => state.removeElement);
    const lockElement = useCanvasStore((state) => state.lockElement);
    const unlockElement = useCanvasStore((state) => state.unlockElement);
    const groupElements = useCanvasStore((state) => state.groupElements);
    const ungroupElement = useCanvasStore((state) => state.ungroupElement);
    const updateTransform = useCanvasStore((state) => state.updateTransform);
    const updateElement = useCanvasStore((state) => state.updateElement);

    const activePage = useActivePage();
    const updatePage = useEditorStore((state) => state.updatePage);
    const openColorsPanel = useEditorStore((state) => state.openColorsPanel);
    const openFiltersPanel = useEditorStore((state) => state.openFiltersPanel);

    // List type state for text elements
    const [listType, setListType] = useState<'none' | 'bullet' | 'numbered'>('none');

    // Get current background color
    const currentBgColor = useMemo(() => {
        if (activePage?.background?.type === 'solid') {
            return (activePage.background as SolidBackground).color;
        }
        return '#FFFFFF';
    }, [activePage]);

    // Handle background color change
    const handleColorChange = (color: string) => {
        if (activePage) {
            updatePage(activePage.id, {
                background: { type: 'solid', color }
            });
        }
    };

    // Handle image color replacement
    const handleImageColorReplace = async (color: string) => {
        if (selectedIds.length !== 1) return;

        const element = getElement(selectedIds[0]);
        if (!element || element.type !== 'image') return;

        const imageElement = element as ImageElement;
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(imageElement.id) as fabric.Image | undefined;

        if (!fabricObj || !fabricObj.getElement) return;

        const imgElement = fabricObj.getElement() as HTMLImageElement;

        // Apply color replacement
        const colorReplaceEffect = {
            enabled: true,
            targetColor: color,
            intensity: 80,
            preserveBackground: true,
            blendMode: 'hue' as const,
        };

        try {
            const newSrc = await applyColorReplacement(imgElement, colorReplaceEffect);

            // Update the element with the new color-replaced image
            updateElement(imageElement.id, {
                src: newSrc,
                colorReplace: colorReplaceEffect,
            });

            // Update Fabric.js canvas
            fabric.Image.fromURL(newSrc, (img) => {
                const canvas = fabricCanvas.getCanvas();
                if (!canvas) return;

                // Copy properties from old object
                img.set({
                    left: fabricObj.left,
                    top: fabricObj.top,
                    scaleX: fabricObj.scaleX,
                    scaleY: fabricObj.scaleY,
                    angle: fabricObj.angle,
                    originX: fabricObj.originX,
                    originY: fabricObj.originY,
                    opacity: fabricObj.opacity,
                    data: { id: imageElement.id, type: 'image' },
                });

                canvas.remove(fabricObj);
                canvas.add(img);
                fabricCanvas.setObjectById(imageElement.id, img);
                canvas.setActiveObject(img);
                canvas.renderAll();
            }, { crossOrigin: 'anonymous' });
        } catch (error) {
            console.error('Color replacement failed:', error);
        }
    };

    // Derive selected elements from IDs - only recompute when selectedIds change
    const selectedElements = useMemo(() => {
        return selectedIds.map(id => getElement(id)).filter(Boolean);
    }, [selectedIds, getElement]);

    // Flip handlers
    const handleFlipHorizontal = () => {
        selectedIds.forEach(id => {
            const element = getElement(id);
            if (element) {
                updateTransform(id, {
                    scaleX: element.transform.scaleX * -1
                });
            }
        });
    };

    const handleFlipVertical = () => {
        selectedIds.forEach(id => {
            const element = getElement(id);
            if (element) {
                updateTransform(id, {
                    scaleY: element.transform.scaleY * -1
                });
            }
        });
    };

    if (selectedElements.length === 0) {
        return (
            <div className="h-12 bg-[#F8F9FA] border-b border-gray-200 flex items-center px-4 gap-4">
                {/* Current Color Indicator - Click to open Colors panel */}
                <button
                    onClick={openColorsPanel}
                    className="w-7 h-7 rounded-lg border-2 border-gray-300 shadow-sm hover:border-blue-400 hover:scale-105 transition-all cursor-pointer"
                    style={{ backgroundColor: currentBgColor }}
                    title="Open Colors panel"
                />

                {/* Hint text */}
                <span className="text-gray-400 text-xs ml-auto">
                    Select an element to edit it
                </span>
            </div>
        );
    }

    const element = selectedElements[0];
    const isLocked = element?.locked;
    const isGroup = element?.type === 'group';
    const canGroup = selectedElements.length > 1;
    const isImage = element?.type === 'image';
    const isText = element?.type === 'text';
    const textElement = isText ? (element as TextElement) : null;

    // Text formatting handlers
    const handleFontSizeChange = (delta: number) => {
        if (!textElement) return;
        const newSize = Math.max(8, Math.min(200, textElement.textStyle.fontSize + delta));
        updateElement(textElement.id, {
            textStyle: { ...textElement.textStyle, fontSize: newSize }
        } as Partial<TextElement>);
    };

    const toggleBold = () => {
        if (!textElement) return;
        const isBold = textElement.textStyle.fontWeight === 'bold' || textElement.textStyle.fontWeight === 700;
        updateElement(textElement.id, {
            textStyle: { ...textElement.textStyle, fontWeight: isBold ? 'normal' : 'bold' }
        } as Partial<TextElement>);
    };

    const toggleItalic = () => {
        if (!textElement) return;
        updateElement(textElement.id, {
            textStyle: { ...textElement.textStyle, fontStyle: textElement.textStyle.fontStyle === 'italic' ? 'normal' : 'italic' }
        } as Partial<TextElement>);
    };

    const toggleUnderline = () => {
        if (!textElement) return;
        const isUnderline = textElement.textStyle.textDecoration === 'underline';
        updateElement(textElement.id, {
            textStyle: { ...textElement.textStyle, textDecoration: isUnderline ? 'none' : 'underline' }
        } as Partial<TextElement>);
    };

    const toggleStrikethrough = () => {
        if (!textElement) return;
        const isStrikethrough = textElement.textStyle.textDecoration === 'line-through';
        updateElement(textElement.id, {
            textStyle: { ...textElement.textStyle, textDecoration: isStrikethrough ? 'none' : 'line-through' }
        } as Partial<TextElement>);
    };

    const toggleUppercase = () => {
        if (!textElement) return;
        const isUppercase = textElement.textStyle.textTransform === 'uppercase';
        updateElement(textElement.id, {
            textStyle: { ...textElement.textStyle, textTransform: isUppercase ? 'none' : 'uppercase' }
        } as Partial<TextElement>);
    };

    const setAlignment = (align: 'left' | 'center' | 'right') => {
        if (!textElement) return;
        updateElement(textElement.id, {
            textStyle: { ...textElement.textStyle, textAlign: align }
        } as Partial<TextElement>);
    };

    const handleTextColorChange = (color: string) => {
        if (!textElement) return;
        updateElement(textElement.id, {
            style: { ...textElement.style, fill: color }
        } as Partial<TextElement>);
    };

    return (
        <div className="h-12 bg-[#F8F9FA] border-b border-gray-200 flex items-center px-4 gap-2">
            {/* Element Info */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
                <span className="text-gray-800 text-sm font-medium">
                    {selectedElements.length === 1
                        ? element?.name || 'Unnamed'
                        : `${selectedElements.length} elements selected`}
                </span>
            </div>

            {/* Color Replacement for Images */}
            {isImage && (
                <>
                    <div className="flex items-center gap-1.5 px-3">
                        {COLOR_PALETTE.slice(0, 6).map((colorItem) => (
                            <button
                                key={colorItem.color}
                                onClick={() => handleImageColorReplace(colorItem.color)}
                                className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-blue-400 hover:scale-110 transition-all shadow-sm"
                                style={{ backgroundColor: colorItem.color }}
                                title={`Apply ${colorItem.name} color`}
                            />
                        ))}
                        {/* Custom Color Picker */}
                        <div className="relative">
                            <input
                                type="color"
                                onChange={(e) => handleImageColorReplace(e.target.value)}
                                className="absolute inset-0 opacity-0 w-6 h-6 cursor-pointer"
                                title="Pick custom color"
                            />
                            <div
                                className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-blue-400 hover:scale-110 transition-all shadow-sm cursor-pointer"
                                style={{
                                    background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)'
                                }}
                                title="Pick custom color"
                            />
                        </div>
                    </div>
                    <div className="w-px h-6 bg-gray-200" />
                    {/* Filter Button */}
                    <button
                        onClick={openFiltersPanel}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all flex items-center gap-1.5"
                        title="Image Filters"
                    >
                        <SlidersHorizontal size={16} />
                        <span className="text-xs font-medium">Filters</span>
                    </button>
                    <div className="w-px h-6 bg-gray-200" />
                </>
            )}

            {/* Text Formatting Options */}
            {isText && textElement && (
                <>
                    {/* Font Size */}
                    <div className="flex items-center gap-1 px-2">
                        <button
                            onClick={() => handleFontSizeChange(-2)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                            title="Decrease font size"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium text-gray-700 w-8 text-center">
                            {textElement.textStyle.fontSize}
                        </span>
                        <button
                            onClick={() => handleFontSizeChange(2)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                            title="Increase font size"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* Bold & Italic */}
                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={toggleBold}
                            className={`p-1.5 rounded transition-all ${textElement.textStyle.fontWeight === 'bold' || textElement.textStyle.fontWeight === 700
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            title="Bold"
                        >
                            <Bold size={14} />
                        </button>
                        <button
                            onClick={toggleItalic}
                            className={`p-1.5 rounded transition-all ${textElement.textStyle.fontStyle === 'italic'
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            title="Italic"
                        >
                            <Italic size={14} />
                        </button>
                        <button
                            onClick={toggleUnderline}
                            className={`p-1.5 rounded transition-all ${textElement.textStyle.textDecoration === 'underline'
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            title="Underline"
                        >
                            <Underline size={14} />
                        </button>
                        <button
                            onClick={toggleStrikethrough}
                            className={`p-1.5 rounded transition-all ${textElement.textStyle.textDecoration === 'line-through'
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            title="Strikethrough"
                        >
                            <Strikethrough size={14} />
                        </button>
                        <button
                            onClick={toggleUppercase}
                            className={`p-1.5 rounded transition-all ${textElement.textStyle.textTransform === 'uppercase'
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            title="Uppercase"
                        >
                            <CaseSensitive size={14} />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* Alignment - Single button that cycles through options */}
                    <button
                        onClick={() => {
                            const alignments: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];
                            const currentIndex = alignments.indexOf(textElement.textStyle.textAlign as 'left' | 'center' | 'right');
                            const nextIndex = (currentIndex + 1) % alignments.length;
                            setAlignment(alignments[nextIndex]);
                        }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        title={`Align ${textElement.textStyle.textAlign} (click to change)`}
                    >
                        {textElement.textStyle.textAlign === 'left' && <AlignLeft size={14} />}
                        {textElement.textStyle.textAlign === 'center' && <AlignCenter size={14} />}
                        {textElement.textStyle.textAlign === 'right' && <AlignRight size={14} />}
                        {!['left', 'center', 'right'].includes(textElement.textStyle.textAlign) && <AlignLeft size={14} />}
                    </button>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* List - Single button that cycles through options */}
                    <button
                        onClick={() => {
                            const types: ('none' | 'bullet' | 'numbered')[] = ['none', 'bullet', 'numbered'];
                            const currentIndex = types.indexOf(listType);
                            const nextIndex = (currentIndex + 1) % types.length;
                            setListType(types[nextIndex]);
                        }}
                        className={`p-1.5 rounded transition-all ${listType !== 'none'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                        title={listType === 'none' ? 'No list' : listType === 'bullet' ? 'Bullet list' : 'Numbered list'}
                    >
                        {listType === 'numbered' ? <ListOrdered size={14} /> : <List size={14} />}
                    </button>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* Text Color */}
                    <div className="relative">
                        <input
                            type="color"
                            value={typeof textElement.style.fill === 'string' ? textElement.style.fill : '#000000'}
                            onChange={(e) => handleTextColorChange(e.target.value)}
                            className="absolute inset-0 opacity-0 w-8 h-8 cursor-pointer"
                            title="Text color"
                        />
                        <div
                            className="w-7 h-7 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all cursor-pointer flex items-center justify-center"
                            style={{ backgroundColor: typeof textElement.style.fill === 'string' ? textElement.style.fill : '#000000' }}
                            title="Text color"
                        >
                            <span className="text-xs font-bold" style={{ color: typeof textElement.style.fill === 'string' && textElement.style.fill.toLowerCase() !== '#ffffff' && textElement.style.fill.toLowerCase() !== 'white' ? '#fff' : '#000' }}>A</span>
                        </div>
                    </div>

                    <div className="w-px h-6 bg-gray-200" />
                </>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1">
                <button
                    onClick={copy}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Copy"
                >
                    <Copy size={16} />
                </button>
                <button
                    onClick={paste}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Paste"
                >
                    <Clipboard size={16} />
                </button>
                <button
                    onClick={() => duplicateElements()}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Duplicate"
                >
                    <Copy size={16} />
                </button>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            {/* Transform */}
            <div className="flex items-center gap-1">
                <button
                    onClick={handleFlipHorizontal}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Flip Horizontal"
                >
                    <FlipHorizontal size={16} />
                </button>
                <button
                    onClick={handleFlipVertical}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Flip Vertical"
                >
                    <FlipVertical size={16} />
                </button>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            {/* Grouping */}
            <div className="flex items-center gap-1">
                {canGroup && (
                    <button
                        onClick={() => groupElements(selectedIds)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        title="Group"
                    >
                        <Group size={16} />
                    </button>
                )}
                {isGroup && (
                    <button
                        onClick={() => ungroupElement(selectedIds[0])}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        title="Ungroup"
                    >
                        <Ungroup size={16} />
                    </button>
                )}
            </div>

            {/* Lock */}
            <button
                onClick={() => isLocked ? unlockElement(selectedIds[0]) : lockElement(selectedIds[0])}
                className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-all"
                title={isLocked ? 'Unlock' : 'Lock'}
            >
                {isLocked ? <LockOpen size={16} /> : <Lock size={16} />}
            </button>

            {/* Delete */}
            <button
                onClick={() => removeElement(selectedIds)}
                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-all ml-auto"
                title="Delete"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}
