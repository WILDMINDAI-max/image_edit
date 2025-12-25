'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditorStore, useZoom } from '@/store/editorStore';
import { useHistoryStore } from '@/store/historyStore';
import {
    ChevronDown,
    Undo2,
    Redo2,
    Download,
    Minus,
    Plus,
    Play,
    Monitor,
    Smartphone,
    Instagram,
    FileText,
    CreditCard,
    Youtube,
    Twitter,
    Facebook,
    Presentation,
    Check,
} from 'lucide-react';

interface CanvasPreset {
    name: string;
    width: number;
    height: number;
    icon: React.ReactNode;
}

const CANVAS_PRESETS: CanvasPreset[] = [
    // Print
    { name: 'Standard Print Page', width: 2480, height: 3508, icon: <FileText size={16} /> },
    { name: 'Medium Print Page', width: 1748, height: 2480, icon: <FileText size={16} /> },
    { name: 'Small Print Page', width: 1240, height: 1748, icon: <FileText size={16} /> },
    { name: 'Professional Card', width: 1004, height: 650, icon: <CreditCard size={16} /> },
    // Desktop
    { name: 'Desktop Wallpaper', width: 1920, height: 1080, icon: <Monitor size={16} /> },
    { name: 'Square Logo Board', width: 500, height: 500, icon: <Instagram size={16} /> },
    // Social Media
    { name: 'YouTube', width: 1280, height: 720, icon: <Youtube size={16} /> },
    { name: 'Twitter / X', width: 1600, height: 900, icon: <Twitter size={16} /> },
    { name: 'Facebook', width: 940, height: 788, icon: <Facebook size={16} /> },
    { name: 'Stories', width: 1080, height: 1920, icon: <Smartphone size={16} /> },
    { name: 'Instagram', width: 1080, height: 1080, icon: <Instagram size={16} /> },
    // Presentations
    { name: 'Widescreen (16:9)', width: 1920, height: 1080, icon: <Presentation size={16} /> },
    { name: 'Classic (4:3)', width: 1024, height: 768, icon: <Monitor size={16} /> },
];

