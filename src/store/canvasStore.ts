// Canvas Store
// Element management and selection state using Zustand

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { fabric } from 'fabric';
import {
    CanvasElement,
    TextElement,
    ImageElement,
    ShapeElement,
    createDefaultTransform,
    createDefaultStyle,
    createDefaultTextStyle,
    createDefaultImageFilter,
    Transform,
    Style,
    CropData,
} from '@/types/canvas';
import { useEditorStore } from './editorStore';
import { useHistoryStore } from './historyStore';
import { getFabricCanvas } from '@/engine/fabric/FabricCanvas';

interface CropBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface CanvasState {
    // Selection state
    selectedIds: string[];
    hoveredId: string | null;

    // Clipboard
    clipboard: CanvasElement[];

    // Drag state
    isDragging: boolean;
    isResizing: boolean;
    isRotating: boolean;

    // Transform state for active operations
    activeTransform: Partial<Transform> | null;

    // Crop mode state
    cropMode: boolean;
    cropBounds: CropBounds | null;
    cropElementId: string | null;
}

interface CanvasActions {
    // Selection actions
    select: (id: string | string[], addToSelection?: boolean) => void;
    deselect: (id?: string) => void;
    selectAll: () => void;
    setHovered: (id: string | null) => void;

    // Element CRUD
    addElement: (element: CanvasElement) => void;
    addTextElement: (options?: Partial<TextElement>) => string;
    addImageElement: (src: string, options?: Partial<ImageElement>) => string;
    addShapeElement: (shapeType: string, options?: Partial<ShapeElement>) => string;
    updateElement: (id: string, updates: Partial<CanvasElement>) => void;
    removeElement: (id: string | string[]) => void;
    duplicateElements: (ids?: string[]) => string[];

    // Transform actions
    updateTransform: (id: string, transform: Partial<Transform>) => void;
    updateStyle: (id: string, style: Partial<Style>) => void;

    // Z-index operations
    bringToFront: (id: string) => void;
    sendToBack: (id: string) => void;
    bringForward: (id: string) => void;
    sendBackward: (id: string) => void;

    // Group operations
    groupElements: (ids: string[]) => string;
    ungroupElement: (groupId: string) => string[];

    // Layer operations
    lockElement: (id: string) => void;
    unlockElement: (id: string) => void;
    toggleVisibility: (id: string) => void;

    // Clipboard operations
    copy: () => void;
    cut: () => void;
    paste: () => void;

    // Drag state
    setDragging: (isDragging: boolean) => void;
    setResizing: (isResizing: boolean) => void;
    setRotating: (isRotating: boolean) => void;
    setActiveTransform: (transform: Partial<Transform> | null) => void;

    // Crop mode actions
    setCropMode: (enabled: boolean, elementId?: string) => void;
    setCropBounds: (bounds: CropBounds) => void;
    applyCrop: () => void;
    cancelCrop: () => void;

    // Utility
    getSelectedElements: () => CanvasElement[];
    getElement: (id: string) => CanvasElement | undefined;
    getElements: () => CanvasElement[];
}

export type CanvasStore = CanvasState & CanvasActions;

// Helper to get active page elements
const getActivePageElements = (): CanvasElement[] => {
    const project = useEditorStore.getState().project;
    if (!project) return [];
    const activePage = project.pages.find(p => p.id === project.activePageId);
    return activePage?.elements ?? [];
};

// Helper to update active page elements
const updateActivePageElements = (updater: (elements: CanvasElement[]) => void) => {
    const editorStore = useEditorStore.getState();
    if (!editorStore.project) return;

    const activePage = editorStore.project.pages.find(
        p => p.id === editorStore.project?.activePageId
    );
    if (activePage) {
        updater(activePage.elements);
        editorStore.markAsChanged();
    }
};

// Helper to push history state after changes
const pushHistory = (label: string) => {
    // Use setTimeout to ensure state is updated before capturing
    setTimeout(() => {
        useHistoryStore.getState().pushState(label);
    }, 0);
};

