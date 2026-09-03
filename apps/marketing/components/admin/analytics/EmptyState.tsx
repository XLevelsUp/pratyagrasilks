import { LucideIcon, BarChart3 } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title?: string;
    message?: string;
}

export default function EmptyState({
    icon: Icon = BarChart3,
    title = 'No data in this range',
    message = 'Try expanding the date range or check back once new orders come in.',
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium">{title}</p>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">{message}</p>
        </div>
    );
}
