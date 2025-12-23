// Google Fonts Service
// Dynamic font loading and management for the designer

export interface GoogleFont {
    family: string;
    category: FontCategory;
    variants: string[];
    subsets: string[];
}

export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';

export const FONT_CATEGORIES: { id: FontCategory; label: string; icon: string }[] = [
    { id: 'handwriting', label: 'Handwriting', icon: '✍️' },
    { id: 'display', label: 'Display', icon: '🎨' },
    { id: 'serif', label: 'Serif', icon: 'T' },
    { id: 'sans-serif', label: 'Sans', icon: 'A' },
    { id: 'monospace', label: 'Mono', icon: '</>' },
];

// Popular Google Fonts - Comprehensive collection (300+ fonts)
// Sorted by category, then popularity
export const GOOGLE_FONTS: GoogleFont[] = [
    // ============ SANS-SERIF FONTS ============
    { family: 'Inter', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Roboto', category: 'sans-serif', variants: ['100', '300', '400', '500', '700', '900'], subsets: ['latin'] },
    { family: 'Open Sans', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800'], subsets: ['latin'] },
    { family: 'Lato', category: 'sans-serif', variants: ['100', '300', '400', '700', '900'], subsets: ['latin'] },
    { family: 'Montserrat', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Poppins', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Oswald', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Raleway', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Source Sans 3', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Nunito', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Nunito Sans', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Ubuntu', category: 'sans-serif', variants: ['300', '400', '500', '700'], subsets: ['latin'] },
    { family: 'Rubik', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Work Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Quicksand', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Mulish', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Barlow', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Kanit', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Manrope', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'] },
    { family: 'Outfit', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Figtree', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'DM Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Lexend', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Sora', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'] },
    { family: 'Space Grotesk', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Plus Jakarta Sans', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'] },
    { family: 'Urbanist', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Josefin Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Comfortaa', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Exo 2', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Archivo', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Cabin', category: 'sans-serif', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Assistant', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'] },
    { family: 'Barlow Condensed', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Catamaran', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Overpass', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Karla', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'] },
    { family: 'Heebo', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Mukta', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'] },
    { family: 'Titillium Web', category: 'sans-serif', variants: ['200', '300', '400', '600', '700', '900'], subsets: ['latin'] },
    { family: 'Varela Round', category: 'sans-serif', variants: ['400'], subsets: ['latin'] },
    { family: 'Abel', category: 'sans-serif', variants: ['400'], subsets: ['latin'] },
    { family: 'Asap', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Yanone Kaffeesatz', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Prompt', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Red Hat Display', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'IBM Plex Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Public Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Jost', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Albert Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },

    // ============ SERIF FONTS ============
    { family: 'Playfair Display', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Merriweather', category: 'serif', variants: ['300', '400', '700', '900'], subsets: ['latin'] },
    { family: 'Lora', category: 'serif', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'PT Serif', category: 'serif', variants: ['400', '700'], subsets: ['latin'] },
    { family: 'Noto Serif', category: 'serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Libre Baskerville', category: 'serif', variants: ['400', '700'], subsets: ['latin'] },
    { family: 'Source Serif 4', category: 'serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'EB Garamond', category: 'serif', variants: ['400', '500', '600', '700', '800'], subsets: ['latin'] },
    { family: 'Cormorant Garamond', category: 'serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Bitter', category: 'serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Crimson Text', category: 'serif', variants: ['400', '600', '700'], subsets: ['latin'] },
    { family: 'Spectral', category: 'serif', variants: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'] },
    { family: 'Libre Caslon Text', category: 'serif', variants: ['400', '700'], subsets: ['latin'] },
    { family: 'Vollkorn', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Domine', category: 'serif', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Cardo', category: 'serif', variants: ['400', '700'], subsets: ['latin'] },
    { family: 'Old Standard TT', category: 'serif', variants: ['400', '700'], subsets: ['latin'] },
    { family: 'Cormorant', category: 'serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Arvo', category: 'serif', variants: ['400', '700'], subsets: ['latin'] },
    { family: 'Noto Serif Display', category: 'serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Zilla Slab', category: 'serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Newsreader', category: 'serif', variants: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'] },
    { family: 'Bodoni Moda', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Fraunces', category: 'serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'DM Serif Display', category: 'serif', variants: ['400'], subsets: ['latin'] },
    { family: 'DM Serif Text', category: 'serif', variants: ['400'], subsets: ['latin'] },

    // ============ DISPLAY / STYLISH FONTS ============
    { family: 'Bebas Neue', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Anton', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Abril Fatface', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Righteous', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Fredoka', category: 'display', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Archivo Black', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Staatliches', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Bungee', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Black Ops One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Alfa Slab One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Bangers', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Lilita One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Passion One', category: 'display', variants: ['400', '700', '900'], subsets: ['latin'] },
    { family: 'Russo One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Teko', category: 'display', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Fugaz One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Bungee Inline', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Bungee Shade', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Bungee Outline', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Monoton', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Shrikhand', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Mono One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Squada One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Ultra', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Luckiest Guy', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Boogaloo', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Bowlby One SC', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Titan One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Changa One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Limelight', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Yeseva One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rammetto One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Chewy', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Baloo 2', category: 'display', variants: ['400', '500', '600', '700', '800'], subsets: ['latin'] },
    { family: 'Calistoga', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Freckle Face', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Creepster', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Fascinate Inline', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Faster One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Bungee Spice', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Wet Paint', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Glitch', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Vinyl', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Burned', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Distressed', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Spray Paint', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik 80s Fade', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Dirt', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Iso', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Marker Hatch', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Maze', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Microbe', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Moonrocks', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Puddles', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Storm', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Modak', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Nabla', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rampart One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Rubik Bubbles', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Silkscreen', category: 'display', variants: ['400', '700'], subsets: ['latin'] },
    { family: 'Pixelify Sans', category: 'display', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Press Start 2P', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'VT323', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Orbitron', category: 'display', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Audiowide', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Electrolize', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Michroma', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Share Tech Mono', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Wallpoet', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Notable', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Dela Gothic One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Koulen', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Big Shoulders Display', category: 'display', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Secular One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Bree Serif', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Patua One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Crete Round', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Knewave', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Londrina Solid', category: 'display', variants: ['100', '300', '400', '900'], subsets: ['latin'] },
    { family: 'Concert One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Carter One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Holtwood One SC', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Graduate', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Akronim', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Almendra Display', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Germania One', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Frijole', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Uncial Antiqua', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Lacquer', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Metal Mania', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Nosifer', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Eater', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Butcherman', category: 'display', variants: ['400'], subsets: ['latin'] },
    { family: 'Jolly Lodger', category: 'display', variants: ['400'], subsets: ['latin'] },

    // ============ HANDWRITING / SCRIPT FONTS ============
    { family: 'Dancing Script', category: 'handwriting', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Pacifico', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Caveat', category: 'handwriting', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Satisfy', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Great Vibes', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Lobster', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Sacramento', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Kaushan Script', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Permanent Marker', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Indie Flower', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Shadows Into Light', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Amatic SC', category: 'handwriting', variants: ['400', '700'], subsets: ['latin'] },
    { family: 'Courgette', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Cookie', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Yellowtail', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Allura', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Alex Brush', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Tangerine', category: 'handwriting', variants: ['400', '700'], subsets: ['latin'] },
    { family: 'Pinyon Script', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Marck Script', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Lovers Quarrel', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Rouge Script', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Berkshire Swash', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Parisienne', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Norican', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Niconne', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Rochester', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Sail', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Sofia', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Rancho', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Italianno', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Ruthie', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Mr Dafoe', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Bilbo Swash Caps', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Euphoria Script', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Clicker Script', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Ms Madi', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Mrs Saint Delafield', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Monsieur La Doulaise', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Herr Von Muellerhoff', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Qwigley', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'La Belle Aurore', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Petit Formal Script', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Sevillana', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Stalemate', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Engagement', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Leckerli One', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Lobster Two', category: 'handwriting', variants: ['400', '700'], subsets: ['latin'] },
    { family: 'Gloria Hallelujah', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Patrick Hand', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Architects Daughter', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Handlee', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Kalam', category: 'handwriting', variants: ['300', '400', '700'], subsets: ['latin'] },
    { family: 'Gochi Hand', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Annie Use Your Telescope', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Reenie Beanie', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Just Another Hand', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Covered By Your Grace', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Cedarville Cursive', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Rock Salt', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Arizonia', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Bad Script', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Nothing You Could Do', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Homemade Apple', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Over the Rainbow', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Waiting for the Sunrise', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Give You Glory', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Dawning of a New Day', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Coming Soon', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Crafty Girls', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Sue Ellen Francisco', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Loved by the King', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Schoolbell', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Zeyada', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Short Stack', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Neucha', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Gaegu', category: 'handwriting', variants: ['300', '400', '700'], subsets: ['latin'] },
    { family: 'Hi Melody', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Merienda', category: 'handwriting', variants: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Grand Hotel', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Playball', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Grape Nuts', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Vibur', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Meie Script', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
    { family: 'Licorice', category: 'handwriting', variants: ['400'], subsets: ['latin'] },

    // ============ MONOSPACE FONTS ============
    { family: 'Fira Code', category: 'monospace', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Source Code Pro', category: 'monospace', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'JetBrains Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'] },
    { family: 'IBM Plex Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Roboto Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Space Mono', category: 'monospace', variants: ['400', '700'], subsets: ['latin'] },
    { family: 'Inconsolata', category: 'monospace', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Ubuntu Mono', category: 'monospace', variants: ['400', '700'], subsets: ['latin'] },
    { family: 'Courier Prime', category: 'monospace', variants: ['400', '700'], subsets: ['latin'] },
    { family: 'Anonymous Pro', category: 'monospace', variants: ['400', '700'], subsets: ['latin'] },
    { family: 'PT Mono', category: 'monospace', variants: ['400'], subsets: ['latin'] },
    { family: 'Overpass Mono', category: 'monospace', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Red Hat Mono', category: 'monospace', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'] },
    { family: 'Azeret Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
    { family: 'Martian Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'] },
];

// Track loaded fonts
const loadedFonts = new Set<string>();

/**
 * Load a Google Font dynamically
 */
export async function loadGoogleFont(family: string, variants: string[] = ['400']): Promise<void> {
    const fontKey = `${family}:${variants.join(',')}`;

    if (loadedFonts.has(fontKey)) {
        return;
    }

    // Create the Google Fonts URL
    const variantStr = variants.join(';');
    const familyParam = `${family.replace(/ /g, '+')}:wght@${variantStr}`;
    const url = `https://fonts.googleapis.com/css2?family=${familyParam}&display=swap`;

    // Check if link already exists
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (existingLink) {
        loadedFonts.add(fontKey);
        return;
    }

    // Create and append link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;

    return new Promise((resolve, reject) => {
        link.onload = () => {
            loadedFonts.add(fontKey);
            resolve();
        };
        link.onerror = () => {
            reject(new Error(`Failed to load font: ${family}`));
        };
        document.head.appendChild(link);
    });
}

/**
 * Search fonts by name
 */
export function searchFonts(query: string, category?: FontCategory): GoogleFont[] {
    const lowerQuery = query.toLowerCase();
    return GOOGLE_FONTS.filter(font => {
        const matchesQuery = font.family.toLowerCase().includes(lowerQuery);
        const matchesCategory = !category || font.category === category;
        return matchesQuery && matchesCategory;
    });
}

/**
 * Get fonts by category
 */
export function getFontsByCategory(category: FontCategory): GoogleFont[] {
    return GOOGLE_FONTS.filter(font => font.category === category);
}

/**
 * Get font variants for a specific font
 */
export function getFontVariants(family: string): string[] {
    const font = GOOGLE_FONTS.find(f => f.family === family);
    return font?.variants || ['400'];
}

/**
 * Convert variant string to weight number
 */
export function variantToWeight(variant: string): number {
    const numericPart = variant.replace(/[^0-9]/g, '');
    return parseInt(numericPart) || 400;
}

/**
 * Get human-readable weight name
 */
export function getWeightName(weight: string | number): string {
    const w = typeof weight === 'string' ? parseInt(weight) : weight;
    const names: Record<number, string> = {
        100: 'Thin',
        200: 'Extra Light',
        300: 'Light',
        400: 'Regular',
        500: 'Medium',
        600: 'Semi Bold',
        700: 'Bold',
        800: 'Extra Bold',
        900: 'Black',
    };
    return names[w] || 'Regular';
}

/**
 * Preload common fonts
 */
export async function preloadCommonFonts(): Promise<void> {
    const commonFonts = ['Inter', 'Roboto', 'Poppins', 'Open Sans', 'Montserrat'];
    await Promise.all(
        commonFonts.map(family => {
            const font = GOOGLE_FONTS.find(f => f.family === family);
            return loadGoogleFont(family, font?.variants.slice(0, 5) || ['400']);
        })
    );
}
