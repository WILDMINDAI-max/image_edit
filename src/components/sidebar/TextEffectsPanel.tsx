'use client';

import { useMemo, useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useEditorStore, useActivePage } from '@/store/editorStore';
import { TextElement, TextEffect, TextEffectType, TextShapeType, createDefaultTextEffect } from '@/types/canvas';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';
import { X } from 'lucide-react';

interface TextEffectsProps {
    onClose: () => void;
}

// Shape effect options (text transformations)
const SHAPE_EFFECTS: { type: TextShapeType; label: string; preview: string }[] = [
    { type: 'none', label: 'Flat', preview: 'Ag' },
    { type: 'curved', label: 'Arc', preview: 'Ag' },
];

// Style effect options (visual styling)
const STYLE_EFFECTS: { type: TextEffectType; label: string; preview: string }[] = [
    { type: 'none', label: 'Plain', preview: 'Ag' },
    { type: 'shadow', label: 'Drop', preview: 'Ag' },
    { type: 'lift', label: 'Float', preview: 'Ag' },
    { type: 'hollow', label: 'Stroke', preview: 'Ag' },
    { type: 'splice', label: 'Split', preview: 'Ag' },
    { type: 'outline', label: 'Border', preview: 'Ag' },
    { type: 'echo', label: 'Layer', preview: 'Ag' },
    { type: 'glitch', label: 'Distort', preview: 'Ag' },
    { type: 'neon', label: 'Glow', preview: 'Ag' },
    { type: 'background', label: 'Highlight', preview: 'Ag' },
];

