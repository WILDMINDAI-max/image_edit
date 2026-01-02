'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import {
    X,
    FileText,
    CreditCard,
    Monitor,
    Square,
    Youtube,
    Twitter,
    Facebook,
    Smartphone,
    Instagram,
    Presentation,
    Link2,
    Link2Off,
} from 'lucide-react';

interface CanvasPreset {
    name: string;
    width: number;
    height: number;
    category: string;
    icon: React.ReactNode;
}

const CANVAS_PRESETS: CanvasPreset[] = [
    // Print - A Series
    { name: 'A0', width: 9933, height: 14043, category: 'Print - A Series', icon: <FileText size={16} /> },
    { name: 'A1', width: 7016, height: 9933, category: 'Print - A Series', icon: <FileText size={16} /> },
    { name: 'A2', width: 4961, height: 7016, category: 'Print - A Series', icon: <FileText size={16} /> },
    { name: 'A3', width: 3508, height: 4961, category: 'Print - A Series', icon: <FileText size={16} /> },
    { name: 'A4', width: 2480, height: 3508, category: 'Print - A Series', icon: <FileText size={16} /> },
    { name: 'A5', width: 1748, height: 2480, category: 'Print - A Series', icon: <FileText size={16} /> },
    { name: 'A6', width: 1240, height: 1748, category: 'Print - A Series', icon: <FileText size={16} /> },
    { name: 'A7', width: 874, height: 1240, category: 'Print - A Series', icon: <FileText size={16} /> },
    { name: 'A8', width: 614, height: 874, category: 'Print - A Series', icon: <FileText size={16} /> },
    { name: 'A9', width: 437, height: 614, category: 'Print - A Series', icon: <FileText size={16} /> },
    { name: 'A10', width: 307, height: 437, category: 'Print - A Series', icon: <FileText size={16} /> },

    // Print - B Series
    { name: 'B0', width: 11811, height: 16701, category: 'Print - B Series', icon: <FileText size={16} /> },
    { name: 'B1', width: 8350, height: 11811, category: 'Print - B Series', icon: <FileText size={16} /> },
    { name: 'B2', width: 5906, height: 8350, category: 'Print - B Series', icon: <FileText size={16} /> },
    { name: 'B3', width: 4175, height: 5906, category: 'Print - B Series', icon: <FileText size={16} /> },
    { name: 'B4', width: 2953, height: 4175, category: 'Print - B Series', icon: <FileText size={16} /> },
    { name: 'B5', width: 2079, height: 2953, category: 'Print - B Series', icon: <FileText size={16} /> },
    { name: 'B6', width: 1476, height: 2079, category: 'Print - B Series', icon: <FileText size={16} /> },
    { name: 'B7', width: 1039, height: 1476, category: 'Print - B Series', icon: <FileText size={16} /> },
    { name: 'B8', width: 732, height: 1039, category: 'Print - B Series', icon: <FileText size={16} /> },
    { name: 'B9', width: 520, height: 732, category: 'Print - B Series', icon: <FileText size={16} /> },
    { name: 'B10', width: 366, height: 520, category: 'Print - B Series', icon: <FileText size={16} /> },

    // Print - C Series
    { name: 'C0', width: 12992, height: 18370, category: 'Print - C Series', icon: <FileText size={16} /> },
    { name: 'C1', width: 9175, height: 12992, category: 'Print - C Series', icon: <FileText size={16} /> },
    { name: 'C2', width: 6488, height: 9175, category: 'Print - C Series', icon: <FileText size={16} /> },
    { name: 'C3', width: 4599, height: 6488, category: 'Print - C Series', icon: <FileText size={16} /> },
    { name: 'C4', width: 3248, height: 4599, category: 'Print - C Series', icon: <FileText size={16} /> },
    { name: 'C5', width: 2299, height: 3248, category: 'Print - C Series', icon: <FileText size={16} /> },
    { name: 'C6', width: 1624, height: 2299, category: 'Print - C Series', icon: <FileText size={16} /> },
    { name: 'C7', width: 1148, height: 1624, category: 'Print - C Series', icon: <FileText size={16} /> },
    { name: 'C8', width: 812, height: 1148, category: 'Print - C Series', icon: <FileText size={16} /> },
    { name: 'C9', width: 574, height: 812, category: 'Print - C Series', icon: <FileText size={16} /> },
    { name: 'C10', width: 406, height: 574, category: 'Print - C Series', icon: <FileText size={16} /> },

    // US Paper Sizes
    { name: 'Letter', width: 2550, height: 3300, category: 'US Paper Sizes', icon: <FileText size={16} /> },
    { name: 'Legal', width: 2550, height: 4200, category: 'US Paper Sizes', icon: <FileText size={16} /> },
    { name: 'Tabloid', width: 3300, height: 5100, category: 'US Paper Sizes', icon: <FileText size={16} /> },
    { name: 'Ledger', width: 5100, height: 3300, category: 'US Paper Sizes', icon: <FileText size={16} /> },
    { name: 'Executive', width: 2175, height: 3150, category: 'US Paper Sizes', icon: <FileText size={16} /> },
    { name: 'Statement', width: 1650, height: 2550, category: 'US Paper Sizes', icon: <FileText size={16} /> },
    { name: 'Government Letter', width: 2400, height: 3150, category: 'US Paper Sizes', icon: <FileText size={16} /> },
    { name: 'Professional Card', width: 1004, height: 650, category: 'US Paper Sizes', icon: <CreditCard size={16} /> },

    // Desktop
    { name: 'Desktop Wallpaper', width: 1920, height: 1080, category: 'Desktop', icon: <Monitor size={16} /> },
    { name: 'Square Logo Board', width: 500, height: 500, category: 'Desktop', icon: <Square size={16} /> },

    // Social Media
    { name: 'YouTube', width: 1280, height: 720, category: 'Social Media', icon: <Youtube size={16} /> },
    { name: 'Twitter / X', width: 1600, height: 900, category: 'Social Media', icon: <Twitter size={16} /> },
    { name: 'Facebook', width: 940, height: 788, category: 'Social Media', icon: <Facebook size={16} /> },
    { name: 'Stories', width: 1080, height: 1920, category: 'Social Media', icon: <Smartphone size={16} /> },
    { name: 'Instagram', width: 1080, height: 1080, category: 'Social Media', icon: <Instagram size={16} /> },

    // Presentations
    { name: 'Widescreen Slides (16:9)', width: 1920, height: 1080, category: 'Presentations', icon: <Presentation size={16} /> },
    { name: 'Classic Slides (4:3)', width: 1024, height: 768, category: 'Presentations', icon: <Presentation size={16} /> },
    { name: '4:5', width: 1080, height: 1350, category: 'Presentations', icon: <Presentation size={16} /> },
    { name: '2:3', width: 2000, height: 3000, category: 'Presentations', icon: <Presentation size={16} /> },
    { name: '3:4', width: 3000, height: 4000, category: 'Presentations', icon: <Presentation size={16} /> },
    { name: '21:9', width: 2560, height: 1080, category: 'Presentations', icon: <Presentation size={16} /> },

    // Mobile & Devices
    { name: 'Android Small', width: 720, height: 1280, category: 'Mobile & Devices', icon: <Smartphone size={16} /> },
    { name: 'Android Medium', width: 1080, height: 1920, category: 'Mobile & Devices', icon: <Smartphone size={16} /> },
    { name: 'Android Large', width: 1440, height: 2960, category: 'Mobile & Devices', icon: <Smartphone size={16} /> },
    { name: 'iPhone SE', width: 640, height: 1136, category: 'Mobile & Devices', icon: <Smartphone size={16} /> },
    { name: 'iPhone 8', width: 750, height: 1334, category: 'Mobile & Devices', icon: <Smartphone size={16} /> },
    { name: 'iPhone 8 Plus', width: 1080, height: 1920, category: 'Mobile & Devices', icon: <Smartphone size={16} /> },
    { name: 'iPhone X / XS', width: 1125, height: 2436, category: 'Mobile & Devices', icon: <Smartphone size={16} /> },
    { name: 'iPhone 11 Pro Max', width: 1242, height: 2688, category: 'Mobile & Devices', icon: <Smartphone size={16} /> },
    { name: 'iPhone 14 Pro', width: 1179, height: 2556, category: 'Mobile & Devices', icon: <Smartphone size={16} /> },

    // Web
    { name: 'Web Small', width: 640, height: 480, category: 'Web', icon: <Monitor size={16} /> },
    { name: 'Web Medium', width: 1280, height: 800, category: 'Web', icon: <Monitor size={16} /> },
    { name: 'Web Large', width: 1920, height: 1080, category: 'Web', icon: <Monitor size={16} /> },
    { name: 'Website Header', width: 1920, height: 600, category: 'Web', icon: <Monitor size={16} /> },
    { name: 'Website Banner', width: 1920, height: 400, category: 'Web', icon: <Monitor size={16} /> },
    { name: 'Blog Image', width: 1200, height: 630, category: 'Web', icon: <Monitor size={16} /> },
    { name: 'Email Header', width: 600, height: 300, category: 'Web', icon: <Monitor size={16} /> },

    // Photo
    { name: 'Photo – Small', width: 640, height: 480, category: 'Photo', icon: <Square size={16} /> },
    { name: 'Photo – Medium', width: 1024, height: 768, category: 'Photo', icon: <Square size={16} /> },
    { name: 'Photo – Large', width: 1600, height: 1200, category: 'Photo', icon: <Square size={16} /> },
    { name: '3:2 Landscape', width: 3000, height: 2000, category: 'Photo', icon: <Square size={16} /> },
    { name: '3:2 Portrait', width: 2000, height: 3000, category: 'Photo', icon: <Square size={16} /> },
    { name: '4:3 Landscape', width: 4000, height: 3000, category: 'Photo', icon: <Square size={16} /> },
    { name: '4:3 Portrait', width: 3000, height: 4000, category: 'Photo', icon: <Square size={16} /> },
    { name: '5:4 Landscape', width: 2500, height: 2000, category: 'Photo', icon: <Square size={16} /> },
    { name: '5:4 Portrait', width: 2000, height: 2500, category: 'Photo', icon: <Square size={16} /> },
    { name: '7:5 Landscape', width: 3500, height: 2500, category: 'Photo', icon: <Square size={16} /> },
    { name: '7:5 Portrait', width: 2500, height: 3500, category: 'Photo', icon: <Square size={16} /> },
    { name: '8 × 10', width: 2400, height: 3000, category: 'Photo', icon: <Square size={16} /> },
    { name: '11 × 14', width: 3300, height: 4200, category: 'Photo', icon: <Square size={16} /> },
];

