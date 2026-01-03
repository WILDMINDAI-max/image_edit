'use client';

import { useCanvasStore } from '@/store/canvasStore';
import { useActivePage } from '@/store/editorStore';
import { DEFAULT_TEXT_PRESETS } from '@/types/template';
import { FONT_COMBINATIONS, FontCombination } from '@/data/fontCombinations';
import { Type } from 'lucide-react';

export function TextPanel() {
    const addTextElement = useCanvasStore((state) => state.addTextElement);
    const activePage = useActivePage();

    const handleAddText = (preset: typeof DEFAULT_TEXT_PRESETS[0]) => {
        addTextElement({
            content: preset.content,
            transform: {
                width: 400,
                height: 50,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                skewX: 0,
                skewY: 0,
                originX: 'center',
                originY: 'center',
            } as any,
            textStyle: {
                fontFamily: preset.fontFamily,
                fontSize: preset.fontSize,
                fontWeight: preset.fontWeight,
                fontStyle: 'normal',
                textDecoration: 'none',
                textAlign: preset.textAlign,
                lineHeight: preset.lineHeight,
                letterSpacing: preset.letterSpacing,
                textTransform: 'none',
            },
            style: {
                fill: preset.color,
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                shadow: null,
                cornerRadius: 0,
            },
        });
    };

    const handleAddCombination = (combination: FontCombination) => {
        const canvasWidth = activePage?.width || 1080;
        const canvasHeight = activePage?.height || 1080;
        const startX = canvasWidth / 2;
        const startY = canvasHeight / 4;

        let cumulativeY = 0;

        combination.texts.forEach((textItem) => {
            const scaledFontSize = textItem.fontSize * 2;

            addTextElement({
                content: textItem.content,
                transform: {
                    x: startX,
                    y: startY + cumulativeY,
                    width: 800,
                    height: scaledFontSize * 1.5,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    skewX: 0,
                    skewY: 0,
                    originX: 'center',
                    originY: 'center',
                } as any,
                textStyle: {
                    fontFamily: textItem.fontFamily,
                    fontSize: scaledFontSize,
                    fontWeight: textItem.fontWeight,
                    fontStyle: textItem.fontStyle || 'normal',
                    textDecoration: 'none',
                    textAlign: 'center',
                    lineHeight: 1.0,
                    letterSpacing: textItem.letterSpacing || 0,
                    textTransform: textItem.textTransform || 'none',
                },
                style: {
                    fill: textItem.color,
                    stroke: null,
                    strokeWidth: 0,
                    opacity: 1,
                    shadow: null,
                    cornerRadius: 0,
                },
            });

            cumulativeY += scaledFontSize * 1.1;
        });
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 pb-2">
                <h2 className="text-lg font-semibold text-gray-800">Text</h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                {/* Basic Text Options */}
                <div className="space-y-1.5 mb-6">
                    <button
                        onClick={() => handleAddText(DEFAULT_TEXT_PRESETS[0])}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 bg-violet-50 border border-violet-100 hover:border-violet-300 rounded-md transition-all group"
                    >
                        <div className="w-6 h-6 rounded bg-violet-100 flex items-center justify-center shrink-0">
                            <span className="text-violet-600 font-bold text-[10px]">H1</span>
                        </div>
                        <span className="text-gray-800 text-sm font-semibold group-hover:text-violet-700">Add a heading</span>
                    </button>

                    <button
                        onClick={() => handleAddText(DEFAULT_TEXT_PRESETS[1])}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 bg-gray-50 border border-gray-200 hover:border-violet-300 hover:bg-violet-50 rounded-md transition-all group"
                    >
                        <div className="w-6 h-6 rounded bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center shrink-0 transition-colors">
                            <span className="text-gray-500 group-hover:text-violet-600 font-semibold text-[10px]">H2</span>
                        </div>
                        <span className="text-gray-700 text-xs font-medium group-hover:text-violet-700">Add a subheading</span>
                    </button>

                    <button
                        onClick={() => handleAddText(DEFAULT_TEXT_PRESETS[2])}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 bg-gray-50 border border-gray-200 hover:border-violet-300 hover:bg-violet-50 rounded-md transition-all group"
                    >
                        <div className="w-6 h-6 rounded bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center shrink-0 transition-colors">
                            <Type size={12} className="text-gray-500 group-hover:text-violet-600" />
                        </div>
                        <span className="text-gray-600 text-xs group-hover:text-violet-700">Add body text</span>
                    </button>
                </div>

                {/* Font Combinations - Flat Grid (No Categories) */}
                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                        ✨ Font Combinations
                    </h3>

                    {/* All combinations in a single flat grid */}
                    <div className="grid grid-cols-2 gap-2">
                        {FONT_COMBINATIONS.map(combo => (
                            <button
                                key={combo.id}
                                onClick={() => handleAddCombination(combo)}
                                className="relative rounded-lg p-2 h-24 flex flex-col justify-center items-center overflow-hidden hover:ring-2 hover:ring-violet-400 hover:scale-[1.02] transition-all group shadow-md"
                                style={{ backgroundColor: combo.previewBg || '#3d3d3d' }}
                                title={combo.name}
                            >
                                <div className="flex flex-col items-center gap-0 transform scale-[0.42] origin-center">
                                    {combo.texts.slice(0, 2).map((text, idx) => (
                                        <span
                                            key={idx}
                                            style={{
                                                fontFamily: text.fontFamily,
                                                fontSize: `${text.fontSize}px`,
                                                fontWeight: text.fontWeight as any,
                                                fontStyle: text.fontStyle || 'normal',
                                                color: text.color,
                                                letterSpacing: text.letterSpacing ? `${text.letterSpacing}px` : undefined,
                                                textTransform: text.textTransform || 'none',
                                                lineHeight: 1.0,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {text.content}
                                        </span>
                                    ))}
                                </div>
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-lg" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
