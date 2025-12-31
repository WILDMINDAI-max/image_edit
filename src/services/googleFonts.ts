// Google Fonts Service
// Dynamic font loading and management for the designer

export interface GoogleFont {
    family: string;
    category: FontCategory;
    variants: string[];
    subsets: string[];
    themes?: FontTheme[];
}

export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';

// Theme types for font categorization
export type FontTheme =
    // Occasions
    | 'wedding' | 'engagement' | 'anniversary' | 'birthday' | 'baby-shower' | 'naming-ceremony'
    | 'invitation' | 'greeting-card' | 'party' | 'graduation' | 'retirement' | 'thank-you' | 'congratulations'
    // Festival
    | 'diwali' | 'holi' | 'christmas' | 'new-year' | 'halloween'
    // Content
    | 'blog' | 'article' | 'news' | 'editorial' | 'magazine' | 'journal' | 'academic'
    // Business
    | 'corporate' | 'business' | 'startup' | 'finance' | 'technology' | 'real-estate' | 'marketing' | 'consulting' | 'agency'
    // Advertising
    | 'promotion' | 'sale' | 'discount' | 'offer' | 'poster' | 'flyer' | 'banner' | 'social-media'
    // Kids
    | 'kids' | 'cartoon' | 'playful' | 'fun'
    // Horror
    | 'horror' | 'scary' | 'thriller' | 'mystery' | 'crime' | 'dark' | 'gothic';

export interface ThemeGroup {
    id: string;
    label: string;
    icon: string;
    themes: { id: FontTheme; label: string }[];
}

