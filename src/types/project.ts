// Project and Page Type Definitions
// Core types for project structure and page management

import { CanvasElement } from './canvas';

// Page preset categories
export type PresetCategory =
    | 'social'
    | 'document'
    | 'presentation'
    | 'video'
    | 'print'
    | 'custom';

// Preset size definition
export interface PagePreset {
    id: string;
    name: string;
    category: PresetCategory;
    width: number; // in pixels
    height: number; // in pixels
    dpi: number;
    icon?: string;
}

// Background types
export interface SolidBackground {
    type: 'solid';
    color: string;
}

export interface GradientBackground {
    type: 'gradient';
    gradientType: 'linear' | 'radial';
    colorStops: Array<{ offset: number; color: string }>;
    angle?: number;
    radialPosition?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface ImageBackground {
    type: 'image';
    src: string;
    fit: 'cover' | 'contain' | 'fill' | 'tile';
    opacity: number;
}

export type PageBackground = SolidBackground | GradientBackground | ImageBackground;

// Single page in a project
export interface Page {
    id: string;
    name: string;
    width: number;
    height: number;
    dpi: number;
    background: PageBackground;
    elements: CanvasElement[];
    thumbnail?: string; // Base64 thumbnail for preview
    hidden?: boolean; // Whether page is hidden from export
    locked?: boolean; // Whether page elements are locked from editing
    createdAt: number;
    updatedAt: number;
}

// Main project structure
export interface Project {
    id: string;
    name: string;
    description?: string;
    pages: Page[];
    activePageId: string;
    createdAt: number;
    updatedAt: number;
    version: string;
    metadata?: ProjectMetadata;
}

export interface ProjectMetadata {
    author?: string;
    tags?: string[];
    category?: string;
    isTemplate?: boolean;
    templateId?: string;
}

// Layer representation for the layers panel
export interface Layer {
    elementId: string;
    name: string;
    type: string;
    visible: boolean;
    locked: boolean;
    zIndex: number;
    thumbnail?: string;
}

// Predefined page presets
export const PAGE_PRESETS: PagePreset[] = [
    // Social Media
    {
        id: 'instagram-post',
        name: 'Instagram Post',
        category: 'social',
        width: 1080,
        height: 1080,
        dpi: 72,
    },
    {
        id: 'instagram-story',
        name: 'Instagram Story',
        category: 'social',
        width: 1080,
        height: 1920,
        dpi: 72,
    },
    {
        id: 'instagram-reel',
        name: 'Instagram Reel',
        category: 'social',
        width: 1080,
        height: 1920,
        dpi: 72,
    },
    {
        id: 'facebook-post',
        name: 'Facebook Post',
        category: 'social',
        width: 1200,
        height: 630,
        dpi: 72,
    },
    {
        id: 'facebook-cover',
        name: 'Facebook Cover',
        category: 'social',
        width: 851,
        height: 315,
        dpi: 72,
    },
    {
        id: 'twitter-post',
        name: 'Twitter/X Post',
        category: 'social',
        width: 1200,
        height: 675,
        dpi: 72,
    },
    {
        id: 'linkedin-post',
        name: 'LinkedIn Post',
        category: 'social',
        width: 1200,
        height: 627,
        dpi: 72,
    },
    {
        id: 'youtube-thumbnail',
        name: 'YouTube Thumbnail',
        category: 'social',
        width: 1280,
        height: 720,
        dpi: 72,
    },

    // Documents
    {
        id: 'a4-portrait',
        name: 'A4 Portrait',
        category: 'document',
        width: 2480,
        height: 3508,
        dpi: 300,
    },
    {
        id: 'a4-landscape',
        name: 'A4 Landscape',
        category: 'document',
        width: 3508,
        height: 2480,
        dpi: 300,
    },
    {
        id: 'letter-portrait',
        name: 'Letter Portrait',
        category: 'document',
        width: 2550,
        height: 3300,
        dpi: 300,
    },
    {
        id: 'letter-landscape',
        name: 'Letter Landscape',
        category: 'document',
        width: 3300,
        height: 2550,
        dpi: 300,
    },

    // Presentations
    {
        id: 'presentation-16-9',
        name: 'Presentation 16:9',
        category: 'presentation',
        width: 1920,
        height: 1080,
        dpi: 72,
    },
    {
        id: 'presentation-4-3',
        name: 'Presentation 4:3',
        category: 'presentation',
        width: 1024,
        height: 768,
        dpi: 72,
    },

    // Video
    {
        id: 'video-1080p',
        name: 'Video 1080p',
        category: 'video',
        width: 1920,
        height: 1080,
        dpi: 72,
    },
    {
        id: 'video-4k',
        name: 'Video 4K',
        category: 'video',
        width: 3840,
        height: 2160,
        dpi: 72,
    },
    {
        id: 'video-vertical',
        name: 'Video Vertical',
        category: 'video',
        width: 1080,
        height: 1920,
        dpi: 72,
    },

    // Print
    {
        id: 'business-card',
        name: 'Business Card',
        category: 'print',
        width: 1050,
        height: 600,
        dpi: 300,
    },
    {
        id: 'poster-18x24',
        name: 'Poster 18×24"',
        category: 'print',
        width: 5400,
        height: 7200,
        dpi: 300,
    },
    {
        id: 'flyer-a5',
        name: 'Flyer A5',
        category: 'print',
        width: 1748,
        height: 2480,
        dpi: 300,
    },
];

// Factory functions
export const createDefaultPage = (preset?: PagePreset): Page => {
    const defaultPreset = preset || PAGE_PRESETS[0];
    return {
        id: crypto.randomUUID(),
        name: 'Untitled Page',
        width: defaultPreset.width,
        height: defaultPreset.height,
        dpi: defaultPreset.dpi,
        background: { type: 'solid', color: '#FFFFFF' },
        elements: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
};

export const createDefaultProject = (preset?: PagePreset): Project => {
    const page = createDefaultPage(preset);
    return {
        id: crypto.randomUUID(),
        name: 'Untitled Project',
        pages: [page],
        activePageId: page.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
    };
};
