'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, FileImage, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { uploadVendorDoc, getVendorDocSignedUrl, deleteVendorDoc } from '@/lib/supabase/storage-utils';
import toast from 'react-hot-toast';

const MAX_DOCS = 5;

interface DocState {
    path: string;       // storage path within vendor-docs bucket (saved to DB)
    previewUrl: string; // blob URL (new uploads) or signed URL (existing)
    fileName: string;
}

interface VendorDocUploaderProps {
    onPathsChange: (paths: string[]) => void;
    existingPaths?: string[];
}

export default function VendorDocUploader({
    onPathsChange,
    existingPaths = [],
}: VendorDocUploaderProps) {
    const [docs, setDocs] = useState<DocState[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const blobUrlsRef = useRef<string[]>([]); // track for cleanup

    // Load existing paths and generate signed URLs for display
    useEffect(() => {
        if (existingPaths.length === 0) return;
        (async () => {
            try {
                const loaded = await Promise.all(
                    existingPaths.map(async (path) => {
                        const signedUrl = await getVendorDocSignedUrl(path);
                        const fileName = path.replace(/^\d+_/, ''); // strip timestamp prefix
                        return { path, previewUrl: signedUrl, fileName };
                    })
                );
                setDocs(loaded);
                onPathsChange(loaded.map((d) => d.path));
            } catch {
                toast.error('Could not load existing documents.');
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Revoke blob URLs on unmount
    useEffect(() => {
        return () => {
            blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    const updateDocs = (next: DocState[]) => {
        setDocs(next);
        onPathsChange(next.map((d) => d.path));
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        const remaining = MAX_DOCS - docs.length;
        if (files.length > remaining) {
            toast.error(`You can add ${remaining} more document${remaining !== 1 ? 's' : ''} (max ${MAX_DOCS}).`);
            return;
        }

        const nonImages = files.filter((f) => !f.type.startsWith('image/'));
        if (nonImages.length > 0) {
            toast.error('Please select image files only (photo of bill, business card, etc.).');
            return;
        }

        setUploading(true);
        setProgress(0);

        const newDocs: DocState[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setProgress(Math.round((i / files.length) * 90));

                // Blob URL for immediate preview (revoked on unmount)
                const blobUrl = URL.createObjectURL(file);
                blobUrlsRef.current.push(blobUrl);

                const path = await uploadVendorDoc(file);

                newDocs.push({
                    path,
                    previewUrl: blobUrl,
                    fileName: file.name,
                });
            }

            setProgress(100);
            updateDocs([...docs, ...newDocs]);
            toast.success(`${newDocs.length} document${newDocs.length !== 1 ? 's' : ''} uploaded.`);
        } catch (err) {
            console.error('Vendor doc upload error:', err);
            toast.error('Upload failed. Please try again.');
            if (newDocs.length > 0) {
                updateDocs([...docs, ...newDocs]);
                toast.success(`Uploaded ${newDocs.length} of ${files.length} files.`);
            }
        } finally {
            setTimeout(() => {
                setUploading(false);
                setProgress(0);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }, 800);
        }
    };

    const handleRemove = async (index: number) => {
        const doc = docs[index];
        const next = docs.filter((_, i) => i !== index);
        updateDocs(next);

        // Best-effort delete from storage
        try {
            await deleteVendorDoc(doc.path);
        } catch {
            // Non-fatal — storage cleanup is not critical for form correctness
        }
    };

    const isFull = docs.length >= MAX_DOCS;

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                    isFull
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-amber-500 cursor-pointer'
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    disabled={uploading || isFull}
                    className="hidden"
                    id="vendor-doc-upload"
                />
                <label
                    htmlFor="vendor-doc-upload"
                    className={`flex flex-col items-center justify-center ${
                        uploading || isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                >
                    {uploading ? (
                        <div className="w-full max-w-xs">
                            <div className="flex items-center justify-center mb-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
                            </div>
                            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-amber-600 h-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                Compressing &amp; uploading… {progress}%
                            </p>
                        </div>
                    ) : isFull ? (
                        <>
                            <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                            <p className="text-sm text-gray-500">Maximum {MAX_DOCS} documents reached</p>
                        </>
                    ) : (
                        <>
                            <Upload className="w-10 h-10 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700">
                                Click to upload documents
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Photos of bills, business cards, KYC — up to {MAX_DOCS} files
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Auto-compressed &amp; converted to WebP · Max 1 MB each
                            </p>
                        </>
                    )}
                </label>
            </div>

            {/* Document thumbnails */}
            {docs.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                        Uploaded Documents ({docs.length}/{MAX_DOCS})
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {docs.map((doc, index) => (
                            <div key={doc.path} className="relative group">
                                {/* Thumbnail */}
                                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                    <Image
                                        src={doc.previewUrl}
                                        alt={doc.fileName}
                                        fill
                                        className="object-cover"
                                        sizes="96px"
                                        unoptimized // signed URLs may not be in next.config domains
                                    />
                                    {/* Overlay with filename */}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-[10px] truncate leading-tight">
                                            {doc.fileName}
                                        </p>
                                    </div>
                                </div>

                                {/* Number badge */}
                                <div className="absolute -top-1.5 -left-1.5 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold z-10">
                                    {index + 1}
                                </div>

                                {/* File icon fallback indicator */}
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-0">
                                    <FileImage className="w-3 h-3 text-white" />
                                </div>

                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                                    aria-label={`Remove ${doc.fileName}`}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
