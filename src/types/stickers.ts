// Sticker Type Definitions
// Editable SVG stickers with color regions

export type StickerCategory =
    | 'celebration'
    | 'nature'
    | 'people'
    | 'food'
    | 'objects'
    | 'animals'
    | 'objects'
    | 'animals'
    | 'emoji'
    | 'office'
    | 'fitness'
    | 'gradients'
    | 'abstract'
    | 'decorations'
    | '3d'
    | 'liquid'
    | 'badges'
    | 'frames';

export const STICKER_CATEGORY_LABELS: Record<StickerCategory, string> = {
    celebration: 'Celebration',
    nature: 'Nature',
    people: 'People',
    food: 'Food',
    objects: 'Objects',
    animals: 'Animals',
    emoji: 'Emoji',
    office: 'Office',
    fitness: 'Fitness',
    gradients: 'Gradients',
    abstract: 'Abstract',
    decorations: 'Decorations',
    '3d': '3D Shapes',
    liquid: 'Liquid Shapes',
    badges: 'Badges & Labels',
    frames: 'Frames & Mockups',
};

export interface StickerDefinition {
    id: string;
    name: string;
    category: StickerCategory;
    svgContent: string;           // SVG template with specific colors
    defaultColors: string[];      // Original colors in the SVG (extracted for editing)
    tags: string[];              // For search
}

// Helper to extract unique colors from SVG content
export function extractColorsFromSvg(svgContent: string): string[] {
    const colorPattern = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g;
    const matches = svgContent.match(colorPattern) || [];
    // Return unique colors, normalized to lowercase
    return [...new Set(matches.map(c => c.toLowerCase()))];
}

// Helper to replace a color in SVG content
export function replaceSvgColor(svgContent: string, oldColor: string, newColor: string): string {
    // Create a case-insensitive regex for the color
    const escapedOldColor = oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedOldColor, 'gi');
    return svgContent.replace(regex, newColor);
}

