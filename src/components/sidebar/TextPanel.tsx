'use client';

import { useCanvasStore } from '@/store/canvasStore';
import { DEFAULT_TEXT_PRESETS } from '@/types/template';
import { Type } from 'lucide-react';

export function TextPanel() {
    const addTextElement = useCanvasStore((state) => state.addTextElement);

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

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-gray-100">
                <h2 className="text-gray-800 font-semibold text-sm">Text</h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                <div className="space-y-1.5">
                    {/* Heading */}
                    <button
                        onClick={() => handleAddText(DEFAULT_TEXT_PRESETS[0])}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 bg-violet-50 border border-violet-100 hover:border-violet-300 rounded-md transition-all group"
                    >
                        <div className="w-6 h-6 rounded bg-violet-100 flex items-center justify-center shrink-0">
                            <span className="text-violet-600 font-bold text-[10px]">H1</span>
                        </div>
                        <span className="text-gray-800 text-sm font-semibold group-hover:text-violet-700">Add a heading</span>
                    </button>

                    {/* Subheading */}
                    <button
                        onClick={() => handleAddText(DEFAULT_TEXT_PRESETS[1])}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 bg-gray-50 border border-gray-200 hover:border-violet-300 hover:bg-violet-50 rounded-md transition-all group"
                    >
                        <div className="w-6 h-6 rounded bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center shrink-0 transition-colors">
                            <span className="text-gray-500 group-hover:text-violet-600 font-semibold text-[10px]">H2</span>
                        </div>
                        <span className="text-gray-700 text-xs font-medium group-hover:text-violet-700">Add a subheading</span>
                    </button>

                    {/* Body Text */}
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
            </div>
        </div>
    );
}
