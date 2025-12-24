'use client';

import { ANIMATION_PRESETS } from '@/types/animation';

export function AnimationsPanel() {
    const entranceAnimations = ANIMATION_PRESETS.filter(p => p.category === 'entrance');
    const exitAnimations = ANIMATION_PRESETS.filter(p => p.category === 'exit');
    const emphasisAnimations = ANIMATION_PRESETS.filter(p => p.category === 'emphasis');

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-white font-semibold">Animations</h2>
                <p className="text-gray-400 text-xs mt-1">
                    Select an element to apply animations
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* Entrance Animations */}
                <div className="mb-6">
                    <h3 className="text-gray-300 text-sm font-medium mb-3">Entrance</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {entranceAnimations.map((anim) => (
                            <button
                                key={anim.id}
                                className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-xs transition-colors text-center"
                            >
                                {anim.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Exit Animations */}
                <div className="mb-6">
                    <h3 className="text-gray-300 text-sm font-medium mb-3">Exit</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {exitAnimations.map((anim) => (
                            <button
                                key={anim.id}
                                className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-xs transition-colors text-center"
                            >
                                {anim.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Emphasis Animations */}
                <div className="mb-6">
                    <h3 className="text-gray-300 text-sm font-medium mb-3">Emphasis</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {emphasisAnimations.map((anim) => (
                            <button
                                key={anim.id}
                                className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-xs transition-colors text-center"
                            >
                                {anim.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Animation Settings */}
                <div className="mb-6">
                    <h3 className="text-gray-300 text-sm font-medium mb-3">Settings</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-gray-400 text-xs block mb-1">Duration</label>
                            <input
                                type="range"
                                min="100"
                                max="3000"
                                defaultValue="500"
                                className="w-full"
                            />
                            <div className="flex justify-between text-gray-500 text-xs">
                                <span>0.1s</span>
                                <span>3s</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs block mb-1">Delay</label>
                            <input
                                type="range"
                                min="0"
                                max="2000"
                                defaultValue="0"
                                className="w-full"
                            />
                            <div className="flex justify-between text-gray-500 text-xs">
                                <span>0s</span>
                                <span>2s</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs block mb-1">Easing</label>
                            <select className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-300 text-sm">
                                <option>ease-out</option>
                                <option>ease-in</option>
                                <option>ease-in-out</option>
                                <option>linear</option>
                                <option>bounce</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
