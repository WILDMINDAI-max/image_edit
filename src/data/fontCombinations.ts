// Font Combinations Catalog - Pro Quality Stylish Designs
// Trendy 2024 typography pairings with vibrant colors

export interface TextItem {
    content: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number | 'normal' | 'bold';
    color: string;
    letterSpacing?: number;
    textTransform?: 'none' | 'uppercase' | 'lowercase';
    fontStyle?: 'normal' | 'italic';
    offsetY: number;
}

export interface FontCombination {
    id: string;
    name: string;
    category: 'sale' | 'social' | 'business' | 'creative' | 'gradient' | 'minimal' | 'retro' | 'elegant';
    texts: TextItem[];
    previewBg?: string; // Custom background color for preview
}

export const FONT_COMBINATIONS: FontCombination[] = [
    // === GRADIENT & COLORFUL ===
    {
        id: 'neon-vibes',
        name: 'Neon Vibes',
        category: 'gradient',
        previewBg: '#0f0f23',
        texts: [
            { content: 'NEON', fontFamily: 'Bebas Neue', fontSize: 52, fontWeight: 400, color: '#ff00ff', letterSpacing: 8, offsetY: 0 },
            { content: 'VIBES', fontFamily: 'Bebas Neue', fontSize: 52, fontWeight: 400, color: '#00ffff', letterSpacing: 8, offsetY: 48 },
        ]
    },
    {
        id: 'sunset-dreams',
        name: 'Sunset Dreams',
        category: 'gradient',
        previewBg: '#1a1a2e',
        texts: [
            { content: 'SUNSET', fontFamily: 'Montserrat', fontSize: 36, fontWeight: 800, color: '#ff6b6b', letterSpacing: 6, offsetY: 0 },
            { content: 'dreams', fontFamily: 'Dancing Script', fontSize: 42, fontWeight: 700, color: '#feca57', offsetY: 38 },
        ]
    },
    {
        id: 'electric-blue',
        name: 'Electric Blue',
        category: 'gradient',
        previewBg: '#0a0a0a',
        texts: [
            { content: 'ELECTRIC', fontFamily: 'Oswald', fontSize: 38, fontWeight: 700, color: '#00d4ff', letterSpacing: 4, offsetY: 0 },
            { content: 'BLUE', fontFamily: 'Oswald', fontSize: 48, fontWeight: 700, color: '#0066ff', letterSpacing: 6, offsetY: 40 },
        ]
    },
    {
        id: 'purple-haze',
        name: 'Purple Haze',
        category: 'gradient',
        previewBg: '#16161d',
        texts: [
            { content: 'purple', fontFamily: 'Caveat', fontSize: 36, fontWeight: 700, color: '#c084fc', offsetY: 0 },
            { content: 'HAZE', fontFamily: 'Bebas Neue', fontSize: 56, fontWeight: 400, color: '#a855f7', letterSpacing: 10, offsetY: 32 },
        ]
    },
    {
        id: 'coral-glow',
        name: 'Coral Glow',
        category: 'gradient',
        previewBg: '#1e1e1e',
        texts: [
            { content: 'CORAL', fontFamily: 'Montserrat', fontSize: 42, fontWeight: 900, color: '#ff7f50', letterSpacing: 4, offsetY: 0 },
            { content: 'glow', fontFamily: 'Dancing Script', fontSize: 48, fontWeight: 700, color: '#ffd700', offsetY: 42 },
        ]
    },
    {
        id: 'mint-fresh',
        name: 'Mint Fresh',
        category: 'gradient',
        previewBg: '#0d1117',
        texts: [
            { content: 'MINT', fontFamily: 'Bebas Neue', fontSize: 52, fontWeight: 400, color: '#10b981', letterSpacing: 8, offsetY: 0 },
            { content: 'fresh', fontFamily: 'Caveat', fontSize: 42, fontWeight: 700, color: '#34d399', offsetY: 48 },
        ]
    },

    // === ELEGANT & LUXURY ===
    {
        id: 'gold-luxury',
        name: 'Gold Luxury',
        category: 'elegant',
        previewBg: '#1a1a1a',
        texts: [
            { content: 'LUXURY', fontFamily: 'Playfair Display', fontSize: 38, fontWeight: 700, color: '#d4af37', letterSpacing: 10, offsetY: 0 },
            { content: 'collection', fontFamily: 'Montserrat', fontSize: 18, fontWeight: 300, color: '#c4a747', letterSpacing: 8, textTransform: 'uppercase', offsetY: 44 },
        ]
    },
    {
        id: 'royal-elegance',
        name: 'Royal Elegance',
        category: 'elegant',
        previewBg: '#0f0f23',
        texts: [
            { content: 'Royal', fontFamily: 'Playfair Display', fontSize: 48, fontWeight: 700, color: '#8b5cf6', fontStyle: 'italic', offsetY: 0 },
            { content: 'ELEGANCE', fontFamily: 'Montserrat', fontSize: 20, fontWeight: 400, color: '#a78bfa', letterSpacing: 12, offsetY: 52 },
        ]
    },
    {
        id: 'champagne-toast',
        name: 'Champagne Toast',
        category: 'elegant',
        previewBg: '#1c1917',
        texts: [
            { content: 'Champagne', fontFamily: 'Dancing Script', fontSize: 42, fontWeight: 700, color: '#fbbf24', offsetY: 0 },
            { content: 'TOAST', fontFamily: 'Bebas Neue', fontSize: 48, fontWeight: 400, color: '#f59e0b', letterSpacing: 6, offsetY: 40 },
        ]
    },
    {
        id: 'diamond-shine',
        name: 'Diamond Shine',
        category: 'elegant',
        previewBg: '#18181b',
        texts: [
            { content: '◇ DIAMOND ◇', fontFamily: 'Montserrat', fontSize: 14, fontWeight: 300, color: '#e5e5e5', letterSpacing: 6, offsetY: 0 },
            { content: 'SHINE', fontFamily: 'Playfair Display', fontSize: 52, fontWeight: 700, color: '#ffffff', letterSpacing: 8, offsetY: 20 },
        ]
    },

    // === RETRO & VINTAGE ===
    {
        id: 'retro-wave',
        name: 'Retro Wave',
        category: 'retro',
        previewBg: '#1a1a2e',
        texts: [
            { content: 'RETRO', fontFamily: 'Bebas Neue', fontSize: 48, fontWeight: 400, color: '#ff6ec7', letterSpacing: 6, offsetY: 0 },
            { content: 'WAVE', fontFamily: 'Bebas Neue', fontSize: 48, fontWeight: 400, color: '#7873f5', letterSpacing: 6, offsetY: 44 },
        ]
    },
    {
        id: 'vintage-vibes',
        name: 'Vintage Vibes',
        category: 'retro',
        previewBg: '#2d2a2e',
        texts: [
            { content: '★ VINTAGE ★', fontFamily: 'Oswald', fontSize: 32, fontWeight: 500, color: '#fcd34d', letterSpacing: 4, offsetY: 0 },
            { content: 'vibes', fontFamily: 'Caveat', fontSize: 48, fontWeight: 700, color: '#fbbf24', offsetY: 34 },
        ]
    },
    {
        id: 'disco-night',
        name: 'Disco Night',
        category: 'retro',
        previewBg: '#1e1b4b',
        texts: [
            { content: 'DISCO', fontFamily: 'Bebas Neue', fontSize: 52, fontWeight: 400, color: '#f472b6', letterSpacing: 8, offsetY: 0 },
            { content: 'night', fontFamily: 'Dancing Script', fontSize: 42, fontWeight: 700, color: '#c084fc', offsetY: 48 },
        ]
    },
    {
        id: 'groovy-70s',
        name: 'Groovy 70s',
        category: 'retro',
        previewBg: '#3d2914',
        texts: [
            { content: 'GROOVY', fontFamily: 'Oswald', fontSize: 42, fontWeight: 700, color: '#fb923c', letterSpacing: 4, offsetY: 0 },
            { content: '70s', fontFamily: 'Caveat', fontSize: 56, fontWeight: 700, color: '#fbbf24', offsetY: 40 },
        ]
    },

    // === MINIMAL & CLEAN ===
    {
        id: 'clean-minimal',
        name: 'Clean Minimal',
        category: 'minimal',
        previewBg: '#ffffff',
        texts: [
            { content: 'CLEAN', fontFamily: 'Montserrat', fontSize: 36, fontWeight: 200, color: '#1a1a1a', letterSpacing: 14, offsetY: 0 },
            { content: 'minimal', fontFamily: 'Montserrat', fontSize: 28, fontWeight: 600, color: '#6b7280', letterSpacing: 4, offsetY: 42 },
        ]
    },
    {
        id: 'swiss-style',
        name: 'Swiss Style',
        category: 'minimal',
        previewBg: '#f5f5f5',
        texts: [
            { content: 'SWISS', fontFamily: 'Oswald', fontSize: 48, fontWeight: 700, color: '#ef4444', letterSpacing: 6, offsetY: 0 },
            { content: 'STYLE', fontFamily: 'Montserrat', fontSize: 18, fontWeight: 400, color: '#1f2937', letterSpacing: 10, offsetY: 52 },
        ]
    },
    {
        id: 'mono-type',
        name: 'Mono Type',
        category: 'minimal',
        previewBg: '#fafafa',
        texts: [
            { content: 'MONO', fontFamily: 'Bebas Neue', fontSize: 56, fontWeight: 400, color: '#171717', letterSpacing: 10, offsetY: 0 },
            { content: 'TYPE', fontFamily: 'Montserrat', fontSize: 24, fontWeight: 300, color: '#525252', letterSpacing: 16, offsetY: 54 },
        ]
    },
    {
        id: 'zen-balance',
        name: 'Zen Balance',
        category: 'minimal',
        previewBg: '#fefce8',
        texts: [
            { content: 'ZEN', fontFamily: 'Playfair Display', fontSize: 48, fontWeight: 400, color: '#78716c', letterSpacing: 12, offsetY: 0 },
            { content: 'balance', fontFamily: 'Dancing Script', fontSize: 36, fontWeight: 700, color: '#a8a29e', offsetY: 50 },
        ]
    },

    // === BOLD & CREATIVE ===
    {
        id: 'power-move',
        name: 'Power Move',
        category: 'creative',
        previewBg: '#18181b',
        texts: [
            { content: 'POWER', fontFamily: 'Bebas Neue', fontSize: 52, fontWeight: 400, color: '#ef4444', letterSpacing: 6, offsetY: 0 },
            { content: 'MOVE', fontFamily: 'Bebas Neue', fontSize: 52, fontWeight: 400, color: '#ffffff', letterSpacing: 6, offsetY: 48 },
        ]
    },
    {
        id: 'game-changer',
        name: 'Game Changer',
        category: 'creative',
        previewBg: '#0c0c0c',
        texts: [
            { content: 'GAME', fontFamily: 'Oswald', fontSize: 44, fontWeight: 700, color: '#22c55e', letterSpacing: 8, offsetY: 0 },
            { content: 'CHANGER', fontFamily: 'Montserrat', fontSize: 24, fontWeight: 800, color: '#4ade80', letterSpacing: 10, offsetY: 46 },
        ]
    },
    {
        id: 'next-level',
        name: 'Next Level',
        category: 'creative',
        previewBg: '#0f172a',
        texts: [
            { content: 'NEXT', fontFamily: 'Bebas Neue', fontSize: 48, fontWeight: 400, color: '#3b82f6', letterSpacing: 6, offsetY: 0 },
            { content: 'level', fontFamily: 'Caveat', fontSize: 52, fontWeight: 700, color: '#60a5fa', offsetY: 44 },
        ]
    },
    {
        id: 'wild-spirit',
        name: 'Wild Spirit',
        category: 'creative',
        previewBg: '#1e1e1e',
        texts: [
            { content: 'WILD', fontFamily: 'Oswald', fontSize: 48, fontWeight: 700, color: '#f97316', letterSpacing: 8, offsetY: 0 },
            { content: 'spirit', fontFamily: 'Dancing Script', fontSize: 44, fontWeight: 700, color: '#fb923c', offsetY: 46 },
        ]
    },
    {
        id: 'creative-hub',
        name: 'Creative Hub',
        category: 'creative',
        previewBg: '#1a1a2e',
        texts: [
            { content: 'creative', fontFamily: 'Caveat', fontSize: 38, fontWeight: 700, color: '#ec4899', offsetY: 0 },
            { content: 'HUB', fontFamily: 'Bebas Neue', fontSize: 56, fontWeight: 400, color: '#f472b6', letterSpacing: 10, offsetY: 34 },
        ]
    },

    // === SALE & PROMO ===
    {
        id: 'mega-sale',
        name: 'Mega Sale',
        category: 'sale',
        previewBg: '#dc2626',
        texts: [
            { content: 'MEGA', fontFamily: 'Bebas Neue', fontSize: 42, fontWeight: 400, color: '#fef08a', letterSpacing: 8, offsetY: 0 },
            { content: 'SALE', fontFamily: 'Bebas Neue', fontSize: 56, fontWeight: 400, color: '#ffffff', letterSpacing: 6, offsetY: 38 },
        ]
    },
    {
        id: 'flash-deal',
        name: 'Flash Deal',
        category: 'sale',
        previewBg: '#fbbf24',
        texts: [
            { content: '⚡ FLASH ⚡', fontFamily: 'Oswald', fontSize: 28, fontWeight: 700, color: '#1f2937', letterSpacing: 4, offsetY: 0 },
            { content: 'DEAL', fontFamily: 'Bebas Neue', fontSize: 52, fontWeight: 400, color: '#111827', letterSpacing: 8, offsetY: 30 },
        ]
    },
    {
        id: 'hot-price',
        name: 'Hot Price',
        category: 'sale',
        previewBg: '#ea580c',
        texts: [
            { content: '🔥 HOT', fontFamily: 'Montserrat', fontSize: 32, fontWeight: 800, color: '#ffffff', letterSpacing: 4, offsetY: 0 },
            { content: 'PRICE', fontFamily: 'Bebas Neue', fontSize: 48, fontWeight: 400, color: '#fef3c7', letterSpacing: 6, offsetY: 36 },
        ]
    },
    {
        id: 'black-friday-pro',
        name: 'Black Friday Pro',
        category: 'sale',
        previewBg: '#000000',
        texts: [
            { content: 'BLACK', fontFamily: 'Bebas Neue', fontSize: 42, fontWeight: 400, color: '#fbbf24', letterSpacing: 8, offsetY: 0 },
            { content: 'FRIDAY', fontFamily: 'Montserrat', fontSize: 32, fontWeight: 900, color: '#ffffff', letterSpacing: 6, offsetY: 40 },
        ]
    },

    // === SOCIAL & TRENDING ===
    {
        id: 'trending-now',
        name: 'Trending Now',
        category: 'social',
        previewBg: '#1e1b4b',
        texts: [
            { content: '🔥 TRENDING', fontFamily: 'Montserrat', fontSize: 24, fontWeight: 700, color: '#f472b6', letterSpacing: 4, offsetY: 0 },
            { content: 'NOW', fontFamily: 'Bebas Neue', fontSize: 56, fontWeight: 400, color: '#ffffff', letterSpacing: 8, offsetY: 28 },
        ]
    },
    {
        id: 'viral-content',
        name: 'Viral Content',
        category: 'social',
        previewBg: '#0ea5e9',
        texts: [
            { content: 'VIRAL', fontFamily: 'Oswald', fontSize: 48, fontWeight: 700, color: '#ffffff', letterSpacing: 6, offsetY: 0 },
            { content: 'content', fontFamily: 'Caveat', fontSize: 38, fontWeight: 700, color: '#bae6fd', offsetY: 48 },
        ]
    },
    {
        id: 'new-drop',
        name: 'New Drop',
        category: 'social',
        previewBg: '#7c3aed',
        texts: [
            { content: '✨ NEW', fontFamily: 'Montserrat', fontSize: 28, fontWeight: 600, color: '#f0abfc', letterSpacing: 6, offsetY: 0 },
            { content: 'DROP', fontFamily: 'Bebas Neue', fontSize: 56, fontWeight: 400, color: '#ffffff', letterSpacing: 8, offsetY: 32 },
        ]
    },
    {
        id: 'swipe-up',
        name: 'Swipe Up',
        category: 'social',
        previewBg: '#be185d',
        texts: [
            { content: '↑ SWIPE', fontFamily: 'Oswald', fontSize: 36, fontWeight: 600, color: '#fdf2f8', letterSpacing: 6, offsetY: 0 },
            { content: 'UP', fontFamily: 'Bebas Neue', fontSize: 52, fontWeight: 400, color: '#ffffff', letterSpacing: 10, offsetY: 38 },
        ]
    },

    // === BUSINESS PRO ===
    {
        id: 'pro-consulting',
        name: 'Pro Consulting',
        category: 'business',
        previewBg: '#1e293b',
        texts: [
            { content: 'PRO', fontFamily: 'Montserrat', fontSize: 42, fontWeight: 800, color: '#38bdf8', letterSpacing: 8, offsetY: 0 },
            { content: 'CONSULTING', fontFamily: 'Montserrat', fontSize: 18, fontWeight: 400, color: '#94a3b8', letterSpacing: 10, offsetY: 48 },
        ]
    },
    {
        id: 'elite-brand',
        name: 'Elite Brand',
        category: 'business',
        previewBg: '#18181b',
        texts: [
            { content: 'ELITE', fontFamily: 'Playfair Display', fontSize: 42, fontWeight: 700, color: '#d4af37', letterSpacing: 8, offsetY: 0 },
            { content: 'brand', fontFamily: 'Montserrat', fontSize: 22, fontWeight: 300, color: '#a8a29e', letterSpacing: 6, offsetY: 48 },
        ]
    },
    {
        id: 'startup-hub',
        name: 'Startup Hub',
        category: 'business',
        previewBg: '#0f172a',
        texts: [
            { content: 'STARTUP', fontFamily: 'Oswald', fontSize: 38, fontWeight: 600, color: '#22c55e', letterSpacing: 4, offsetY: 0 },
            { content: 'HUB', fontFamily: 'Bebas Neue', fontSize: 52, fontWeight: 400, color: '#4ade80', letterSpacing: 10, offsetY: 40 },
        ]
    },
];

// Updated category labels with new categories
export const COMBINATION_CATEGORIES = [
    { id: 'gradient', label: 'Colorful & Gradient', icon: '🌈' },
    { id: 'elegant', label: 'Elegant & Luxury', icon: '💎' },
    { id: 'retro', label: 'Retro & Vintage', icon: '🎸' },
    { id: 'creative', label: 'Bold & Creative', icon: '🚀' },
    { id: 'minimal', label: 'Minimal & Clean', icon: '✨' },
    { id: 'sale', label: 'Sale & Promo', icon: '🔥' },
    { id: 'social', label: 'Social Media', icon: '📱' },
    { id: 'business', label: 'Business Pro', icon: '💼' },
];
