'use client';

import { useEditorStore, useSidebarPanel, SidebarPanel } from '@/store/editorStore';
import {
    Library,
    SquareStack,
    Gem,
    Type,
    Image,
    CloudUpload,
    Layers,
    Sparkles,
    ChevronLeft,
} from 'lucide-react';
import { TemplatesPanel } from './TemplatesPanel';
import { ElementsPanel } from './ElementsPanel';
import { AssetsPanel } from './AssetsPanel';
import { TextPanel } from './TextPanel';
import { UploadPanel } from './UploadPanel';
import { PhotosPanel } from './PhotosPanel';
import { LayersPanel } from './LayersPanel';
import { AnimationsPanel } from './AnimationsPanel';
import { LibraryPanel } from './LibraryPanel';
import { MaskPanel } from './MaskPanel';

interface SidebarTab {
    id: SidebarPanel;
    icon: React.ReactNode;
    label: string;
}

const SIDEBAR_TABS: SidebarTab[] = [
    { id: 'library', icon: <Library size={20} strokeWidth={1.5} />, label: 'Library' },
    { id: 'templates', icon: <SquareStack size={20} strokeWidth={1.5} />, label: 'Templates' },
    { id: 'assets', icon: <Gem size={20} strokeWidth={1.5} />, label: 'Assets' },
    { id: 'text', icon: <Type size={20} strokeWidth={1.5} />, label: 'Text' },
    { id: 'photos', icon: <Image size={20} strokeWidth={1.5} />, label: 'Photos' },
    { id: 'uploads', icon: <CloudUpload size={20} strokeWidth={1.5} />, label: 'Uploads' },
    { id: 'layers', icon: <Layers size={20} strokeWidth={1.5} />, label: 'Layers' },
    { id: 'animations', icon: <Sparkles size={20} strokeWidth={1.5} />, label: 'Animations' },
];

export function SidebarContainer() {
    const activePanel = useSidebarPanel();
    const setSidebarPanel = useEditorStore((state) => state.setSidebarPanel);

    const handleClosePanel = () => {
        setSidebarPanel(null);
    };

    const renderPanel = () => {
        switch (activePanel) {
            case 'library':
                return <LibraryPanel />;
            case 'templates':
                return <TemplatesPanel />;
            case 'assets':
                return <AssetsPanel />;
            case 'text':
                return <TextPanel />;
            case 'photos':
                return <PhotosPanel />;
            case 'uploads':
                return <UploadPanel />;
            case 'layers':
                return <LayersPanel />;
            case 'animations':
                return <AnimationsPanel />;
            case 'mask':
                return <MaskPanel />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-full">
            {/* Tab Icons - Left Toolbar */}
            <div className="w-[80px] bg-[#0e1318] text-gray-400 flex flex-col h-full z-30 shrink-0">
                <div className="flex flex-col py-1">
                    {SIDEBAR_TABS.map((tab) => {
                        const isActive = activePanel === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setSidebarPanel(activePanel === tab.id ? null : tab.id)}
                                className={`
                                    flex flex-col items-center justify-center py-2.5 w-full transition-all relative shrink-0
                                    ${isActive
                                        ? 'bg-[#252627] text-white'
                                        : 'hover:text-gray-100 hover:bg-[#1f2021]'
                                    }
                                `}
                            >
                                {/* Active indicator bar */}
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r" />
                                )}
                                <span className="mb-1">{tab.icon}</span>
                                <span className="text-[9px] font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Panel Content with Close Button */}
            {activePanel && (
                <div className="relative h-full">
                    {/* Panel */}
                    <div className="w-72 bg-white border-r border-gray-200 overflow-hidden h-full">
                        {renderPanel()}
                    </div>

                    {/* Close Button - Trapezoid shape on the right edge */}
                    <button
                        onClick={handleClosePanel}
                        className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-full z-40 
                                   flex items-center justify-center
                                   transition-all duration-200
                                   hover:opacity-80 active:scale-95"
                        title="Close panel"
                    >
                        {/* Vertical trapezoid with subtle curves */}
                        <svg
                            width="24"
                            height="80"
                            viewBox="0 0 24 80"
                            fill="none"
                        >
                            <path
                                d="M0 0 Q0 5 12 12 Q20 18 20 30 L20 50 Q20 62 12 68 Q0 75 0 80 Z"
                                className="fill-white"
                            />
                            <path
                                d="M0 0 Q0 5 12 12 Q20 18 20 30 L20 50 Q20 62 12 68 Q0 75 0 80"
                                stroke="#E5E7EB"
                                strokeWidth="1"
                                fill="none"
                            />
                        </svg>
                        <ChevronLeft size={14} className="absolute text-gray-400" />
                    </button>
                </div>
            )}
        </div>
    );
}
