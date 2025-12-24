'use client';

import { useMemo } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useEditorStore, useActivePage } from '@/store/editorStore';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { TextElement } from '@/types/canvas';
import {
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyStart,
    AlignHorizontalJustifyEnd,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyEnd,
    ChevronUp,
    ChevronDown,
    ChevronsUp,
    ChevronsDown,
    FlipHorizontal,
    FlipVertical,
} from 'lucide-react';

export function TextEditPanel() {
    const selectedIds = useCanvasStore((state) => state.selectedIds);
    const updateTransform = useCanvasStore((state) => state.updateTransform);
    const bringForward = useCanvasStore((state) => state.bringForward);
    const sendBackward = useCanvasStore((state) => state.sendBackward);
    const bringToFront = useCanvasStore((state) => state.bringToFront);
    const sendToBack = useCanvasStore((state) => state.sendToBack);
    const activePage = useActivePage();

    // Get elements from active page
    const elements = activePage?.elements ?? [];

    // Get canvas dimensions
    const canvasWidth = activePage?.width || 1080;
    const canvasHeight = activePage?.height || 1080;

    // Get selected element
    const selectedElement = useMemo(() => {
        if (selectedIds.length !== 1) return null;
        const el = elements.find(el => el.id === selectedIds[0]);
        return el?.type === 'text' ? el as TextElement : null;
    }, [selectedIds, elements]);

    // Get element bounds from Fabric.js canvas (actual visual size, not bounding rect)
    const getElementBounds = () => {
        if (!selectedElement) return { width: 0, height: 0 };

        const fabricCanvas = getFabricCanvas();
        const fabricObject = fabricCanvas.getObjectById(selectedElement.id);

        if (fabricObject) {
            // Use actual scaled dimensions, not bounding rect which includes control padding
            const scaleX = fabricObject.scaleX || 1;
            const scaleY = fabricObject.scaleY || 1;
            const objWidth = (fabricObject.width || 0) * scaleX;
            const objHeight = (fabricObject.height || 0) * scaleY;
            return { width: objWidth, height: objHeight };
        }

        const width = selectedElement.transform.width * Math.abs(selectedElement.transform.scaleX);
        const height = selectedElement.transform.height * Math.abs(selectedElement.transform.scaleY);
        return { width, height };
    };

    // Alignment handlers
    const handleAlignLeft = () => {
        if (!selectedElement) return;
        const { width } = getElementBounds();
        updateTransform(selectedElement.id, { x: width / 2 });
    };

    const handleAlignCenter = () => {
        if (!selectedElement) return;
        updateTransform(selectedElement.id, { x: canvasWidth / 2 });
    };

    const handleAlignRight = () => {
        if (!selectedElement) return;
        const { width } = getElementBounds();
        updateTransform(selectedElement.id, { x: canvasWidth - width / 2 });
    };

    const handleAlignTop = () => {
        if (!selectedElement) return;
        const { height } = getElementBounds();
        updateTransform(selectedElement.id, { y: height / 2 });
    };

    const handleAlignMiddle = () => {
        if (!selectedElement) return;
        updateTransform(selectedElement.id, { y: canvasHeight / 2 });
    };

    const handleAlignBottom = () => {
        if (!selectedElement) return;
        const { height } = getElementBounds();
        updateTransform(selectedElement.id, { y: canvasHeight - height / 2 });
    };

    // Flip handlers
    const handleFlipHorizontal = () => {
        if (!selectedElement) return;
        updateTransform(selectedElement.id, {
            scaleX: selectedElement.transform.scaleX * -1
        });
    };

    const handleFlipVertical = () => {
        if (!selectedElement) return;
        updateTransform(selectedElement.id, {
            scaleY: selectedElement.transform.scaleY * -1
        });
    };

    const isDisabled = !selectedElement;

    return (
        <div className="w-64 h-full flex flex-col bg-white border-l border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-gray-800 font-semibold text-sm">Edit Text</h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Alignment Section */}
                <div className="p-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-3">Alignment</h4>

                    {/* All 6 buttons in one row */}
                    <div className="grid grid-cols-6 gap-1">
                        <button
                            onClick={handleAlignLeft}
                            disabled={isDisabled}
                            className={`flex flex-col items-center text-center justify-center py-2 px-0 rounded-lg transition-all
                                ${!isDisabled
                                    ? 'hover:bg-blue-50 text-gray-500 hover:text-blue-600 active:bg-blue-100'
                                    : 'text-gray-300 cursor-not-allowed'}`}
                            title="Align Left"
                        >
                            <AlignHorizontalJustifyStart size={16} />
                            <span className="text-[9px] mt-1 font-medium leading-none">Left</span>
                        </button>

                        <button
                            onClick={handleAlignCenter}
                            disabled={isDisabled}
                            className={`flex flex-col items-center text-center justify-center py-2 px-0 rounded-lg transition-all
                                ${!isDisabled
                                    ? 'hover:bg-blue-50 text-gray-500 hover:text-blue-600 active:bg-blue-100'
                                    : 'text-gray-300 cursor-not-allowed'}`}
                            title="Align Center"
                        >
                            <AlignHorizontalJustifyCenter size={16} />
                            <span className="text-[9px] mt-1 font-medium leading-none">Center</span>
                        </button>

                        <button
                            onClick={handleAlignRight}
                            disabled={isDisabled}
                            className={`flex flex-col items-center text-center justify-center py-2 px-0 rounded-lg transition-all
                                ${!isDisabled
                                    ? 'hover:bg-blue-50 text-gray-500 hover:text-blue-600 active:bg-blue-100'
                                    : 'text-gray-300 cursor-not-allowed'}`}
                            title="Align Right"
                        >
                            <AlignHorizontalJustifyEnd size={16} />
                            <span className="text-[9px] mt-1 font-medium leading-none">Right</span>
                        </button>

                        <button
                            onClick={handleAlignTop}
                            disabled={isDisabled}
                            className={`flex flex-col items-center text-center justify-center py-2 px-0 rounded-lg transition-all
                                ${!isDisabled
                                    ? 'hover:bg-blue-50 text-gray-500 hover:text-blue-600 active:bg-blue-100'
                                    : 'text-gray-300 cursor-not-allowed'}`}
                            title="Align Top"
                        >
                            <AlignVerticalJustifyStart size={16} />
                            <span className="text-[9px] mt-1 font-medium leading-none">Top</span>
                        </button>

                        <button
                            onClick={handleAlignMiddle}
                            disabled={isDisabled}
                            className={`flex flex-col items-center text-center justify-center py-2 px-0 rounded-lg transition-all
                                ${!isDisabled
                                    ? 'hover:bg-blue-50 text-gray-500 hover:text-blue-600 active:bg-blue-100'
                                    : 'text-gray-300 cursor-not-allowed'}`}
                            title="Align Middle"
                        >
                            <AlignVerticalJustifyCenter size={16} />
                            <span className="text-[9px] mt-1 font-medium leading-none">Middle</span>
                        </button>

                        <button
                            onClick={handleAlignBottom}
                            disabled={isDisabled}
                            className={`flex flex-col items-center text-center justify-center py-2 px-0 rounded-lg transition-all
                                ${!isDisabled
                                    ? 'hover:bg-blue-50 text-gray-500 hover:text-blue-600 active:bg-blue-100'
                                    : 'text-gray-300 cursor-not-allowed'}`}
                            title="Align Bottom"
                        >
                            <AlignVerticalJustifyEnd size={16} />
                            <span className="text-[9px] mt-1 font-medium leading-none">Bottom</span>
                        </button>
                    </div>
                </div>

                {/* Arrange Section */}
                <div className="px-4 pb-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-3">Arrange</h4>

                    {/* 4 buttons in one row */}
                    <div className="grid grid-cols-4 gap-1">
                        <button
                            onClick={() => selectedElement && bringForward(selectedElement.id)}
                            disabled={isDisabled}
                            className={`flex flex-col items-center text-center justify-center py-2 px-0 rounded-lg transition-all
                                ${!isDisabled
                                    ? 'hover:bg-blue-50 text-gray-500 hover:text-blue-600 active:bg-blue-100'
                                    : 'text-gray-300 cursor-not-allowed'}`}
                            title="Bring Forward"
                        >
                            <ChevronUp size={16} />
                            <span className="text-[9px] mt-1 font-medium leading-none">Forward</span>
                        </button>

                        <button
                            onClick={() => selectedElement && sendBackward(selectedElement.id)}
                            disabled={isDisabled}
                            className={`flex flex-col items-center text-center justify-center py-2 px-0 rounded-lg transition-all
                                ${!isDisabled
                                    ? 'hover:bg-blue-50 text-gray-500 hover:text-blue-600 active:bg-blue-100'
                                    : 'text-gray-300 cursor-not-allowed'}`}
                            title="Send Backward"
                        >
                            <ChevronDown size={16} />
                            <span className="text-[9px] mt-1 font-medium leading-none">Backward</span>
                        </button>

                        <button
                            onClick={() => selectedElement && bringToFront(selectedElement.id)}
                            disabled={isDisabled}
                            className={`flex flex-col items-center text-center justify-center py-2 px-0 rounded-lg transition-all
                                ${!isDisabled
                                    ? 'hover:bg-blue-50 text-gray-500 hover:text-blue-600 active:bg-blue-100'
                                    : 'text-gray-300 cursor-not-allowed'}`}
                            title="Bring to Front"
                        >
                            <ChevronsUp size={16} />
                            <span className="text-[9px] mt-1 font-medium leading-none">To Front</span>
                        </button>

                        <button
                            onClick={() => selectedElement && sendToBack(selectedElement.id)}
                            disabled={isDisabled}
                            className={`flex flex-col items-center text-center justify-center py-2 px-0 rounded-lg transition-all
                                ${!isDisabled
                                    ? 'hover:bg-blue-50 text-gray-500 hover:text-blue-600 active:bg-blue-100'
                                    : 'text-gray-300 cursor-not-allowed'}`}
                            title="Send to Back"
                        >
                            <ChevronsDown size={16} />
                            <span className="text-[9px] mt-1 font-medium leading-none">To Back</span>
                        </button>
                    </div>
                </div>

                {/* Transform Section */}
                <div className="px-4 pb-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-3">Transform</h4>

                    {/* 2 buttons in one row */}
                    <div className="grid grid-cols-4 gap-1">
                        <button
                            onClick={handleFlipHorizontal}
                            disabled={isDisabled}
                            className={`flex flex-col items-center text-center justify-center py-2 px-0 rounded-lg transition-all
                                ${!isDisabled
                                    ? 'hover:bg-blue-50 text-gray-500 hover:text-blue-600 active:bg-blue-100'
                                    : 'text-gray-300 cursor-not-allowed'}`}
                            title="Flip Horizontal"
                        >
                            <FlipHorizontal size={16} />
                            <span className="text-[9px] mt-1 font-medium leading-none">Flip H</span>
                        </button>

                        <button
                            onClick={handleFlipVertical}
                            disabled={isDisabled}
                            className={`flex flex-col items-center text-center justify-center py-2 px-0 rounded-lg transition-all
                                ${!isDisabled
                                    ? 'hover:bg-blue-50 text-gray-500 hover:text-blue-600 active:bg-blue-100'
                                    : 'text-gray-300 cursor-not-allowed'}`}
                            title="Flip Vertical"
                        >
                            <FlipVertical size={16} />
                            <span className="text-[9px] mt-1 font-medium leading-none">Flip V</span>
                        </button>
                    </div>
                </div>

                {/* Size Section */}
                <div className="px-4 pb-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-3">Size</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {/* Width */}
                        <div>
                            <label className="text-[9px] text-gray-500 mb-1 block">Width</label>
                            <input
                                type="number"
                                value={selectedElement ? Math.round((selectedElement.transform?.width || 0) * Math.abs(selectedElement.transform?.scaleX || 1)) : 0}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (isNaN(val) || !selectedElement) return;
                                    const originalWidth = selectedElement.transform.width || 1;
                                    const currentSign = Math.sign(selectedElement.transform.scaleX || 1);
                                    updateTransform(selectedElement.id, {
                                        scaleX: (val / originalWidth) * (currentSign === 0 ? 1 : currentSign)
                                    });
                                }}
                                disabled={isDisabled}
                                className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Height */}
                        <div>
                            <label className="text-[9px] text-gray-500 mb-1 block">Height</label>
                            <input
                                type="number"
                                value={selectedElement ? Math.round((selectedElement.transform?.height || 0) * Math.abs(selectedElement.transform?.scaleY || 1)) : 0}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (isNaN(val) || !selectedElement) return;
                                    const originalHeight = selectedElement.transform.height || 1;
                                    const currentSign = Math.sign(selectedElement.transform.scaleY || 1);
                                    updateTransform(selectedElement.id, {
                                        scaleY: (val / originalHeight) * (currentSign === 0 ? 1 : currentSign)
                                    });
                                }}
                                disabled={isDisabled}
                                className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Rotation */}
                        <div>
                            <label className="text-[9px] text-gray-500 mb-1 block">Rotation</label>
                            <input
                                type="number"
                                value={selectedElement ? Math.round(selectedElement.transform?.rotation || 0) : 0}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!selectedElement || isNaN(val)) return;
                                    updateTransform(selectedElement.id, {
                                        rotation: val
                                    });
                                }}
                                disabled={isDisabled}
                                className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Position Section */}
                <div className="px-4 pb-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-3">Position</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {/* X Position */}
                        <div>
                            <label className="text-[9px] text-gray-500 mb-1 block">X</label>
                            <input
                                type="number"
                                value={selectedElement ? Math.round(selectedElement.transform?.x || 0) : 0}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!selectedElement || isNaN(val)) return;
                                    updateTransform(selectedElement.id, { x: val });
                                }}
                                disabled={isDisabled}
                                className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Y Position */}
                        <div>
                            <label className="text-[9px] text-gray-500 mb-1 block">Y</label>
                            <input
                                type="number"
                                value={selectedElement ? Math.round(selectedElement.transform?.y || 0) : 0}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!selectedElement || isNaN(val)) return;
                                    updateTransform(selectedElement.id, { y: val });
                                }}
                                disabled={isDisabled}
                                className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Empty third column for consistent layout with Size section */}
                        <div></div>
                    </div>
                </div>

                {/* Opacity Section */}
                <div className="px-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-medium text-gray-500">Opacity</h4>
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={selectedElement ? Math.round((selectedElement.style?.opacity ?? 1) * 100) : 100}
                                onChange={(e) => {
                                    let val = parseInt(e.target.value);
                                    if (isNaN(val)) val = 100;
                                    val = Math.max(0, Math.min(100, val));

                                    if (selectedElement) {
                                        useCanvasStore.getState().updateStyle(selectedElement.id, {
                                            opacity: val / 100
                                        });
                                    }
                                }}
                                disabled={isDisabled}
                                className="w-10 text-xs text-right text-gray-700 bg-transparent focus:outline-none hover:text-blue-600 transition-colors"
                            />
                            <span className="text-[10px] text-gray-400">%</span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={selectedElement ? Math.round((selectedElement.style?.opacity ?? 1) * 100) : 100}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (selectedElement) {
                                    useCanvasStore.getState().updateStyle(selectedElement.id, {
                                        opacity: val / 100
                                    });
                                }
                            }}
                            disabled={isDisabled}
                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:bg-gray-200 transition-colors"
                        />
                    </div>
                </div>

                {/* Info when no element selected */}
                {isDisabled && (
                    <div className="px-4">
                        <div className="text-center text-gray-400 text-xs py-4">
                            Select a text element to edit
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