export function TextEffectsPanel({ onClose }: TextEffectsProps) {
    const selectedIds = useCanvasStore((state) => state.selectedIds);
    const updateElement = useCanvasStore((state) => state.updateElement);
    const activePage = useActivePage();
    const elements = activePage?.elements ?? [];

    // Get selected text element
    const textElement = useMemo(() => {
        if (selectedIds.length !== 1) return null;
        const el = elements.find(el => el.id === selectedIds[0]);
        return el?.type === 'text' ? el as TextElement : null;
    }, [selectedIds, elements]);

    // Get current effect settings
    const currentEffect = textElement?.effect || createDefaultTextEffect();

    // Update effect
    const updateEffect = (updates: Partial<TextEffect>) => {
        if (!textElement) return;
        const newEffect = { ...currentEffect, ...updates };
        updateElement(textElement.id, { effect: newEffect } as Partial<TextElement>);

        // Sync to Fabric.js
        const fabricCanvas = getFabricCanvas();
        const fabricObj = fabricCanvas.getObjectById(textElement.id);

        if (fabricObj) {
            // Check if it's a CustomText with applyEffect method
            if ('applyEffect' in fabricObj && typeof (fabricObj as any).applyEffect === 'function') {
                (fabricObj as any).applyEffect(newEffect);
            } else {
                // Fallback: manually apply effects for regular fabric.IText
                const { fabric } = require('fabric');

                // Store original fill if not hollow, restore it when resetting
                const originalFill = textElement.style.fill || '#000000';

                // Reset ALL effect properties first to ensure clean switch between effects
                (fabricObj as any).shadow = undefined;
                (fabricObj as any).stroke = undefined;
                (fabricObj as any).strokeWidth = 0;
                (fabricObj as any).textBackgroundColor = '';
                (fabricObj as any).skewY = 0;
                (fabricObj as any).skewX = 0;
                (fabricObj as any).scaleY = 1;
                (fabricObj as any)._curveAmount = 0;
                (fabricObj as any).paintFirst = 'fill';

                // Restore fill unless we're applying hollow effect
                if (newEffect.type !== 'hollow') {
                    (fabricObj as any).fill = originalFill;
                }

                const getAngleOffsets = (angle: number, distance: number) => {
                    const radians = (angle - 90) * (Math.PI / 180);
                    return {
                        offsetX: Math.cos(radians) * distance,
                        offsetY: Math.sin(radians) * distance
                    };
                };

                switch (newEffect.type) {
                    case 'shadow': {
                        const { offsetX, offsetY } = getAngleOffsets(
                            newEffect.shadowAngle || 45,
                            newEffect.shadowDistance || 5
                        );
                        const opacity = (newEffect.shadowOpacity || 50) / 100;
                        const shadowColor = newEffect.shadowColor || '#000000';
                        const r = parseInt(shadowColor.slice(1, 3), 16);
                        const g = parseInt(shadowColor.slice(3, 5), 16);
                        const b = parseInt(shadowColor.slice(5, 7), 16);

                        (fabricObj as any).shadow = new fabric.Shadow({
                            color: `rgba(${r},${g},${b},${opacity})`,
                            blur: newEffect.shadowBlur || 10,
                            offsetX,
                            offsetY,
                        });
                        break;
                    }

                    case 'lift': {
                        (fabricObj as any).shadow = new fabric.Shadow({
                            color: 'rgba(0,0,0,0.3)',
                            blur: newEffect.liftBlur || 15,
                            offsetX: 0,
                            offsetY: newEffect.liftDistance || 8,
                        });
                        break;
                    }

                    case 'hollow': {
                        (fabricObj as any).stroke = newEffect.hollowColor || '#000000';
                        (fabricObj as any).strokeWidth = newEffect.hollowWidth || 2;
                        (fabricObj as any).fill = 'transparent';
                        break;
                    }

                    case 'splice': {
                        const offset = newEffect.spliceOffset || 3;
                        const color = newEffect.spliceColor || '#cccccc';
                        (fabricObj as any).shadow = new fabric.Shadow({
                            color: color,
                            blur: 0,
                            offsetX: offset,
                            offsetY: offset,
                        });
                        (fabricObj as any).stroke = color;
                        (fabricObj as any).strokeWidth = 1;
                        break;
                    }

                    case 'outline': {
                        (fabricObj as any).stroke = newEffect.outlineColor || '#000000';
                        (fabricObj as any).strokeWidth = newEffect.outlineWidth || 2;
                        (fabricObj as any).paintFirst = 'stroke';
                        break;
                    }

                    case 'echo': {
                        const offset = newEffect.echoOffset || 5;
                        const layers = newEffect.echoLayers || 3;
                        const color = newEffect.echoColor || '#cccccc';
                        (fabricObj as any).shadow = new fabric.Shadow({
                            color: color,
                            blur: layers * 2,
                            offsetX: offset * layers,
                            offsetY: offset * layers,
                        });
                        (fabricObj as any).stroke = color;
                        (fabricObj as any).strokeWidth = 0.5;
                        break;
                    }

                    case 'glitch': {
                        const intensity = newEffect.glitchIntensity || 5;
                        const color1 = newEffect.glitchColor1 || '#00ffff';
                        const color2 = newEffect.glitchColor2 || '#ff00ff';
                        (fabricObj as any).shadow = new fabric.Shadow({
                            color: color1,
                            blur: 0,
                            offsetX: -intensity,
                            offsetY: 0,
                        });
                        (fabricObj as any).stroke = color2;
                        (fabricObj as any).strokeWidth = 1;
                        break;
                    }

                    case 'neon': {
                        const color = newEffect.neonColor || '#ff00ff';
                        const intensity = newEffect.neonIntensity || 30;
                        (fabricObj as any).shadow = new fabric.Shadow({
                            color: color,
                            blur: intensity,
                            offsetX: 0,
                            offsetY: 0,
                        });
                        (fabricObj as any).stroke = color;
                        (fabricObj as any).strokeWidth = 1;
                        break;
                    }

                    case 'background': {
                        const bgColor = newEffect.backgroundColor || '#f0f0f0';
                        const padding = newEffect.backgroundPadding || 10;
                        const radius = newEffect.backgroundRadius || 5;

                        // Use Fabric.js textBackgroundColor for background effect
                        (fabricObj as any).textBackgroundColor = bgColor;
                        // Store padding and radius in custom properties for reference
                        (fabricObj as any).backgroundColor = bgColor;
                        (fabricObj as any).padding = padding;
                        break;
                    }

                    // Note: 'curved' is now a shape effect, not a style effect
                    // It's handled via shapeType in the CustomText.applyEffect method

                    case 'none':
                    default:
                        // Reset any special properties
                        (fabricObj as any).textBackgroundColor = '';
                        (fabricObj as any).skewY = 0;
                        (fabricObj as any).skewX = 0;
                        (fabricObj as any).scaleY = 1;
                        (fabricObj as any)._curveAmount = 0;
                        break;
                }

                (fabricObj as any).dirty = true;
            }
            fabricCanvas.getCanvas()?.renderAll();
        }
    };

    // Select shape effect (curved, etc.)
    const selectShape = (shapeType: TextShapeType) => {
        updateEffect({ shapeType });
    };

    // Select style effect (shadow, glow, etc.)
    const selectStyle = (type: TextEffectType) => {
        updateEffect({ type });
    };

    if (!textElement) {
        return (
            <div className="w-80 h-full flex flex-col bg-white border-l border-gray-200">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-gray-800 font-semibold text-sm">Text Effects</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <X size={16} className="text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-gray-400 text-sm text-center">Select a text element to apply effects</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 h-full flex flex-col bg-white border-l border-gray-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-gray-800 font-semibold text-sm">Text Styles</h2>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                    <X size={14} className="text-gray-500" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Transform Section */}
                <div className="p-3">
                    <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Transform</h4>
                    <div className="grid grid-cols-4 gap-1.5">
                        {SHAPE_EFFECTS.map((shape) => (
                            <button
                                key={shape.type}
                                onClick={() => selectShape(shape.type)}
                                className={`relative flex flex-col items-center p-1.5 rounded-md border transition-all ${(currentEffect.shapeType || 'none') === shape.type
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                    }`}
                            >
                                <div className="relative w-full h-6 flex items-center justify-center">
                                    <span
                                        className="text-sm font-bold"
                                        style={shape.type === 'curved' ? { transform: 'rotate(-10deg)' } : {}}
                                    >
                                        {shape.preview}
                                    </span>
                                </div>
                                <span className="text-[8px] font-medium text-gray-600">{shape.label}</span>
                                {(currentEffect.shapeType || 'none') === shape.type && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                        <X size={8} className="text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Effects Section */}
                <div className="p-3 border-t border-gray-100">
                    <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Effects</h4>
                    <div className="grid grid-cols-4 gap-1.5">
                        {STYLE_EFFECTS.map((effect) => (
                            <button
                                key={effect.type}
                                onClick={() => selectStyle(effect.type)}
                                className={`relative flex flex-col items-center p-1.5 rounded-md border transition-all ${currentEffect.type === effect.type
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                    }`}
                            >
                                <div className="relative w-full h-6 flex items-center justify-center">
                                    <span
                                        className="text-sm font-bold"
                                        style={getEffectPreviewStyle(effect.type)}
                                    >
                                        {effect.preview}
                                    </span>
                                </div>
                                <span className="text-[8px] font-medium text-gray-600">{effect.label}</span>
                                {currentEffect.type === effect.type && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                        <X size={8} className="text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Section */}
                {(currentEffect.type !== 'none' || currentEffect.shapeType === 'curved') && (
                    <div className="p-3 border-t border-gray-100">
                        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Customize</h4>

                        {/* Shadow Settings */}
                        {currentEffect.type === 'shadow' && (
                            <div className="space-y-2">
                                <ColorPicker
                                    label="Color"
                                    value={currentEffect.shadowColor || '#000000'}
                                    onChange={(color) => updateEffect({ shadowColor: color })}
                                />
                                <AnglePicker
                                    value={currentEffect.shadowAngle || 45}
                                    onChange={(angle) => updateEffect({ shadowAngle: angle })}
                                />
                                <Slider
                                    label="Opacity"
                                    value={currentEffect.shadowOpacity || 50}
                                    min={0}
                                    max={100}
                                    onChange={(val) => updateEffect({ shadowOpacity: val })}
                                    suffix="%"
                                />
                                <Slider
                                    label="Distance"
                                    value={currentEffect.shadowDistance || 5}
                                    min={0}
                                    max={100}
                                    onChange={(val) => updateEffect({ shadowDistance: val })}
                                />
                                <Slider
                                    label="Blur"
                                    value={currentEffect.shadowBlur || 10}
                                    min={0}
                                    max={100}
                                    onChange={(val) => updateEffect({ shadowBlur: val })}
                                />
                            </div>
                        )}

                        {/* Outline Settings */}
                        {currentEffect.type === 'outline' && (
                            <div className="space-y-4">
                                <ColorPicker
                                    label="Color"
                                    value={currentEffect.outlineColor || '#000000'}
                                    onChange={(color) => updateEffect({ outlineColor: color })}
                                />
                                <Slider
                                    label="Width"
                                    value={currentEffect.outlineWidth || 2}
                                    min={1}
                                    max={50}
                                    onChange={(val) => updateEffect({ outlineWidth: val })}
                                />
                            </div>
                        )}

                        {/* Lift Settings */}
                        {currentEffect.type === 'lift' && (
                            <div className="space-y-4">
                                <Slider
                                    label="Distance"
                                    value={currentEffect.liftDistance || 8}
                                    min={0}
                                    max={50}
                                    onChange={(val) => updateEffect({ liftDistance: val })}
                                />
                                <Slider
                                    label="Blur"
                                    value={currentEffect.liftBlur || 15}
                                    min={0}
                                    max={50}
                                    onChange={(val) => updateEffect({ liftBlur: val })}
                                />
                            </div>
                        )}

                        {/* Hollow Settings */}
                        {currentEffect.type === 'hollow' && (
                            <div className="space-y-4">
                                <ColorPicker
                                    label="Color"
                                    value={currentEffect.hollowColor || '#000000'}
                                    onChange={(color) => updateEffect({ hollowColor: color })}
                                />
                                <Slider
                                    label="Width"
                                    value={currentEffect.hollowWidth || 2}
                                    min={1}
                                    max={20}
                                    onChange={(val) => updateEffect({ hollowWidth: val })}
                                />
                            </div>
                        )}

                        {/* Echo Settings */}
                        {currentEffect.type === 'echo' && (
                            <div className="space-y-4">
                                <ColorPicker
                                    label="Color"
                                    value={currentEffect.echoColor || '#cccccc'}
                                    onChange={(color) => updateEffect({ echoColor: color })}
                                />
                                <Slider
                                    label="Offset"
                                    value={currentEffect.echoOffset || 5}
                                    min={1}
                                    max={50}
                                    onChange={(val) => updateEffect({ echoOffset: val })}
                                />
                                <Slider
                                    label="Layers"
                                    value={currentEffect.echoLayers || 3}
                                    min={1}
                                    max={10}
                                    onChange={(val) => updateEffect({ echoLayers: val })}
                                />
                            </div>
                        )}

                        {/* Splice Settings */}
                        {currentEffect.type === 'splice' && (
                            <div className="space-y-4">
                                <ColorPicker
                                    label="Color"
                                    value={currentEffect.spliceColor || '#cccccc'}
                                    onChange={(color) => updateEffect({ spliceColor: color })}
                                />
                                <Slider
                                    label="Offset"
                                    value={currentEffect.spliceOffset || 3}
                                    min={1}
                                    max={50}
                                    onChange={(val) => updateEffect({ spliceOffset: val })}
                                />
                            </div>
                        )}

                        {/* Glitch Settings */}
                        {currentEffect.type === 'glitch' && (
                            <div className="space-y-4">
                                <ColorPicker
                                    label="Color 1"
                                    value={currentEffect.glitchColor1 || '#00ffff'}
                                    onChange={(color) => updateEffect({ glitchColor1: color })}
                                />
                                <ColorPicker
                                    label="Color 2"
                                    value={currentEffect.glitchColor2 || '#ff00ff'}
                                    onChange={(color) => updateEffect({ glitchColor2: color })}
                                />
                                <Slider
                                    label="Intensity"
                                    value={currentEffect.glitchIntensity || 5}
                                    min={1}
                                    max={50}
                                    onChange={(val) => updateEffect({ glitchIntensity: val })}
                                />
                            </div>
                        )}

                        {/* Neon Settings */}
                        {currentEffect.type === 'neon' && (
                            <div className="space-y-4">
                                <ColorPicker
                                    label="Glow Color"
                                    value={currentEffect.neonColor || '#ff00ff'}
                                    onChange={(color) => updateEffect({ neonColor: color })}
                                />
                                <Slider
                                    label="Intensity"
                                    value={currentEffect.neonIntensity || 30}
                                    min={1}
                                    max={100}
                                    onChange={(val) => updateEffect({ neonIntensity: val })}
                                />
                            </div>
                        )}

                        {/* Background Settings */}
                        {currentEffect.type === 'background' && (
                            <div className="space-y-4">
                                <ColorPicker
                                    label="Background Color"
                                    value={currentEffect.backgroundColor || '#f0f0f0'}
                                    onChange={(color) => updateEffect({ backgroundColor: color })}
                                />
                                <Slider
                                    label="Padding"
                                    value={currentEffect.backgroundPadding || 10}
                                    min={0}
                                    max={50}
                                    onChange={(val) => updateEffect({ backgroundPadding: val })}
                                />
                                <Slider
                                    label="Roundness"
                                    value={currentEffect.backgroundRadius || 5}
                                    min={0}
                                    max={50}
                                    onChange={(val) => updateEffect({ backgroundRadius: val })}
                                />
                            </div>
                        )}

                        {/* Arc Settings */}
                        {currentEffect.shapeType === 'curved' && (
                            <div className="space-y-2">
                                <Slider
                                    label="Arc Bend"
                                    value={currentEffect.curveAmount || 0}
                                    min={-360}
                                    max={360}
                                    onChange={(val) => updateEffect({ curveAmount: val })}
                                />
                                <div className="flex justify-between text-[10px] text-gray-400">
                                    <span>∩ Inward</span>
                                    <span>Flat</span>
                                    <span>Outward ∪</span>
                                </div>
                            </div>
                        )}
                    </div>
                )
                }
            </div >
        </div >
    );
}

// Helper function for effect preview styles
function getEffectPreviewStyle(type: TextEffectType): React.CSSProperties {
    switch (type) {
        case 'none':
            return { color: '#1a1a1a' };
        case 'shadow':
            return { color: '#1a1a1a', textShadow: '2px 2px 4px rgba(0,0,0,0.4)' };
        case 'lift':
            return { color: '#1a1a1a', textShadow: '0 4px 8px rgba(0,0,0,0.3)' };
        case 'hollow':
            return {
                color: 'transparent',
                WebkitTextStroke: '1px #666',
            };
        case 'splice':
            return {
                color: '#1a1a1a',
                textShadow: '2px 2px 0 #ccc, -2px -2px 0 #999',
            };
        case 'outline':
            return {
                color: '#1a1a1a',
                WebkitTextStroke: '1px #666',
                paintOrder: 'stroke fill',
            };
        case 'echo':
            return {
                color: '#1a1a1a',
                textShadow: '2px 2px 0 #ccc, 4px 4px 0 #ddd, 6px 6px 0 #eee',
            };
        case 'glitch':
            return {
                color: '#1a1a1a',
                textShadow: '-2px 0 #0ff, 2px 0 #f0f',
            };
        case 'neon':
            return {
                color: '#ff00ff',
                textShadow: '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 20px #ff00ff',
            };
        case 'background':
            return {
                color: '#1a1a1a',
                backgroundColor: '#f0f0f0',
                padding: '2px 4px',
                borderRadius: '2px',
            };
        // Note: 'curved' is handled by shape preview, not style preview
        default:
            return { color: '#1a1a1a' };
    }
}

// Slider Component
interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
    suffix?: string;
}

function Slider({ label, value, min, max, onChange, suffix = '' }: SliderProps) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-gray-600">{label}</span>
                <span className="text-[10px] text-gray-500 font-mono">{value}{suffix}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
        </div>
    );
}

// Color Picker Component
interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (color: string) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{label}</span>
            <div className="relative">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 opacity-0 w-8 h-8 cursor-pointer"
                />
                <div
                    className="w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer"
                    style={{ backgroundColor: value }}
                />
            </div>
        </div>
    );
}

// Angle Picker Component - Dark theme circular style
interface AnglePickerProps {
    value: number;
    onChange: (angle: number) => void;
}

function AnglePicker({ value, onChange }: AnglePickerProps) {
    const size = 40;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const handleRadius = 5;

    // Calculate handle position
    const angleRad = (value - 90) * (Math.PI / 180);
    const handleX = center + radius * Math.cos(angleRad);
    const handleY = center + radius * Math.sin(angleRad);

    // Calculate arc path
    const getArcPath = () => {
        const startAngle = -90; // Start from top
        const endAngle = value - 90;
        const startRad = startAngle * (Math.PI / 180);
        const endRad = endAngle * (Math.PI / 180);

        const startX = center + radius * Math.cos(startRad);
        const startY = center + radius * Math.sin(startRad);
        const endX = center + radius * Math.cos(endRad);
        const endY = center + radius * Math.sin(endRad);

        const largeArc = value > 180 ? 1 : 0;

        return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();

        const updateAngle = (clientX: number, clientY: number) => {
            const x = clientX - rect.left - center;
            const y = clientY - rect.top - center;
            let angle = Math.round(Math.atan2(y, x) * (180 / Math.PI) + 90);
            if (angle < 0) angle += 360;
            onChange(angle);
        };

        const onMouseMove = (e: MouseEvent) => {
            updateAngle(e.clientX, e.clientY);
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        updateAngle(e.clientX, e.clientY);
    };

    return (
        <div className="flex items-center gap-4">
            <svg
                width={size}
                height={size}
                className="cursor-pointer"
                onMouseDown={handleMouseDown}
            >
                {/* Background ring */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#374151"
                    strokeWidth={strokeWidth}
                />

                {/* Active arc */}
                {value > 0 && (
                    <path
                        d={getArcPath()}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />
                )}

                {/* Handle */}
                <circle
                    cx={handleX}
                    cy={handleY}
                    r={handleRadius}
                    fill="#ffffff"
                    stroke="#e5e7eb"
                    strokeWidth={2}
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                />
            </svg>
            <span className="text-sm text-gray-600 font-medium min-w-[40px]">{value}°</span>
        </div>
    );
}