// Sticker catalog organized by category
export const STICKER_CATALOG: StickerDefinition[] = [
    // ========== CELEBRATION ==========
    {
        id: 'balloon-red',
        name: 'Red Balloon',
        category: 'celebration',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="35" rx="25" ry="30" fill="#E53935"/>
            <ellipse cx="45" cy="25" rx="8" ry="10" fill="#EF5350" opacity="0.6"/>
            <path d="M50 65 L50 95" stroke="#795548" stroke-width="2" fill="none"/>
            <path d="M50 65 Q48 68 50 70" stroke="#E53935" stroke-width="3" fill="none"/>
        </svg>`,
        defaultColors: ['#e53935', '#ef5350', '#795548'],
        tags: ['balloon', 'party', 'birthday', 'celebration'],
    },
    {
        id: 'party-hat',
        name: 'Party Hat',
        category: 'celebration',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,10 20,85 80,85" fill="#FF9800"/>
            <circle cx="50" cy="10" r="8" fill="#E91E63"/>
            <ellipse cx="50" cy="85" rx="35" ry="8" fill="#FF9800"/>
            <line x1="30" y1="30" x2="35" y2="75" stroke="#4CAF50" stroke-width="4"/>
            <line x1="45" y1="25" x2="50" y2="80" stroke="#2196F3" stroke-width="4"/>
            <line x1="60" y1="30" x2="65" y2="75" stroke="#E91E63" stroke-width="4"/>
        </svg>`,
        defaultColors: ['#ff9800', '#e91e63', '#4caf50', '#2196f3'],
        tags: ['party', 'hat', 'birthday', 'celebration', 'cone'],
    },
    {
        id: 'confetti-burst',
        name: 'Confetti',
        category: 'celebration',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="15" width="8" height="8" fill="#FF5722" transform="rotate(15 24 19)"/>
            <rect x="70" y="20" width="6" height="6" fill="#2196F3" transform="rotate(-20 73 23)"/>
            <rect x="45" y="10" width="7" height="7" fill="#4CAF50" transform="rotate(30 48 13)"/>
            <rect x="15" y="50" width="5" height="5" fill="#9C27B0" transform="rotate(-10 17 52)"/>
            <rect x="80" y="55" width="8" height="8" fill="#FFEB3B" transform="rotate(25 84 59)"/>
            <rect x="35" y="70" width="6" height="6" fill="#E91E63" transform="rotate(-15 38 73)"/>
            <rect x="60" y="75" width="7" height="7" fill="#00BCD4" transform="rotate(40 63 78)"/>
            <rect x="50" y="45" width="9" height="9" fill="#FF9800" transform="rotate(20 54 49)"/>
        </svg>`,
        defaultColors: ['#ff5722', '#2196f3', '#4caf50', '#9c27b0', '#ffeb3b', '#e91e63', '#00bcd4', '#ff9800'],
        tags: ['confetti', 'party', 'celebration', 'colorful'],
    },
    {
        id: 'gift-box',
        name: 'Gift Box',
        category: 'celebration',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="15" y="35" width="70" height="55" fill="#E91E63" rx="3"/>
            <rect x="15" y="35" width="70" height="12" fill="#C2185B" rx="3"/>
            <rect x="45" y="35" width="10" height="55" fill="#FFC107"/>
            <rect x="15" y="38" width="70" height="6" fill="#FFC107"/>
            <path d="M50 35 Q35 20 25 35" stroke="#FFC107" stroke-width="4" fill="none"/>
            <path d="M50 35 Q65 20 75 35" stroke="#FFC107" stroke-width="4" fill="none"/>
        </svg>`,
        defaultColors: ['#e91e63', '#c2185b', '#ffc107'],
        tags: ['gift', 'present', 'birthday', 'celebration', 'box'],
    },
    {
        id: 'star-burst',
        name: 'Star',
        category: 'celebration',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,5 61,35 95,35 68,55 79,90 50,70 21,90 32,55 5,35 39,35" fill="#FFD700"/>
            <polygon points="50,20 56,38 75,38 60,50 66,68 50,58 34,68 40,50 25,38 44,38" fill="#FFF59D"/>
        </svg>`,
        defaultColors: ['#ffd700', '#fff59d'],
        tags: ['star', 'gold', 'celebration', 'award', 'shine'],
    },
    {
        id: 'cake-birthday',
        name: 'Birthday Cake',
        category: 'celebration',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="50" width="60" height="40" fill="#8D6E63" rx="5"/>
            <rect x="20" y="50" width="60" height="15" fill="#FFCCBC" rx="5"/>
            <rect x="15" y="40" width="70" height="12" fill="#E91E63"/>
            <ellipse cx="50" cy="40" rx="35" ry="6" fill="#EC407A"/>
            <rect x="48" y="20" width="4" height="22" fill="#FFD54F"/>
            <ellipse cx="50" cy="18" rx="5" ry="6" fill="#FF9800"/>
            <ellipse cx="50" cy="15" rx="3" ry="4" fill="#FFEB3B"/>
        </svg>`,
        defaultColors: ['#8d6e63', '#ffccbc', '#e91e63', '#ec407a', '#ffd54f', '#ff9800', '#ffeb3b'],
        tags: ['cake', 'birthday', 'celebration', 'candle', 'dessert'],
    },

    // ========== NATURE ==========
    {
        id: 'sun-happy',
        name: 'Happy Sun',
        category: 'nature',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="25" fill="#FFD600"/>
            <circle cx="42" cy="45" r="4" fill="#5D4037"/>
            <circle cx="58" cy="45" r="4" fill="#5D4037"/>
            <path d="M40 58 Q50 68 60 58" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
            <line x1="50" y1="10" x2="50" y2="20" stroke="#FFD600" stroke-width="4" stroke-linecap="round"/>
            <line x1="50" y1="80" x2="50" y2="90" stroke="#FFD600" stroke-width="4" stroke-linecap="round"/>
            <line x1="10" y1="50" x2="20" y2="50" stroke="#FFD600" stroke-width="4" stroke-linecap="round"/>
            <line x1="80" y1="50" x2="90" y2="50" stroke="#FFD600" stroke-width="4" stroke-linecap="round"/>
            <line x1="22" y1="22" x2="28" y2="28" stroke="#FFD600" stroke-width="4" stroke-linecap="round"/>
            <line x1="72" y1="72" x2="78" y2="78" stroke="#FFD600" stroke-width="4" stroke-linecap="round"/>
            <line x1="22" y1="78" x2="28" y2="72" stroke="#FFD600" stroke-width="4" stroke-linecap="round"/>
            <line x1="72" y1="28" x2="78" y2="22" stroke="#FFD600" stroke-width="4" stroke-linecap="round"/>
        </svg>`,
        defaultColors: ['#ffd600', '#5d4037'],
        tags: ['sun', 'happy', 'sunny', 'weather', 'nature', 'smile'],
    },
    {
        id: 'cloud-fluffy',
        name: 'Fluffy Cloud',
        category: 'nature',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="55" rx="30" ry="20" fill="#ECEFF1"/>
            <circle cx="30" cy="50" r="18" fill="#ECEFF1"/>
            <circle cx="70" cy="50" r="15" fill="#ECEFF1"/>
            <circle cx="45" cy="40" r="20" fill="#ECEFF1"/>
            <circle cx="60" cy="42" r="16" fill="#ECEFF1"/>
            <ellipse cx="40" cy="38" rx="8" ry="6" fill="#FFFFFF" opacity="0.7"/>
        </svg>`,
        defaultColors: ['#eceff1', '#ffffff'],
        tags: ['cloud', 'sky', 'weather', 'fluffy', 'nature'],
    },
    {
        id: 'rainbow-arc',
        name: 'Rainbow',
        category: 'nature',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 70 A40 40 0 0 1 90 70" stroke="#E53935" stroke-width="6" fill="none"/>
            <path d="M16 70 A34 34 0 0 1 84 70" stroke="#FF9800" stroke-width="6" fill="none"/>
            <path d="M22 70 A28 28 0 0 1 78 70" stroke="#FFEB3B" stroke-width="6" fill="none"/>
            <path d="M28 70 A22 22 0 0 1 72 70" stroke="#4CAF50" stroke-width="6" fill="none"/>
            <path d="M34 70 A16 16 0 0 1 66 70" stroke="#2196F3" stroke-width="6" fill="none"/>
            <path d="M40 70 A10 10 0 0 1 60 70" stroke="#9C27B0" stroke-width="6" fill="none"/>
        </svg>`,
        defaultColors: ['#e53935', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0'],
        tags: ['rainbow', 'colorful', 'nature', 'sky', 'arc'],
    },
    {
        id: 'flower-simple',
        name: 'Flower',
        category: 'nature',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="25" rx="12" ry="18" fill="#E91E63"/>
            <ellipse cx="25" cy="45" rx="12" ry="18" fill="#E91E63" transform="rotate(-72 25 45)"/>
            <ellipse cx="35" cy="75" rx="12" ry="18" fill="#E91E63" transform="rotate(-144 35 75)"/>
            <ellipse cx="65" cy="75" rx="12" ry="18" fill="#E91E63" transform="rotate(-216 65 75)"/>
            <ellipse cx="75" cy="45" rx="12" ry="18" fill="#E91E63" transform="rotate(-288 75 45)"/>
            <circle cx="50" cy="50" r="15" fill="#FFC107"/>
            <circle cx="45" cy="45" r="3" fill="#FF8F00"/>
            <circle cx="55" cy="48" r="2" fill="#FF8F00"/>
            <circle cx="50" cy="55" r="2.5" fill="#FF8F00"/>
        </svg>`,
        defaultColors: ['#e91e63', '#ffc107', '#ff8f00'],
        tags: ['flower', 'bloom', 'nature', 'garden', 'petal'],
    },
    {
        id: 'tree-simple',
        name: 'Tree',
        category: 'nature',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="42" y="60" width="16" height="35" fill="#795548"/>
            <polygon points="50,10 15,50 30,50 10,70 35,70 25,85 75,85 65,70 90,70 70,50 85,50" fill="#4CAF50"/>
            <circle cx="35" cy="55" r="4" fill="#81C784"/>
            <circle cx="60" cy="45" r="3" fill="#81C784"/>
            <circle cx="50" cy="65" r="3.5" fill="#81C784"/>
        </svg>`,
        defaultColors: ['#795548', '#4caf50', '#81c784'],
        tags: ['tree', 'nature', 'forest', 'green', 'plant'],
    },
    {
        id: 'leaf-green',
        name: 'Leaf',
        category: 'nature',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 85 Q20 60 25 35 Q30 10 50 15 Q70 10 75 35 Q80 60 50 85" fill="#4CAF50"/>
            <path d="M50 85 Q50 50 50 25" stroke="#2E7D32" stroke-width="3" fill="none"/>
            <path d="M50 45 Q35 40 30 50" stroke="#2E7D32" stroke-width="2" fill="none"/>
            <path d="M50 60 Q65 55 70 65" stroke="#2E7D32" stroke-width="2" fill="none"/>
        </svg>`,
        defaultColors: ['#4caf50', '#2e7d32'],
        tags: ['leaf', 'green', 'nature', 'plant', 'eco'],
    },

    // ========== EMOJI ==========
    {
        id: 'emoji-smile',
        name: 'Smiley',
        category: 'emoji',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill="#FFEB3B"/>
            <circle cx="35" cy="40" r="6" fill="#5D4037"/>
            <circle cx="65" cy="40" r="6" fill="#5D4037"/>
            <path d="M30 60 Q50 80 70 60" stroke="#5D4037" stroke-width="4" fill="none" stroke-linecap="round"/>
        </svg>`,
        defaultColors: ['#ffeb3b', '#5d4037'],
        tags: ['emoji', 'smile', 'happy', 'face', 'smiley'],
    },
    {
        id: 'emoji-love',
        name: 'Love Eyes',
        category: 'emoji',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill="#FFEB3B"/>
            <path d="M28 38 L35 32 L42 38 L35 48 Z" fill="#E91E63"/>
            <path d="M58 38 L65 32 L72 38 L65 48 Z" fill="#E91E63"/>
            <path d="M30 60 Q50 80 70 60" stroke="#5D4037" stroke-width="4" fill="none" stroke-linecap="round"/>
        </svg>`,
        defaultColors: ['#ffeb3b', '#e91e63', '#5d4037'],
        tags: ['emoji', 'love', 'heart', 'eyes', 'face'],
    },
    {
        id: 'emoji-cool',
        name: 'Cool Face',
        category: 'emoji',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill="#FFEB3B"/>
            <rect x="22" y="35" width="56" height="16" rx="8" fill="#212121"/>
            <rect x="28" y="38" width="18" height="10" rx="5" fill="#42A5F5"/>
            <rect x="54" y="38" width="18" height="10" rx="5" fill="#42A5F5"/>
            <path d="M30 65 Q50 78 70 65" stroke="#5D4037" stroke-width="4" fill="none" stroke-linecap="round"/>
        </svg>`,
        defaultColors: ['#ffeb3b', '#212121', '#42a5f5', '#5d4037'],
        tags: ['emoji', 'cool', 'sunglasses', 'face'],
    },
    {
        id: 'emoji-wink',
        name: 'Wink',
        category: 'emoji',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill="#FFEB3B"/>
            <circle cx="35" cy="42" r="6" fill="#5D4037"/>
            <path d="M58 42 Q65 38 72 42" stroke="#5D4037" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M30 62 Q50 78 70 62" stroke="#5D4037" stroke-width="4" fill="none" stroke-linecap="round"/>
        </svg>`,
        defaultColors: ['#ffeb3b', '#5d4037'],
        tags: ['emoji', 'wink', 'face', 'fun'],
    },
    {
        id: 'emoji-tongue',
        name: 'Tongue Out',
        category: 'emoji',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill="#FFEB3B"/>
            <circle cx="35" cy="40" r="6" fill="#5D4037"/>
            <circle cx="65" cy="40" r="6" fill="#5D4037"/>
            <path d="M35 60 L65 60" stroke="#5D4037" stroke-width="4" stroke-linecap="round"/>
            <ellipse cx="50" cy="72" rx="10" ry="12" fill="#E91E63"/>
        </svg>`,
        defaultColors: ['#ffeb3b', '#5d4037', '#e91e63'],
        tags: ['emoji', 'tongue', 'silly', 'face', 'fun'],
    },

    // ========== PEOPLE ==========
    {
        id: 'thumbs-up',
        name: 'Thumbs Up',
        category: 'people',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 45 L30 85 L50 85 L50 45 Z" fill="#FFB74D"/>
            <path d="M50 45 L50 25 Q50 15 60 15 L65 15 Q75 15 75 25 L75 45 L85 45 Q95 45 95 55 L95 75 Q95 85 85 85 L50 85" fill="#FFB74D"/>
            <rect x="18" y="40" width="18" height="48" rx="4" fill="#1976D2"/>
        </svg>`,
        defaultColors: ['#ffb74d', '#1976d2'],
        tags: ['thumbs', 'up', 'like', 'approve', 'hand', 'gesture'],
    },
    {
        id: 'heart-love',
        name: 'Heart',
        category: 'people',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 88 C20 65 5 45 5 30 C5 15 18 5 32 5 C42 5 50 15 50 15 C50 15 58 5 68 5 C82 5 95 15 95 30 C95 45 80 65 50 88" fill="#E91E63"/>
            <ellipse cx="30" cy="30" rx="10" ry="8" fill="#F48FB1" opacity="0.6"/>
        </svg>`,
        defaultColors: ['#e91e63', '#f48fb1'],
        tags: ['heart', 'love', 'valentine', 'romance'],
    },
    {
        id: 'wave-hand',
        name: 'Waving Hand',
        category: 'people',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 75 Q15 65 20 50 L25 35 Q28 25 35 28 L40 40 L40 20 Q43 12 50 15 L50 40 L52 18 Q55 10 62 13 L60 45 L65 25 Q68 18 75 22 L72 55 Q70 75 55 85 L35 90 Q22 88 25 75" fill="#FFB74D"/>
            <line x1="15" y1="25" x2="25" y2="35" stroke="#42A5F5" stroke-width="3" stroke-linecap="round"/>
            <line x1="8" y1="40" x2="18" y2="45" stroke="#42A5F5" stroke-width="3" stroke-linecap="round"/>
            <line x1="75" y1="15" x2="85" y2="10" stroke="#42A5F5" stroke-width="3" stroke-linecap="round"/>
            <line x1="80" y1="30" x2="90" y2="28" stroke="#42A5F5" stroke-width="3" stroke-linecap="round"/>
        </svg>`,
        defaultColors: ['#ffb74d', '#42a5f5'],
        tags: ['wave', 'hand', 'hello', 'hi', 'greeting'],
    },
    // Circular Profile Placeholders
    {
        id: 'profile-circle-blue',
        name: 'Profile Circle Blue',
        category: 'people',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#3B82F6" stroke="#2563EB" stroke-width="2"/>
            <circle cx="50" cy="35" r="15" fill="#FCD34D"/>
            <path d="M25 85 Q25 55 50 55 Q75 55 75 85" fill="#FCD34D"/>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#1D4ED8" stroke-width="3"/>
        </svg>`,
        defaultColors: ['#3b82f6', '#2563eb', '#fcd34d', '#1d4ed8'],
        tags: ['profile', 'avatar', 'user', 'circle', 'placeholder', 'blue'],
    },
    {
        id: 'profile-circle-coral',
        name: 'Profile Circle Coral',
        category: 'people',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#F87171"/>
            <circle cx="50" cy="38" r="16" fill="#FFFFFF"/>
            <path d="M22 88 Q22 58 50 58 Q78 58 78 88" fill="#FFFFFF"/>
        </svg>`,
        defaultColors: ['#f87171', '#ffffff'],
        tags: ['profile', 'avatar', 'user', 'circle', 'placeholder', 'red', 'coral'],
    },
    {
        id: 'profile-circle-purple',
        name: 'Profile Circle Purple',
        category: 'people',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1"/>
                    <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1"/>
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#purpleGrad)"/>
            <circle cx="50" cy="36" r="14" fill="#FFFFFF" opacity="0.9"/>
            <path d="M24 85 Q24 56 50 56 Q76 56 76 85" fill="#FFFFFF" opacity="0.9"/>
            <circle cx="50" cy="50" r="45" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.3"/>
        </svg>`,
        defaultColors: ['#8b5cf6', '#ec4899', '#ffffff'],
        tags: ['profile', 'avatar', 'user', 'circle', 'placeholder', 'purple', 'gradient'],
    },
    {
        id: 'profile-circle-gray',
        name: 'Profile Circle Gray',
        category: 'people',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#E5E7EB" stroke="#D1D5DB" stroke-width="2"/>
            <circle cx="50" cy="36" r="15" fill="#9CA3AF"/>
            <path d="M23 88 Q23 56 50 56 Q77 56 77 88" fill="#9CA3AF"/>
        </svg>`,
        defaultColors: ['#e5e7eb', '#d1d5db', '#9ca3af'],
        tags: ['profile', 'avatar', 'user', 'circle', 'placeholder', 'gray', 'minimal'],
    },
    {
        id: 'profile-circle-teal',
        name: 'Profile Circle Teal',
        category: 'people',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#0D9488"/>
            <circle cx="50" cy="36" r="15" fill="#FFFFFF"/>
            <path d="M24 86 Q24 55 50 55 Q76 55 76 86" fill="#FFFFFF"/>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#14B8A6" stroke-width="3"/>
        </svg>`,
        defaultColors: ['#0d9488', '#ffffff', '#14b8a6'],
        tags: ['profile', 'avatar', 'user', 'circle', 'placeholder', 'teal', 'green'],
    },

    // ========== FOOD ==========
    {
        id: 'pizza-slice',
        name: 'Pizza',
        category: 'food',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,10 15,90 85,90" fill="#FFB74D"/>
            <polygon points="50,18 22,85 78,85" fill="#FFC107"/>
            <circle cx="40" cy="55" r="8" fill="#E53935"/>
            <circle cx="60" cy="60" r="7" fill="#E53935"/>
            <circle cx="50" cy="75" r="6" fill="#E53935"/>
            <ellipse cx="35" cy="70" rx="5" ry="4" fill="#4CAF50"/>
            <ellipse cx="65" cy="45" rx="4" ry="3" fill="#4CAF50"/>
        </svg>`,
        defaultColors: ['#ffb74d', '#ffc107', '#e53935', '#4caf50'],
        tags: ['pizza', 'food', 'slice', 'pepperoni', 'italian'],
    },
    {
        id: 'ice-cream',
        name: 'Ice Cream',
        category: 'food',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,95 25,45 75,45" fill="#D7CCC8"/>
            <line x1="35" y1="55" x2="45" y2="80" stroke="#A1887F" stroke-width="2"/>
            <line x1="55" y1="60" x2="60" y2="75" stroke="#A1887F" stroke-width="2"/>
            <circle cx="50" cy="30" r="22" fill="#E91E63"/>
            <circle cx="35" cy="40" r="12" fill="#4CAF50"/>
            <circle cx="65" cy="40" r="12" fill="#FFEB3B"/>
            <ellipse cx="45" cy="22" rx="6" ry="4" fill="#F48FB1" opacity="0.6"/>
        </svg>`,
        defaultColors: ['#d7ccc8', '#a1887f', '#e91e63', '#4caf50', '#ffeb3b', '#f48fb1'],
        tags: ['ice', 'cream', 'food', 'dessert', 'cone', 'sweet'],
    },
    {
        id: 'coffee-cup',
        name: 'Coffee Cup',
        category: 'food',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="30" width="50" height="55" rx="5" fill="#ECEFF1"/>
            <rect x="25" y="35" width="40" height="20" fill="#795548"/>
            <ellipse cx="45" cy="35" rx="25" ry="8" fill="#ECEFF1"/>
            <ellipse cx="45" cy="35" rx="20" ry="5" fill="#795548"/>
            <path d="M70 45 Q85 45 85 60 Q85 75 70 75" stroke="#ECEFF1" stroke-width="8" fill="none"/>
            <path d="M30 20 Q35 10 40 20" stroke="#9E9E9E" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M45" y1="20 Q50 8 55 20" stroke="#9E9E9E" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>`,
        defaultColors: ['#eceff1', '#795548', '#9e9e9e'],
        tags: ['coffee', 'cup', 'drink', 'beverage', 'cafe'],
    },

    // ========== FOOD ADDITIONS ==========
    {
        id: 'grapes',
        name: 'Grapes',
        category: 'food',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="30" r="10" fill="#9C27B0"/>
            <circle cx="35" cy="45" r="10" fill="#9C27B0"/>
            <circle cx="65" cy="45" r="10" fill="#9C27B0"/>
            <circle cx="50" cy="55" r="10" fill="#7B1FA2"/>
            <circle cx="40" cy="70" r="10" fill="#7B1FA2"/>
            <circle cx="60" cy="70" r="10" fill="#7B1FA2"/>
            <circle cx="50" cy="85" r="9" fill="#4A148C"/>
            <path d="M50 30 L50 10" stroke="#795548" stroke-width="3"/>
            <path d="M50 15 Q65 10 70 20 Q60 25 50 20" fill="#4CAF50"/>
        </svg>`,
        defaultColors: ['#9c27b0', '#7b1fa2', '#4a148c', '#795548', '#4caf50'],
        tags: ['grapes', 'fruit', 'purple', 'food'],
    },
    {
        id: 'watermelon-slice',
        name: 'Watermelon',
        category: 'food',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 30 A45 45 0 0 0 85 30 Z" fill="#F44336"/>
            <path d="M15 30 A45 45 0 0 0 85 30" stroke="#4CAF50" stroke-width="6" fill="none"/>
            <path d="M19 30 A41 41 0 0 0 81 30" stroke="#FFF" stroke-width="2" fill="none" opacity="0.6"/>
            <circle cx="35" cy="45" r="2" fill="#212121"/>
            <circle cx="55" cy="55" r="2" fill="#212121"/>
            <circle cx="65" cy="40" r="2" fill="#212121"/>
            <circle cx="45" cy="65" r="2" fill="#212121"/>
        </svg>`,
        defaultColors: ['#f44336', '#4caf50', '#ffffff', '#212121'],
        tags: ['watermelon', 'fruit', 'summer', 'slice'],
    },
    {
        id: 'burger-cheese',
        name: 'Burger',
        category: 'food',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 50 Q20 20 50 20 Q80 20 80 50 Z" fill="#FFB74D"/>
            <rect x="20" y="50" width="60" height="10" fill="#8D6E63"/>
            <rect x="18" y="60" width="64" height="6" fill="#FFC107"/>
            <rect x="20" y="66" width="60" height="8" fill="#4CAF50"/>
            <path d="M20 74 Q20 90 50 90 Q80 90 80 74 Z" fill="#FFB74D"/>
            <circle cx="40" cy="30" r="1.5" fill="#FFE0B2"/>
            <circle cx="60" cy="35" r="1.5" fill="#FFE0B2"/>
            <circle cx="50" cy="25" r="1.5" fill="#FFE0B2"/>
        </svg>`,
        defaultColors: ['#ffb74d', '#8d6e63', '#ffc107', '#4caf50', '#ffe0b2'],
        tags: ['burger', 'food', 'fastfood', 'sandwich'],
    },
    {
        id: 'donut-pink',
        name: 'Donut',
        category: 'food',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill="#D7CCC8"/>
            <path d="M50 15 Q65 15 75 25 Q85 35 85 50 Q85 65 75 75 Q65 85 50 85 Q35 85 25 75 Q15 65 15 50 Q15 35 25 25 Q35 15 50 15" stroke="#F48FB1" stroke-width="15" fill="none" stroke-linecap="round"/>
            <circle cx="50" cy="50" r="15" fill="#FFF"/>
            <line x1="40" y1="20" x2="45" y2="25" stroke="#FFF" stroke-width="2"/>
            <line x1="60" y1="25" x2="65" y2="20" stroke="#FFF" stroke-width="2"/>
            <line x1="75" y1="45" x2="80" y2="50" stroke="#FFF" stroke-width="2"/>
            <line x1="25" y1="50" x2="20" y2="55" stroke="#FFF" stroke-width="2"/>
        </svg>`,
        defaultColors: ['#d7ccc8', '#f48fb1', '#ffffff'],
        tags: ['donut', 'sweet', 'dessert', 'food'],
    },
    {
        id: 'ramen-bowl',
        name: 'Ramen',
        category: 'food',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 50 Q20 90 50 90 Q80 90 80 50 Z" fill="#EF9A9A"/>
            <path d="M20 50 Q50 60 80 50" stroke="#D32F2F" stroke-width="4" fill="none"/>
            <path d="M25 45 Q35 30 40 45 T55 45 T70 45" stroke="#FFD54F" stroke-width="3" fill="none"/>
            <circle cx="40" cy="40" r="5" fill="#FFF"/>
            <circle cx="40" cy="40" r="2" fill="#FF9800"/>
            <path d="M75 45 L90 20" stroke="#795548" stroke-width="2"/>
            <path d="M78 48 L95 25" stroke="#795548" stroke-width="2"/>
        </svg>`,
        defaultColors: ['#ef9a9a', '#d32f2f', '#ffd54f', '#ffffff', '#ff9800', '#795548'],
        tags: ['ramen', 'noodles', 'food', 'japanese', 'soup'],
    },
    {
        id: 'banana',
        name: 'Banana',
        category: 'food',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 20 Q10 10 30 30 Q60 60 80 80 Q90 90 80 85 Q60 65 30 35 Q10 15 20 20" stroke="#FFEB3B" stroke-width="20" stroke-linecap="round" fill="none"/>
            <path d="M20 20 Q10 10 30 30 Q60 60 80 80" stroke="#FDD835" stroke-width="2" fill="none"/>
        </svg>`,
        defaultColors: ['#ffeb3b', '#fdd835'],
        tags: ['banana', 'fruit', 'food', 'yellow'],
    },
    {
        id: 'avocado',
        name: 'Avocado',
        category: 'food',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10 Q20 10 20 55 Q20 90 50 90 Q80 90 80 55 Q80 10 50 10 Z" fill="#2E7D32"/>
            <path d="M50 15 Q25 15 25 55 Q25 85 50 85 Q75 85 75 55 Q75 15 50 15 Z" fill="#C5E1A5"/>
            <circle cx="50" cy="65" r="15" fill="#795548"/>
            <circle cx="54" cy="62" r="5" fill="#8D6E63"/>
        </svg>`,
        defaultColors: ['#2e7d32', '#c5e1a5', '#795548', '#8d6e63'],
        tags: ['avocado', 'fruit', 'food', 'vegetable', 'green'],
    },

    // ========== FITNESS ==========
    {
        id: 'dumbbell',
        name: 'Dumbbell',
        category: 'fitness',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="45" width="50" height="10" rx="2" fill="#9E9E9E"/>
            <rect x="10" y="30" width="15" height="40" rx="3" fill="#424242"/>
            <rect x="75" y="30" width="15" height="40" rx="3" fill="#424242"/>
            <rect x="5" y="25" width="5" height="50" rx="1" fill="#757575"/>
            <rect x="90" y="25" width="5" height="50" rx="1" fill="#757575"/>
        </svg>`,
        defaultColors: ['#9e9e9e', '#424242', '#757575'],
        tags: ['dumbbell', 'fitness', 'gym', 'weight', 'workout'],
    },
    {
        id: 'boxing-glove',
        name: 'Boxing Glove',
        category: 'fitness',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 30 Q30 10 60 10 Q90 10 90 40 Q90 60 70 70 L40 70 Q30 60 30 30" fill="#E53935"/>
            <rect x="35" y="70" width="40" height="20" rx="5" fill="#B71C1C"/>
            <path d="M20 40 Q15 50 30 60" stroke="#B71C1C" stroke-width="10" fill="none" stroke-linecap="round"/>
            <path d="M50 30 L70 30" stroke="#EF5350" stroke-width="3" opacity="0.5"/>
        </svg>`,
        defaultColors: ['#e53935', '#b71c1c', '#ef5350'],
        tags: ['boxing', 'glove', 'fitness', 'sport', 'fight'],
    },
    {
        id: 'sneaker',
        name: 'Sneaker',
        category: 'fitness',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 60 Q20 40 40 35 L70 40 Q90 45 90 70 L80 80 L15 80 Q10 70 20 60" fill="#29B6F6"/>
            <path d="M15 80 L85 80 L85 90 L15 90 Z" fill="#ECEFF1"/>
            <path d="M40 35 L55 55 L70 40" fill="#E1F5FE"/>
            <line x1="45" y1="45" x2="60" y2="45" stroke="#FFF" stroke-width="2"/>
            <line x1="48" y1="50" x2="63" y2="50" stroke="#FFF" stroke-width="2"/>
        </svg>`,
        defaultColors: ['#29b6f6', '#eceff1', '#e1f5fe', '#ffffff'],
        tags: ['sneaker', 'shoe', 'fitness', 'running', 'sport'],
    },

    {
        id: 'cat-face',
        name: 'Cat Face',
        category: 'animals',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="55" r="35" fill="#FF9800"/>
            <polygon points="20,40 15,10 35,30" fill="#FF9800"/>
            <polygon points="80,40 85,10 65,30" fill="#FF9800"/>
            <polygon points="20,40 18,15 32,28" fill="#FFE0B2"/>
            <polygon points="80,40 82,15 68,28" fill="#FFE0B2"/>
            <ellipse cx="35" cy="50" rx="8" ry="10" fill="#FFFFFF"/>
            <ellipse cx="65" cy="50" rx="8" ry="10" fill="#FFFFFF"/>
            <circle cx="35" cy="52" r="5" fill="#4CAF50"/>
            <circle cx="65" cy="52" r="5" fill="#4CAF50"/>
            <ellipse cx="50" cy="65" rx="5" ry="4" fill="#E91E63"/>
            <line x1="15" y1="55" x2="30" y2="58" stroke="#795548" stroke-width="2"/>
            <line x1="15" y1="65" x2="30" y2="62" stroke="#795548" stroke-width="2"/>
            <line x1="85" y1="55" x2="70" y2="58" stroke="#795548" stroke-width="2"/>
            <line x1="85" y1="65" x2="70" y2="62" stroke="#795548" stroke-width="2"/>
        </svg>`,
        defaultColors: ['#ff9800', '#ffe0b2', '#ffffff', '#4caf50', '#e91e63', '#795548'],
        tags: ['cat', 'animal', 'pet', 'kitty', 'face'],
    },
    {
        id: 'dog-face',
        name: 'Dog Face',
        category: 'animals',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="55" r="35" fill="#8D6E63"/>
            <ellipse cx="25" cy="35" rx="15" ry="20" fill="#8D6E63"/>
            <ellipse cx="75" cy="35" rx="15" ry="20" fill="#8D6E63"/>
            <ellipse cx="50" cy="62" rx="20" ry="15" fill="#EFEBE9"/>
            <circle cx="35" cy="48" r="6" fill="#FFFFFF"/>
            <circle cx="65" cy="48" r="6" fill="#FFFFFF"/>
            <circle cx="36" cy="49" r="4" fill="#5D4037"/>
            <circle cx="64" cy="49" r="4" fill="#5D4037"/>
            <ellipse cx="50" cy="58" rx="8" ry="6" fill="#5D4037"/>
            <path d="M42 70 Q50 78 58 70" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
            <ellipse cx="50" cy="68" rx="3" ry="2" fill="#E91E63"/>
        </svg>`,
        defaultColors: ['#8d6e63', '#efebe9', '#ffffff', '#5d4037', '#e91e63'],
        tags: ['dog', 'animal', 'pet', 'puppy', 'face'],
    },
    {
        id: 'bird-simple',
        name: 'Bird',
        category: 'animals',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="55" cy="50" rx="30" ry="25" fill="#2196F3"/>
            <circle cx="75" cy="40" r="15" fill="#2196F3"/>
            <polygon points="90,40 100,35 100,45" fill="#FF9800"/>
            <circle cx="80" cy="38" r="4" fill="#FFFFFF"/>
            <circle cx="81" cy="38" r="2" fill="#212121"/>
            <path d="M30 55 Q15 70 25 80 Q35 75 40 60" fill="#1976D2"/>
            <ellipse cx="50" cy="70" rx="8" ry="5" fill="#FF9800"/>
        </svg>`,
        defaultColors: ['#2196f3', '#ff9800', '#ffffff', '#212121', '#1976d2'],
        tags: ['bird', 'animal', 'fly', 'tweet', 'blue'],
    },

    // ========== OBJECTS ==========
    {
        id: 'trophy-gold',
        name: 'Trophy',
        category: 'objects',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="35" y="70" width="30" height="8" fill="#FFC107"/>
            <rect x="30" y="78" width="40" height="12" rx="2" fill="#795548"/>
            <path d="M30 20 L30 45 Q30 60 50 65 Q70 60 70 45 L70 20 Z" fill="#FFD600"/>
            <path d="M30 20 Q15 20 15 35 Q15 50 30 50" stroke="#FFD600" stroke-width="8" fill="none"/>
            <path d="M70 20 Q85 20 85 35 Q85 50 70 50" stroke="#FFD600" stroke-width="8" fill="none"/>
            <polygon points="50,30 53,38 62,38 55,44 58,52 50,47 42,52 45,44 38,38 47,38" fill="#FFF59D"/>
        </svg>`,
        defaultColors: ['#ffc107', '#795548', '#ffd600', '#fff59d'],
        tags: ['trophy', 'award', 'winner', 'gold', 'cup', 'prize'],
    },
    {
        id: 'light-bulb',
        name: 'Light Bulb',
        category: 'objects',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="40" rx="25" ry="30" fill="#FFEB3B"/>
            <rect x="40" y="65" width="20" height="8" fill="#9E9E9E"/>
            <rect x="42" y="73" width="16" height="4" fill="#757575"/>
            <rect x="44" y="77" width="12" height="4" fill="#616161"/>
            <rect x="46" y="81" width="8" height="4" rx="2" fill="#9E9E9E"/>
            <ellipse cx="42" cy="35" rx="8" ry="12" fill="#FFF59D" opacity="0.7"/>
            <line x1="50" y1="5" x2="50" y2="15" stroke="#FFC107" stroke-width="3" stroke-linecap="round"/>
            <line x1="20" y1="25" x2="28" y2="30" stroke="#FFC107" stroke-width="3" stroke-linecap="round"/>
            <line x1="80" y1="25" x2="72" y2="30" stroke="#FFC107" stroke-width="3" stroke-linecap="round"/>
            <line x1="15" y1="50" x2="25" y2="50" stroke="#FFC107" stroke-width="3" stroke-linecap="round"/>
            <line x1="85" y1="50" x2="75" y2="50" stroke="#FFC107" stroke-width="3" stroke-linecap="round"/>
        </svg>`,
        defaultColors: ['#ffeb3b', '#9e9e9e', '#757575', '#616161', '#fff59d', '#ffc107'],
        tags: ['light', 'bulb', 'idea', 'bright', 'glow'],
    },
    {
        id: 'rocket-ship',
        name: 'Rocket',
        category: 'objects',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 5 Q70 25 70 55 L65 60 L50 60 L35 60 L30 55 Q30 25 50 5" fill="#ECEFF1"/>
            <ellipse cx="50" cy="35" rx="12" ry="15" fill="#2196F3"/>
            <polygon points="30,55 15,75 35,65" fill="#E53935"/>
            <polygon points="70,55 85,75 65,65" fill="#E53935"/>
            <polygon points="40,60 50,85 60,60" fill="#FF9800"/>
            <polygon points="45,60 50,75 55,60" fill="#FFC107"/>
            <circle cx="50" cy="35" r="5" fill="#B3E5FC"/>
        </svg>`,
        defaultColors: ['#eceff1', '#2196f3', '#e53935', '#ff9800', '#ffc107', '#b3e5fc'],
        tags: ['rocket', 'space', 'launch', 'ship', 'fly'],
    },
    {
        id: 'pencil',
        name: 'Pencil',
        category: 'objects',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="20,85 12,95 25,88" fill="#FFB74D"/>
            <rect x="18" y="20" width="12" height="65" fill="#FFEB3B" transform="rotate(-45 50 50)"/>
            <rect x="18" y="15" width="12" height="10" fill="#E91E63" transform="rotate(-45 50 50)"/>
            <polygon points="75,18 85,28 80,33 70,23" fill="#BDBDBD"/>
        </svg>`,
        defaultColors: ['#ffb74d', '#ffeb3b', '#e91e63', '#bdbdbd'],
        tags: ['pencil', 'write', 'draw', 'school', 'office'],
    },
    // ========== OFFICE ==========
    {
        id: 'office-chair',
        name: 'Office Chair',
        category: 'office',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="35" y="20" width="30" height="35" rx="5" fill="#546E7A"/>
            <rect x="35" y="60" width="30" height="5" rx="2" fill="#455A64"/>
            <rect x="48" y="65" width="4" height="15" fill="#90A4AE"/>
            <path d="M50 80 L30 90 L35 95 L50 90 L65 95 L70 90 Z" fill="#455A64"/>
            <rect x="25" y="40" width="10" height="15" rx="2" fill="#455A64"/>
            <rect x="65" y="40" width="10" height="15" rx="2" fill="#455A64"/>
        </svg>`,
        defaultColors: ['#546e7a', '#455a64', '#90a4ae'],
        tags: ['chair', 'office', 'furniture', 'seat', 'work'],
    },
    {
        id: 'briefcase',
        name: 'Briefcase',
        category: 'office',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="35" width="60" height="45" rx="4" fill="#795548"/>
            <rect x="20" y="35" width="60" height="15" rx="4" fill="#5D4037"/>
            <path d="M40 35 L40 25 Q40 20 45 20 L55 20 Q60 20 60 25 L60 35" stroke="#3E2723" stroke-width="4" fill="none"/>
            <rect x="45" y="45" width="10" height="12" rx="1" fill="#FFC107"/>
        </svg>`,
        defaultColors: ['#795548', '#5d4037', '#3e2723', '#ffc107'],
        tags: ['briefcase', 'work', 'job', 'bag', 'office'],
    },
    {
        id: 'laptop-work',
        name: 'Laptop',
        category: 'office',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="25" width="60" height="40" rx="3" fill="#424242"/>
            <rect x="23" y="28" width="54" height="34" fill="#29B6F6"/>
            <path d="M15 65 L85 65 L80 75 L20 75 Z" fill="#9E9E9E"/>
            <polygon points="15,65 85,65 85,67 15,67" fill="#616161"/>
        </svg>`,
        defaultColors: ['#424242', '#29b6f6', '#9e9e9e', '#616161'],
        tags: ['laptop', 'computer', 'tech', 'work', 'screen'],
    },
    {
        id: 'folder-file',
        name: 'File Folder',
        category: 'office',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 25 L40 25 L45 30 L85 30 L85 80 L15 80 Z" fill="#FFB74D"/>
            <path d="M15 35 L85 35 L85 80 L15 80 Z" fill="#FFCC80"/>
        </svg>`,
        defaultColors: ['#ffb74d', '#ffcc80'],
        tags: ['folder', 'file', 'document', 'organized', 'office'],
    },
    // ========== GRADIENTS ==========
    {
        id: 'grad-blob-1',
        name: 'Sunset Blob',
        category: 'gradients',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#FF9A9E;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#FECFEF;stop-opacity:1" />
                </linearGradient>
            </defs>
            <path d="M45,10 Q80,0 85,35 Q90,70 55,85 Q20,100 10,60 Q0,20 45,10 Z" fill="url(#grad1)" />
        </svg>`,
        defaultColors: ['#ff9a9e', '#fecfef'],
        tags: ['gradient', 'blob', 'abstract', 'pink', 'soft'],
    },
    {
        id: 'grad-circle',
        name: 'Ocean Gradient',
        category: 'gradients',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="grad2" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" style="stop-color:#84FAB0;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#8FD3F4;stop-opacity:1" />
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#grad2)" />
        </svg>`,
        defaultColors: ['#84fab0', '#8fd3f4'],
        tags: ['gradient', 'circle', 'blue', 'green', 'fresh'],
    },
    {
        id: 'grad-wave',
        name: 'Wavy Gradient',
        category: 'gradients',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
             <defs>
                <linearGradient id="grad3" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" style="stop-color:#F6D365;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#FDA085;stop-opacity:1" />
                </linearGradient>
            </defs>
            <path d="M0,50 C20,40 40,40 60,60 C80,80 100,50 100,50 L100,100 L0,100 Z" fill="url(#grad3)" />
        </svg>`,
        defaultColors: ['#f6d365', '#fda085'],
        tags: ['gradient', 'wave', 'orange', 'warm'],
    },
    {
        id: 'grad-holographic',
        name: 'Holographic Mesh',
        category: 'gradients',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="gradHolo" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#FF9A9E;stop-opacity:1" />
                    <stop offset="25%" style="stop-color:#FECFEF;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#A18CD1;stop-opacity:1" />
                    <stop offset="75%" style="stop-color:#FBC2EB;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#8FD3F4;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" rx="10" fill="url(#gradHolo)" />
        </svg>`,
        defaultColors: ['#ff9a9e', '#fecfef', '#a18cd1', '#fbc2eb', '#8fd3f4'],
        tags: ['gradient', 'holographic', 'mesh', 'colorful'],
    },
    {
        id: 'grad-radial-dark',
        name: 'Dark Aura',
        category: 'gradients',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="gradDark" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style="stop-color:#434343;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="50" fill="url(#gradDark)" />
        </svg>`,
        defaultColors: ['#434343', '#000000'],
        tags: ['gradient', 'dark', 'aura', 'black'],
    },

    // ========== ABSTRACT ==========
    {
        id: 'memphis-1',
        name: 'Memphis Shapes',
        category: 'abstract',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="10" fill="#E91E63"/>
            <rect x="50" y="10" width="20" height="20" fill="#3F51B5"/>
            <polygon points="20,80 40,50 60,80" fill="#FFC107"/>
            <path d="M70 60 Q80 50 90 60 T110 60" fill="none" stroke="#009688" stroke-width="4"/>
            <circle cx="80" cy="80" r="5" fill="#9C27B0"/>
        </svg>`,
        defaultColors: ['#e91e63', '#3f51b5', '#ffc107', '#009688', '#9c27b0'],
        tags: ['abstract', 'memphis', 'shapes', 'retro', '90s'],
    },
    {
        id: 'dots-pattern',
        name: 'Dot Pattern',
        category: 'abstract',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g fill="#BDBDBD">
                <circle cx="10" cy="10" r="2"/><circle cx="30" cy="10" r="2"/><circle cx="50" cy="10" r="2"/>
                <circle cx="70" cy="10" r="2"/><circle cx="90" cy="10" r="2"/>
                <circle cx="10" cy="30" r="2"/><circle cx="30" cy="30" r="2"/><circle cx="50" cy="30" r="2"/>
                <circle cx="70" cy="30" r="2"/><circle cx="90" cy="30" r="2"/>
                <circle cx="10" cy="50" r="2"/><circle cx="30" cy="50" r="2"/><circle cx="50" cy="50" r="2"/>
                <circle cx="70" cy="50" r="2"/><circle cx="90" cy="50" r="2"/>
                <circle cx="10" cy="70" r="2"/><circle cx="30" cy="70" r="2"/><circle cx="50" cy="70" r="2"/>
                <circle cx="70" cy="70" r="2"/><circle cx="90" cy="70" r="2"/>
            </g>
        </svg>`,
        defaultColors: ['#bdbdbd'],
        tags: ['dots', 'pattern', 'texture', 'background'],
    },
    {
        id: 'organic-lines',
        name: 'Organic Lines',
        category: 'abstract',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 20 Q30 5 50 20 T90 20" fill="none" stroke="#FF5722" stroke-width="3" stroke-linecap="round"/>
            <path d="M10 40 Q30 25 50 40 T90 40" fill="none" stroke="#4CAF50" stroke-width="3" stroke-linecap="round"/>
            <path d="M10 60 Q30 45 50 60 T90 60" fill="none" stroke="#2196F3" stroke-width="3" stroke-linecap="round"/>
            <path d="M10 80 Q30 65 50 80 T90 80" fill="none" stroke="#9C27B0" stroke-width="3" stroke-linecap="round"/>
        </svg>`,
        defaultColors: ['#ff5722', '#4caf50', '#2196f3', '#9c27b0'],
        tags: ['lines', 'wave', 'abstract', 'colorful'],
    },

    // ========== DECORATIONS ==========
    {
        id: 'sparkles',
        name: 'Sparkles',
        category: 'decorations',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10 L55 40 L85 45 L55 50 L50 80 L45 50 L15 45 L45 40 Z" fill="#FFC107"/>
            <path d="M80 10 L82 20 L92 22 L82 24 L80 34 L78 24 L68 22 L78 20 Z" fill="#FFC107"/>
            <path d="M20 70 L22 80 L32 82 L22 84 L20 94 L18 84 L8 82 L18 80 Z" fill="#FFC107"/>
        </svg>`,
        defaultColors: ['#ffc107'],
        tags: ['sparkle', 'star', 'shine', 'magic'],
    },
    {
        id: 'underline-brush',
        name: 'Brush Underline',
        category: 'decorations',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 50 Q30 45 50 55 T90 50" fill="none" stroke="#E91E63" stroke-width="6" stroke-linecap="round"/>
        </svg>`,
        defaultColors: ['#e91e63'],
        tags: ['underline', 'brush', 'paint', 'stroke'],
    },
    {
        id: 'arrow-doodle',
        name: 'Doodle Arrow',
        category: 'decorations',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 50 Q40 30 70 50" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>
            <path d="M60 40 L70 50 L60 60" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>
        </svg>`,
        defaultColors: ['#333333'],
        tags: ['arrow', 'doodle', 'pointer', 'hand-drawn'],
    },

    // ========== 3D SHAPES ==========
    {
        id: '3d-cube',
        name: '3D Cube',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,20 80,35 50,50 20,35" fill="#90CAF9"/>
            <polygon points="20,35 50,50 50,80 20,65" fill="#1976D2"/>
            <polygon points="50,50 80,35 80,65 50,80" fill="#42A5F5"/>
        </svg>`,
        defaultColors: ['#90caf9', '#1976d2', '#42a5f5'],
        tags: ['cube', '3d', 'box', 'geometric'],
    },
    {
        id: '3d-cylinder',
        name: '3D Cylinder',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="20" rx="30" ry="10" fill="#A5D6A7"/>
            <path d="M20 20 L20 70 A30 10 0 0 0 80 70 L80 20" fill="#66BB6A"/>
            <ellipse cx="50" cy="20" rx="30" ry="10" fill="#A5D6A7" opacity="0.6"/>
        </svg>`,
        defaultColors: ['#a5d6a7', '#66bb6a'],
        tags: ['cylinder', '3d', 'tube', 'shape'],
    },
    {
        id: '3d-sphere',
        name: '3D Sphere',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="gradSphere" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" style="stop-color:#FFCCBC;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#D84315;stop-opacity:1" />
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="40" fill="url(#gradSphere)" />
        </svg>`,
        defaultColors: ['#ffccbc', '#d84315'],
        tags: ['sphere', '3d', 'ball', 'round'],
    },
    {
        id: '3d-cone',
        name: '3D Cone',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10 L85 80 Q50 95 15 80 Z" fill="#FF7043"/>
            <path d="M50 10 L85 80 Q50 95 15 80 Z" fill="#F4511E" opacity="0.3"/>
            <ellipse cx="50" cy="80" rx="35" ry="10" fill="#FF8A65"/>
        </svg>`,
        defaultColors: ['#ff7043', '#f4511e', '#ff8a65'],
        tags: ['cone', '3d', 'shape', 'geometric'],
    },
    {
        id: '3d-torus',
        name: '3D Torus',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50,25 A25,25 0 1,1 50,75 A25,25 0 1,1 50,25 M50,35 A15,15 0 1,0 50,65 A15,15 0 1,0 50,35 Z" fill="#7E57C2" fill-rule="evenodd"/>
            <path d="M50,25 A25,25 0 1,1 50,75 A25,25 0 1,1 50,25 M50,35 A15,15 0 1,0 50,65 A15,15 0 1,0 50,35 Z" stroke="#512DA8" stroke-width="2" fill="url(#gradTorus)" opacity="0.5"/>
            <defs>
                 <linearGradient id="gradTorus" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#9575CD;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#512DA8;stop-opacity:1" />
                </linearGradient>
            </defs>
        </svg>`,
        defaultColors: ['#7e57c2', '#512da8', '#9575cd'],
        tags: ['torus', '3d', 'donut', 'ring'],
    },
    {
        id: '3d-pyramid',
        name: '3D Pyramid',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,15 90,85 10,85" fill="#FFCA28"/>
            <polygon points="50,15 50,85 90,85" fill="#FFC107"/>
            <polygon points="50,15 10,85 50,85" fill="#FFD54F" opacity="0.4"/>
            <path d="M50 15 L90 85" stroke="#FFA000" stroke-width="1" opacity="0.5"/>
        </svg>`,
        defaultColors: ['#ffca28', '#ffc107', '#ffd54f', '#ffa000'],
        tags: ['pyramid', '3d', 'triangle', 'egypt'],
    },
    {
        id: '3d-capsule',
        name: '3D Capsule',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="20" width="50" height="60" fill="#26C6DA"/>
            <circle cx="50" cy="20" r="25" fill="#4DD0E1"/>
            <circle cx="50" cy="80" r="25" fill="#00BCD4"/>
            <path d="M25 20 L25 80" stroke="#0097A7" stroke-width="1" opacity="0.3"/>
            <path d="M75 20 L75 80" stroke="#0097A7" stroke-width="1" opacity="0.3"/>
             <ellipse cx="40" cy="30" rx="6" ry="10" fill="#E0F7FA" opacity="0.6"/>
        </svg>`,
        defaultColors: ['#26c6da', '#4dd0e1', '#00bcd4', '#0097a7'],
        tags: ['capsule', '3d', 'pill', 'cylinder'],
    },
    {
        id: '3d-prism',
        name: 'Triangular Prism',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="20,70 80,70 50,20" fill="#CFD8DC"/>
            <polygon points="20,70 50,20 30,30" fill="#B0BEC5"/>
            <polygon points="80,70 50,20 70,30" fill="#90A4AE"/>
            <path d="M20 70 L30 80 L90 80 L80 70" fill="#78909C"/>
            <path d="M90 80 L60 30 L50 20" stroke="#546E7A" stroke-width="1" fill="none" opacity="0.5"/>
        </svg>`,
        defaultColors: ['#cfd8dc', '#b0bec5', '#90a4ae', '#78909c'],
        tags: ['prism', '3d', 'triangle', 'glass'],
    },
    {
        id: '3d-hex-prism',
        name: 'Hexagonal Prism',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,15 85,25 85,75 50,85 15,75 15,25" fill="#5C6BC0"/>
            <polygon points="50,15 85,25 50,35 15,25" fill="#7986CB"/>
            <rect x="15" y="25" width="35" height="50" fill="#3949AB"/>
             <rect x="50" y="25" width="35" height="50" fill="#3F51B5"/>
            <path d="M50 35 L50 85" stroke="#283593" stroke-width="1" opacity="0.3"/>
             <polygon points="50,15 85,25 50,35 15,25" fill="#9FA8DA" opacity="0.4"/>
        </svg>`,
        defaultColors: ['#5c6bc0', '#7986cb', '#3949ab', '#3f51b5'],
        tags: ['prism', '3d', 'hexagon', 'geometric'],
    },
    {
        id: '3d-octahedron',
        name: 'Octahedron',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,10 90,50 50,90 10,50" fill="#E53935"/>
            <polygon points="50,10 50,90" stroke="#B71C1C" stroke-width="1" opacity="0.5"/>
            <polygon points="10,50 90,50" stroke="#B71C1C" stroke-width="1" opacity="0.5"/>
            <polygon points="50,10 90,50 50,50" fill="#EF5350" opacity="0.6"/>
            <polygon points="10,50 50,50 50,90" fill="#C62828" opacity="0.4"/>
        </svg>`,
        defaultColors: ['#e53935', '#ef5350', '#c62828', '#b71c1c'],
        tags: ['octahedron', '3d', 'diamond', 'gem', 'shape'],
    },
    {
        id: '3d-icosahedron',
        name: 'Icosahedron',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,10 80,30 50,50 20,30" fill="#66BB6A"/>
            <polygon points="80,30 95,65 50,90 50,50" fill="#43A047"/>
            <polygon points="20,30 5,65 50,90 50,50" fill="#388E3C"/>
            <polygon points="50,50 95,65 50,90" fill="#2E7D32" opacity="0.5"/>
            <polygon points="20,30 50,10 80,30" fill="#81C784" opacity="0.6"/>
            <path d="M50 50 L50 90" stroke="#1B5E20" stroke-width="1" opacity="0.3"/>
        </svg>`,
        defaultColors: ['#66bb6a', '#43a047', '#388e3c', '#2e7d32', '#81c784'],
        tags: ['icosahedron', '3d', 'geometric', 'polyhedron'],
    },
    {
        id: '3d-truncated-cone',
        name: 'Truncated Cone',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 20 L70 20 L85 80 L15 80 Z" fill="#FF7043"/>
            <ellipse cx="50" cy="20" rx="20" ry="8" fill="#FF8A65"/>
            <ellipse cx="50" cy="80" rx="35" ry="10" fill="#D84315" opacity="0.3"/>
             <path d="M30 20 L15 80" stroke="#BF360C" stroke-width="1" opacity="0.2"/>
             <path d="M70 20 L85 80" stroke="#BF360C" stroke-width="1" opacity="0.2"/>
        </svg>`,
        defaultColors: ['#ff7043', '#ff8a65', '#d84315'],
        tags: ['cone', 'truncated', '3d', 'shape'],
    },
    {
        id: '3d-cube-cluster',
        name: 'Floating Cubes',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="50" width="20" height="20" fill="#FF7043"/>
            <polygon points="20,50 30,40 50,40 40,50" fill="#FF5722"/>
            <polygon points="40,50 50,40 50,60 40,70" fill="#D84315"/>
            
            <rect x="60" y="20" width="15" height="15" fill="#42A5F5"/>
            <polygon points="60,20 68,12 83,12 75,20" fill="#2196F3"/>
            <polygon points="75,20 83,12 83,27 75,35" fill="#1565C0"/>

            <rect x="55" y="65" width="25" height="25" fill="#66BB6A"/>
            <polygon points="55,65 65,55 90,55 80,65" fill="#4CAF50"/>
            <polygon points="80,65 90,55 90,80 80,90" fill="#2E7D32"/>
        </svg>`,
        defaultColors: ['#ff7043', '#ff5722', '#d84315', '#42a5f5', '#2196f3', '#66bb6a'],
        tags: ['cubes', '3d', 'cluster', 'floating'],
    },
    {
        id: '3d-dodecahedron',
        name: 'Dodecahedron',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,50 20,40 30,15 70,15 80,40" fill="#26A69A"/>
            <polygon points="50,50 80,40 90,70 65,90 35,90 10,70 20,40" fill="#00897B" opacity="0.6"/>
            <polygon points="50,50 20,40 10,70 35,90" fill="#00796B" opacity="0.4"/>
            <polygon points="50,50 80,40 90,70 65,90" fill="#00695C" opacity="0.4"/>
            <path d="M50 50 L20 40 M50 50 L80 40 M50 50 L65 90 M50 50 L35 90" stroke="#004D40" stroke-width="1" opacity="0.3"/>
        </svg>`,
        defaultColors: ['#26a69a', '#00897b', '#00796b', '#00695c'],
        tags: ['dodecahedron', '3d', 'pentagon', '12-sided'],
    },

    {
        id: '3d-hemisphere',
        name: 'Hemisphere',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 50 A40 40 0 0 0 90 50" fill="#7E57C2"/>
            <ellipse cx="50" cy="50" rx="40" ry="15" fill="#673AB7"/>
            <path d="M10 50 A40 40 0 0 0 90 50" fill="url(#gradHemi)" opacity="0.4"/>
            <defs>
                <radialGradient id="gradHemi" cx="50%" cy="20%" r="80%">
                    <stop offset="0%" style="stop-color:#B39DDB;stop-opacity:0.5" />
                    <stop offset="100%" style="stop-color:#311B92;stop-opacity:0.1" />
                </radialGradient>
            </defs>
        </svg>`,
        defaultColors: ['#7e57c2', '#673ab7'],
        tags: ['hemisphere', '3d', 'bowl', 'dome', 'half-sphere'],
    },
    {
        id: '3d-pipe',
        name: 'Hollow Pipe',
        category: '3d',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 20 L20 80 A30 10 0 0 0 80 80 L80 20" fill="#90A4AE"/>
            <ellipse cx="50" cy="80" rx="30" ry="10" fill="#78909C"/>
            <ellipse cx="50" cy="20" rx="30" ry="10" fill="#B0BEC5"/>
            <ellipse cx="50" cy="20" rx="20" ry="7" fill="#455A64"/>
        </svg>`,
        defaultColors: ['#90a4ae', '#78909c', '#b0bec5', '#455a64'],
        tags: ['pipe', '3d', 'tube', 'cylinder', 'hollow'],
    },
    // ========== LIQUID / FLUID ==========
    {
        id: 'liquid-blob-1',
        name: 'Fluid Blob 1',
        category: 'liquid',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M47.5,-58.3C60.9,-46.7,70.9,-31.6,73.1,-15.7C75.3,0.3,69.7,17.2,59.3,31.2C48.9,45.2,33.7,56.3,18.1,61.5C2.5,66.7,-13.6,66,-28.4,59.3C-43.2,52.6,-56.7,39.9,-62.4,24.4C-68.1,8.9,-65.9,-9.4,-57.4,-25.2C-48.9,-41,-34.1,-54.3,-18.2,-59.8C-2.2,-65.4,13.9,-63.1,34.1,-69.9" transform="translate(50 50) scale(0.6)" fill="#FF9A9E" opacity="0.8"/>
            <path d="M47.5,-58.3C60.9,-46.7,70.9,-31.6,73.1,-15.7C75.3,0.3,69.7,17.2,59.3,31.2C48.9,45.2,33.7,56.3,18.1,61.5C2.5,66.7,-13.6,66,-28.4,59.3C-43.2,52.6,-56.7,39.9,-62.4,24.4C-68.1,8.9,-65.9,-9.4,-57.4,-25.2C-48.9,-41,-34.1,-54.3,-18.2,-59.8C-2.2,-65.4,13.9,-63.1,34.1,-69.9" transform="translate(50 55) scale(0.6)" fill="#FECFEF" opacity="0.5"/>
        </svg>`,
        defaultColors: ['#ff9a9e', '#fecfef'],
        tags: ['liquid', 'blob', 'fluid', 'organic', 'shape'],
    },
    {
        id: 'liquid-blob-2',
        name: 'Fluid Blob 2',
        category: 'liquid',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
             <defs>
                <linearGradient id="gradLiq" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#a18cd1;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#fbc2eb;stop-opacity:1" />
                </linearGradient>
            </defs>
            <path d="M44.1,-51.9C57.3,-45.5,68.2,-33.4,73.6,-19.4C79,-5.4,78.9,10.5,72.6,24.6C66.3,38.7,53.8,51,39.9,59.2C26,67.4,10.6,71.5,-3.6,76.5C-17.8,81.4,-30.9,87.3,-41.8,80.7C-52.7,74.1,-61.4,55.1,-67.2,37.2C-73,19.3,-75.9,2.5,-71.2,-11.9C-66.5,-26.3,-54.2,-38.3,-41.2,-44.8C-28.2,-51.3,-14.6,-52.3,1.4,-54.2C17.4,-56.1,30.9,-58.3,44.1,-51.9Z" transform="translate(50 50) scale(0.5)" fill="url(#gradLiq)" />
        </svg>`,
        defaultColors: ['#a18cd1', '#fbc2eb'],
        tags: ['liquid', 'blob', 'gradient', 'purple'],
    },
    {
        id: 'liquid-drip',
        name: 'Liquid Drip',
        category: 'liquid',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 10 Q20 40 30 60 Q40 80 50 80 Q60 80 70 60 Q80 40 80 10" fill="#29B6F6"/>
            <circle cx="50" cy="85" r="8" fill="#29B6F6"/>
            <circle cx="50" cy="85" r="3" fill="#B3E5FC"/>
            <path d="M30 60 Q35 70 40 60" stroke="#0288D1" stroke-width="2" fill="none" opacity="0.3"/>
        </svg>`,
        defaultColors: ['#29b6f6', '#b3e5fc', '#0288d1'],
        tags: ['liquid', 'drip', 'water', 'drop'],
    },
    {
        id: 'liquid-splash',
        name: 'Paint Splash',
        category: 'liquid',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
           <path d="M50 50 m-40 0 a 40 40 0 1 0 80 0 a 40 40 0 1 0 -80 0" fill="#E91E63"/>
           <circle cx="20" cy="20" r="10" fill="#E91E63"/>
           <circle cx="80" cy="30" r="12" fill="#E91E63"/>
           <circle cx="30" cy="80" r="8" fill="#E91E63"/>
           <circle cx="70" cy="75" r="15" fill="#E91E63"/>
           <circle cx="35" cy="35" r="5" fill="#F8BBD0"/>
           <circle cx="65" cy="45" r="8" fill="#F8BBD0"/>
        </svg>`,
        defaultColors: ['#e91e63', '#f8bbd0'],
        tags: ['splash', 'paint', 'liquid', 'spot'],
    },

    // ========== BADGES ==========
    {
        id: 'badge-new',
        name: 'New Badge',
        category: 'badges',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 5 L61 35 L95 35 L68 55 L79 85 L50 65 L21 85 L32 55 L5 35 L39 35 Z" fill="#FFC107"/>
            <text x="50" y="55" font-family="sans-serif" font-weight="bold" font-size="14" text-anchor="middle" fill="#FFFFFF">NEW</text>
        </svg>`,
        defaultColors: ['#ffc107', '#ffffff'],
        tags: ['badge', 'new', 'star', 'label', 'tag'],
    },
    {
        id: 'badge-sale',
        name: 'Sale Ribbon',
        category: 'badges',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 30 L90 30 L90 70 L10 70 L20 50 L10 30" fill="#F44336"/>
            <rect x="15" y="35" width="70" height="30" fill="none" stroke="#FFF" stroke-width="2" stroke-dasharray="4 2"/>
            <text x="52" y="58" font-family="sans-serif" font-weight="bold" font-size="20" text-anchor="middle" fill="#FFFFFF">SALE</text>
        </svg>`,
        defaultColors: ['#f44336', '#ffffff'],
        tags: ['badge', 'sale', 'ribbon', 'tag', 'discount'],
    },
    {
        id: 'badge-best',
        name: 'Best Choice',
        category: 'badges',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
             <circle cx="50" cy="50" r="40" fill="#4CAF50" stroke="#81C784" stroke-width="4"/>
             <path d="M30 50 L45 65 L70 35" stroke="#FFF" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        defaultColors: ['#4caf50', '#81c784', '#ffffff'],
        tags: ['badge', 'best', 'check', 'verified', 'green'],
    },

    // ========== FRAMES ==========
    {
        id: 'frame-polaroid',
        name: 'Polaroid Frame',
        category: 'frames',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="15" y="10" width="70" height="85" fill="#FFF" stroke="#E0E0E0" stroke-width="1" shadow="0 4 6 rgba(0,0,0,0.1)"/>
            <rect x="20" y="15" width="60" height="60" fill="#F5F5F5"/>
        </svg>`,
        defaultColors: ['#ffffff', '#e0e0e0', '#f5f5f5'],
        tags: ['frame', 'photo', 'polaroid', 'picture', 'white'],
    },
    {
        id: 'frame-phone',
        name: 'Phone Mockup',
        category: 'frames',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="10" width="50" height="80" rx="6" fill="#FFF" stroke="#333" stroke-width="3"/>
            <rect x="28" y="15" width="44" height="70" fill="#E3F2FD"/>
            <circle cx="50" cy="85" r="2" fill="#333"/>
            <rect x="40" y="12" width="20" height="2" rx="1" fill="#333"/>
        </svg>`,
        defaultColors: ['#ffffff', '#333333', '#e3f2fd'],
        tags: ['frame', 'phone', 'mobile', 'device', 'mockup'],
    },
    {
        id: 'frame-browser',
        name: 'Browser Window',
        category: 'frames',
        svgContent: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="20" width="80" height="60" rx="3" fill="#FFF" stroke="#9E9E9E" stroke-width="2"/>
            <path d="M10 35 L90 35" stroke="#E0E0E0" stroke-width="2"/>
            <circle cx="18" cy="27" r="2" fill="#F44336"/>
            <circle cx="25" cy="27" r="2" fill="#FFC107"/>
            <circle cx="32" cy="27" r="2" fill="#4CAF50"/>
        </svg>`,
        defaultColors: ['#ffffff', '#9e9e9e', '#e0e0e0', '#f44336', '#ffc107', '#4caf50'],
        tags: ['frame', 'browser', 'window', 'web', 'ui'],
    },
];

// Get stickers organized by category
export function getStickerCategories(): { category: StickerCategory; stickers: StickerDefinition[] }[] {
    const categories: StickerCategory[] = ['celebration', 'nature', 'emoji', 'people', 'food', 'animals', 'objects', 'office', 'fitness', 'gradients', 'abstract', 'decorations', '3d', 'liquid', 'badges', 'frames'];

    return categories.map(category => ({
        category,
        stickers: STICKER_CATALOG.filter(s => s.category === category),
    })).filter(g => g.stickers.length > 0);
}

// Search stickers by query
export function searchStickers(query: string): StickerDefinition[] {
    const lowerQuery = query.toLowerCase();
    return STICKER_CATALOG.filter(sticker =>
        sticker.name.toLowerCase().includes(lowerQuery) ||
        sticker.tags.some(tag => tag.includes(lowerQuery)) ||
        sticker.category.toLowerCase().includes(lowerQuery)
    );
}
