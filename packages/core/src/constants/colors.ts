export const COLOR_FAMILIES = [
    { id: 'red',    name: 'Red',    hex: '#ef4444' },
    { id: 'pink',   name: 'Pink',   hex: '#ec4899' },
    { id: 'orange', name: 'Orange', hex: '#f97316' },
    { id: 'yellow', name: 'Yellow', hex: '#eab308' },
    { id: 'green',  name: 'Green',  hex: '#22c55e' },
    { id: 'blue',   name: 'Blue',   hex: '#3b82f6' },
    { id: 'purple', name: 'Purple', hex: '#a855f7' },
    { id: 'brown',  name: 'Brown',  hex: '#92400e' },
    { id: 'white',  name: 'White',  hex: '#f9fafb' },
    { id: 'black',  name: 'Black',  hex: '#111827' },
    { id: 'gold',   name: 'Gold',   hex: '#d97706' },
    { id: 'silver', name: 'Silver', hex: '#9ca3af' },
] as const;

export type ColorFamilyId = typeof COLOR_FAMILIES[number]['id'];

// IDs that need a visible border at rest (too light to see against white backgrounds)
export const LIGHT_COLOR_IDS: ReadonlySet<string> = new Set(['white', 'silver', 'yellow']);