export const FONT_THEME_GROUPS: ThemeGroup[] = [
    {
        id: 'occasions', label: 'Occasions', icon: '💒',
        themes: [
            { id: 'wedding', label: 'Wedding' }, { id: 'engagement', label: 'Engagement' },
            { id: 'anniversary', label: 'Anniversary' }, { id: 'birthday', label: 'Birthday' },
            { id: 'baby-shower', label: 'Baby Shower' }, { id: 'naming-ceremony', label: 'Naming Ceremony' },
            { id: 'invitation', label: 'Invitation' }, { id: 'greeting-card', label: 'Greeting Card' },
            { id: 'party', label: 'Party' }, { id: 'graduation', label: 'Graduation' },
            { id: 'retirement', label: 'Retirement' }, { id: 'thank-you', label: 'Thank You' },
            { id: 'congratulations', label: 'Congratulations' },
        ]
    },
    {
        id: 'festival', label: 'Festival', icon: '🎉',
        themes: [
            { id: 'diwali', label: 'Diwali' }, { id: 'holi', label: 'Holi' },
            { id: 'christmas', label: 'Christmas' }, { id: 'new-year', label: 'New Year' },
            { id: 'halloween', label: 'Halloween' },
        ]
    },
    {
        id: 'content', label: 'Content', icon: '📝',
        themes: [
            { id: 'blog', label: 'Blog' }, { id: 'article', label: 'Article' },
            { id: 'news', label: 'News' }, { id: 'editorial', label: 'Editorial' },
            { id: 'magazine', label: 'Magazine' }, { id: 'journal', label: 'Journal' },
            { id: 'academic', label: 'Academic' },
        ]
    },
    {
        id: 'business', label: 'Business', icon: '💼',
        themes: [
            { id: 'business', label: 'Business' }, { id: 'corporate', label: 'Corporate' }, { id: 'startup', label: 'Startup' },
            { id: 'finance', label: 'Finance' }, { id: 'technology', label: 'Technology' },
            { id: 'real-estate', label: 'Real Estate' }, { id: 'marketing', label: 'Marketing' },
            { id: 'consulting', label: 'Consulting' }, { id: 'agency', label: 'Agency' },
        ]
    },
    {
        id: 'advertising', label: 'Advertising', icon: '📢',
        themes: [
            { id: 'promotion', label: 'Promotion' }, { id: 'sale', label: 'Sale' },
            { id: 'discount', label: 'Discount' }, { id: 'offer', label: 'Offer' },
            { id: 'poster', label: 'Poster' }, { id: 'flyer', label: 'Flyer' },
            { id: 'banner', label: 'Banner' }, { id: 'social-media', label: 'Social Media' },
        ]
    },
    {
        id: 'kids', label: 'Kids', icon: '🧸',
        themes: [
            { id: 'kids', label: 'Kids' }, { id: 'cartoon', label: 'Cartoon' },
            { id: 'playful', label: 'Playful' }, { id: 'fun', label: 'Fun' },
        ]
    },
    {
        id: 'horror', label: 'Horror', icon: '👻',
        themes: [
            { id: 'horror', label: 'Horror' }, { id: 'scary', label: 'Scary' },
            { id: 'thriller', label: 'Thriller' }, { id: 'mystery', label: 'Mystery' },
            { id: 'crime', label: 'Crime' }, { id: 'dark', label: 'Dark' },
            { id: 'gothic', label: 'Gothic' },
        ]
    },
];

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
    { family: 'Inter', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['corporate', 'technology', 'startup', 'blog', 'article', 'news', 'social-media'] },
    { family: 'Roboto', category: 'sans-serif', variants: ['100', '300', '400', '500', '700', '900'], subsets: ['latin'], themes: ['corporate', 'technology', 'startup', 'blog', 'article', 'news', 'social-media', 'marketing'] },
    { family: 'Open Sans', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['corporate', 'blog', 'article', 'news', 'editorial', 'magazine'] },
    { family: 'Lato', category: 'sans-serif', variants: ['100', '300', '400', '700', '900'], subsets: ['latin'], themes: ['corporate', 'blog', 'article', 'news', 'editorial', 'magazine', 'real-estate'] },
    { family: 'Montserrat', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['corporate', 'startup', 'agency', 'marketing', 'poster', 'banner', 'social-media'] },
    { family: 'Poppins', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['corporate', 'startup', 'technology', 'marketing', 'social-media', 'agency'] },
    { family: 'Oswald', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['poster', 'banner', 'promotion', 'sale', 'flyer', 'offer'] },
    { family: 'Raleway', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['wedding', 'invitation', 'greeting-card', 'magazine', 'editorial', 'agency'] },
    { family: 'Source Sans 3', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['blog', 'article', 'news', 'academic', 'journal'] },
    { family: 'Nunito', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['kids', 'playful', 'fun', 'baby-shower', 'birthday'] },
    { family: 'Nunito Sans', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['blog', 'article', 'startup', 'technology'] },
    { family: 'Ubuntu', category: 'sans-serif', variants: ['300', '400', '500', '700'], subsets: ['latin'], themes: ['technology', 'startup', 'blog'] },
    { family: 'Rubik', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['startup', 'technology', 'marketing', 'agency'] },
    { family: 'Work Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['corporate', 'startup', 'blog', 'article'] },
    { family: 'Quicksand', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['kids', 'playful', 'fun', 'baby-shower', 'birthday', 'party'] },
    { family: 'Mulish', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['blog', 'article', 'corporate'] },
    { family: 'Barlow', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['technology', 'startup', 'poster'] },
    { family: 'Kanit', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['poster', 'banner', 'promotion', 'technology'] },
    { family: 'Manrope', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['startup', 'technology', 'agency'] },
    { family: 'Outfit', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['startup', 'technology', 'agency', 'marketing'] },
    { family: 'Figtree', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['startup', 'technology', 'blog'] },
    { family: 'DM Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['startup', 'technology', 'corporate'] },
    { family: 'Lexend', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['blog', 'article', 'academic'] },
    { family: 'Sora', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['technology', 'startup', 'agency'] },
    { family: 'Space Grotesk', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['technology', 'startup'] },
    { family: 'Plus Jakarta Sans', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['startup', 'technology', 'corporate'] },
    { family: 'Urbanist', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['startup', 'agency', 'marketing'] },
    { family: 'Josefin Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['wedding', 'invitation', 'magazine', 'editorial'] },
    { family: 'Comfortaa', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['kids', 'playful', 'fun', 'party'] },
    { family: 'Exo 2', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['technology', 'startup'] },
    { family: 'Archivo', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['news', 'editorial', 'magazine'] },
    { family: 'Cabin', category: 'sans-serif', variants: ['400', '500', '600', '700'], subsets: ['latin'], themes: ['blog', 'article'] },
    { family: 'Assistant', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['blog', 'article'] },
    { family: 'Barlow Condensed', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['poster', 'banner', 'sale', 'promotion'] },
    { family: 'Catamaran', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['technology', 'startup'] },
    { family: 'Overpass', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['technology'] },
    { family: 'Karla', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['blog', 'article'] },
    { family: 'Heebo', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['corporate', 'blog'] },
    { family: 'Mukta', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['diwali', 'holi', 'blog'] },
    { family: 'Titillium Web', category: 'sans-serif', variants: ['200', '300', '400', '600', '700', '900'], subsets: ['latin'], themes: ['technology', 'startup'] },
    { family: 'Varela Round', category: 'sans-serif', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Abel', category: 'sans-serif', variants: ['400'], subsets: ['latin'], themes: ['blog', 'magazine'] },
    { family: 'Asap', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['blog', 'news'] },
    { family: 'Yanone Kaffeesatz', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['poster', 'flyer', 'promotion'] },
    { family: 'Prompt', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['technology'] },
    { family: 'Red Hat Display', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['technology', 'startup'] },
    { family: 'IBM Plex Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['corporate', 'technology', 'finance'] },
    { family: 'Public Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['corporate', 'blog'] },
    { family: 'Jost', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['startup', 'agency'] },
    { family: 'Albert Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['startup', 'technology'] },

    // ============ SERIF FONTS ============
    { family: 'Playfair Display', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement', 'anniversary', 'magazine', 'editorial'] },
    { family: 'Merriweather', category: 'serif', variants: ['300', '400', '700', '900'], subsets: ['latin'], themes: ['blog', 'article', 'news', 'editorial', 'academic', 'journal'] },
    { family: 'Lora', category: 'serif', variants: ['400', '500', '600', '700'], subsets: ['latin'], themes: ['blog', 'article', 'magazine', 'editorial', 'wedding'] },
    { family: 'PT Serif', category: 'serif', variants: ['400', '700'], subsets: ['latin'], themes: ['news', 'editorial', 'academic', 'journal'] },
    { family: 'Noto Serif', category: 'serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['blog', 'article', 'news', 'editorial', 'academic'] },
    { family: 'Libre Baskerville', category: 'serif', variants: ['400', '700'], subsets: ['latin'], themes: ['editorial', 'magazine', 'academic', 'journal'] },
    { family: 'Source Serif 4', category: 'serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['news', 'editorial', 'academic'] },
    { family: 'EB Garamond', category: 'serif', variants: ['400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['wedding', 'invitation', 'academic', 'journal'] },
    { family: 'Cormorant Garamond', category: 'serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement', 'magazine', 'editorial'] },
    { family: 'Bitter', category: 'serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['blog', 'article', 'news'] },
    { family: 'Crimson Text', category: 'serif', variants: ['400', '600', '700'], subsets: ['latin'], themes: ['editorial', 'academic', 'journal', 'magazine'] },
    { family: 'Spectral', category: 'serif', variants: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['editorial', 'academic', 'journal'] },
    { family: 'Libre Caslon Text', category: 'serif', variants: ['400', '700'], subsets: ['latin'], themes: ['editorial', 'magazine', 'academic'] },
    { family: 'Vollkorn', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['blog', 'article', 'editorial'] },
    { family: 'Domine', category: 'serif', variants: ['400', '500', '600', '700'], subsets: ['latin'], themes: ['news', 'editorial'] },
    { family: 'Cardo', category: 'serif', variants: ['400', '700'], subsets: ['latin'], themes: ['academic', 'journal', 'editorial'] },
    { family: 'Old Standard TT', category: 'serif', variants: ['400', '700'], subsets: ['latin'], themes: ['academic', 'journal', 'gothic'] },
    { family: 'Cormorant', category: 'serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement', 'magazine'] },
    { family: 'Arvo', category: 'serif', variants: ['400', '700'], subsets: ['latin'], themes: ['blog', 'news', 'poster'] },
    { family: 'Noto Serif Display', category: 'serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['magazine', 'editorial', 'poster'] },
    { family: 'Zilla Slab', category: 'serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['technology', 'blog'] },
    { family: 'Newsreader', category: 'serif', variants: ['200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['news', 'editorial', 'magazine'] },
    { family: 'Bodoni Moda', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['wedding', 'invitation', 'magazine', 'editorial'] },
    { family: 'Fraunces', category: 'serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['wedding', 'invitation', 'magazine'] },
    { family: 'DM Serif Display', category: 'serif', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'magazine', 'poster'] },
    { family: 'DM Serif Text', category: 'serif', variants: ['400'], subsets: ['latin'], themes: ['blog', 'article', 'editorial'] },

    // ============ DISPLAY / STYLISH FONTS ============
    { family: 'Bebas Neue', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner', 'sale', 'promotion', 'flyer', 'offer'] },
    { family: 'Anton', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner', 'sale', 'promotion', 'discount'] },
    { family: 'Abril Fatface', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['magazine', 'editorial', 'poster'] },
    { family: 'Righteous', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['party', 'fun', 'poster', 'flyer'] },
    { family: 'Fredoka', category: 'display', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['kids', 'cartoon', 'playful', 'fun', 'baby-shower', 'birthday'] },
    { family: 'Archivo Black', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner', 'sale', 'promotion'] },
    { family: 'Staatliches', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner', 'news'] },
    { family: 'Bungee', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'fun', 'playful', 'party'] },
    { family: 'Black Ops One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['thriller', 'crime', 'dark', 'poster'] },
    { family: 'Alfa Slab One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner', 'sale', 'promotion'] },
    { family: 'Bangers', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'cartoon', 'playful', 'fun', 'party', 'birthday'] },
    { family: 'Lilita One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun', 'party'] },
    { family: 'Passion One', category: 'display', variants: ['400', '700', '900'], subsets: ['latin'], themes: ['poster', 'banner', 'sale', 'promotion'] },
    { family: 'Russo One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['technology', 'poster'] },
    { family: 'Teko', category: 'display', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['technology', 'poster', 'sale'] },
    { family: 'Fugaz One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'sale', 'promotion'] },
    { family: 'Bungee Inline', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['fun', 'party', 'playful'] },
    { family: 'Bungee Shade', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['fun', 'party', 'poster'] },
    { family: 'Bungee Outline', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['fun', 'playful', 'poster'] },
    { family: 'Monoton', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['party', 'new-year', 'holi', 'diwali'] },
    { family: 'Shrikhand', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['diwali', 'holi', 'poster', 'fun'] },
    { family: 'Rubik Mono One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['technology', 'poster'] },
    { family: 'Squada One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['technology', 'poster'] },
    { family: 'Ultra', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'sale', 'banner'] },
    { family: 'Luckiest Guy', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'cartoon', 'playful', 'fun', 'birthday', 'party'] },
    { family: 'Boogaloo', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun', 'party'] },
    { family: 'Bowlby One SC', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner'] },
    { family: 'Titan One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner', 'sale'] },
    { family: 'Changa One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner'] },
    { family: 'Limelight', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['party', 'new-year', 'poster'] },
    { family: 'Yeseva One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'magazine'] },
    { family: 'Rammetto One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'fun'] },
    { family: 'Chewy', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'cartoon', 'playful', 'fun'] },
    { family: 'Baloo 2', category: 'display', variants: ['400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['kids', 'playful', 'fun', 'diwali', 'holi'] },
    { family: 'Calistoga', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner'] },
    { family: 'Freckle Face', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'cartoon', 'playful', 'fun'] },
    { family: 'Creepster', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'scary', 'halloween', 'dark'] },
    { family: 'Fascinate Inline', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['party', 'fun'] },
    { family: 'Faster One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'sale', 'promotion'] },
    { family: 'Bungee Spice', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['fun', 'party', 'holi'] },
    { family: 'Rubik Wet Paint', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'scary', 'halloween', 'dark'] },
    { family: 'Rubik Glitch', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['technology', 'dark', 'thriller'] },
    { family: 'Rubik Vinyl', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['party', 'fun'] },
    { family: 'Rubik Burned', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'scary', 'dark', 'halloween'] },
    { family: 'Rubik Distressed', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'dark', 'gothic'] },
    { family: 'Rubik Spray Paint', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['fun', 'playful', 'party'] },
    { family: 'Rubik 80s Fade', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['party', 'fun', 'new-year'] },
    { family: 'Rubik Dirt', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'dark', 'gothic'] },
    { family: 'Rubik Iso', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['technology', 'fun'] },
    { family: 'Rubik Marker Hatch', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Rubik Maze', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['mystery', 'thriller'] },
    { family: 'Rubik Microbe', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'scary'] },
    { family: 'Rubik Moonrocks', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['fun', 'kids', 'technology'] },
    { family: 'Rubik Puddles', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Rubik Storm', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['dark', 'thriller', 'mystery'] },
    { family: 'Modak', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['diwali', 'holi', 'fun', 'kids'] },
    { family: 'Nabla', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['technology', 'fun'] },
    { family: 'Rampart One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['dark', 'gothic'] },
    { family: 'Rubik Bubbles', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun', 'baby-shower'] },
    { family: 'Silkscreen', category: 'display', variants: ['400', '700'], subsets: ['latin'], themes: ['technology', 'fun'] },
    { family: 'Pixelify Sans', category: 'display', variants: ['400', '500', '600', '700'], subsets: ['latin'], themes: ['technology', 'fun', 'kids'] },
    { family: 'Press Start 2P', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['technology', 'fun', 'kids'] },
    { family: 'VT323', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['technology', 'fun'] },
    { family: 'Orbitron', category: 'display', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['technology', 'fun'] },
    { family: 'Audiowide', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['technology'] },
    { family: 'Electrolize', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['technology'] },
    { family: 'Michroma', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['technology'] },
    { family: 'Share Tech Mono', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['technology'] },
    { family: 'Wallpoet', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster'] },
    { family: 'Notable', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner'] },
    { family: 'Dela Gothic One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['dark', 'gothic', 'poster'] },
    { family: 'Koulen', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner'] },
    { family: 'Big Shoulders Display', category: 'display', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['poster', 'banner', 'sale'] },
    { family: 'Secular One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner'] },
    { family: 'Bree Serif', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['blog', 'magazine'] },
    { family: 'Patua One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner'] },
    { family: 'Crete Round', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['blog'] },
    { family: 'Knewave', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'fun', 'party'] },
    { family: 'Londrina Solid', category: 'display', variants: ['100', '300', '400', '900'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Concert One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['party', 'fun', 'poster'] },
    { family: 'Carter One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner'] },
    { family: 'Holtwood One SC', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner'] },
    { family: 'Graduate', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['graduation', 'academic'] },
    { family: 'Akronim', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['dark', 'gothic', 'mystery'] },
    { family: 'Almendra Display', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['gothic', 'dark'] },
    { family: 'Germania One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['gothic', 'dark'] },
    { family: 'Frijole', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'party'] },
    { family: 'Uncial Antiqua', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['gothic', 'dark', 'mystery'] },
    { family: 'Lacquer', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'dark'] },
    { family: 'Metal Mania', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'dark', 'gothic'] },
    { family: 'Nosifer', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'scary', 'halloween', 'dark'] },
    { family: 'Eater', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'scary', 'halloween', 'dark'] },
    { family: 'Butcherman', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'scary', 'halloween', 'dark'] },
    { family: 'Jolly Lodger', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['halloween', 'horror', 'fun'] },

    // ============ HANDWRITING / SCRIPT FONTS ============
    { family: 'Dancing Script', category: 'handwriting', variants: ['400', '500', '600', '700'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement', 'anniversary', 'greeting-card', 'thank-you'] },
    { family: 'Pacifico', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['party', 'fun', 'birthday', 'greeting-card', 'social-media'] },
    { family: 'Caveat', category: 'handwriting', variants: ['400', '500', '600', '700'], subsets: ['latin'], themes: ['greeting-card', 'thank-you', 'blog', 'baby-shower'] },
    { family: 'Satisfy', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'anniversary', 'greeting-card'] },
    { family: 'Great Vibes', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement', 'anniversary', 'greeting-card'] },
    { family: 'Lobster', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['poster', 'fun', 'party', 'social-media'] },
    { family: 'Sacramento', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement', 'greeting-card'] },
    { family: 'Kaushan Script', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'greeting-card', 'thank-you'] },
    { family: 'Permanent Marker', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'playful', 'poster'] },
    { family: 'Indie Flower', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'playful', 'greeting-card', 'baby-shower'] },
    { family: 'Shadows Into Light', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you', 'baby-shower'] },
    { family: 'Amatic SC', category: 'handwriting', variants: ['400', '700'], subsets: ['latin'], themes: ['poster', 'fun', 'party', 'birthday'] },
    { family: 'Courgette', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'greeting-card'] },
    { family: 'Cookie', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['birthday', 'party', 'kids', 'baby-shower'] },
    { family: 'Yellowtail', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['party', 'fun', 'poster'] },
    { family: 'Allura', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement', 'anniversary'] },
    { family: 'Alex Brush', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement', 'thank-you'] },
    { family: 'Tangerine', category: 'handwriting', variants: ['400', '700'], subsets: ['latin'], themes: ['wedding', 'invitation', 'greeting-card'] },
    { family: 'Pinyon Script', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement'] },
    { family: 'Marck Script', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you', 'invitation'] },
    { family: 'Lovers Quarrel', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'engagement', 'anniversary'] },
    { family: 'Rouge Script', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'greeting-card'] },
    { family: 'Berkshire Swash', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'poster'] },
    { family: 'Parisienne', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement'] },
    { family: 'Norican', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'invitation'] },
    { family: 'Niconne', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'greeting-card'] },
    { family: 'Rochester', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'thank-you'] },
    { family: 'Sail', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['party', 'poster', 'fun'] },
    { family: 'Sofia', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['invitation', 'greeting-card', 'baby-shower'] },
    { family: 'Rancho', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['party', 'fun'] },
    { family: 'Italianno', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'anniversary'] },
    { family: 'Ruthie', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'greeting-card'] },
    { family: 'Mr Dafoe', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement'] },
    { family: 'Bilbo Swash Caps', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'anniversary'] },
    { family: 'Euphoria Script', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'congratulations'] },
    { family: 'Clicker Script', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'greeting-card'] },
    { family: 'Ms Madi', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement'] },
    { family: 'Mrs Saint Delafield', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'anniversary'] },
    { family: 'Monsieur La Doulaise', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation'] },
    { family: 'Herr Von Muellerhoff', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation'] },
    { family: 'Qwigley', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'greeting-card'] },
    { family: 'La Belle Aurore', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you'] },
    { family: 'Petit Formal Script', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'anniversary'] },
    { family: 'Sevillana', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation'] },
    { family: 'Stalemate', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement'] },
    { family: 'Engagement', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['engagement', 'wedding', 'invitation'] },
    { family: 'Leckerli One', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['party', 'fun', 'birthday'] },
    { family: 'Lobster Two', category: 'handwriting', variants: ['400', '700'], subsets: ['latin'], themes: ['poster', 'fun', 'party'] },
    { family: 'Gloria Hallelujah', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'playful', 'greeting-card'] },
    { family: 'Patrick Hand', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'playful', 'baby-shower'] },
    { family: 'Architects Daughter', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'playful'] },
    { family: 'Handlee', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you', 'kids'] },
    { family: 'Kalam', category: 'handwriting', variants: ['300', '400', '700'], subsets: ['latin'], themes: ['greeting-card', 'thank-you', 'diwali', 'holi'] },
    { family: 'Gochi Hand', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'playful'] },
    { family: 'Annie Use Your Telescope', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you'] },
    { family: 'Reenie Beanie', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you', 'kids'] },
    { family: 'Just Another Hand', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you'] },
    { family: 'Covered By Your Grace', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you'] },
    { family: 'Cedarville Cursive', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you'] },
    { family: 'Rock Salt', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['poster', 'fun'] },
    { family: 'Arizonia', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'greeting-card'] },
    { family: 'Bad Script', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you'] },
    { family: 'Nothing You Could Do', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you'] },
    { family: 'Homemade Apple', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you'] },
    { family: 'Over the Rainbow', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'playful'] },
    { family: 'Waiting for the Sunrise', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you'] },
    { family: 'Give You Glory', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you', 'christmas'] },
    { family: 'Dawning of a New Day', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['new-year', 'greeting-card'] },
    { family: 'Coming Soon', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'playful'] },
    { family: 'Crafty Girls', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'playful', 'baby-shower'] },
    { family: 'Sue Ellen Francisco', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you'] },
    { family: 'Loved by the King', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you'] },
    { family: 'Schoolbell', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'graduation'] },
    { family: 'Zeyada', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you'] },
    { family: 'Short Stack', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'playful'] },
    { family: 'Neucha', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you'] },
    { family: 'Gaegu', category: 'handwriting', variants: ['300', '400', '700'], subsets: ['latin'], themes: ['kids', 'fun', 'playful'] },
    { family: 'Hi Melody', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'playful'] },
    { family: 'Merienda', category: 'handwriting', variants: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['party', 'fun', 'birthday'] },
    { family: 'Grand Hotel', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'poster'] },
    { family: 'Playball', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['party', 'fun', 'birthday'] },
    { family: 'Grape Nuts', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you'] },
    { family: 'Vibur', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['fun', 'party'] },
    { family: 'Meie Script', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation'] },
    { family: 'Licorice', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'greeting-card'] },

    { family: 'Fira Code', category: 'monospace', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['technology'] },
    { family: 'Source Code Pro', category: 'monospace', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['technology'] },
    { family: 'JetBrains Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['technology'] },
    { family: 'IBM Plex Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['technology', 'corporate'] },
    { family: 'Roboto Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['technology'] },
    { family: 'Space Mono', category: 'monospace', variants: ['400', '700'], subsets: ['latin'], themes: ['technology'] },
    { family: 'Inconsolata', category: 'monospace', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['technology'] },
    { family: 'Ubuntu Mono', category: 'monospace', variants: ['400', '700'], subsets: ['latin'], themes: ['technology'] },
    { family: 'Courier Prime', category: 'monospace', variants: ['400', '700'], subsets: ['latin'], themes: ['technology', 'academic'] },
    { family: 'Anonymous Pro', category: 'monospace', variants: ['400', '700'], subsets: ['latin'], themes: ['technology'] },
    { family: 'PT Mono', category: 'monospace', variants: ['400'], subsets: ['latin'], themes: ['technology'] },
    { family: 'Overpass Mono', category: 'monospace', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['technology'] },
    { family: 'Red Hat Mono', category: 'monospace', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['technology'] },
    { family: 'Azeret Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['technology'] },
    { family: 'Martian Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['technology'] },

    // ============ ADDITIONAL WEDDING & INVITATION FONTS ============
    { family: 'Cormorant Infant', category: 'serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement'] },
    { family: 'Marcellus', category: 'serif', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'anniversary'] },
    { family: 'Marcellus SC', category: 'serif', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation'] },
    { family: 'Cinzel Decorative', category: 'display', variants: ['400', '700', '900'], subsets: ['latin'], themes: ['wedding', 'invitation', 'anniversary'] },
    { family: 'Bellefair', category: 'serif', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'editorial'] },
    { family: 'Corinthia', category: 'handwriting', variants: ['400', '700'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement', 'anniversary'] },
    { family: 'Fleur De Leah', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement'] },
    { family: 'Lavishly Yours', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement', 'anniversary'] },
    { family: 'Style Script', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'greeting-card'] },
    { family: 'Whisper', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement'] },
    { family: 'Imperial Script', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'anniversary'] },
    { family: 'Puppies Play', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'baby-shower', 'kids'] },
    { family: 'Love Light', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'engagement', 'anniversary'] },
    { family: 'Moon Dance', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement'] },
    { family: 'Petemoss', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation'] },
    { family: 'Shalimar', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'engagement'] },
    { family: 'Waterfall', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['wedding', 'invitation', 'greeting-card'] },

    // ============ ADDITIONAL HORROR & DARK FONTS ============
    { family: 'Ewert', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'dark', 'gothic'] },
    { family: 'Flavors', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'halloween', 'fun'] },
    { family: 'Fruktur', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'gothic', 'dark'] },
    { family: 'Griffy', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'halloween', 'scary'] },
    { family: 'Gwendolyn', category: 'handwriting', variants: ['400', '700'], subsets: ['latin'], themes: ['gothic', 'dark', 'mystery'] },
    { family: 'Underdog', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'dark'] },
    { family: 'Piedra', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'dark', 'gothic'] },
    { family: 'Rye', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'dark', 'mystery'] },
    { family: 'Sancreek', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'dark', 'gothic'] },
    { family: 'Smokum', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'dark'] },
    { family: 'Snowburst One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'dark', 'mystery'] },
    { family: 'Spirax', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'gothic', 'dark'] },
    { family: 'Trade Winds', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'mystery', 'dark'] },
    { family: 'Vampiro One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['horror', 'halloween', 'scary', 'dark'] },
    { family: 'Dokdo', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['horror', 'dark', 'thriller'] },
    { family: 'Emilys Candy', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['halloween', 'horror', 'fun'] },
    { family: 'Mystery Quest', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['mystery', 'thriller', 'dark'] },
    { family: 'Redacted Script', category: 'display', variants: ['300', '400', '700'], subsets: ['latin'], themes: ['mystery', 'thriller', 'dark'] },

    // ============ ADDITIONAL KIDS & PLAYFUL FONTS ============
    { family: 'Bubblegum Sans', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun', 'cartoon'] },
    { family: 'Cherry Cream Soda', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'playful'] },
    { family: 'Chicle', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Comic Neue', category: 'handwriting', variants: ['300', '400', '700'], subsets: ['latin'], themes: ['kids', 'cartoon', 'playful', 'fun'] },
    { family: 'Delius', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Delius Swash Caps', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful'] },
    { family: 'Delius Unicase', category: 'handwriting', variants: ['400', '700'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Finger Paint', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun', 'baby-shower'] },
    { family: 'Fuzzy Bubbles', category: 'handwriting', variants: ['400', '700'], subsets: ['latin'], themes: ['kids', 'playful', 'baby-shower'] },
    { family: 'Gorditas', category: 'display', variants: ['400', '700'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Grandstander', category: 'display', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['kids', 'playful', 'fun', 'cartoon'] },
    { family: 'Happy Monkey', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Itim', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Jua', category: 'sans-serif', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Kranky', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Lemon', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Love Ya Like A Sister', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Mali', category: 'handwriting', variants: ['200', '300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Montez', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'party'] },
    { family: 'Mountains of Christmas', category: 'display', variants: ['400', '700'], subsets: ['latin'], themes: ['kids', 'christmas', 'fun'] },
    { family: 'Nerko One', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Nanum Pen Script', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Patrick Hand SC', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Shantell Sans', category: 'display', variants: ['300', '400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['kids', 'playful', 'fun', 'cartoon'] },
    { family: 'Sniglet', category: 'display', variants: ['400', '800'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Sour Gummy', category: 'display', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },
    { family: 'Sunshiney', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'fun', 'playful'] },
    { family: 'Swanky and Moo Moo', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['kids', 'playful', 'fun'] },

    // ============ ADDITIONAL BUSINESS & CORPORATE FONTS ============
    { family: 'Archivo Narrow', category: 'sans-serif', variants: ['400', '500', '600', '700'], subsets: ['latin'], themes: ['corporate', 'business'] },
    { family: 'Be Vietnam Pro', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['corporate', 'business', 'startup'] },
    { family: 'Encode Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['corporate', 'technology'] },
    { family: 'Epilogue', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['corporate', 'business', 'startup'] },
    { family: 'Geist', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['corporate', 'technology', 'startup'] },
    { family: 'Hanken Grotesk', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['corporate', 'business'] },
    { family: 'Hind', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['corporate', 'business'] },
    { family: 'Libre Franklin', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['corporate', 'business', 'news'] },
    { family: 'Noto Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['corporate', 'business', 'technology'] },

    // ============ ADDITIONAL FESTIVAL FONTS (DIWALI, HOLI, CHRISTMAS) ============
    { family: 'Palanquin', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['diwali', 'holi'] },
    { family: 'Pavanam', category: 'sans-serif', variants: ['400'], subsets: ['latin'], themes: ['diwali', 'holi'] },
    { family: 'Tiro Devanagari Hindi', category: 'serif', variants: ['400'], subsets: ['latin'], themes: ['diwali', 'holi'] },
    { family: 'Yatra One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['diwali', 'holi', 'fun'] },
    { family: 'Festive', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['christmas', 'new-year', 'party'] },
    { family: 'Gloock', category: 'serif', variants: ['400'], subsets: ['latin'], themes: ['christmas', 'editorial'] },

    // ============ ADDITIONAL PARTY & FUN FONTS ============
    { family: 'Baloo Bhai 2', category: 'display', variants: ['400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['party', 'fun', 'diwali', 'holi'] },
    { family: 'Baloo Chettan 2', category: 'display', variants: ['400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['party', 'fun'] },
    { family: 'Baloo Da 2', category: 'display', variants: ['400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['party', 'fun'] },
    { family: 'Baloo Paaji 2', category: 'display', variants: ['400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['party', 'fun', 'diwali'] },
    { family: 'Baloo Tamma 2', category: 'display', variants: ['400', '500', '600', '700', '800'], subsets: ['latin'], themes: ['party', 'fun'] },
    { family: 'Ramabhadra', category: 'sans-serif', variants: ['400'], subsets: ['latin'], themes: ['party', 'fun', 'diwali'] },

    // ============ ADDITIONAL POSTER & ADVERTISING FONTS ============
    { family: 'Fjalla One', category: 'sans-serif', variants: ['400'], subsets: ['latin'], themes: ['poster', 'banner', 'sale'] },
    { family: 'Pathway Extreme', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['poster', 'banner'] },
    { family: 'Saira Condensed', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['poster', 'sale', 'promotion'] },
    { family: 'Saira Extra Condensed', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['poster', 'sale'] },
    { family: 'Saira Semi Condensed', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['poster', 'banner'] },
    { family: 'Alumni Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['poster', 'promotion'] },
    { family: 'Antonio', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['poster', 'banner'] },

    // ============ ADDITIONAL GREETING CARD & THANK YOU FONTS ============
    { family: 'Sorts Mill Goudy', category: 'serif', variants: ['400'], subsets: ['latin'], themes: ['greeting-card', 'thank-you', 'editorial'] },
    { family: 'Nanum Myeongjo', category: 'serif', variants: ['400', '700', '800'], subsets: ['latin'], themes: ['greeting-card', 'editorial'] },
    { family: 'Crimson Pro', category: 'serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['greeting-card', 'editorial', 'blog'] },

    // ============ ADDITIONAL BIRTHDAY & BABY SHOWER FONTS ============
    { family: 'Butterfly Kids', category: 'handwriting', variants: ['400'], subsets: ['latin'], themes: ['birthday', 'baby-shower', 'kids'] },
    { family: 'Henny Penny', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['birthday', 'kids', 'fun'] },
    { family: 'Londrina Outline', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['birthday', 'kids', 'party'] },
    { family: 'Londrina Shadow', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['birthday', 'party', 'fun'] },
    { family: 'Londrina Sketch', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['birthday', 'kids', 'playful'] },
    { family: 'Oleo Script', category: 'display', variants: ['400', '700'], subsets: ['latin'], themes: ['birthday', 'party', 'fun'] },
    { family: 'Oleo Script Swash Caps', category: 'display', variants: ['400', '700'], subsets: ['latin'], themes: ['birthday', 'party'] },
    { family: 'Sigmar One', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['birthday', 'party', 'kids'] },
    { family: 'Special Elite', category: 'display', variants: ['400'], subsets: ['latin'], themes: ['birthday', 'party'] },

    // ============ ADDITIONAL BLOG & ARTICLE FONTS ============
    { family: 'Source Serif Pro', category: 'serif', variants: ['200', '300', '400', '600', '700', '900'], subsets: ['latin'], themes: ['blog', 'article', 'editorial'] },
    { family: 'Literata', category: 'serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'], themes: ['blog', 'article', 'editorial'] },

    // ============ ADDITIONAL SOCIAL MEDIA FONTS ============
    { family: 'Signika', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['social-media', 'poster'] },
    { family: 'Signika Negative', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'], subsets: ['latin'], themes: ['social-media', 'poster'] },
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

/**
 * Get fonts by theme
 */
export function getFontsByTheme(theme: FontTheme): GoogleFont[] {
    return GOOGLE_FONTS.filter(font => font.themes?.includes(theme));
}

/**
 * Get all available themes
 */
export function getAllThemes(): FontTheme[] {
    return FONT_THEME_GROUPS.flatMap(group => group.themes.map(t => t.id));
}
