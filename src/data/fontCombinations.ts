// Font Combinations Catalog - Bold Stylish Designs
// Unique creative pairings with dramatic visual impact

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
    category: string;
    texts: TextItem[];
    previewBg?: string;
}

export const FONT_COMBINATIONS: FontCombination[] = [
    // === DRAMATIC DISPLAY ===
    {
        id: 'big-bold-beautiful',
        name: 'Big Bold Beautiful',
        category: 'display',
        previewBg: '#ff6b6b',
        texts: [
            { content: 'BIG', fontFamily: 'Abril Fatface', fontSize: 64, fontWeight: 400, color: '#ffffff', letterSpacing: 4, offsetY: 0 },
            { content: 'BOLD', fontFamily: 'Archivo Black', fontSize: 48, fontWeight: 400, color: '#1a1a1a', letterSpacing: 6, offsetY: 60 },
        ]
    },
    {
        id: 'super-star',
        name: 'Super Star',
        category: 'display',
        previewBg: '#fbbf24',
        texts: [
            { content: 'SUPER', fontFamily: 'Bangers', fontSize: 52, fontWeight: 400, color: '#ef4444', letterSpacing: 4, offsetY: 0 },
            { content: 'STAR', fontFamily: 'Bangers', fontSize: 64, fontWeight: 400, color: '#1f2937', letterSpacing: 6, offsetY: 48 },
        ]
    },
    {
        id: 'boom-pow',
        name: 'Boom Pow',
        category: 'display',
        previewBg: '#ef4444',
        texts: [
            { content: 'BOOM!', fontFamily: 'Bangers', fontSize: 68, fontWeight: 400, color: '#fef08a', letterSpacing: 4, offsetY: 0 },
        ]
    },
    {
        id: 'epic-moment',
        name: 'Epic Moment',
        category: 'display',
        previewBg: '#7c3aed',
        texts: [
            { content: 'EPIC', fontFamily: 'Russo One', fontSize: 56, fontWeight: 400, color: '#ffffff', letterSpacing: 8, offsetY: 0 },
            { content: 'moment', fontFamily: 'Great Vibes', fontSize: 48, fontWeight: 400, color: '#c4b5fd', offsetY: 52 },
        ]
    },

    // === RETRO & VINTAGE ===
    {
        id: 'groovy-baby',
        name: 'Groovy Baby',
        category: 'retro',
        previewBg: '#f97316',
        texts: [
            { content: 'GROOVY', fontFamily: 'Righteous', fontSize: 48, fontWeight: 400, color: '#fef3c7', letterSpacing: 4, offsetY: 0 },
            { content: 'baby', fontFamily: 'Pacifico', fontSize: 44, fontWeight: 400, color: '#7c2d12', offsetY: 48 },
        ]
    },
    {
        id: 'vintage-classic',
        name: 'Vintage Classic',
        category: 'retro',
        previewBg: '#1c1917',
        texts: [
            { content: 'VINTAGE', fontFamily: 'Alfa Slab One', fontSize: 44, fontWeight: 400, color: '#d4a574', letterSpacing: 4, offsetY: 0 },
            { content: 'classic', fontFamily: 'Sacramento', fontSize: 48, fontWeight: 400, color: '#e8d5b7', offsetY: 46 },
        ]
    },
    {
        id: 'old-school',
        name: 'Old School',
        category: 'retro',
        previewBg: '#292524',
        texts: [
            { content: 'OLD', fontFamily: 'Archivo Black', fontSize: 52, fontWeight: 400, color: '#fbbf24', letterSpacing: 6, offsetY: 0 },
            { content: 'SCHOOL', fontFamily: 'Righteous', fontSize: 36, fontWeight: 400, color: '#fcd34d', letterSpacing: 8, offsetY: 52 },
        ]
    },

    // === ELEGANT SCRIPTS ===
    {
        id: 'forever-yours',
        name: 'Forever Yours',
        category: 'elegant',
        previewBg: '#fdf2f8',
        texts: [
            { content: 'Forever', fontFamily: 'Great Vibes', fontSize: 56, fontWeight: 400, color: '#be185d', offsetY: 0 },
            { content: 'Yours', fontFamily: 'Great Vibes', fontSize: 52, fontWeight: 400, color: '#db2777', offsetY: 48 },
        ]
    },
    {
        id: 'with-love',
        name: 'With Love',
        category: 'elegant',
        previewBg: '#1a1a1a',
        texts: [
            { content: 'with', fontFamily: 'Sacramento', fontSize: 36, fontWeight: 400, color: '#f9a8d4', offsetY: 0 },
            { content: 'Love', fontFamily: 'Abril Fatface', fontSize: 64, fontWeight: 400, color: '#ec4899', offsetY: 30 },
        ]
    },
    {
        id: 'dreamy-nights',
        name: 'Dreamy Nights',
        category: 'elegant',
        previewBg: '#1e1b4b',
        texts: [
            { content: 'Dreamy', fontFamily: 'Satisfy', fontSize: 52, fontWeight: 400, color: '#c4b5fd', offsetY: 0 },
            { content: 'NIGHTS', fontFamily: 'Montserrat', fontSize: 24, fontWeight: 200, color: '#a78bfa', letterSpacing: 14, offsetY: 52 },
        ]
    },

    // === FUN & PLAYFUL ===
    {
        id: 'party-time',
        name: 'Party Time',
        category: 'fun',
        previewBg: '#ec4899',
        texts: [
            { content: 'PARTY', fontFamily: 'Fredoka', fontSize: 52, fontWeight: 700, color: '#fef08a', letterSpacing: 4, offsetY: 0 },
            { content: 'TIME!', fontFamily: 'Bangers', fontSize: 48, fontWeight: 400, color: '#ffffff', letterSpacing: 6, offsetY: 52 },
        ]
    },
    {
        id: 'lets-celebrate',
        name: "Let's Celebrate",
        category: 'fun',
        previewBg: '#10b981',
        texts: [
            { content: "LET'S", fontFamily: 'Lobster', fontSize: 36, fontWeight: 400, color: '#ecfdf5', offsetY: 0 },
            { content: 'CELEBRATE', fontFamily: 'Russo One', fontSize: 36, fontWeight: 400, color: '#ffffff', letterSpacing: 4, offsetY: 38 },
        ]
    },
    {
        id: 'yay-hooray',
        name: 'Yay Hooray',
        category: 'fun',
        previewBg: '#8b5cf6',
        texts: [
            { content: 'YAY!', fontFamily: 'Fredoka', fontSize: 64, fontWeight: 700, color: '#fef08a', offsetY: 0 },
        ]
    },
    {
        id: 'hello-gorgeous',
        name: 'Hello Gorgeous',
        category: 'fun',
        previewBg: '#f472b6',
        texts: [
            { content: 'Hello', fontFamily: 'Pacifico', fontSize: 36, fontWeight: 400, color: '#ffffff', offsetY: 0 },
            { content: 'GORGEOUS', fontFamily: 'Montserrat', fontSize: 28, fontWeight: 800, color: '#1f2937', letterSpacing: 6, offsetY: 40 },
        ]
    },

    // === EDGY & BOLD ===
    {
        id: 'game-on',
        name: 'Game On',
        category: 'edgy',
        previewBg: '#0f0f0f',
        texts: [
            { content: 'GAME', fontFamily: 'Russo One', fontSize: 52, fontWeight: 400, color: '#22c55e', letterSpacing: 6, offsetY: 0 },
            { content: 'ON', fontFamily: 'Archivo Black', fontSize: 64, fontWeight: 400, color: '#4ade80', letterSpacing: 8, offsetY: 50 },
        ]
    },
    {
        id: 'level-up',
        name: 'Level Up',
        category: 'edgy',
        previewBg: '#1e1e2e',
        texts: [
            { content: 'LEVEL', fontFamily: 'Bangers', fontSize: 48, fontWeight: 400, color: '#60a5fa', letterSpacing: 6, offsetY: 0 },
            { content: 'UP!', fontFamily: 'Bangers', fontSize: 56, fontWeight: 400, color: '#3b82f6', letterSpacing: 4, offsetY: 46 },
        ]
    },
    {
        id: 'no-limits',
        name: 'No Limits',
        category: 'edgy',
        previewBg: '#18181b',
        texts: [
            { content: 'NO', fontFamily: 'Archivo Black', fontSize: 56, fontWeight: 400, color: '#ef4444', letterSpacing: 8, offsetY: 0 },
            { content: 'LIMITS', fontFamily: 'Russo One', fontSize: 44, fontWeight: 400, color: '#ffffff', letterSpacing: 6, offsetY: 54 },
        ]
    },
    {
        id: 'stay-wild',
        name: 'Stay Wild',
        category: 'edgy',
        previewBg: '#292524',
        texts: [
            { content: 'STAY', fontFamily: 'Permanent Marker', fontSize: 44, fontWeight: 400, color: '#f97316', offsetY: 0 },
            { content: 'WILD', fontFamily: 'Permanent Marker', fontSize: 52, fontWeight: 400, color: '#fbbf24', offsetY: 44 },
        ]
    },

    // === WEDDING & ROMANCE ===
    {
        id: 'happily-ever-after',
        name: 'Happily Ever After',
        category: 'wedding',
        previewBg: '#fef7f0',
        texts: [
            { content: 'Happily', fontFamily: 'Great Vibes', fontSize: 48, fontWeight: 400, color: '#b45309', offsetY: 0 },
            { content: 'ever after', fontFamily: 'Sacramento', fontSize: 42, fontWeight: 400, color: '#d97706', offsetY: 44 },
        ]
    },
    {
        id: 'mr-and-mrs',
        name: 'Mr & Mrs',
        category: 'wedding',
        previewBg: '#1c1917',
        texts: [
            { content: 'Mr & Mrs', fontFamily: 'Satisfy', fontSize: 52, fontWeight: 400, color: '#d4af37', offsetY: 0 },
        ]
    },
    {
        id: 'save-our-date',
        name: 'Save Our Date',
        category: 'wedding',
        previewBg: '#f5f5f0',
        texts: [
            { content: 'SAVE', fontFamily: 'Abril Fatface', fontSize: 48, fontWeight: 400, color: '#2d4a3e', letterSpacing: 6, offsetY: 0 },
            { content: 'our', fontFamily: 'Great Vibes', fontSize: 36, fontWeight: 400, color: '#4a6741', offsetY: 48 },
            { content: 'DATE', fontFamily: 'Abril Fatface', fontSize: 48, fontWeight: 400, color: '#2d4a3e', letterSpacing: 6, offsetY: 78 },
        ]
    },

    // === SEASONAL ===
    {
        id: 'summer-vibes',
        name: 'Summer Vibes',
        category: 'seasonal',
        previewBg: '#0ea5e9',
        texts: [
            { content: 'SUMMER', fontFamily: 'Righteous', fontSize: 44, fontWeight: 400, color: '#fef08a', letterSpacing: 4, offsetY: 0 },
            { content: 'vibes', fontFamily: 'Lobster', fontSize: 48, fontWeight: 400, color: '#ffffff', offsetY: 46 },
        ]
    },
    {
        id: 'spring-bloom',
        name: 'Spring Bloom',
        category: 'seasonal',
        previewBg: '#fdf2f8',
        texts: [
            { content: 'Spring', fontFamily: 'Pacifico', fontSize: 52, fontWeight: 400, color: '#be185d', offsetY: 0 },
            { content: 'BLOOM', fontFamily: 'Montserrat', fontSize: 28, fontWeight: 700, color: '#ec4899', letterSpacing: 10, offsetY: 52 },
        ]
    },
    {
        id: 'winter-magic',
        name: 'Winter Magic',
        category: 'seasonal',
        previewBg: '#1e3a5f',
        texts: [
            { content: 'Winter', fontFamily: 'Satisfy', fontSize: 48, fontWeight: 400, color: '#bae6fd', offsetY: 0 },
            { content: 'MAGIC', fontFamily: 'Fredoka', fontSize: 40, fontWeight: 600, color: '#ffffff', letterSpacing: 8, offsetY: 48 },
        ]
    },
    {
        id: 'autumn-feels',
        name: 'Autumn Feels',
        category: 'seasonal',
        previewBg: '#7c2d12',
        texts: [
            { content: 'AUTUMN', fontFamily: 'Alfa Slab One', fontSize: 44, fontWeight: 400, color: '#fcd34d', letterSpacing: 4, offsetY: 0 },
            { content: 'feels', fontFamily: 'Sacramento', fontSize: 48, fontWeight: 400, color: '#fef3c7', offsetY: 46 },
        ]
    },

    // === SOCIAL MEDIA ===
    {
        id: 'follow-me',
        name: 'Follow Me',
        category: 'social',
        previewBg: '#c026d3',
        texts: [
            { content: 'FOLLOW', fontFamily: 'Russo One', fontSize: 40, fontWeight: 400, color: '#ffffff', letterSpacing: 6, offsetY: 0 },
            { content: 'me', fontFamily: 'Pacifico', fontSize: 48, fontWeight: 400, color: '#fdf4ff', offsetY: 42 },
        ]
    },
    {
        id: 'new-post',
        name: 'New Post',
        category: 'social',
        previewBg: '#e11d48',
        texts: [
            { content: 'NEW', fontFamily: 'Bangers', fontSize: 44, fontWeight: 400, color: '#fef08a', letterSpacing: 6, offsetY: 0 },
            { content: 'POST', fontFamily: 'Archivo Black', fontSize: 48, fontWeight: 400, color: '#ffffff', letterSpacing: 4, offsetY: 44 },
        ]
    },
    {
        id: 'link-in-bio',
        name: 'Link in Bio',
        category: 'social',
        previewBg: '#2563eb',
        texts: [
            { content: 'LINK IN', fontFamily: 'Montserrat', fontSize: 20, fontWeight: 600, color: '#bfdbfe', letterSpacing: 6, offsetY: 0 },
            { content: 'BIO', fontFamily: 'Abril Fatface', fontSize: 64, fontWeight: 400, color: '#ffffff', letterSpacing: 4, offsetY: 22 },
        ]
    },
    {
        id: 'swipe-right',
        name: 'Swipe Right',
        category: 'social',
        previewBg: '#f97316',
        texts: [
            { content: '→ SWIPE', fontFamily: 'Fredoka', fontSize: 36, fontWeight: 600, color: '#ffffff', letterSpacing: 2, offsetY: 0 },
            { content: 'RIGHT', fontFamily: 'Righteous', fontSize: 44, fontWeight: 400, color: '#fef3c7', letterSpacing: 6, offsetY: 40 },
        ]
    },

    // === BUSINESS ===
    {
        id: 'now-open',
        name: 'Now Open',
        category: 'business',
        previewBg: '#059669',
        texts: [
            { content: 'NOW', fontFamily: 'Russo One', fontSize: 36, fontWeight: 400, color: '#d1fae5', letterSpacing: 8, offsetY: 0 },
            { content: 'OPEN', fontFamily: 'Abril Fatface', fontSize: 56, fontWeight: 400, color: '#ffffff', letterSpacing: 4, offsetY: 38 },
        ]
    },
    {
        id: 'flash-sale',
        name: 'Flash Sale',
        category: 'business',
        previewBg: '#dc2626',
        texts: [
            { content: '⚡FLASH', fontFamily: 'Bangers', fontSize: 44, fontWeight: 400, color: '#fef08a', letterSpacing: 2, offsetY: 0 },
            { content: 'SALE', fontFamily: 'Archivo Black', fontSize: 52, fontWeight: 400, color: '#ffffff', letterSpacing: 6, offsetY: 44 },
        ]
    },
    {
        id: 'limited-offer',
        name: 'Limited Offer',
        category: 'business',
        previewBg: '#0f172a',
        texts: [
            { content: 'LIMITED', fontFamily: 'Montserrat', fontSize: 18, fontWeight: 300, color: '#94a3b8', letterSpacing: 12, offsetY: 0 },
            { content: 'OFFER', fontFamily: 'Alfa Slab One', fontSize: 52, fontWeight: 400, color: '#fbbf24', letterSpacing: 4, offsetY: 22 },
        ]
    },

    // === MOTIVATIONAL ===
    {
        id: 'dream-big',
        name: 'Dream Big',
        category: 'motivational',
        previewBg: '#4f46e5',
        texts: [
            { content: 'DREAM', fontFamily: 'Righteous', fontSize: 44, fontWeight: 400, color: '#c7d2fe', letterSpacing: 6, offsetY: 0 },
            { content: 'BIG', fontFamily: 'Abril Fatface', fontSize: 64, fontWeight: 400, color: '#ffffff', letterSpacing: 8, offsetY: 46 },
        ]
    },
    {
        id: 'be-you',
        name: 'Be You',
        category: 'motivational',
        previewBg: '#f0abfc',
        texts: [
            { content: 'BE', fontFamily: 'Archivo Black', fontSize: 56, fontWeight: 400, color: '#581c87', letterSpacing: 6, offsetY: 0 },
            { content: 'YOU', fontFamily: 'Lobster', fontSize: 64, fontWeight: 400, color: '#7e22ce', offsetY: 52 },
        ]
    },
    {
        id: 'just-breathe',
        name: 'Just Breathe',
        category: 'motivational',
        previewBg: '#ecfdf5',
        texts: [
            { content: 'just', fontFamily: 'Sacramento', fontSize: 36, fontWeight: 400, color: '#065f46', offsetY: 0 },
            { content: 'Breathe', fontFamily: 'Satisfy', fontSize: 52, fontWeight: 400, color: '#059669', offsetY: 32 },
        ]
    },
    {
        id: 'be-fearless',
        name: 'Be Fearless',
        category: 'motivational',
        previewBg: '#1f2937',
        texts: [
            { content: 'BE', fontFamily: 'Montserrat', fontSize: 24, fontWeight: 200, color: '#9ca3af', letterSpacing: 12, offsetY: 0 },
            { content: 'FEARLESS', fontFamily: 'Russo One', fontSize: 44, fontWeight: 400, color: '#f97316', letterSpacing: 4, offsetY: 28 },
        ]
    },
];

// Category labels
export const COMBINATION_CATEGORIES = [
    { id: 'display', label: 'Bold Display', icon: '💥' },
    { id: 'retro', label: 'Retro & Vintage', icon: '🎸' },
    { id: 'elegant', label: 'Elegant Scripts', icon: '✨' },
    { id: 'fun', label: 'Fun & Playful', icon: '🎉' },
    { id: 'edgy', label: 'Edgy & Bold', icon: '🔥' },
    { id: 'wedding', label: 'Wedding & Romance', icon: '💒' },
    { id: 'seasonal', label: 'Seasonal', icon: '🌸' },
    { id: 'social', label: 'Social Media', icon: '📱' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'motivational', label: 'Motivational', icon: '💪' },
];
