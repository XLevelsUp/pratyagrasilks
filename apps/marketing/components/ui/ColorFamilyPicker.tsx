'use client';

import { COLOR_FAMILIES, LIGHT_COLOR_IDS } from '@/lib/constants/colors';

interface ColorFamilyPickerProps {
    value: string[];
    onChange: (ids: string[]) => void;
    size?: 'sm' | 'md';
}

export default function ColorFamilyPicker({ value, onChange, size = 'md' }: ColorFamilyPickerProps) {
    const dim = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
    const showBadges = size === 'md';

    const toggle = (id: string) => {
        const idx = value.indexOf(id);
        if (idx !== -1) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {COLOR_FAMILIES.map(({ id, name, hex }) => {
                const selIdx = value.indexOf(id);
                const isSelected = selIdx !== -1;
                const isLight = LIGHT_COLOR_IDS.has(id);

                return (
                    <button
                        key={id}
                        type="button"
                        title={isSelected ? `${name} (#${selIdx + 1})` : name}
                        aria-label={name}
                        aria-pressed={isSelected}
                        onClick={() => toggle(id)}
                        className={[
                            dim,
                            'relative rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black',
                            isLight ? 'ring-1 ring-gray-300' : '',
                            isSelected
                                ? 'ring-2 ring-offset-2 ring-black scale-110'
                                : 'hover:scale-105',
                        ].join(' ')}
                        style={{ backgroundColor: hex }}
                    >
                        {showBadges && isSelected && (
                            <span className="absolute bottom-0 right-0 translate-x-1 translate-y-1 w-3.5 h-3.5 rounded-full bg-black text-white text-[8px] font-bold flex items-center justify-center leading-none pointer-events-none">
                                {selIdx + 1}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