export function TopToolbar() {
    const project = useEditorStore((state) => state.project);
    const zoom = useZoom();
    const isFitMode = useEditorStore((state) => state.isFitMode);
    const zoomIn = useEditorStore((state) => state.zoomIn);
    const zoomOut = useEditorStore((state) => state.zoomOut);
    const resetZoom = useEditorStore((state) => state.resetZoom);
    const fitToScreen = useEditorStore((state) => state.fitToScreen);
    const openExportModal = useEditorStore((state) => state.openExportModal);
    const openPreviewMode = useEditorStore((state) => state.openPreviewMode);
    const updatePage = useEditorStore((state) => state.updatePage);

    const undo = useHistoryStore((state) => state.undo);
    const redo = useHistoryStore((state) => state.redo);
    const canUndo = useHistoryStore((state) => state.past.length > 0);
    const canRedo = useHistoryStore((state) => state.future.length > 0);

    const [projectName, setProjectName] = useState(project?.name || 'Untitled Video Design');
    const [isResizeOpen, setIsResizeOpen] = useState(false);
    const [width, setWidth] = useState(1920);
    const [height, setHeight] = useState(1080);
    const resizeRef = useRef<HTMLDivElement>(null);

    // Initialize with current page dimensions
    useEffect(() => {
        if (project) {
            const activePage = project.pages.find(p => p.id === project.activePageId);
            if (activePage) {
                // Only update if values actually differ to prevent infinite loops
                if (activePage.width !== width) {
                    setWidth(activePage.width);
                }
                if (activePage.height !== height) {
                    setHeight(activePage.height);
                }
            }
        }
    }, [project?.activePageId, project?.pages]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (resizeRef.current && !resizeRef.current.contains(event.target as Node)) {
                setIsResizeOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePresetSelect = (preset: CanvasPreset) => {
        setWidth(preset.width);
        setHeight(preset.height);
        if (project) {
            updatePage(project.activePageId, { width: preset.width, height: preset.height });
        }
        setIsResizeOpen(false);
    };

    const handleWidthChange = (newWidth: number) => {
        setWidth(newWidth);
    };

    const handleHeightChange = (newHeight: number) => {
        setHeight(newHeight);
    };

    const applyCustomSize = () => {
        if (project && width > 0 && height > 0) {
            updatePage(project.activePageId, { width, height });
            setIsResizeOpen(false);
        }
    };

    return (
        <header className="h-14 bg-[#18181b] text-gray-200 flex items-center justify-between px-4 pr-16 select-none z-50 relative border-b border-gray-800">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                {/* File Button */}
                <div className="relative">
                    <button className="px-3 py-1.5 hover:bg-white/10 rounded-lg font-medium text-sm flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
                        File <ChevronDown size={14} aria-hidden="true" />
                    </button>
                </div>

                {/* Resize Button with Dropdown */}
                <div className="relative" ref={resizeRef}>
                    <button
                        onClick={() => setIsResizeOpen(!isResizeOpen)}
                        className={`px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${isResizeOpen
                            ? 'bg-white/10 text-white'
                            : 'hover:bg-white/10 text-gray-300 hover:text-white'
                            }`}
                    >
                        Resize
                    </button>

                    {/* Resize Dropdown */}
                    {isResizeOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Custom Size Inputs */}
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Resize Canvas</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        className="w-full p-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-bold text-center focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                                        type="number"
                                        value={width}
                                        onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                                    />
                                    <span className="text-gray-400">×</span>
                                    <input
                                        className="w-full p-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-bold text-center focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                                        type="number"
                                        value={height}
                                        onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                                    />
                                    <button
                                        onClick={applyCustomSize}
                                        className="text-emerald-500 hover:text-emerald-600 transition-colors shrink-0"
                                        title="Apply custom size"
                                    >
                                        <Check size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>

                            {/* Presets */}
                            <div className="py-1 max-h-64 overflow-y-auto">
                                {CANVAS_PRESETS.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => handlePresetSelect(preset)}
                                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-violet-50 hover:text-violet-700 flex items-center justify-between group transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 group-hover:text-violet-500">
                                                {preset.icon}
                                            </span>
                                            <span>{preset.name}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 group-hover:text-violet-400">
                                            {preset.width}×{preset.height}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-gray-700 mx-2 hidden md:block" />

                {/* Undo/Redo Buttons */}
                <div className="flex items-center gap-1 hidden md:flex">
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                        <Undo2 size={18} aria-hidden="true" />
                    </button>
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                        <Redo2 size={18} aria-hidden="true" />
                    </button>
                </div>
            </div>

            {/* Center Section - Project Title */}
            <div className="absolute left-1/2 transform -translate-x-1/2 max-w-xs hidden lg:block">
                <input
                    className="bg-transparent border border-transparent hover:border-gray-700 focus:border-violet-500 rounded px-3 py-1.5 text-center text-sm font-medium focus:outline-none w-64 transition-all text-gray-300 placeholder-gray-600"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                {/* Zoom Controls */}
                <div className="flex items-center gap-2 bg-[#27272a] rounded-lg p-1 border border-gray-700 mr-2">
                    <button
                        onClick={zoomOut}
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                    >
                        <Minus size={14} aria-hidden="true" />
                    </button>
                    <span className="text-xs font-medium w-12 text-center text-gray-300">
                        {zoom}%
                    </span>
                    <button
                        onClick={zoomIn}
                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                    >
                        <Plus size={14} aria-hidden="true" />
                    </button>
                    <div className="w-px h-4 bg-gray-700 mx-1" />
                    <button
                        onClick={fitToScreen}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded transition-colors ${isFitMode
                            ? 'bg-violet-500/20 text-violet-400'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        Fit
                    </button>
                </div>

                {/* Preview Button */}
                <button
                    onClick={openPreviewMode}
                    className="px-4 py-1.5 bg-[#27272a] hover:bg-white/10 text-gray-200 text-sm font-medium rounded-lg transition-colors border border-gray-700 flex items-center gap-2"
                    title="Preview design (Tab)"
                >
                    <Play size={14} fill="currentColor" aria-hidden="true" />
                    Preview
                </button>

                {/* Export Button */}
                <button
                    onClick={openExportModal}
                    className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2"
                >
                    <Download size={14} aria-hidden="true" />
                    Export
                </button>
            </div>
        </header>
    );
}
