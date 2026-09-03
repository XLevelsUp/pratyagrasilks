'use client';

import { PieChart, Pie, Cell } from 'recharts';

interface SplitRingProps {
    leftLabel: string;
    leftValue: number;
    rightLabel: string;
    rightValue: number;
    leftColor: string;
    rightColor: string;
    leftHex: string;
    rightHex: string;
}

export default function SplitRing({
    leftLabel,
    leftValue,
    rightLabel,
    rightValue,
    leftColor,
    rightColor,
    leftHex,
    rightHex,
}: SplitRingProps) {
    const total = leftValue + rightValue;
    const data = total > 0 ? [{ value: leftValue }, { value: rightValue }] : [{ value: 1 }];
    const colors = total > 0 ? [leftHex, rightHex] : ['#e5e7eb'];

    return (
        <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
                <PieChart width={64} height={64}>
                    <Pie
                        data={data}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={22}
                        outerRadius={31}
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={colors[i]} />
                        ))}
                    </Pie>
                </PieChart>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[13px] font-semibold text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {total}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${leftColor}`} aria-hidden="true" />
                    <span className="text-gray-500">{leftLabel}</span>
                    <span className="font-semibold text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {leftValue.toLocaleString('en-IN')}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${rightColor}`} aria-hidden="true" />
                    <span className="text-gray-500">{rightLabel}</span>
                    <span className="font-semibold text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {rightValue.toLocaleString('en-IN')}
                    </span>
                </div>
            </div>
        </div>
    );
}
