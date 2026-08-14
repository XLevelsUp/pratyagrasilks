'use client';

interface DateRangeFilterProps {
    from: string;
    to: string;
    onChange: (range: { from: string; to: string }) => void;
}

function istTodayStr(): string {
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    return new Date(Date.now() + IST_OFFSET_MS).toISOString().split('T')[0];
}

function daysAgoStr(days: number): string {
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const d = new Date(Date.now() + IST_OFFSET_MS - days * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
}

const PRESETS = [
    { label: 'Today', from: () => istTodayStr(), to: () => istTodayStr() },
    { label: '7d', from: () => daysAgoStr(6), to: () => istTodayStr() },
    { label: '30d', from: () => daysAgoStr(29), to: () => istTodayStr() },
    { label: '1y', from: () => daysAgoStr(364), to: () => istTodayStr() },
];

export default function DateRangeFilter({ from, to, onChange }: DateRangeFilterProps) {
    return (
        <div className="flex flex-wrap items-center gap-3 bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2">
                {PRESETS.map((preset) => {
                    const presetFrom = preset.from();
                    const presetTo = preset.to();
                    const isActive = from === presetFrom && to === presetTo;
                    return (
                        <button
                            key={preset.label}
                            onClick={() => onChange({ from: presetFrom, to: presetTo })}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {preset.label}
                        </button>
                    );
                })}
            </div>
            <div className="flex items-center gap-2 ml-auto">
                <input
                    type="date"
                    value={from}
                    max={to}
                    onChange={(e) => onChange({ from: e.target.value, to })}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700"
                />
                <span className="text-gray-400 text-sm">to</span>
                <input
                    type="date"
                    value={to}
                    min={from}
                    max={istTodayStr()}
                    onChange={(e) => onChange({ from, to: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700"
                />
            </div>
        </div>
    );
}
