'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useEditorStore, useActivePage } from '@/store/editorStore';
import { SolidBackground } from '@/types/project';
import { CanvasElement, ImageElement, TextElement } from '@/types/canvas';
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
    AlignHorizontalJustifyStart,
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyEnd,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    List,
    ListOrdered,
    Minus,
    Plus,
    Palette,
    ChevronDown,
    Sparkles,
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
    const setRightPanel = useEditorStore((state) => state.setRightPanel);
    const openColorsPanel = useEditorStore((state) => state.openColorsPanel);
    const openFiltersPanel = useEditorStore((state) => state.openFiltersPanel);

    // List type state for text elements
    const [listType, setListType] = useState<'none' | 'bullet' | 'numbered'>('none');

    // Alignment popup state
    const [showAlignPopup, setShowAlignPopup] = useState(false);
    const alignPopupRef = useRef<HTMLDivElement>(null);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (alignPopupRef.current && !alignPopupRef.current.contains(event.target as Node)) {
                setShowAlignPopup(false);
            }
        };

        if (showAlignPopup) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAlignPopup]);

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

    // Derive selected elements from IDs - recompute when elements change
    const selectedElements = useMemo(() => {
        if (!activePage) return [];
        return selectedIds
            .map(id => activePage.elements.find(el => el.id === id))
            .filter(Boolean) as CanvasElement[];
    }, [selectedIds, activePage?.elements]);

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

        // Sync to Fabric.js canvas
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(textElement.id);
        if (fabricObj && 'updateTextStyle' in fabricObj) {
            (fabricObj as any).updateTextStyle({ fontSize: newSize });
        } else if (fabricObj) {
            (fabricObj as any).set({ fontSize: newSize });
            fabricCanvas.getCanvas()?.renderAll();
        }
    };

    const toggleBold = () => {
        if (!textElement) return;
        const isBold = textElement.textStyle.fontWeight === 'bold' || textElement.textStyle.fontWeight === 700;
        const newWeight = isBold ? 'normal' : 'bold';
        updateElement(textElement.id, {
            textStyle: { ...textElement.textStyle, fontWeight: newWeight }
        } as Partial<TextElement>);

        // Sync to Fabric.js canvas
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(textElement.id);
        if (fabricObj && 'updateTextStyle' in fabricObj) {
            (fabricObj as any).updateTextStyle({ fontWeight: newWeight });
        } else if (fabricObj) {
            (fabricObj as any).set({ fontWeight: newWeight });
            fabricCanvas.getCanvas()?.renderAll();
        }
    };

    const toggleItalic = () => {
        if (!textElement) return;
        const newStyle = textElement.textStyle.fontStyle === 'italic' ? 'normal' : 'italic';
        updateElement(textElement.id, {
            textStyle: { ...textElement.textStyle, fontStyle: newStyle }
        } as Partial<TextElement>);

        // Sync to Fabric.js canvas
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(textElement.id);
        if (fabricObj && 'updateTextStyle' in fabricObj) {
            (fabricObj as any).updateTextStyle({ fontStyle: newStyle });
        } else if (fabricObj) {
            (fabricObj as any).set({ fontStyle: newStyle });
            fabricCanvas.getCanvas()?.renderAll();
        }
    };

    const toggleUnderline = () => {
        if (!textElement) return;
        const isUnderline = textElement.textStyle.textDecoration === 'underline';
        const newDecoration = isUnderline ? 'none' : 'underline';
        updateElement(textElement.id, {
            textStyle: { ...textElement.textStyle, textDecoration: newDecoration }
        } as Partial<TextElement>);

        // Sync to Fabric.js canvas
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(textElement.id);
        if (fabricObj && 'updateTextStyle' in fabricObj) {
            (fabricObj as any).updateTextStyle({ textDecoration: newDecoration });
        } else if (fabricObj) {
            (fabricObj as any).set({ underline: newDecoration === 'underline', linethrough: false });
            fabricCanvas.getCanvas()?.renderAll();
        }
    };

    const toggleStrikethrough = () => {
        if (!textElement) return;
        const isStrikethrough = textElement.textStyle.textDecoration === 'line-through';
        const newDecoration = isStrikethrough ? 'none' : 'line-through';
        updateElement(textElement.id, {
            textStyle: { ...textElement.textStyle, textDecoration: newDecoration }
        } as Partial<TextElement>);

        // Sync to Fabric.js canvas
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(textElement.id);
        if (fabricObj && 'updateTextStyle' in fabricObj) {
            (fabricObj as any).updateTextStyle({ textDecoration: newDecoration });
        } else if (fabricObj) {
            (fabricObj as any).set({ linethrough: newDecoration === 'line-through', underline: false });
            fabricCanvas.getCanvas()?.renderAll();
        }
    };

    const toggleUppercase = () => {
        if (!textElement) return;
        const isUppercase = textElement.textStyle.textTransform === 'uppercase';
        const newTransform = isUppercase ? 'none' : 'uppercase';

        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(textElement.id);

        if (fabricObj && fabricObj.type === 'i-text') {
            const currentText = (fabricObj as any).text;
            // When turning on uppercase, convert current text to uppercase
            // When turning off, convert current text to lowercase (preserving user edits)
            const newText = newTransform === 'uppercase'
                ? currentText.toUpperCase()
                : currentText.toLowerCase();

            (fabricObj as any).set({ text: newText });
            fabricCanvas.getCanvas()?.renderAll();

            // Also update the store with the new content
            updateElement(textElement.id, {
                content: newText,
                textStyle: { ...textElement.textStyle, textTransform: newTransform }
            } as Partial<TextElement>);
        } else {
            // Fallback if no fabric object
            updateElement(textElement.id, {
                textStyle: { ...textElement.textStyle, textTransform: newTransform }
            } as Partial<TextElement>);
        }
    };

    const handleLetterSpacingChange = (delta: number) => {
        if (!textElement) return;
        const currentSpacing = textElement.textStyle.letterSpacing || 0;
        const newSpacing = Math.max(-5, Math.min(20, currentSpacing + delta));
        updateElement(textElement.id, {
            textStyle: { ...textElement.textStyle, letterSpacing: newSpacing }
        } as Partial<TextElement>);

        // Sync to Fabric.js canvas (charSpacing is in 1/1000 em)
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(textElement.id);
        if (fabricObj && 'updateTextStyle' in fabricObj) {
            (fabricObj as any).updateTextStyle({ letterSpacing: newSpacing });
        } else if (fabricObj) {
            (fabricObj as any).set({ charSpacing: newSpacing * 100 });
            fabricCanvas.getCanvas()?.renderAll();
        }
    };

    const setAlignment = (align: 'left' | 'center' | 'right') => {
        if (!textElement) return;
        updateElement(textElement.id, {
            textStyle: { ...textElement.textStyle, textAlign: align }
        } as Partial<TextElement>);

        // Sync to Fabric.js canvas
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(textElement.id);
        if (fabricObj && 'updateTextStyle' in fabricObj) {
            (fabricObj as any).updateTextStyle({ textAlign: align });
        } else if (fabricObj) {
            // Fallback for regular fabric.IText
            (fabricObj as any).set({ textAlign: align });
            fabricCanvas.getCanvas()?.renderAll();
        }
    };

    const handleTextColorChange = (color: string) => {
        if (!textElement) return;
        updateElement(textElement.id, {
            style: { ...textElement.style, fill: color }
        } as Partial<TextElement>);

        // Sync to Fabric.js canvas
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(textElement.id);
        if (fabricObj) {
            (fabricObj as any).set({ fill: color });
            fabricCanvas.getCanvas()?.renderAll();
        }
    };

    // Handle list type change
    const handleListTypeChange = () => {
        if (!textElement) return;

        const types: ('none' | 'bullet' | 'numbered')[] = ['none', 'bullet', 'numbered'];
        const currentIndex = types.indexOf(listType);
        const nextIndex = (currentIndex + 1) % types.length;
        const newListType = types[nextIndex];
        setListType(newListType);

        // Apply list formatting to the text content
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(textElement.id);

        if (fabricObj && fabricObj.type === 'i-text') {
            const currentText = (fabricObj as any).text as string;
            const lines = currentText.split('\n');

            let newText: string;
            if (newListType === 'bullet') {
                // Add bullet points
                newText = lines.map(line => {
                    const cleanLine = line.replace(/^(\d+\.\s*|•\s*)/, '').trim();
                    return cleanLine ? `• ${cleanLine}` : cleanLine;
                }).join('\n');
            } else if (newListType === 'numbered') {
                // Add numbers
                let num = 1;
                newText = lines.map(line => {
                    const cleanLine = line.replace(/^(\d+\.\s*|•\s*)/, '').trim();
                    return cleanLine ? `${num++}. ${cleanLine}` : cleanLine;
                }).join('\n');
            } else {
                // Remove list formatting
                newText = lines.map(line => line.replace(/^(\d+\.\s*|•\s*)/, '').trim()).join('\n');
            }

            (fabricObj as any).set({ text: newText });
            fabricCanvas.getCanvas()?.renderAll();

            // Update store
            updateElement(textElement.id, {
                content: newText
            } as Partial<TextElement>);
        }
    };

    // Get canvas dimensions
    const canvasWidth = activePage?.width || 1080;
    const canvasHeight = activePage?.height || 1080;

    // Get element bounds for positioning (actual visual size, not bounding rect)
    const getElementBounds = () => {
        if (!textElement) return { width: 0, height: 0 };
        const fabricCanvas = getFabricCanvas();
        const fabricObject = fabricCanvas.getObjectById(textElement.id);
        if (fabricObject) {
            // Use actual scaled dimensions, not bounding rect which includes control padding
            const scaleX = fabricObject.scaleX || 1;
            const scaleY = fabricObject.scaleY || 1;
            const objWidth = (fabricObject.width || 0) * scaleX;
            const objHeight = (fabricObject.height || 0) * scaleY;
            return { width: objWidth, height: objHeight };
        }
        const width = textElement.transform.width * Math.abs(textElement.transform.scaleX);
        const height = textElement.transform.height * Math.abs(textElement.transform.scaleY);
        return { width, height };
    };

    // Position alignment handlers (like sidebar)
    const handlePositionAlignLeft = () => {
        if (!textElement) return;
        const { width } = getElementBounds();
        updateTransform(textElement.id, { x: width / 2 });
        setShowAlignPopup(false);
    };

    const handlePositionAlignCenter = () => {
        if (!textElement) return;
        updateTransform(textElement.id, { x: canvasWidth / 2 });
        setShowAlignPopup(false);
    };

    const handlePositionAlignRight = () => {
        if (!textElement) return;
        const { width } = getElementBounds();
        updateTransform(textElement.id, { x: canvasWidth - width / 2 });
        setShowAlignPopup(false);
    };

    const handlePositionAlignTop = () => {
        if (!textElement) return;
        const { height } = getElementBounds();
        updateTransform(textElement.id, { y: height / 2 });
        setShowAlignPopup(false);
    };

    const handlePositionAlignMiddle = () => {
        if (!textElement) return;
        updateTransform(textElement.id, { y: canvasHeight / 2 });
        setShowAlignPopup(false);
    };

    const handlePositionAlignBottom = () => {
        if (!textElement) return;
        const { height } = getElementBounds();
        updateTransform(textElement.id, { y: canvasHeight - height / 2 });
        setShowAlignPopup(false);
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
                    {/* Font Family Button */}
                    <button
                        onClick={() => setRightPanel('fonts')}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
                        style={{ fontFamily: textElement.textStyle.fontFamily }}
                        title="Change font"
                    >
                        <span className="max-w-[100px] truncate">{textElement.textStyle.fontFamily}</span>
                        <ChevronDown size={12} className="text-gray-400" />
                    </button>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* Font Size */}
                    <div className="flex items-center gap-0.5 px-1">
                        <button
                            onClick={() => handleFontSizeChange(-2)}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                            title="Decrease font size"
                        >
                            <Minus size={12} />
                        </button>
                        <span className="text-xs font-medium text-gray-700 w-6 text-center">
                            {textElement.textStyle.fontSize}
                        </span>
                        <button
                            onClick={() => handleFontSizeChange(2)}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                            title="Increase font size"
                        >
                            <Plus size={12} />
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

                    {/* Letter Spacing */}
                    <div className="flex items-center gap-0.5 px-1">
                        <button
                            onClick={() => handleLetterSpacingChange(-0.5)}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                            title="Decrease letter spacing"
                        >
                            <Minus size={10} />
                        </button>
                        <div
                            className="flex items-center justify-center px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-600 min-w-[32px]"
                            title={`Letter spacing: ${textElement.textStyle.letterSpacing || 0}`}
                        >
                            <span className="font-medium">
                                {(textElement.textStyle.letterSpacing || 0).toFixed(1)}
                            </span>
                        </div>
                        <button
                            onClick={() => handleLetterSpacingChange(0.5)}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                            title="Increase letter spacing"
                        >
                            <Plus size={10} />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* Alignment - Button with popup for all options */}
                    <div className="relative" ref={alignPopupRef}>
                        <button
                            onClick={() => setShowAlignPopup(!showAlignPopup)}
                            className={`p-1 rounded transition-all flex items-center gap-0.5 ${showAlignPopup
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            title="Align element"
                        >
                            <AlignHorizontalJustifyCenter size={12} />
                            <ChevronDown size={10} />
                        </button>

                        {/* Alignment Popup */}
                        {showAlignPopup && (
                            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50">
                                <div className="grid grid-cols-6 gap-1 min-w-[200px]">
                                    <button
                                        onClick={handlePositionAlignLeft}
                                        className="flex flex-col items-center justify-center p-2 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                                        title="Align Left"
                                    >
                                        <AlignHorizontalJustifyStart size={14} />
                                        <span className="text-[9px] mt-1 font-medium">Left</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignCenter}
                                        className="flex flex-col items-center justify-center p-2 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                                        title="Align Center"
                                    >
                                        <AlignHorizontalJustifyCenter size={14} />
                                        <span className="text-[9px] mt-1 font-medium">Center</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignRight}
                                        className="flex flex-col items-center justify-center p-2 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                                        title="Align Right"
                                    >
                                        <AlignHorizontalJustifyEnd size={14} />
                                        <span className="text-[9px] mt-1 font-medium">Right</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignTop}
                                        className="flex flex-col items-center justify-center p-2 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                                        title="Align Top"
                                    >
                                        <AlignVerticalJustifyStart size={14} />
                                        <span className="text-[9px] mt-1 font-medium">Top</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignMiddle}
                                        className="flex flex-col items-center justify-center p-2 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                                        title="Align Middle"
                                    >
                                        <AlignVerticalJustifyCenter size={14} />
                                        <span className="text-[9px] mt-1 font-medium">Middle</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignBottom}
                                        className="flex flex-col items-center justify-center p-2 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                                        title="Align Bottom"
                                    >
                                        <AlignVerticalJustifyEnd size={14} />
                                        <span className="text-[9px] mt-1 font-medium">Bottom</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* List - Single button that cycles through options */}
                    <button
                        onClick={handleListTypeChange}
                        className={`p-1 rounded transition-all ${listType !== 'none'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                        title={listType === 'none' ? 'No list' : listType === 'bullet' ? 'Bullet list' : 'Numbered list'}
                    >
                        {listType === 'numbered' ? <ListOrdered size={12} /> : <List size={12} />}
                    </button>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* Text Color */}
                    <div className="relative">
                        <input
                            type="color"
                            value={typeof textElement.style.fill === 'string' ? textElement.style.fill : '#000000'}
                            onChange={(e) => handleTextColorChange(e.target.value)}
                            className="absolute inset-0 opacity-0 w-8 h-8 cursor-pointer z-10"
                            title="Text color"
                        />
                        <div
                            className="p-1 rounded hover:bg-blue-50 transition-all cursor-pointer flex flex-col items-center justify-center"
                            title="Text color"
                        >
                            <span className="text-sm font-bold text-gray-700 leading-none">A</span>
                            <div
                                className="w-4 h-1 rounded-sm mt-0.5"
                                style={{ backgroundColor: typeof textElement.style.fill === 'string' ? textElement.style.fill : '#000000' }}
                            />
                        </div>
                    </div>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* Effects Button */}
                    <button
                        onClick={() => setRightPanel('textEffects')}
                        className="p-1 rounded transition-all text-gray-500 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                        title="Text Effects"
                    >
                        <Sparkles size={12} />
                        <span className="text-[10px] font-medium">Effects</span>
                    </button>
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
