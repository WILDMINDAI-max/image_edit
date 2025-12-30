'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { BlendMode } from '@/types/canvas';

interface BlendModeOption {
    value: BlendMode;
    label: string;
}

interface BlendModeGroup {
    label: string;
    modes: BlendModeOption[];
}

// Blend mode categories matching Photoshop/Photopea - ALL 27 MODES
const BLEND_MODE_GROUPS: BlendModeGroup[] = [
    {
        label: 'Normal',
        modes: [
            { value: 'normal', label: 'Normal' },
            { value: 'dissolve', label: 'Dissolve' },
        ],
    },
    {
        label: 'Darken',
        modes: [
            { value: 'darken', label: 'Darken' },
            { value: 'multiply', label: 'Multiply' },
            { value: 'color-burn', label: 'Color Burn' },
            { value: 'linear-burn', label: 'Linear Burn' },
            { value: 'darker-color', label: 'Darker Color' },
        ],
    },
    {
        label: 'Lighten',
        modes: [
            { value: 'lighten', label: 'Lighten' },
            { value: 'screen', label: 'Screen' },
            { value: 'color-dodge', label: 'Color Dodge' },
            { value: 'linear-dodge', label: 'Linear Dodge (Add)' },
            { value: 'lighter-color', label: 'Lighter Color' },
        ],
    },
    {
        label: 'Contrast',
        modes: [
            { value: 'overlay', label: 'Overlay' },
            { value: 'soft-light', label: 'Soft Light' },
            { value: 'hard-light', label: 'Hard Light' },
            { value: 'vivid-light', label: 'Vivid Light' },
            { value: 'linear-light', label: 'Linear Light' },
            { value: 'pin-light', label: 'Pin Light' },
            { value: 'hard-mix', label: 'Hard Mix' },
        ],
    },
    {
        label: 'Inversion',
        modes: [
            { value: 'difference', label: 'Difference' },
            { value: 'exclusion', label: 'Exclusion' },
            { value: 'subtract', label: 'Subtract' },
            { value: 'divide', label: 'Divide' },
        ],
    },
    {
        label: 'Component',
        modes: [
            { value: 'hue', label: 'Hue' },
            { value: 'saturation', label: 'Saturation' },
            { value: 'color', label: 'Color' },
            { value: 'luminosity', label: 'Luminosity' },
        ],
    },
];

// Flat list of all blend modes for easy lookup
const ALL_BLEND_MODES: BlendModeOption[] = BLEND_MODE_GROUPS.flatMap(group => group.modes);

interface BlendModeSelectorProps {
    value: BlendMode;
    onChange: (mode: BlendMode) => void;
    disabled?: boolean;
    compact?: boolean;
}

export function BlendModeSelector({ value, onChange, disabled, compact }: BlendModeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    // Get display label for current value
    const currentLabel = ALL_BLEND_MODES.find(m => m.value === value)?.label || 'Normal';

    // Calculate dropdown position when opening
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Position dropdown to the right of the button, or below if not enough space
            setDropdownPosition({
                top: rect.top,
                left: rect.right + 8, // 8px gap from button
            });
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (mode: BlendMode) => {
        onChange(mode);
        setIsOpen(false);
    };

    return (
        <>
            {/* Trigger button */}
            <button
                ref={buttonRef}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    flex items-center justify-between gap-1 rounded-md border border-gray-200
                    bg-white hover:bg-gray-50 transition-colors
                    ${compact ? 'px-2 py-1 text-xs min-w-[90px]' : 'px-3 py-1.5 text-sm min-w-[120px]'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                `}
            >
                <span className="truncate font-medium text-gray-700">{currentLabel}</span>
                <ChevronDown size={compact ? 12 : 14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu - using fixed position to escape sidebar overflow */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="fixed z-[9999] w-52 bg-white border border-gray-200 rounded-lg shadow-2xl py-1"
                    style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        maxHeight: '70vh',
                        overflowY: 'auto',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#cbd5e1 #f1f5f9'
                    }}
                >
                    {BLEND_MODE_GROUPS.map((group, groupIndex) => (
                        <div key={group.label}>
                            {/* Group label */}
                            <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0">
                                {group.label}
                            </div>
                            {/* Mode options */}
                            {group.modes.map((mode) => (
                                <button
                                    key={mode.value}
                                    onClick={() => handleSelect(mode.value)}
                                    className={`
                                        w-full text-left px-3 py-1.5 text-sm transition-colors
                                        ${value === mode.value
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'}
                                    `}
                                >
                                    {mode.label}
                                </button>
                            ))}
                            {/* Separator between groups */}
                            {groupIndex < BLEND_MODE_GROUPS.length - 1 && (
                                <div className="my-1 border-t border-gray-100" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

