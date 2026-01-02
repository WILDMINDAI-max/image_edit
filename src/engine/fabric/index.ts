// Fabric Engine Index
// Re-export all Fabric.js utilities

export { FabricCanvas, getFabricCanvas, resetFabricCanvas } from './FabricCanvas';
export type { FabricCanvasOptions } from './FabricCanvas';

export { CustomText, createTextGradient, TEXT_PRESETS } from './CustomText';
export type { CustomTextOptions, TextPresetConfig } from './CustomText';

export {
    CustomImage,
    FILTER_PRESETS,
    loadImageFromFile,
    loadImageWithCORS
} from './CustomImage';
export type { CustomImageOptions, FilterPreset } from './CustomImage';

export {
    createBrightnessFilter,
    createContrastFilter,
    createSaturationFilter,
    createBlurFilter,
    createGrayscaleFilter,
    createSepiaFilter,
    createInvertFilter,
    createNoiseFilter,
    createPixelateFilter,
    createGammaFilter,
    createColorMatrixFilter,
    createDuotoneEffect,
    combineFilters,
    applyFiltersToImage,
    COLOR_MATRICES,
    FILTER_PRESETS_UI,
} from './Filters';
export type { FilterPresetUI } from './Filters';

export {
    SmartGuides,
    initSmartGuides,
    getSmartGuides,
    disposeSmartGuides,
    GUIDE_STYLES,
} from './SmartGuides';
export type { GuideLine, DistanceIndicator, SnapResult, ObjectBounds } from './SmartGuides';
