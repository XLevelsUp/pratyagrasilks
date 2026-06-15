'use client';

import { useState, useRef } from 'react';
import { Upload, X, GripVertical, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { isSupabaseImage } from '@/lib/utils/image';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface OptimizedUploaderProps {
    onImagesChange: (urls: string[]) => void;
    existingImages?: string[];
    maxImages?: number;
}

export default function OptimizedUploader({
    onImagesChange,
    existingImages = [],
    maxImages = 10,
}: OptimizedUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [images, setImages] = useState<string[]>(existingImages);
    const [urlInput, setUrlInput] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateImages = (newImages: string[]) => {
        setImages(newImages);
        onImagesChange(newImages);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const maxSizeBytes = 50 * 1024 * 1024; // 50MB

        // Validate file types and sizes in one pass
        const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
        const oversizedFiles = files.filter(file => file.size > maxSizeBytes);

        // Show warnings for invalid/oversized files
        if (invalidFiles.length > 0) {
            toast.error(`${invalidFiles.length} file(s) not recognized as images. Accepted: PNG, JPEG, WebP, GIF, SVG`);
        }

        if (oversizedFiles.length > 0) {
            const sizes = oversizedFiles
                .map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(1)}MB)`)
                .join(', ');
            toast.error(`Skipping oversized files (>50MB): ${sizes}`);
        }

        // Filter to only valid files
        const validFiles = files.filter(
            file =>
                file.type.startsWith('image/') &&
                file.size <= maxSizeBytes
        );

        if (validFiles.length === 0) {
            // No valid files to upload
            if (invalidFiles.length > 0 || oversizedFiles.length > 0) {
                toast.error('No valid images to upload. Please check file types and sizes.');
            }
            return;
        }

        // Check total image count with valid files only
        if (images.length + validFiles.length > maxImages) {
            toast.error(`Maximum ${maxImages} images allowed. You can add ${maxImages - images.length} more.`);
            return;
        }

        setUploading(true);
        setProgress(5);

        const firstPreview = URL.createObjectURL(validFiles[0]);
        setPreviewUrl(firstPreview);

        try {
            // Step 1: Get signed upload URLs from server (tiny JSON request)
            const res1 = await fetch('/api/products/get-upload-urls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filenames: validFiles.map(f => f.name) }),
            });

            if (!res1.ok) {
                const { error } = await res1.json() as { error: string };
                throw new Error(error || 'Could not get upload URLs');
            }

            const { uploads } = await res1.json() as {
                uploads: { path: string; signedUrl: string; token: string }[];
            };

            setProgress(15);

            // Step 2: Upload raw files directly to Supabase — bypasses Vercel entirely, no size limit
            const supabase = createClient();
            const uploadResults = await Promise.allSettled(
                uploads.map(({ path, token }, i) =>
                    supabase.storage
                        .from('saree-images')
                        .uploadToSignedUrl(path, token, validFiles[i])
                )
            );

            // Check if any uploads failed
            const failedUploads = uploadResults.filter(r => r.status === 'rejected');
            if (failedUploads.length > 0) {
                throw new Error(`Failed to upload ${failedUploads.length} image(s) to storage`);
            }

            setProgress(70);

            // Step 3: Trigger server-side sharp processing (download → WebP → re-upload)
            const res3 = await fetch('/api/products/process-uploaded-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paths: uploads.map(u => u.path) }),
            });

            if (!res3.ok) {
                const errorData = await res3.json() as { error: string };
                throw new Error(errorData.error || 'Image processing failed');
            }

            const responseData = await res3.json() as { urls: string[]; partialFailure?: string };
            const { urls, partialFailure } = responseData;

            URL.revokeObjectURL(firstPreview);

            // Only add successfully processed images
            if (urls.length > 0) {
                const newImages = [...images, ...urls];
                updateImages(newImages);

                setProgress(100);
                
                if (partialFailure) {
                    toast.success(`Uploaded ${urls.length} of ${validFiles.length} images`);
                    toast.error(`Some images failed: ${partialFailure}`);
                } else {
                    toast.success(`Successfully uploaded ${urls.length} image${urls.length > 1 ? 's' : ''}!`);
                }
            } else {
                throw new Error(partialFailure || 'No images were processed successfully');
            }

            setTimeout(() => {
                setUploading(false);
                setPreviewUrl(null);
                setProgress(0);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }, 1000);

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to upload images';
            console.error('Upload error:', message);
            toast.error(message);
            URL.revokeObjectURL(firstPreview);
            setUploading(false);
            setPreviewUrl(null);
            setProgress(0);
        }
    };

    const handleUrlAdd = () => {
        if (!urlInput.trim()) return;

        const urls = urlInput
            .split(',')
            .map((url) => url.trim())
            .filter((url) => url);

        const validUrls = urls.filter((url) => {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        });

        if (validUrls.length === 0) {
            toast.error('Please enter valid image URLs');
            return;
        }

        if (images.length + validUrls.length > maxImages) {
            toast.error(`Maximum ${maxImages} images allowed. You can add ${maxImages - images.length} more.`);
            return;
        }

        const newImages = [...images, ...validUrls];
        updateImages(newImages);
        setUrlInput('');
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        updateImages(newImages);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null) return;

        const newImages = [...images];
        const [draggedImage] = newImages.splice(draggedIndex, 1);
        newImages.splice(dropIndex, 0, draggedImage);

        updateImages(newImages);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const getStatusText = () => {
        if (uploading && progress < 70) return 'Uploading...';
        if (uploading && progress >= 70) return 'Processing...';
        if (progress === 100) return 'Success!';
        return 'Select Images (Multiple)';
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-amber-500 transition-colors">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                    multiple
                    onChange={handleFileSelect}
                    disabled={uploading || images.length >= maxImages}
                    className="hidden"
                    id="image-upload"
                />
                <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center cursor-pointer ${uploading || images.length >= maxImages
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                        }`}
                >
                    {previewUrl ? (
                        <div className="relative w-full max-w-md">
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                width={400}
                                height={400}
                                className="rounded-lg object-cover"
                            />
                            {progress === 100 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    )}

                    <p className="text-sm font-medium text-gray-700 mb-1">{getStatusText()}</p>

                    {!uploading && (
                        <p className="text-xs text-gray-500">
                            PNG, JPEG, WebP, GIF, SVG • Server-processed WebP for maximum texture fidelity
                        </p>
                    )}

                    {/* Progress Bar */}
                    {uploading && (
                        <div className="w-full max-w-md mt-4">
                            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-amber-600 h-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-600 mt-2 text-center">{progress}%</p>
                        </div>
                    )}
                </label>
            </div>

            {/* URL Input */}
            <div className="hidden sm:block border-2 border-gray-300 rounded-lg p-4">
                <div className="flex items-start gap-2">
                    <LinkIcon className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Or add image URLs (comma-separated)
                        </label>
                        <textarea
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                            rows={2}
                            disabled={images.length >= maxImages}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleUrlAdd}
                        disabled={!urlInput.trim() || images.length >= maxImages}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Uploaded Images Grid with Drag & Drop */}
            {images.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                        Product Images ({images.length}/{maxImages})
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {images.map((url, index) => (
                            <div
                                key={index}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`relative group cursor-move transition-all ${draggedIndex === index ? 'opacity-50 scale-95' : ''
                                    } ${dragOverIndex === index && draggedIndex !== index
                                        ? 'ring-2 ring-amber-500 scale-105'
                                        : ''
                                    }`}
                            >
                                {/* Order Number */}
                                <div className="absolute -top-2 -left-2 bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
                                    {index + 1}
                                </div>

                                {/* Drag Handle */}
                                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <GripVertical className="w-4 h-4 text-white" />
                                </div>

                                {/* Image */}
                                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                                    <Image
                                        src={url}
                                        alt={`Product ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                        unoptimized={isSupabaseImage(url)}
                                    />
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    type="button"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        💡 Drag images to reorder them
                    </p>
                </div>
            )}
        </div>
    );
}
