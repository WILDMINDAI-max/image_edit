'use client';

import { Sparkles } from 'lucide-react';

export function AnimationsPanel() {
    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <h2 className="text-gray-800 font-semibold text-sm">Animations</h2>
                    <span className="px-1.5 py-0.5 bg-violet-100 text-violet-600 text-[10px] font-semibold rounded">
                        Coming Soon
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center max-w-[200px]">
                    {/* Icon */}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                        <Sparkles size={28} className="text-violet-500" />
                    </div>

                    <h3 className="text-gray-800 font-medium text-sm mb-2">Element Animations</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">
                        Bring your designs to life with entrance, exit, and emphasis animations.
                    </p>
                </div>
            </div>
        </div>
    );
}