// Group presets by category
const groupedPresets = CANVAS_PRESETS.reduce((acc, preset) => {
    if (!acc[preset.category]) {
        acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
}, {} as Record<string, CanvasPreset[]>);

export function ResizeModal() {
    const isOpen = useEditorStore((state) => state.isResizeModalOpen);
    const closeModal = useEditorStore((state) => state.closeResizeModal);
    const project = useEditorStore((state) => state.project);
    const updatePage = useEditorStore((state) => state.updatePage);

    const [width, setWidth] = useState(1920);
    const [height, setHeight] = useState(1080);
    const [aspectLocked, setAspectLocked] = useState(false);
    const [aspectRatio, setAspectRatio] = useState(1920 / 1080);
    const [scaleContent, setScaleContent] = useState(true);
    const [selectedPreset, setSelectedPreset] = useState<string | null>('Desktop Wallpaper');

    // Initialize with current page dimensions
    useEffect(() => {
        if (project && isOpen) {
            const activePage = project.pages.find(p => p.id === project.activePageId);
            if (activePage) {
                setWidth(activePage.width);
                setHeight(activePage.height);
                setAspectRatio(activePage.width / activePage.height);
            }
        }
    }, [project, isOpen]);

    const handlePresetSelect = (preset: CanvasPreset) => {
        setWidth(preset.width);
        setHeight(preset.height);
        setSelectedPreset(preset.name);
        setAspectRatio(preset.width / preset.height);
    };

    const handleWidthChange = (newWidth: number) => {
        setWidth(newWidth);
        setSelectedPreset(null);
        if (aspectLocked && newWidth > 0) {
            setHeight(Math.round(newWidth / aspectRatio));
        }
    };

    const handleHeightChange = (newHeight: number) => {
        setHeight(newHeight);
        setSelectedPreset(null);
        if (aspectLocked && newHeight > 0) {
            setWidth(Math.round(newHeight * aspectRatio));
        }
    };

    const handleApply = () => {
        if (project && width > 0 && height > 0) {
            const activePage = project.pages.find(p => p.id === project.activePageId);
            let updatedElements = undefined;

            if (scaleContent && activePage && activePage.elements.length > 0) {
                const oldWidth = activePage.width || 1080;
                const oldHeight = activePage.height || 1080;

                // Avoid division by zero
                if (oldWidth > 0 && oldHeight > 0) {
                    // Calculate scale factor to fit
                    const scaleX = width / oldWidth;
                    const scaleY = height / oldHeight;
                    // Use minimum scale to preserve aspect ratio of the content layout
                    // Ensure scale is never exactly 0 to prevent disappearance
                    const scale = Math.max(0.0001, Math.min(scaleX, scaleY));

                    // Calculate offset to center the scaled content
                    const offsetX = (width - oldWidth * scale) / 2;
                    const offsetY = (height - oldHeight * scale) / 2;

                    updatedElements = activePage.elements.map(el => {
                        const newTransform = { ...el.transform };

                        // Scale position
                        // Ensure values are valid numbers
                        const newX = el.transform.x * scale + offsetX;
                        const newY = el.transform.y * scale + offsetY;

                        newTransform.x = Number.isFinite(newX) ? newX : el.transform.x;
                        newTransform.y = Number.isFinite(newY) ? newY : el.transform.y;

                        // Scale dimensions (width/height), NOT scaleX/scaleY
                        // scaleX/scaleY should remain 1 (or their current value)
                        const newWidth = (el.transform.width || 200) * scale;
                        const newHeight = (el.transform.height || 200) * scale;

                        newTransform.width = Number.isFinite(newWidth) ? newWidth : el.transform.width;
                        newTransform.height = Number.isFinite(newHeight) ? newHeight : el.transform.height;
                        // Keep scaleX/scaleY unchanged
                        // newTransform.scaleX and newTransform.scaleY remain as copied from el.transform

                        return {
                            ...el,
                            transform: newTransform,
                        };
                    });
                }
            }

            updatePage(project.activePageId, {
                width,
                height,
                ...(updatedElements ? { elements: updatedElements } : {})
            });
            closeModal();

            // Force re-render of Fabric canvas by briefly updating zoom or similar if needed, 
            // but updatePage should trigger it via props in CanvasStage
        }
    };

    const toggleAspectLock = () => {
        if (!aspectLocked) {
            setAspectRatio(width / height);
        }
        setAspectLocked(!aspectLocked);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeModal}
            />

            {/* Modal */}
            <div className="relative bg-[#1a1a1d] rounded-2xl shadow-2xl w-[600px] max-h-[85vh] overflow-hidden border border-gray-700/50">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
                    <h2 className="text-lg font-semibold text-white">Resize Canvas</h2>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={scaleContent}
                                onChange={(e) => setScaleContent(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-600 text-violet-600 focus:ring-violet-600 bg-[#252528]"
                            />
                            <span className="text-sm text-gray-300">Scale content</span>
                        </label>
                        <button
                            onClick={closeModal}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                    {/* Custom Size Section */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-300 mb-3">Custom Size</h3>
                        <div className="flex items-center gap-3 bg-[#252528] rounded-xl p-4">
                            {/* Width Input */}
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Width</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                                        className="w-full bg-[#1a1a1d] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">px</span>
                                </div>
                            </div>

                            {/* Aspect Lock Button */}
                            <button
                                onClick={toggleAspectLock}
                                className={`mt-5 p-2 rounded-lg transition-colors ${aspectLocked
                                    ? 'bg-violet-500/20 text-violet-400'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                                title={aspectLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                            >
                                {aspectLocked ? <Link2 size={18} /> : <Link2Off size={18} />}
                            </button>

                            {/* Height Input */}
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Height</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                                        className="w-full bg-[#1a1a1d] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">px</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Presets Section */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-3">Presets</h3>

                        {Object.entries(groupedPresets).map(([category, presets]) => (
                            <div key={category} className="mb-4">
                                <h4 className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{category}</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {presets.map((preset) => {
                                        const isSelected = selectedPreset === preset.name;
                                        return (
                                            <button
                                                key={preset.name}
                                                onClick={() => handlePresetSelect(preset)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isSelected
                                                    ? 'bg-violet-500/20 border border-violet-500/50 text-white'
                                                    : 'bg-[#252528] border border-transparent hover:bg-[#2a2a2e] text-gray-300 hover:text-white'
                                                    }`}
                                            >
                                                <span className={`${isSelected ? 'text-violet-400' : 'text-gray-500'}`}>
                                                    {preset.icon}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">{preset.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {preset.width} × {preset.height}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700/50 bg-[#151517]">
                    <button
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
                    >
                        Apply Size
                    </button>
                </div>
            </div>
        </div>
    );
}
