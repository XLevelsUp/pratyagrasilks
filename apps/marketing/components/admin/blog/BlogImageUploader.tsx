'use client';

import { useState, useRef } from 'react';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseImage } from '@pratyagra/core/utils/image';
import toast from 'react-hot-toast';
import type { ImageDisplayMode } from '@pratyagra/core/types';

interface BlogImageUploaderProps {
    imageUrl: string | null | undefined;
    onImageChange: (url: string | null) => void;
    alt: string;
    onAltChange: (alt: string) => void;
    displayMode: ImageDisplayMode;
    onDisplayModeChange: (mode: ImageDisplayMode) => void;
    label: string;
}

// Single-image variant of OptimizedUploader's signed-URL upload flow — one
// featured/section image at a time, with the cover/contain toggle the blog
// spec requires (product images never needed this, so it's new here).
export default function BlogImageUploader({
    imageUrl,
    onImageChange,
    alt,
    onAltChange,
    displayMode,
    onDisplayModeChange,
    label,
}: BlogImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file.');
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            toast.error(`Image (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 50MB limit.`);
            return;
        }

        setUploading(true);
        setProgress(10);

        try {
            const res1 = await fetch('/api/blog/get-upload-urls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filenames: [file.name] }),
            });
            if (!res1.ok) {
                const { error } = await res1.json() as { error: string };
                throw new Error(error || 'Could not get upload URL');
            }
            const { uploads } = await res1.json() as {
                uploads: { path: string; signedUrl: string; token: string }[];
            };
            setProgress(35);

            const supabase = createClient();
            const { path, token } = uploads[0];
            const { error: upError } = await supabase.storage
                .from('saree-images')
                .uploadToSignedUrl(path, token, file);
            if (upError) throw new Error('Failed to upload image to storage');
            setProgress(70);

            const res3 = await fetch('/api/blog/process-uploaded-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paths: [path] }),
            });
            if (!res3.ok) {
                const errorData = await res3.json() as { error: string };
                throw new Error(errorData.error || 'Image processing failed');
            }
            const { urls } = await res3.json() as { urls: string[] };
            if (urls.length === 0) throw new Error('Image processing failed');

            onImageChange(urls[0]);
            setProgress(100);
            toast.success('Image uploaded.');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to upload image';
            toast.error(message);
        } finally {
            setTimeout(() => {
                setUploading(false);
                setProgress(0);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }, 600);
        }
    };

    const inputId = `blog-image-upload-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className="space-y-3">
            {imageUrl ? (
                <div className="relative group w-full max-w-sm">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <Image
                            src={imageUrl}
                            alt={alt || label}
                            fill
                            className={displayMode === 'contain' ? 'object-contain' : 'object-cover'}
                            sizes="384px"
                            unoptimized={isSupabaseImage(imageUrl)}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => onImageChange(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove ${label}`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-amber-500 transition-colors max-w-sm">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                        id={inputId}
                    />
                    <label
                        htmlFor={inputId}
                        className={`flex flex-col items-center justify-center ${
                            uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                    >
                        {uploading ? (
                            <div className="w-full">
                                {progress === 100 ? (
                                    <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                ) : (
                                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
                                        <div
                                            className="bg-amber-600 h-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 text-center">
                                    {progress < 70 ? 'Uploading…' : 'Processing…'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm font-medium text-gray-700">Upload {label}</p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPEG, WebP</p>
                            </>
                        )}
                    </label>
                </div>
            )}

            {imageUrl && (
                <>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Alt text (for accessibility &amp; SEO)
                        </label>
                        <input
                            type="text"
                            value={alt}
                            onChange={(e) => onAltChange(e.target.value)}
                            placeholder="Describe the image for screen readers"
                            className="w-full max-w-sm px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-700">Display:</span>
                        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                            {(['cover', 'contain'] as ImageDisplayMode[]).map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => onDisplayModeChange(mode)}
                                    className={`px-3 py-1 text-xs font-medium capitalize transition-colors ${
                                        displayMode === mode
                                            ? 'bg-amber-600 text-white'
                                            : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
