// Sticker Type Definitions
// Editable SVG stickers with color regions

export type StickerCategory =
    | 'celebration'
    | 'nature'
    | 'people'
    | 'food'
    | 'objects'
    | 'animals'
    | 'emoji';

export const STICKER_CATEGORY_LABELS: Record<StickerCategory, string> = {
    celebration: 'Celebration',
    nature: 'Nature',
    people: 'People',
    food: 'Food',
    objects: 'Objects',
    animals: 'Animals',
    emoji: 'Emoji',
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

    // ========== ANIMALS ==========
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
];

// Get stickers organized by category
export function getStickerCategories(): { category: StickerCategory; stickers: StickerDefinition[] }[] {
    const categories: StickerCategory[] = ['celebration', 'nature', 'emoji', 'people', 'food', 'animals', 'objects'];

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