export const useCanvasStore = create<CanvasStore>()(
    immer((set, get) => ({
        // Initial state
        selectedIds: [],
        hoveredId: null,
        clipboard: [],
        isDragging: false,
        isResizing: false,
        isRotating: false,

        // Crop mode state
        cropMode: false,
        cropBounds: null,
        cropElementId: null,
        activeTransform: null,

        // Selection actions
        select: (id: string | string[], addToSelection = false) => {
            const ids = Array.isArray(id) ? id : [id];
            set((state) => {
                if (addToSelection) {
                    // Add to existing selection, avoiding duplicates
                    const newIds = ids.filter(i => !state.selectedIds.includes(i));
                    state.selectedIds.push(...newIds);
                } else {
                    state.selectedIds = ids;
                }
            });
        },

        deselect: (id?: string) => {
            set((state) => {
                if (id) {
                    state.selectedIds = state.selectedIds.filter(i => i !== id);
                } else {
                    state.selectedIds = [];
                }
            });
        },

        selectAll: () => {
            const elements = getActivePageElements();
            set((state) => {
                state.selectedIds = elements
                    .filter(e => !e.locked && e.selectable)
                    .map(e => e.id);
            });
        },

        setHovered: (id: string | null) => {
            set((state) => {
                state.hoveredId = id;
            });
        },

        // Element CRUD
        addElement: (element: CanvasElement) => {
            const editorStore = useEditorStore.getState();
            if (!editorStore.project) return;

            editorStore.updatePage(editorStore.project.activePageId, {
                elements: [...getActivePageElements(), element],
            });

            // Add element to Fabric.js canvas
            const fabricCanvas = getFabricCanvas();
            fabricCanvas.addElement(element);

            set((state) => {
                state.selectedIds = [element.id];
            });

            pushHistory(`Add ${element.type}`);
        },

        addTextElement: (options?: Partial<TextElement>) => {
            const id = crypto.randomUUID();
            const elements = getActivePageElements();
            const maxZIndex = elements.length > 0
                ? Math.max(...elements.map(e => e.zIndex))
                : 0;

            // Get canvas dimensions to center the text
            const project = useEditorStore.getState().project;
            const activePage = project?.pages.find(p => p.id === project.activePageId);
            const canvasWidth = activePage?.width || 1080;
            const canvasHeight = activePage?.height || 1080;

            // Default text box width - wide enough for text to wrap nicely
            const defaultWidth = Math.min(canvasWidth * 0.6, 400);

            // Build base transform, then apply options, then ensure x/y are centered
            const baseTransform = {
                ...createDefaultTransform(),
                width: defaultWidth,
                height: 50,
                scaleX: 1,
                scaleY: 1,
            };

            // Merge with options transform (if any), but exclude x/y from options
            const optionsTransform = options?.transform || {};
            const mergedTransform = {
                ...baseTransform,
                ...optionsTransform,
                // ALWAYS center the text on canvas (override any x/y from options)
                x: canvasWidth / 2,
                y: canvasHeight / 2,
            };

            // Create element without spreading options at the end (to avoid overriding transform)
            const textElement: TextElement = {
                id,
                type: 'text',
                name: options?.name ?? 'Text',
                content: options?.content ?? 'Click to edit text',
                transform: mergedTransform,
                style: { ...createDefaultStyle(), fill: '#1a1a1a', ...options?.style },
                textStyle: { ...createDefaultTextStyle(), ...options?.textStyle },
                effect: options?.effect ?? { type: 'none' },
                locked: options?.locked ?? false,
                visible: options?.visible ?? true,
                selectable: options?.selectable ?? true,
                editable: options?.editable ?? true,
                zIndex: maxZIndex + 1,
            };

            get().addElement(textElement);
            return id;
        },

        addImageElement: (src: string, options?: Partial<ImageElement>) => {
            const id = crypto.randomUUID();
            const elements = getActivePageElements();
            const maxZIndex = elements.length > 0
                ? Math.max(...elements.map(e => e.zIndex))
                : 0;

            const imageElement: ImageElement = {
                id,
                type: 'image',
                name: 'Image',
                src,
                originalSrc: src,
                transform: { ...createDefaultTransform(), width: 200, height: 200, ...options?.transform },
                style: { ...createDefaultStyle(), fill: null, ...options?.style },
                filters: { ...createDefaultImageFilter(), ...options?.filters },
                crop: null,
                colorReplace: null,
                crossOrigin: 'anonymous',
                locked: false,
                visible: true,
                selectable: true,
                zIndex: maxZIndex + 1,
                ...options,
            };

            get().addElement(imageElement);
            return id;
        },

        addShapeElement: (shapeType: string, options?: Partial<ShapeElement>) => {
            const id = crypto.randomUUID();
            const elements = getActivePageElements();
            const maxZIndex = elements.length > 0
                ? Math.max(...elements.map(e => e.zIndex))
                : 0;

            const shapeElement: ShapeElement = {
                id,
                type: 'shape',
                name: `Shape (${shapeType})`,
                shapeType: shapeType as ShapeElement['shapeType'],
                transform: { ...createDefaultTransform(), ...options?.transform },
                style: { ...createDefaultStyle(), fill: '#4A90D9', ...options?.style },
                locked: false,
                visible: true,
                selectable: true,
                zIndex: maxZIndex + 1,
                ...options,
            };

            get().addElement(shapeElement);
            return id;
        },

        updateElement: (id: string, updates: Partial<CanvasElement>) => {
            const editorStore = useEditorStore.getState();
            if (!editorStore.project) return;

            const elements = getActivePageElements();
            const updatedElements = elements.map(el =>
                el.id === id ? { ...el, ...updates } as CanvasElement : el
            );

            editorStore.updatePage(editorStore.project.activePageId, {
                elements: updatedElements,
            });
        },

        removeElement: (id: string | string[]) => {
            const ids = Array.isArray(id) ? id : [id];
            const editorStore = useEditorStore.getState();
            if (!editorStore.project) return;

            const elements = getActivePageElements();
            const updatedElements = elements.filter(el => !ids.includes(el.id));

            // Remove objects from Fabric.js canvas
            const fabricCanvas = getFabricCanvas();
            ids.forEach(elementId => {
                fabricCanvas.removeObject(elementId);
            });

            editorStore.updatePage(editorStore.project.activePageId, {
                elements: updatedElements,
            });

            set((state) => {
                state.selectedIds = state.selectedIds.filter(i => !ids.includes(i));
            });

            pushHistory(`Delete ${ids.length} element(s)`);
        },

        duplicateElements: (ids?: string[]) => {
            const targetIds = ids ?? get().selectedIds;
            if (targetIds.length === 0) return [];

            const elements = getActivePageElements();
            const duplicatedIds: string[] = [];

            const elementsToDuplicate = elements.filter(el => targetIds.includes(el.id));
            const newElements = elementsToDuplicate.map(el => {
                const newId = crypto.randomUUID();
                duplicatedIds.push(newId);
                return {
                    ...JSON.parse(JSON.stringify(el)),
                    id: newId,
                    // Remove existing (Copy) suffix before adding new one
                    name: `${el.name.replace(/\s*\(Copy\)$/i, '')} (Copy)`,
                    transform: {
                        ...el.transform,
                        x: el.transform.x + 20,
                        y: el.transform.y + 20,
                    },
                };
            });

            const editorStore = useEditorStore.getState();
            if (editorStore.project) {
                editorStore.updatePage(editorStore.project.activePageId, {
                    elements: [...elements, ...newElements],
                });
            }

            // Sync to Fabric.js canvas
            const fabricCanvas = getFabricCanvas();
            newElements.forEach(el => {
                fabricCanvas.addElement(el as CanvasElement);
            });

            set((state) => {
                state.selectedIds = duplicatedIds;
            });

            // Select the duplicated elements on canvas
            fabricCanvas.selectObjects(duplicatedIds);

            pushHistory(`Duplicate ${duplicatedIds.length} element(s)`);

            return duplicatedIds;
        },

        // Transform actions
        updateTransform: (id: string, transform: Partial<Transform>) => {
            const elements = getActivePageElements();
            const element = elements.find(el => el.id === id);
            if (element) {
                get().updateElement(id, {
                    transform: { ...element.transform, ...transform },
                });

                // Sync to Fabric.js canvas
                const fabricCanvas = getFabricCanvas();
                fabricCanvas.updateElementTransform(id, transform);
            }
        },

        updateStyle: (id: string, style: Partial<Style>) => {
            const elements = getActivePageElements();
            const element = elements.find(el => el.id === id);
            if (element) {
                get().updateElement(id, {
                    style: { ...element.style, ...style },
                });

                // Sync to Fabric.js canvas
                const fabricCanvas = getFabricCanvas();
                fabricCanvas.updateElementStyle(id, style as any);
            }
        },

        // Z-index operations
        bringToFront: (id: string) => {
            const elements = getActivePageElements();
            const maxZIndex = Math.max(...elements.map(e => e.zIndex));
            get().updateElement(id, { zIndex: maxZIndex + 1 });

            // Sync with Fabric.js canvas
            const fabricCanvas = getFabricCanvas();
            const obj = fabricCanvas.getObjectById(id);
            const canvas = fabricCanvas.getCanvas();
            if (obj && canvas) {
                canvas.bringToFront(obj);
                canvas.renderAll();
            }
        },

        sendToBack: (id: string) => {
            const elements = getActivePageElements();
            const minZIndex = Math.min(...elements.map(e => e.zIndex));
            get().updateElement(id, { zIndex: minZIndex - 1 });

            // Sync with Fabric.js canvas
            const fabricCanvas = getFabricCanvas();
            const obj = fabricCanvas.getObjectById(id);
            const canvas = fabricCanvas.getCanvas();
            if (obj && canvas) {
                canvas.sendToBack(obj);
                canvas.renderAll();
            }
        },

        bringForward: (id: string) => {
            const elements = getActivePageElements();
            const element = elements.find(e => e.id === id);
            if (element) {
                get().updateElement(id, { zIndex: element.zIndex + 1 });

                // Sync with Fabric.js canvas
                const fabricCanvas = getFabricCanvas();
                const obj = fabricCanvas.getObjectById(id);
                const canvas = fabricCanvas.getCanvas();
                if (obj && canvas) {
                    canvas.bringForward(obj);
                    canvas.renderAll();
                }
            }
        },

        sendBackward: (id: string) => {
            const elements = getActivePageElements();
            const element = elements.find(e => e.id === id);
            if (element) {
                get().updateElement(id, { zIndex: element.zIndex - 1 });

                // Sync with Fabric.js canvas
                const fabricCanvas = getFabricCanvas();
                const obj = fabricCanvas.getObjectById(id);
                const canvas = fabricCanvas.getCanvas();
                if (obj && canvas) {
                    canvas.sendBackwards(obj);
                    canvas.renderAll();
                }
            }
        },

        // Group operations
        groupElements: (ids: string[]) => {
            // TODO: Implement grouping
            const groupId = crypto.randomUUID();
            return groupId;
        },

        ungroupElement: (groupId: string) => {
            // TODO: Implement ungrouping
            return [];
        },

        // Layer operations
        lockElement: (id: string) => {
            get().updateElement(id, { locked: true, selectable: false });

            // Sync to Fabric.js canvas
            const fabricCanvas = getFabricCanvas();
            const obj = fabricCanvas.getObjectById(id);
            const canvas = fabricCanvas.getCanvas();
            if (obj && canvas) {
                obj.set({
                    selectable: false,
                    evented: false,
                    hasControls: false,
                    hasBorders: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    lockRotation: true,
                    lockScalingX: true,
                    lockScalingY: true,
                });
                canvas.discardActiveObject();
                canvas.renderAll();
            }

            set((state) => {
                state.selectedIds = state.selectedIds.filter(i => i !== id);
            });
        },

        unlockElement: (id: string) => {
            get().updateElement(id, { locked: false, selectable: true });

            // Sync to Fabric.js canvas
            const fabricCanvas = getFabricCanvas();
            const obj = fabricCanvas.getObjectById(id);
            const canvas = fabricCanvas.getCanvas();
            if (obj && canvas) {
                obj.set({
                    selectable: true,
                    evented: true,
                    hasControls: true,
                    hasBorders: true,
                    lockMovementX: false,
                    lockMovementY: false,
                    lockRotation: false,
                    lockScalingX: false,
                    lockScalingY: false,
                });
                canvas.renderAll();
            }
        },

        toggleVisibility: (id: string) => {
            const elements = getActivePageElements();
            const element = elements.find(el => el.id === id);
            if (element) {
                get().updateElement(id, { visible: !element.visible });
            }
        },

        // Clipboard operations
        copy: () => {
            const selectedIds = get().selectedIds;
            const elements = getActivePageElements();
            const selectedElements = elements.filter(el => selectedIds.includes(el.id));

            set((state) => {
                state.clipboard = JSON.parse(JSON.stringify(selectedElements));
            });
        },

        cut: () => {
            get().copy();
            get().removeElement(get().selectedIds);
        },

        paste: () => {
            const { clipboard } = get();
            if (clipboard.length === 0) return;

            const elements = getActivePageElements();
            const maxZIndex = elements.length > 0
                ? Math.max(...elements.map(e => e.zIndex))
                : 0;

            const pastedIds: string[] = [];
            const pastedElements = clipboard.map((el, index) => {
                const newId = crypto.randomUUID();
                pastedIds.push(newId);
                return {
                    ...JSON.parse(JSON.stringify(el)),
                    id: newId,
                    transform: {
                        ...el.transform,
                        x: el.transform.x + 20,
                        y: el.transform.y + 20,
                    },
                    zIndex: maxZIndex + index + 1,
                };
            });

            const editorStore = useEditorStore.getState();
            if (editorStore.project) {
                editorStore.updatePage(editorStore.project.activePageId, {
                    elements: [...elements, ...pastedElements],
                });
            }

            // Sync to Fabric.js canvas
            const fabricCanvas = getFabricCanvas();
            pastedElements.forEach(el => {
                fabricCanvas.addElement(el as CanvasElement);
            });

            set((state) => {
                state.selectedIds = pastedIds;
            });

            // Select the pasted elements on canvas
            fabricCanvas.selectObjects(pastedIds);
        },

        // Drag state
        setDragging: (isDragging: boolean) => {
            set((state) => {
                state.isDragging = isDragging;
            });
        },

        setResizing: (isResizing: boolean) => {
            set((state) => {
                state.isResizing = isResizing;
            });
        },

        setRotating: (isRotating: boolean) => {
            set((state) => {
                state.isRotating = isRotating;
            });
        },

        setActiveTransform: (transform: Partial<Transform> | null) => {
            set((state) => {
                state.activeTransform = transform;
            });
        },

        // Utility
        getSelectedElements: () => {
            const selectedIds = get().selectedIds;
            const elements = getActivePageElements();
            return elements.filter(el => selectedIds.includes(el.id));
        },

        getElement: (id: string) => {
            const elements = getActivePageElements();
            return elements.find(el => el.id === id);
        },

        getElements: () => {
            return getActivePageElements();
        },

        // Crop mode actions
        setCropMode: (enabled: boolean, elementId?: string) => {
            if (enabled && elementId) {
                const element = get().getElement(elementId);
                if (element && element.type === 'image') {
                    // Initialize crop bounds to element's current bounds
                    const width = element.transform.width * Math.abs(element.transform.scaleX);
                    const height = element.transform.height * Math.abs(element.transform.scaleY);
                    set((state) => {
                        state.cropMode = true;
                        state.cropElementId = elementId;
                        state.cropBounds = {
                            x: element.transform.x - width / 2,
                            y: element.transform.y - height / 2,
                            width: width,
                            height: height,
                        };
                    });
                }
            } else {
                set((state) => {
                    state.cropMode = false;
                    state.cropBounds = null;
                    state.cropElementId = null;
                });
            }
        },

        setCropBounds: (bounds) => {
            set((state) => {
                state.cropBounds = bounds;
            });
        },

        applyCrop: () => {
            const { cropBounds, cropElementId } = get();
            if (!cropBounds || !cropElementId) return;

            const element = get().getElement(cropElementId);
            if (!element || element.type !== 'image') return;

            const imageElement = element as ImageElement;
            const fabricCanvas = getFabricCanvas();
            const fabricObj = fabricCanvas.getObjectById(cropElementId) as fabric.Image | undefined;

            if (!fabricObj) return;

            // Get the underlying image element
            const imgElement = fabricCanvas.getImageElement(cropElementId);
            if (!imgElement) return;

            // Get the fabric object's current state
            const imgLeft = fabricObj.left || 0;
            const imgTop = fabricObj.top || 0;
            const imgScaleX = Math.abs(fabricObj.scaleX || 1);
            const imgScaleY = Math.abs(fabricObj.scaleY || 1);
            const imgWidth = fabricObj.width || 0;
            const imgHeight = fabricObj.height || 0;

            // Image actual bounds (accounting for center origin)
            const imgActualLeft = imgLeft - (imgWidth * imgScaleX) / 2;
            const imgActualTop = imgTop - (imgHeight * imgScaleY) / 2;

            // Calculate crop rectangle in image-local coordinates (unscaled, in original image pixels)
            const cropX = (cropBounds.x - imgActualLeft) / imgScaleX;
            const cropY = (cropBounds.y - imgActualTop) / imgScaleY;
            const cropWidth = cropBounds.width / imgScaleX;
            const cropHeight = cropBounds.height / imgScaleY;

            // Create a temporary canvas to crop the image
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cropWidth;
            tempCanvas.height = cropHeight;
            const ctx = tempCanvas.getContext('2d');

            if (!ctx) return;

            // Draw the cropped portion of the original image
            ctx.drawImage(
                imgElement,
                cropX, cropY, cropWidth, cropHeight,  // Source rectangle
                0, 0, cropWidth, cropHeight  // Destination rectangle
            );

            // Get the cropped image as data URL
            const croppedDataUrl = tempCanvas.toDataURL('image/png');

            // Calculate new position (center of crop box)
            const newCenterX = cropBounds.x + cropBounds.width / 2;
            const newCenterY = cropBounds.y + cropBounds.height / 2;

            // Remove the old image from fabric canvas
            const canvas = fabricCanvas.getCanvas();
            if (canvas) {
                canvas.remove(fabricObj);
            }

            // Create new fabric image from cropped data
            fabric.Image.fromURL(croppedDataUrl, (croppedImg) => {
                if (!canvas) return;

                croppedImg.set({
                    left: newCenterX,
                    top: newCenterY,
                    scaleX: imgScaleX * (fabricObj.scaleX! >= 0 ? 1 : -1),
                    scaleY: imgScaleY * (fabricObj.scaleY! >= 0 ? 1 : -1),
                    angle: fabricObj.angle || 0,
                    originX: 'center',
                    originY: 'center',
                    opacity: fabricObj.opacity,
                    selectable: true,
                    data: { id: cropElementId, type: 'image' },
                });

                canvas.add(croppedImg);
                canvas.setActiveObject(croppedImg);
                canvas.renderAll();

                // Update the object ID map
                fabricCanvas.setObjectById(cropElementId, croppedImg);

                // Update element in store
                get().updateElement(cropElementId, {
                    src: croppedDataUrl,
                    transform: {
                        ...imageElement.transform,
                        x: newCenterX,
                        y: newCenterY,
                        width: cropWidth,
                        height: cropHeight,
                        scaleX: imgScaleX * (imageElement.transform.scaleX >= 0 ? 1 : -1),
                        scaleY: imgScaleY * (imageElement.transform.scaleY >= 0 ? 1 : -1),
                    },
                    crop: null, // Clear crop data since we've actually cropped
                });

                pushHistory('Crop image');
            }, { crossOrigin: 'anonymous' });

            // Exit crop mode
            set((state) => {
                state.cropMode = false;
                state.cropBounds = null;
                state.cropElementId = null;
            });
        },

        cancelCrop: () => {
            set((state) => {
                state.cropMode = false;
                state.cropBounds = null;
                state.cropElementId = null;
            });
        },
    }))
);

// Selector hooks
// Note: To get selected elements, use the store's getSelectedElements() method
// outside of React's render cycle, or use the selectedIds selector and derive elements
export const useSelectedIds = () => {
    return useCanvasStore((state) => state.selectedIds);
};

export const useIsSelected = (id: string) => {
    return useCanvasStore((state) => state.selectedIds.includes(id));
};
