'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useEditorStore, useActivePage } from '@/store/editorStore';
import { SolidBackground } from '@/types/project';
import { CanvasElement, ImageElement, TextElement, LineElement, ShapeElement, StickerElement } from '@/types/canvas';
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
    Shapes,
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
    const openMaskPanel = useEditorStore((state) => state.openMaskPanel);

    // List type state for text elements
    const [listType, setListType] = useState<'none' | 'bullet' | 'numbered'>('none');

    // Alignment popup state
    const [showAlignPopup, setShowAlignPopup] = useState(false);
    const alignPopupRef = useRef<HTMLDivElement>(null);

    // Line style popup state
    const [showLinePopup, setShowLinePopup] = useState(false);
    const linePopupRef = useRef<HTMLDivElement>(null);

    // Line start cap and end cap popup state
    const [showStartCapPopup, setShowStartCapPopup] = useState(false);
    const [showEndCapPopup, setShowEndCapPopup] = useState(false);
    const startCapRef = useRef<HTMLDivElement>(null);
    const endCapRef = useRef<HTMLDivElement>(null);

    // Shape stroke popup state
    const [showStrokePopup, setShowStrokePopup] = useState(false);
    const strokePopupRef = useRef<HTMLDivElement>(null);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (alignPopupRef.current && !alignPopupRef.current.contains(event.target as Node)) {
                setShowAlignPopup(false);
            }
        };

        const handleClickOutsideLine = (event: MouseEvent) => {
            if (linePopupRef.current && !linePopupRef.current.contains(event.target as Node)) {
                setShowLinePopup(false);
            }
        };

        const handleClickOutsideStartCap = (event: MouseEvent) => {
            if (startCapRef.current && !startCapRef.current.contains(event.target as Node)) {
                setShowStartCapPopup(false);
            }
        };

        const handleClickOutsideEndCap = (event: MouseEvent) => {
            if (endCapRef.current && !endCapRef.current.contains(event.target as Node)) {
                setShowEndCapPopup(false);
            }
        };

        const handleClickOutsideStroke = (event: MouseEvent) => {
            if (strokePopupRef.current && !strokePopupRef.current.contains(event.target as Node)) {
                setShowStrokePopup(false);
            }
        };

        if (showAlignPopup) document.addEventListener('mousedown', handleClickOutside);
        if (showLinePopup) document.addEventListener('mousedown', handleClickOutsideLine);
        if (showStartCapPopup) document.addEventListener('mousedown', handleClickOutsideStartCap);
        if (showEndCapPopup) document.addEventListener('mousedown', handleClickOutsideEndCap);
        if (showStrokePopup) document.addEventListener('mousedown', handleClickOutsideStroke);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('mousedown', handleClickOutsideLine);
            document.removeEventListener('mousedown', handleClickOutsideStartCap);
            document.removeEventListener('mousedown', handleClickOutsideEndCap);
            document.removeEventListener('mousedown', handleClickOutsideStroke);
        };
    }, [showAlignPopup, showLinePopup, showStartCapPopup, showEndCapPopup, showStrokePopup]);

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
    const isLine = element?.type === 'line';
    const isShape = element?.type === 'shape';
    const isSticker = element?.type === 'sticker';
    const textElement = isText ? (element as TextElement) : null;
    const imageElement = isImage ? (element as ImageElement) : null;
    const shapeElement = isShape ? (element as ShapeElement) : null;
    const stickerElement = isSticker ? (element as StickerElement) : null;
    // Ensure lineElement has a valid lineStyle with defaults
    const lineElement = isLine ? (element as LineElement) : null;
    const lineStyleSafe = lineElement?.lineStyle || { dashPattern: 'solid', startCap: 'none', endCap: 'none', capFill: 'outline' };

    // Helper to update line decorations - updates both store AND fabric object
    const updateLineDecoration = (newLineStyle: Partial<typeof lineStyleSafe>) => {
        if (!lineElement) return;
        const updatedStyle = { ...lineStyleSafe, ...newLineStyle };
        updateElement(lineElement.id, {
            lineStyle: updatedStyle
        } as Partial<LineElement>);
        // Also update the fabric object's lineElement so _render can read the new values
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(lineElement.id) as any;
        if (fabricObj && fabricObj.lineElement) {
            fabricObj.lineElement = { ...fabricObj.lineElement, lineStyle: updatedStyle };
        }
        fabricCanvas.getCanvas()?.renderAll();
    };

    // Shape fill color change handler
    const handleShapeFillChange = (color: string) => {
        if (!shapeElement) return;
        updateElement(shapeElement.id, {
            style: { ...shapeElement.style, fill: color }
        } as Partial<ShapeElement>);
        // Sync to Fabric.js
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(shapeElement.id);
        if (fabricObj) {
            (fabricObj as any).set({ fill: color });
            fabricCanvas.getCanvas()?.renderAll();
        }
    };

    // Sticker/Graphics color change handler - applies color to ENTIRE element
    const handleStickerColorChange = (color: string) => {
        if (!stickerElement) return;

        // Replace ALL colors in SVG with the selected color for uniform coloring
        // This creates a single-color version of the sticker
        let newSvgContent = stickerElement.originalSvgContent;

        // Replace all fill colors
        newSvgContent = newSvgContent.replace(/fill="[^"]*"/gi, `fill="${color}"`);
        newSvgContent = newSvgContent.replace(/fill:[^;"]*/gi, `fill:${color}`);

        // Replace all stroke colors
        newSvgContent = newSvgContent.replace(/stroke="[^"]*"/gi, `stroke="${color}"`);
        newSvgContent = newSvgContent.replace(/stroke:[^;"]*/gi, `stroke:${color}`);

        // Handle "none" values - keep them as none
        newSvgContent = newSvgContent.replace(/fill="none"/gi, 'fill="none"');
        newSvgContent = newSvgContent.replace(/stroke="none"/gi, 'stroke="none"');

        // Create new colorMap with all colors mapped to selected color
        const newColorMap: Record<string, string> = {};
        Object.keys(stickerElement.colorMap).forEach(originalColor => {
            newColorMap[originalColor] = color;
        });

        // Update element in store
        updateElement(stickerElement.id, {
            svgContent: newSvgContent,
            colorMap: newColorMap,
        } as Partial<StickerElement>);

        // Update Fabric.js canvas
        const fabricCanvas = getFabricCanvas();
        fabricCanvas.updateStickerSvg(stickerElement.id, newSvgContent);
    };

    // Shape stroke color change handler
    const handleShapeStrokeColorChange = (color: string) => {
        if (!shapeElement) return;
        // Also ensure stroke width is set if currently 0
        const currentStrokeWidth = shapeElement.style.strokeWidth || 0;
        const newStrokeWidth = currentStrokeWidth === 0 ? 2 : currentStrokeWidth;
        updateElement(shapeElement.id, {
            style: { ...shapeElement.style, stroke: color, strokeWidth: newStrokeWidth }
        } as Partial<ShapeElement>);
        // Sync to Fabric.js
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(shapeElement.id);
        if (fabricObj) {
            (fabricObj as any).set({ stroke: color, strokeWidth: newStrokeWidth });
            fabricCanvas.getCanvas()?.renderAll();
        }
    };

    // Shape stroke width change handler
    const handleShapeStrokeWidthChange = (width: number) => {
        if (!shapeElement) return;
        updateElement(shapeElement.id, {
            style: { ...shapeElement.style, strokeWidth: width }
        } as Partial<ShapeElement>);
        // Sync to Fabric.js
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(shapeElement.id);
        if (fabricObj) {
            (fabricObj as any).set({ strokeWidth: width });
            fabricCanvas.getCanvas()?.renderAll();
        }
    };

    // Shape stroke style types
    type StrokeStyleType = 'none' | 'solid' | 'dashed' | 'dotted';

    // Handle shape stroke style change
    const handleShapeStrokeStyleChange = (style: StrokeStyleType) => {
        if (!shapeElement) return;
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(shapeElement.id);

        if (style === 'none') {
            updateElement(shapeElement.id, {
                style: { ...shapeElement.style, stroke: null, strokeWidth: 0 }
            } as Partial<ShapeElement>);
            if (fabricObj) {
                (fabricObj as any).set({ stroke: null, strokeWidth: 0, strokeDashArray: null });
                fabricCanvas.getCanvas()?.renderAll();
            }
        } else {
            const currentStroke = shapeElement.style.stroke || '#000000';
            const currentWidth = shapeElement.style.strokeWidth || 2;
            let dashArray: number[] | null = null;

            if (style === 'dashed') {
                dashArray = [10, 5];
            } else if (style === 'dotted') {
                dashArray = [2, 4];
            }

            updateElement(shapeElement.id, {
                style: { ...shapeElement.style, stroke: currentStroke, strokeWidth: currentWidth }
            } as Partial<ShapeElement>);

            if (fabricObj) {
                (fabricObj as any).set({
                    stroke: currentStroke,
                    strokeWidth: currentWidth,
                    strokeDashArray: dashArray
                });
                fabricCanvas.getCanvas()?.renderAll();
            }
        }
        setShowStrokePopup(false);
    };

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

        if (fabricObj && (fabricObj.type === 'textbox' || fabricObj.type === 'i-text')) {
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

        if (fabricObj && (fabricObj.type === 'textbox' || fabricObj.type === 'i-text')) {
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
        if (!element) return { width: 0, height: 0 };
        const fabricCanvas = getFabricCanvas();
        const fabricObject = fabricCanvas.getObjectById(element.id);
        if (fabricObject) {
            // Use actual scaled dimensions, not bounding rect which includes control padding
            const scaleX = fabricObject.scaleX || 1;
            const scaleY = fabricObject.scaleY || 1;
            const objWidth = (fabricObject.width || 0) * scaleX;
            const objHeight = (fabricObject.height || 0) * scaleY;
            return { width: objWidth, height: objHeight };
        }
        const width = element.transform.width * Math.abs(element.transform.scaleX);
        const height = element.transform.height * Math.abs(element.transform.scaleY);
        return { width, height };
    };

    // Position alignment handlers (like sidebar)
    const handlePositionAlignLeft = () => {
        if (!element) return;
        const { width } = getElementBounds();
        updateTransform(element.id, { x: width / 2 });
        setShowAlignPopup(false);
    };

    const handlePositionAlignCenter = () => {
        if (!element) return;
        updateTransform(element.id, { x: canvasWidth / 2 });
        setShowAlignPopup(false);
    };

    const handlePositionAlignRight = () => {
        if (!element) return;
        const { width } = getElementBounds();
        updateTransform(element.id, { x: canvasWidth - width / 2 });
        setShowAlignPopup(false);
    };

    const handlePositionAlignTop = () => {
        if (!element) return;
        const { height } = getElementBounds();
        updateTransform(element.id, { y: height / 2 });
        setShowAlignPopup(false);
    };

    const handlePositionAlignMiddle = () => {
        if (!element) return;
        updateTransform(element.id, { y: canvasHeight / 2 });
        setShowAlignPopup(false);
    };

    const handlePositionAlignBottom = () => {
        if (!element) return;
        const { height } = getElementBounds();
        updateTransform(element.id, { y: canvasHeight - height / 2 });
        setShowAlignPopup(false);
    };

    return (
        <div className="h-11 bg-[#F8F9FA] border-b border-gray-200 flex items-center px-2 gap-1 overflow-x-auto custom-scrollbar">
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

                    {/* Mask Image Button */}
                    <button
                        onClick={openMaskPanel}
                        className={`p-2 rounded transition-all flex items-center gap-1.5 ${imageElement?.mask
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                        title="Mask Image"
                    >
                        <Shapes size={16} />
                        <span className="text-xs font-medium">Mask</span>
                    </button>


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
                            <AlignHorizontalJustifyCenter size={14} />
                            <ChevronDown size={12} />
                        </button>

                        {/* Alignment Popup */}
                        {showAlignPopup && (
                            <div className="fixed top-[90px] left-[50%] -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 z-50">
                                <div className="grid grid-cols-6 gap-0.5">
                                    <button
                                        onClick={handlePositionAlignLeft}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Left"
                                    >
                                        <AlignHorizontalJustifyStart size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Left</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignCenter}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Center"
                                    >
                                        <AlignHorizontalJustifyCenter size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Center</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignRight}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Right"
                                    >
                                        <AlignHorizontalJustifyEnd size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Right</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignTop}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Top"
                                    >
                                        <AlignVerticalJustifyStart size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Top</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignMiddle}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Middle"
                                    >
                                        <AlignVerticalJustifyCenter size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Mid</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignBottom}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Bottom"
                                    >
                                        <AlignVerticalJustifyEnd size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Bot</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
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
                            <Minus size={14} />
                        </button>
                        <span className="text-xs font-medium text-gray-700 w-6 text-center">
                            {textElement.textStyle.fontSize}
                        </span>
                        <button
                            onClick={() => handleFontSizeChange(2)}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                            title="Increase font size"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* Text Align within textbox (left, center, right) */}
                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={() => setAlignment('left')}
                            className={`p-1.5 rounded transition-all ${textElement.textStyle.textAlign === 'left'
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            title="Align text left"
                        >
                            <AlignLeft size={14} />
                        </button>
                        <button
                            onClick={() => setAlignment('center')}
                            className={`p-1.5 rounded transition-all ${textElement.textStyle.textAlign === 'center'
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            title="Align text center"
                        >
                            <AlignCenter size={14} />
                        </button>
                        <button
                            onClick={() => setAlignment('right')}
                            className={`p-1.5 rounded transition-all ${textElement.textStyle.textAlign === 'right'
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            title="Align text right"
                        >
                            <AlignRight size={14} />
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
                            <Minus size={14} />
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
                            <Plus size={14} />
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
                            <AlignHorizontalJustifyCenter size={14} />
                            <ChevronDown size={12} />
                        </button>

                        {/* Alignment Popup */}
                        {showAlignPopup && (
                            <div className="fixed top-[90px] left-[50%] -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 z-50">
                                <div className="grid grid-cols-6 gap-0.5">
                                    <button
                                        onClick={handlePositionAlignLeft}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Left"
                                    >
                                        <AlignHorizontalJustifyStart size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Left</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignCenter}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Center"
                                    >
                                        <AlignHorizontalJustifyCenter size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Center</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignRight}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Right"
                                    >
                                        <AlignHorizontalJustifyEnd size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Right</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignTop}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Top"
                                    >
                                        <AlignVerticalJustifyStart size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Top</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignMiddle}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Middle"
                                    >
                                        <AlignVerticalJustifyCenter size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Mid</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignBottom}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Bottom"
                                    >
                                        <AlignVerticalJustifyEnd size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Bot</span>
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
                        {listType === 'numbered' ? <ListOrdered size={14} /> : <List size={14} />}
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
                        <Sparkles size={14} />
                        <span className="text-[11px] font-medium">Effects</span>
                    </button>
                </>
            )}

            {/* Shape Formatting Options */}
            {isShape && shapeElement && (
                <>
                    {/* Fill Color */}
                    <div className="relative">
                        <input
                            type="color"
                            value={typeof shapeElement.style.fill === 'string' ? shapeElement.style.fill : '#000000'}
                            onChange={(e) => handleShapeFillChange(e.target.value)}
                            className="absolute inset-0 opacity-0 w-6 h-6 cursor-pointer z-10"
                            title="Fill color"
                        />
                        <div
                            className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-blue-400 hover:scale-110 transition-all cursor-pointer shadow-sm"
                            style={{ backgroundColor: typeof shapeElement.style.fill === 'string' ? shapeElement.style.fill : '#000000' }}
                            title="Fill color"
                        />
                    </div>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* Stroke Style Button with Popup */}
                    <div className="relative" ref={strokePopupRef}>
                        <button
                            onClick={() => setShowStrokePopup(!showStrokePopup)}
                            className={`p-1 rounded transition-all flex items-center gap-0.5 ${showStrokePopup
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            title="Stroke style"
                        >
                            {/* Stroke style icon - dashed rectangle */}
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="2" y="2" width="12" height="12" rx="2" strokeDasharray="3,2" />
                            </svg>
                            <ChevronDown size={10} />
                        </button>

                        {/* Stroke Popup - positioned below the entire context bar */}
                        {showStrokePopup && (
                            <div className="fixed top-[48px] left-[50%] -translate-x-1/2 bg-white rounded-2xl shadow-lg border border-gray-100 px-3 py-3 z-50">
                                {/* Stroke Style Options - 5 compact buttons */}
                                <div className="flex items-center gap-1.5 mb-3">
                                    {/* No Stroke */}
                                    <button
                                        onClick={() => {
                                            if (!shapeElement) return;
                                            updateElement(shapeElement.id, {
                                                style: { ...shapeElement.style, stroke: null, strokeWidth: 0 }
                                            } as Partial<ShapeElement>);
                                            const fabricCanvas = getFabricCanvas();
                                            const fabricObj = fabricCanvas.getObjectById(shapeElement.id);
                                            if (fabricObj) {
                                                (fabricObj as any).set({ stroke: null, strokeWidth: 0, strokeDashArray: null });
                                                fabricCanvas.getCanvas()?.renderAll();
                                            }
                                        }}
                                        className={`w-10 h-9 rounded-lg flex items-center justify-center transition-all ${!shapeElement.style.stroke || shapeElement.style.strokeWidth === 0
                                            ? 'border-2 border-blue-500 bg-blue-50'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                        title="No stroke"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
                                            <circle cx="8" cy="8" r="5" />
                                            <line x1="4" y1="12" x2="12" y2="4" />
                                        </svg>
                                    </button>
                                    {/* Solid */}
                                    <button
                                        onClick={() => {
                                            if (!shapeElement) return;
                                            const currentStroke = shapeElement.style.stroke || '#000000';
                                            const currentWidth = shapeElement.style.strokeWidth || 2;
                                            updateElement(shapeElement.id, {
                                                style: { ...shapeElement.style, stroke: currentStroke, strokeWidth: currentWidth > 0 ? currentWidth : 2 }
                                            } as Partial<ShapeElement>);
                                            const fabricCanvas = getFabricCanvas();
                                            const fabricObj = fabricCanvas.getObjectById(shapeElement.id);
                                            if (fabricObj) {
                                                (fabricObj as any).set({
                                                    stroke: currentStroke,
                                                    strokeWidth: currentWidth > 0 ? currentWidth : 2,
                                                    strokeDashArray: null
                                                });
                                                fabricCanvas.getCanvas()?.renderAll();
                                            }
                                        }}
                                        className={`w-10 h-9 rounded-lg flex items-center justify-center transition-all ${shapeElement.style.stroke && shapeElement.style.strokeWidth > 0
                                            ? 'border-2 border-blue-500 bg-blue-50'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                        title="Solid"
                                    >
                                        <svg width="20" height="3" viewBox="0 0 20 3" className="text-gray-600">
                                            <line x1="0" y1="1.5" x2="20" y2="1.5" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    </button>
                                    {/* Short Dashed */}
                                    <button
                                        onClick={() => {
                                            if (!shapeElement) return;
                                            const currentStroke = shapeElement.style.stroke || '#000000';
                                            const currentWidth = shapeElement.style.strokeWidth || 2;
                                            updateElement(shapeElement.id, {
                                                style: { ...shapeElement.style, stroke: currentStroke, strokeWidth: currentWidth > 0 ? currentWidth : 2 }
                                            } as Partial<ShapeElement>);
                                            const fabricCanvas = getFabricCanvas();
                                            const fabricObj = fabricCanvas.getObjectById(shapeElement.id);
                                            if (fabricObj) {
                                                const sw = currentWidth > 0 ? currentWidth : 2;
                                                (fabricObj as any).set({
                                                    stroke: currentStroke,
                                                    strokeWidth: sw,
                                                    strokeDashArray: [sw * 2, sw]
                                                });
                                                fabricCanvas.getCanvas()?.renderAll();
                                            }
                                        }}
                                        className="w-10 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
                                        title="Short dashed"
                                    >
                                        <svg width="20" height="3" viewBox="0 0 20 3" className="text-gray-600">
                                            <line x1="0" y1="1.5" x2="20" y2="1.5" stroke="currentColor" strokeWidth="2" strokeDasharray="3,2" />
                                        </svg>
                                    </button>
                                    {/* Long Dashed */}
                                    <button
                                        onClick={() => {
                                            if (!shapeElement) return;
                                            const currentStroke = shapeElement.style.stroke || '#000000';
                                            const currentWidth = shapeElement.style.strokeWidth || 2;
                                            updateElement(shapeElement.id, {
                                                style: { ...shapeElement.style, stroke: currentStroke, strokeWidth: currentWidth > 0 ? currentWidth : 2 }
                                            } as Partial<ShapeElement>);
                                            const fabricCanvas = getFabricCanvas();
                                            const fabricObj = fabricCanvas.getObjectById(shapeElement.id);
                                            if (fabricObj) {
                                                const sw = currentWidth > 0 ? currentWidth : 2;
                                                (fabricObj as any).set({
                                                    stroke: currentStroke,
                                                    strokeWidth: sw,
                                                    strokeDashArray: [sw * 4, sw * 2]
                                                });
                                                fabricCanvas.getCanvas()?.renderAll();
                                            }
                                        }}
                                        className="w-10 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
                                        title="Long dashed"
                                    >
                                        <svg width="20" height="3" viewBox="0 0 20 3" className="text-gray-600">
                                            <line x1="0" y1="1.5" x2="20" y2="1.5" stroke="currentColor" strokeWidth="2" strokeDasharray="5,3" />
                                        </svg>
                                    </button>
                                    {/* Dotted */}
                                    <button
                                        onClick={() => {
                                            if (!shapeElement) return;
                                            const currentStroke = shapeElement.style.stroke || '#000000';
                                            const currentWidth = shapeElement.style.strokeWidth || 2;
                                            updateElement(shapeElement.id, {
                                                style: { ...shapeElement.style, stroke: currentStroke, strokeWidth: currentWidth > 0 ? currentWidth : 2 }
                                            } as Partial<ShapeElement>);
                                            const fabricCanvas = getFabricCanvas();
                                            const fabricObj = fabricCanvas.getObjectById(shapeElement.id);
                                            if (fabricObj) {
                                                const sw = currentWidth > 0 ? currentWidth : 2;
                                                (fabricObj as any).set({
                                                    stroke: currentStroke,
                                                    strokeWidth: sw,
                                                    strokeDashArray: [sw, sw * 2],
                                                    strokeLineCap: 'round'
                                                });
                                                fabricCanvas.getCanvas()?.renderAll();
                                            }
                                        }}
                                        className="w-10 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
                                        title="Dotted"
                                    >
                                        <svg width="20" height="3" viewBox="0 0 20 3" className="text-gray-600">
                                            <line x1="2" y1="1.5" x2="18" y2="1.5" stroke="currentColor" strokeWidth="2" strokeDasharray="1,3" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Stroke Width */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-800 font-medium">Stroke Width</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="20"
                                            value={shapeElement.style.strokeWidth || 0}
                                            onChange={(e) => handleShapeStrokeWidthChange(Number(e.target.value))}
                                            className="w-12 px-2 py-1 text-sm text-center text-gray-700 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="20"
                                        value={shapeElement.style.strokeWidth || 0}
                                        onChange={(e) => handleShapeStrokeWidthChange(Number(e.target.value))}
                                        className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* Stroke Color */}
                    <div className="relative">
                        <input
                            type="color"
                            value={typeof shapeElement.style.stroke === 'string' ? shapeElement.style.stroke : '#000000'}
                            onChange={(e) => handleShapeStrokeColorChange(e.target.value)}
                            className="absolute inset-0 opacity-0 w-6 h-6 cursor-pointer z-10"
                            title="Stroke color"
                        />
                        <div
                            className="w-6 h-6 rounded transition-all cursor-pointer flex items-center justify-center hover:scale-110"
                            title="Stroke color"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <rect x="2" y="2" width="12" height="12" rx="2" stroke={typeof shapeElement.style.stroke === 'string' ? shapeElement.style.stroke : '#000000'} strokeWidth="2.5" />
                            </svg>
                        </div>
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
                            <AlignHorizontalJustifyCenter size={14} />
                            <ChevronDown size={12} />
                        </button>

                        {/* Alignment Popup */}
                        {showAlignPopup && (
                            <div className="fixed top-[90px] left-[50%] -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 z-50">
                                <div className="grid grid-cols-6 gap-0.5">
                                    <button
                                        onClick={handlePositionAlignLeft}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Left"
                                    >
                                        <AlignHorizontalJustifyStart size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Left</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignCenter}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Center"
                                    >
                                        <AlignHorizontalJustifyCenter size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Center</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignRight}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Right"
                                    >
                                        <AlignHorizontalJustifyEnd size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Right</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignTop}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Top"
                                    >
                                        <AlignVerticalJustifyStart size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Top</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignMiddle}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Middle"
                                    >
                                        <AlignVerticalJustifyCenter size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Mid</span>
                                    </button>
                                    <button
                                        onClick={handlePositionAlignBottom}
                                        className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all w-10"
                                        title="Align Bottom"
                                    >
                                        <AlignVerticalJustifyEnd size={14} />
                                        <span className="text-[8px] mt-0.5 font-medium leading-none">Bot</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Sticker/Graphics Color Options */}
            {isSticker && stickerElement && (
                <>
                    {/* Color label */}
                    <span className="text-xs text-gray-500 font-medium px-1">Color</span>

                    {/* Color palette - common colors */}
                    <div className="flex items-center gap-1">
                        {['#000000', '#FFFFFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#9B59B6'].map((color) => (
                            <button
                                key={color}
                                onClick={() => handleStickerColorChange(color)}
                                className="w-5 h-5 rounded-full border border-gray-300 hover:border-blue-400 hover:scale-110 transition-all shadow-sm"
                                style={{ backgroundColor: color }}
                                title={`Apply ${color}`}
                            />
                        ))}

                        {/* Custom Color Picker */}
                        <div className="relative">
                            <input
                                type="color"
                                onChange={(e) => handleStickerColorChange(e.target.value)}
                                className="absolute inset-0 opacity-0 w-5 h-5 cursor-pointer"
                                title="Pick custom color"
                            />
                            <div
                                className="w-5 h-5 rounded-full border border-gray-300 hover:border-blue-400 hover:scale-110 transition-all shadow-sm cursor-pointer"
                                style={{
                                    background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)'
                                }}
                                title="Pick custom color"
                            />
                        </div>
                    </div>

                    <div className="w-px h-6 bg-gray-200" />
                </>
            )}

            {/* Line Formatting Options - Icon button with popup */}
            {isLine && lineElement && (
                <>
                    <div className="relative" ref={linePopupRef}>
                        {/* Line Style Icon Button */}
                        <button
                            onClick={() => setShowLinePopup(!showLinePopup)}
                            className={`p-1.5 rounded transition-all ${showLinePopup
                                ? 'text-purple-600 bg-purple-50'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            title="Line style"
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="1" y="2" width="14" height="2" rx="1" />
                                <rect x="1" y="7" width="14" height="2" rx="1" />
                                <rect x="1" y="12" width="14" height="2" rx="1" />
                            </svg>
                        </button>

                        {/* Line Style Popup - positioned below the entire context bar */}
                        {showLinePopup && (
                            <div className="fixed top-[48px] left-[50%] -translate-x-1/2 bg-white rounded-2xl shadow-lg border border-gray-100 px-3 py-3 z-50">
                                {/* Line Style Options - 4 compact buttons */}
                                <div className="flex items-center gap-1.5 mb-3">
                                    {/* Solid */}
                                    <button
                                        onClick={() => {
                                            updateElement(lineElement.id, {
                                                lineStyle: { ...lineElement.lineStyle, dashPattern: 'solid' }
                                            } as Partial<LineElement>);
                                            const fabricCanvas = getFabricCanvas();
                                            const fabricObj = fabricCanvas.getObjectById(lineElement.id);
                                            if (fabricObj) {
                                                (fabricObj as any).set({ strokeDashArray: null });
                                                fabricCanvas.getCanvas()?.renderAll();
                                            }
                                        }}
                                        className={`w-10 h-9 rounded-lg flex items-center justify-center transition-all ${lineStyleSafe.dashPattern === 'solid'
                                            ? 'border-2 border-blue-500 bg-blue-50'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                        title="Solid"
                                    >
                                        <svg width="20" height="3" viewBox="0 0 20 3" className="text-gray-600">
                                            <line x1="0" y1="1.5" x2="20" y2="1.5" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    </button>
                                    {/* Short Dashed */}
                                    <button
                                        onClick={() => {
                                            updateElement(lineElement.id, {
                                                lineStyle: { ...lineElement.lineStyle, dashPattern: 'dashed' }
                                            } as Partial<LineElement>);
                                            const fabricCanvas = getFabricCanvas();
                                            const fabricObj = fabricCanvas.getObjectById(lineElement.id);
                                            if (fabricObj) {
                                                const sw = lineElement.strokeWidth || 4;
                                                (fabricObj as any).set({ strokeDashArray: [sw * 2, sw] });
                                                fabricCanvas.getCanvas()?.renderAll();
                                            }
                                        }}
                                        className={`w-10 h-9 rounded-lg flex items-center justify-center transition-all ${lineStyleSafe.dashPattern === 'dashed'
                                            ? 'border-2 border-blue-500 bg-blue-50'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                        title="Dashed"
                                    >
                                        <svg width="20" height="3" viewBox="0 0 20 3" className="text-gray-600">
                                            <line x1="0" y1="1.5" x2="20" y2="1.5" stroke="currentColor" strokeWidth="2" strokeDasharray="3,2" />
                                        </svg>
                                    </button>
                                    {/* Long Dashed */}
                                    <button
                                        onClick={() => {
                                            updateElement(lineElement.id, {
                                                lineStyle: { ...lineElement.lineStyle, dashPattern: 'long-dashed' as any }
                                            } as Partial<LineElement>);
                                            const fabricCanvas = getFabricCanvas();
                                            const fabricObj = fabricCanvas.getObjectById(lineElement.id);
                                            if (fabricObj) {
                                                const sw = lineElement.strokeWidth || 4;
                                                (fabricObj as any).set({ strokeDashArray: [sw * 4, sw * 2] });
                                                fabricCanvas.getCanvas()?.renderAll();
                                            }
                                        }}
                                        className={`w-10 h-9 rounded-lg flex items-center justify-center transition-all ${(lineStyleSafe.dashPattern as any) === 'long-dashed'
                                            ? 'border-2 border-blue-500 bg-blue-50'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                        title="Long dashed"
                                    >
                                        <svg width="20" height="3" viewBox="0 0 20 3" className="text-gray-600">
                                            <line x1="0" y1="1.5" x2="20" y2="1.5" stroke="currentColor" strokeWidth="2" strokeDasharray="5,3" />
                                        </svg>
                                    </button>
                                    {/* Dotted */}
                                    <button
                                        onClick={() => {
                                            updateElement(lineElement.id, {
                                                lineStyle: { ...lineElement.lineStyle, dashPattern: 'dotted' }
                                            } as Partial<LineElement>);
                                            const fabricCanvas = getFabricCanvas();
                                            const fabricObj = fabricCanvas.getObjectById(lineElement.id);
                                            if (fabricObj) {
                                                const sw = lineElement.strokeWidth || 4;
                                                (fabricObj as any).set({ strokeDashArray: [sw, sw * 2], strokeLineCap: 'round' });
                                                fabricCanvas.getCanvas()?.renderAll();
                                            }
                                        }}
                                        className={`w-10 h-9 rounded-lg flex items-center justify-center transition-all ${lineStyleSafe.dashPattern === 'dotted'
                                            ? 'border-2 border-blue-500 bg-blue-50'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                        title="Dotted"
                                    >
                                        <svg width="20" height="3" viewBox="0 0 20 3" className="text-gray-600">
                                            <line x1="2" y1="1.5" x2="18" y2="1.5" stroke="currentColor" strokeWidth="2" strokeDasharray="1,3" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Stroke Width */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-800 font-medium">Stroke Width</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={lineElement.strokeWidth || 4}
                                            onChange={(e) => {
                                                const newWidth = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
                                                updateElement(lineElement.id, {
                                                    strokeWidth: newWidth
                                                } as Partial<LineElement>);
                                                const fabricCanvas = getFabricCanvas();
                                                const fabricObj = fabricCanvas.getObjectById(lineElement.id);
                                                if (fabricObj) {
                                                    (fabricObj as any).set({ strokeWidth: newWidth });
                                                    fabricCanvas.getCanvas()?.renderAll();
                                                }
                                            }}
                                            className="w-12 px-2 py-1 text-sm text-center text-gray-700 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="20"
                                        value={lineElement.strokeWidth || 4}
                                        onChange={(e) => {
                                            const newWidth = parseInt(e.target.value);
                                            updateElement(lineElement.id, {
                                                strokeWidth: newWidth
                                            } as Partial<LineElement>);
                                            const fabricCanvas = getFabricCanvas();
                                            const fabricObj = fabricCanvas.getObjectById(lineElement.id);
                                            if (fabricObj) {
                                                (fabricObj as any).set({ strokeWidth: newWidth });
                                                const pattern = lineStyleSafe.dashPattern;
                                                if (pattern === 'dashed') {
                                                    (fabricObj as any).set({ strokeDashArray: [newWidth * 2, newWidth] });
                                                } else if ((pattern as any) === 'long-dashed') {
                                                    (fabricObj as any).set({ strokeDashArray: [newWidth * 4, newWidth * 2] });
                                                } else if (pattern === 'dotted') {
                                                    (fabricObj as any).set({ strokeDashArray: [newWidth, newWidth * 2] });
                                                }
                                                fabricCanvas.getCanvas()?.renderAll();
                                            }
                                        }}
                                        className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Start Cap (Left Arrow) Button */}
                    <div className="relative" ref={startCapRef}>
                        <button
                            onClick={() => {
                                setShowStartCapPopup(!showStartCapPopup);
                                setShowEndCapPopup(false);
                            }}
                            className={`p-1.5 rounded transition-all ${showStartCapPopup
                                ? 'text-purple-600 bg-purple-50'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            title="Start cap"
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="6" y1="8" x2="14" y2="8" />
                                <polyline points="9,5 6,8 9,11" fill="none" />
                            </svg>
                        </button>

                        {showStartCapPopup && (
                            <div className="fixed top-[48px] left-[50%] -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50">
                                <div className="grid grid-cols-5 gap-2">
                                    {/* Row 1: None + Outline variants */}
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ startCap: 'none' });
                                            setShowStartCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.startCap === 'none' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="None"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16"><circle cx="12" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" /><line x1="8" y1="4" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ startCap: 'arrow', capFill: 'outline' });
                                            setShowStartCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.startCap === 'arrow' && lineStyleSafe.capFill !== 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Arrow outline"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="10" y1="8" x2="22" y2="8" /><polyline points="14,4 10,8 14,12" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ startCap: 'circle', capFill: 'outline' });
                                            setShowStartCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.startCap === 'circle' && lineStyleSafe.capFill !== 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Circle outline"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="10" y1="8" x2="22" y2="8" /><circle cx="6" cy="8" r="4" fill="none" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ startCap: 'square', capFill: 'outline' });
                                            setShowStartCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.startCap === 'square' && lineStyleSafe.capFill !== 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Square outline"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="10" y1="8" x2="22" y2="8" /><rect x="2" y="4" width="8" height="8" fill="none" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ startCap: 'diamond', capFill: 'outline' });
                                            setShowStartCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.startCap === 'diamond' && lineStyleSafe.capFill !== 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Diamond outline"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="10" y1="8" x2="22" y2="8" /><polygon points="6,2 10,8 6,14 2,8" fill="none" /></svg>
                                    </button>

                                    {/* Row 2: Bar + Filled variants */}
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ startCap: 'bar' });
                                            setShowStartCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.startCap === 'bar' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Bar"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="6" y1="8" x2="22" y2="8" /><line x1="4" y1="3" x2="4" y2="13" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ startCap: 'arrow', capFill: 'filled' });
                                            setShowStartCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.startCap === 'arrow' && lineStyleSafe.capFill === 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Arrow filled"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><line x1="10" y1="8" x2="22" y2="8" /><polygon points="10,8 14,4 14,12" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ startCap: 'circle', capFill: 'filled' });
                                            setShowStartCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.startCap === 'circle' && lineStyleSafe.capFill === 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Circle filled"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><line x1="10" y1="8" x2="22" y2="8" /><circle cx="6" cy="8" r="4" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ startCap: 'square', capFill: 'filled' });
                                            setShowStartCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.startCap === 'square' && lineStyleSafe.capFill === 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Square filled"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><line x1="10" y1="8" x2="22" y2="8" /><rect x="2" y="4" width="8" height="8" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ startCap: 'diamond', capFill: 'filled' });
                                            setShowStartCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.startCap === 'diamond' && lineStyleSafe.capFill === 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Diamond filled"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><line x1="10" y1="8" x2="22" y2="8" /><polygon points="6,2 10,8 6,14 2,8" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* End Cap (Right Arrow) Button */}
                    <div className="relative" ref={endCapRef}>
                        <button
                            onClick={() => {
                                setShowEndCapPopup(!showEndCapPopup);
                                setShowStartCapPopup(false);
                            }}
                            className={`p-1.5 rounded transition-all ${showEndCapPopup
                                ? 'text-purple-600 bg-purple-50'
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            title="End cap"
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="2" y1="8" x2="10" y2="8" />
                                <polyline points="7,5 10,8 7,11" fill="none" />
                            </svg>
                        </button>

                        {showEndCapPopup && (
                            <div className="fixed top-[48px] left-[50%] -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50">
                                <div className="grid grid-cols-5 gap-2">
                                    {/* Row 1: None + Outline variants */}
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ endCap: 'none' });
                                            setShowEndCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.endCap === 'none' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="None"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16"><circle cx="12" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" /><line x1="8" y1="4" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ endCap: 'arrow', capFill: 'outline' });
                                            setShowEndCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.endCap === 'arrow' && lineStyleSafe.capFill !== 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Arrow outline"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="2" y1="8" x2="14" y2="8" /><polyline points="10,4 14,8 10,12" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ endCap: 'circle', capFill: 'outline' });
                                            setShowEndCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.endCap === 'circle' && lineStyleSafe.capFill !== 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Circle outline"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="2" y1="8" x2="14" y2="8" /><circle cx="18" cy="8" r="4" fill="none" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ endCap: 'square', capFill: 'outline' });
                                            setShowEndCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.endCap === 'square' && lineStyleSafe.capFill !== 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Square outline"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="2" y1="8" x2="14" y2="8" /><rect x="14" y="4" width="8" height="8" fill="none" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ endCap: 'diamond', capFill: 'outline' });
                                            setShowEndCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.endCap === 'diamond' && lineStyleSafe.capFill !== 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Diamond outline"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="2" y1="8" x2="14" y2="8" /><polygon points="18,2 22,8 18,14 14,8" fill="none" /></svg>
                                    </button>

                                    {/* Row 2: Bar + Filled variants */}
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ endCap: 'bar' });
                                            setShowEndCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.endCap === 'bar' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Bar"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="2" y1="8" x2="18" y2="8" /><line x1="20" y1="3" x2="20" y2="13" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ endCap: 'arrow', capFill: 'filled' });
                                            setShowEndCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.endCap === 'arrow' && lineStyleSafe.capFill === 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Arrow filled"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><line x1="2" y1="8" x2="14" y2="8" /><polygon points="14,8 10,4 10,12" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ endCap: 'circle', capFill: 'filled' });
                                            setShowEndCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.endCap === 'circle' && lineStyleSafe.capFill === 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Circle filled"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><line x1="2" y1="8" x2="14" y2="8" /><circle cx="18" cy="8" r="4" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ endCap: 'square', capFill: 'filled' });
                                            setShowEndCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.endCap === 'square' && lineStyleSafe.capFill === 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Square filled"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><line x1="2" y1="8" x2="14" y2="8" /><rect x="14" y="4" width="8" height="8" /></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            updateLineDecoration({ endCap: 'diamond', capFill: 'filled' });
                                            setShowEndCapPopup(false);
                                        }}
                                        className={`p-2.5 rounded-lg transition-all ${lineStyleSafe.endCap === 'diamond' && lineStyleSafe.capFill === 'filled' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        title="Diamond filled"
                                    >
                                        <svg width="24" height="16" viewBox="0 0 24 16" fill="currentColor" stroke="currentColor" strokeWidth="1.5"><line x1="2" y1="8" x2="14" y2="8" /><polygon points="18,2 22,8 18,14 14,8" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-px h-6 bg-gray-200" />

                    {/* Line Color */}
                    <div className="relative">
                        <input
                            type="color"
                            value={lineElement.strokeColor || '#1a1a1a'}
                            onChange={(e) => {
                                updateElement(lineElement.id, {
                                    strokeColor: e.target.value
                                } as Partial<LineElement>);
                                const fabricCanvas = getFabricCanvas();
                                const fabricObj = fabricCanvas.getObjectById(lineElement.id);
                                if (fabricObj) {
                                    (fabricObj as any).set({ stroke: e.target.value });
                                    fabricCanvas.getCanvas()?.renderAll();
                                }
                            }}
                            className="absolute inset-0 opacity-0 w-6 h-6 cursor-pointer z-10"
                            title="Line color"
                        />
                        <div
                            className="w-6 h-6 rounded-full border-2 border-gray-200 cursor-pointer hover:border-blue-400 hover:scale-110 transition-all shadow-sm"
                            style={{ backgroundColor: lineElement.strokeColor || '#1a1a1a' }}
                            title="Line color"
                        />
                    </div>

                    <div className="w-px h-6 bg-gray-200" />
                </>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1">
                <button
                    onClick={copy}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Copy"
                >
                    <Copy size={14} />
                </button>
                <button
                    onClick={paste}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Paste"
                >
                    <Clipboard size={14} />
                </button>
                <button
                    onClick={() => duplicateElements()}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Duplicate"
                >
                    <Copy size={14} />
                </button>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            {/* Transform */}
            <div className="flex items-center gap-1">
                <button
                    onClick={handleFlipHorizontal}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Flip Horizontal"
                >
                    <FlipHorizontal size={14} />
                </button>
                <button
                    onClick={handleFlipVertical}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Flip Vertical"
                >
                    <FlipVertical size={14} />
                </button>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            {/* Grouping */}
            <div className="flex items-center gap-1">
                {canGroup && (
                    <button
                        onClick={() => groupElements(selectedIds)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all flex items-center gap-1.5"
                        title="Group selected elements"
                    >
                        <Group size={14} />
                        <span>Group</span>
                    </button>
                )}
                {isGroup && (
                    <>
                        <button
                            onClick={() => ungroupElement(selectedIds[0])}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all flex items-center gap-1.5"
                            title="Ungroup elements"
                        >
                            <Ungroup size={14} />
                            <span>Ungroup</span>
                        </button>
                    </>
                )}
            </div>

            {/* Lock */}
            <button
                onClick={() => isLocked ? unlockElement(selectedIds[0]) : lockElement(selectedIds[0])}
                className={`p-1.5 rounded transition-all ${isLocked ? 'text-amber-600 bg-amber-50' : 'text-gray-500 hover:text-amber-600 hover:bg-amber-50'}`}
                title={isLocked ? 'Unlock' : 'Lock'}
            >
                {isLocked ? <LockOpen size={14} /> : <Lock size={14} />}
            </button>

            {/* Delete */}
            <button
                onClick={() => removeElement(selectedIds)}
                className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-all ml-auto"
                title="Delete"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
}
