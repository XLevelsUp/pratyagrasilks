'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, GripVertical, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { createPost, updatePost, getCategories } from '@/lib/actions/blog-admin.actions';
import type { BlogPost, BlogPostInput, BlogCategory, ImageDisplayMode } from '@/lib/types';
import BlogImageUploader from './BlogImageUploader';
import RichTextEditor from './RichTextEditor';

interface SectionFormState {
    blockType: 'section' | 'callout';
    heading: string;
    bodyHtml: string;
    secondImageUrl: string | null;
    secondImageAlt: string;
    secondImageMode: ImageDisplayMode;
    subsections: { heading: string; bodyHtml: string }[];
}

interface QnaFormState {
    question: string;
    answer: string;
}

interface CtaButtonFormState {
    label: string;
    url: string;
}

function slugify(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function toDateInputValue(date: Date): string {
    return date.toISOString().slice(0, 10);
}

interface BlogPostFormProps {
    initialData?: BlogPost;
}

export default function BlogPostForm({ initialData }: BlogPostFormProps) {
    const router = useRouter();
    const isEdit = !!initialData;

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [slugTouched, setSlugTouched] = useState(isEdit);

    const [title, setTitle] = useState(initialData?.title ?? '');
    const [slug, setSlug] = useState(initialData?.slug ?? '');
    const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(initialData?.featuredImageUrl ?? null);
    const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData?.featuredImageAlt ?? '');
    const [featuredImageMode, setFeaturedImageMode] = useState<ImageDisplayMode>(initialData?.featuredImageMode ?? 'cover');
    const [introHtml, setIntroHtml] = useState(initialData?.introHtml ?? '');
    const [categorySlug, setCategorySlug] = useState<string>(initialData?.categorySlug ?? '');
    const [author, setAuthor] = useState(initialData?.author ?? 'Pratyagra Team');
    const [tagsInput, setTagsInput] = useState((initialData?.tags ?? []).join(', '));
    const [readingTime, setReadingTime] = useState(initialData?.readingTimeMinutes ?? 1);
    const [publishedAt, setPublishedAt] = useState(
        initialData ? toDateInputValue(initialData.publishedAt) : toDateInputValue(new Date()),
    );
    const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription ?? '');
    const [ctaIntroText, setCtaIntroText] = useState(initialData?.ctaIntroText ?? '');

    const [sections, setSections] = useState<SectionFormState[]>(
        (initialData?.sections ?? []).map((s) => ({
            blockType: s.blockType,
            heading: s.heading ?? '',
            bodyHtml: s.bodyHtml,
            secondImageUrl: s.secondImageUrl ?? null,
            secondImageAlt: s.secondImageAlt ?? '',
            secondImageMode: s.secondImageMode,
            subsections: s.subsections.map((sub) => ({ heading: sub.heading ?? '', bodyHtml: sub.bodyHtml })),
        })),
    );
    const [qna, setQna] = useState<QnaFormState[]>(
        (initialData?.qna ?? []).map((q) => ({ question: q.question, answer: q.answer })),
    );
    const [ctaButtons, setCtaButtons] = useState<CtaButtonFormState[]>(
        (initialData?.ctaButtons ?? []).map((b) => ({ label: b.label, url: b.url })),
    );

    useEffect(() => {
        getCategories().then(setCategories).catch(() => {
            toast.error('Could not load categories.');
        });
    }, []);

    useEffect(() => {
        if (!slugTouched) setSlug(slugify(title));
    }, [title, slugTouched]);

    // ── Sections ─────────────────────────────────────────────────────────
    const addSection = () => {
        setSections((prev) => [
            ...prev,
            { blockType: 'section', heading: '', bodyHtml: '', secondImageUrl: null, secondImageAlt: '', secondImageMode: 'cover', subsections: [] },
        ]);
    };
    const removeSection = (i: number) => setSections((prev) => prev.filter((_, idx) => idx !== i));
    const updateSection = (i: number, patch: Partial<SectionFormState>) => {
        setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
    };
    const addSubsection = (sectionIndex: number) => {
        setSections((prev) =>
            prev.map((s, idx) =>
                idx === sectionIndex ? { ...s, subsections: [...s.subsections, { heading: '', bodyHtml: '' }] } : s,
            ),
        );
    };
    const removeSubsection = (sectionIndex: number, subIndex: number) => {
        setSections((prev) =>
            prev.map((s, idx) =>
                idx === sectionIndex ? { ...s, subsections: s.subsections.filter((_, j) => j !== subIndex) } : s,
            ),
        );
    };
    const updateSubsection = (sectionIndex: number, subIndex: number, patch: Partial<{ heading: string; bodyHtml: string }>) => {
        setSections((prev) =>
            prev.map((s, idx) =>
                idx === sectionIndex
                    ? { ...s, subsections: s.subsections.map((sub, j) => (j === subIndex ? { ...sub, ...patch } : sub)) }
                    : s,
            ),
        );
    };

    // ── Q&A ──────────────────────────────────────────────────────────────
    const addQna = () => setQna((prev) => [...prev, { question: '', answer: '' }]);
    const removeQna = (i: number) => setQna((prev) => prev.filter((_, idx) => idx !== i));
    const updateQna = (i: number, patch: Partial<QnaFormState>) =>
        setQna((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

    // ── CTA buttons ──────────────────────────────────────────────────────
    const addCtaButton = () => setCtaButtons((prev) => [...prev, { label: '', url: '' }]);
    const removeCtaButton = (i: number) => setCtaButtons((prev) => prev.filter((_, idx) => idx !== i));
    const updateCtaButton = (i: number, patch: Partial<CtaButtonFormState>) =>
        setCtaButtons((prev) => prev.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Title is required.');
            return;
        }
        if (!slug.trim()) {
            toast.error('Slug is required.');
            return;
        }

        setLoading(true);
        try {
            const input: BlogPostInput = {
                slug: slug.trim(),
                title: title.trim(),
                featuredImageUrl,
                featuredImageAlt: featuredImageAlt.trim() || null,
                featuredImageMode,
                introHtml,
                categorySlug: categorySlug || null,
                author: author.trim() || 'Pratyagra Team',
                tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
                readingTimeMinutes: readingTime,
                publishedAt: new Date(publishedAt).toISOString(),
                metaDescription: metaDescription.trim() || null,
                ctaIntroText: ctaIntroText.trim() || null,
                sections: sections.map((s) => ({
                    blockType: s.blockType,
                    heading: s.heading.trim() || null,
                    bodyHtml: s.bodyHtml,
                    secondImageUrl: s.secondImageUrl,
                    secondImageAlt: s.secondImageAlt.trim() || null,
                    secondImageMode: s.secondImageMode,
                    subsections: s.subsections.map((sub) => ({ heading: sub.heading.trim() || null, bodyHtml: sub.bodyHtml })),
                })),
                qna: qna.filter((q) => q.question.trim()).map((q) => ({ question: q.question.trim(), answer: q.answer })),
                ctaButtons: ctaButtons
                    .filter((b) => b.label.trim() && b.url.trim())
                    .map((b) => ({ label: b.label.trim(), url: b.url.trim() })),
            };

            if (isEdit) {
                await updatePost(initialData!.id, input);
                toast.success('Post updated!');
                router.push('/admin/blog');
            } else {
                await createPost(input);
                toast.success('Post published!');
                router.push('/admin/blog');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save post.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-2';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Core fields ──────────────────────────────────────────── */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <div>
                    <label className={labelClass}>Title *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className={inputClass}
                        placeholder="The Meaning Behind “Pratyagra”"
                    />
                </div>

                <div>
                    <label className={labelClass}>
                        Slug * <span className="text-xs text-gray-400 font-normal">/blog/{slug || '…'}</span>
                    </label>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => {
                            setSlug(slugify(e.target.value));
                            setSlugTouched(true);
                        }}
                        required
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>Featured Image</label>
                    <BlogImageUploader
                        imageUrl={featuredImageUrl}
                        onImageChange={setFeaturedImageUrl}
                        alt={featuredImageAlt}
                        onAltChange={setFeaturedImageAlt}
                        displayMode={featuredImageMode}
                        onDisplayModeChange={setFeaturedImageMode}
                        label="featured image"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Category</label>
                        <select
                            value={categorySlug}
                            onChange={(e) => setCategorySlug(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">— None —</option>
                            {categories.map((c) => (
                                <option key={c.slug} value={c.slug}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Author</label>
                        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Publish Date</label>
                        <input
                            type="date"
                            value={publishedAt}
                            onChange={(e) => setPublishedAt(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>
                            Reading Time (minutes) <span className="text-xs text-gray-400 font-normal">auto-estimated on save if left as-is</span>
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={readingTime}
                            onChange={(e) => setReadingTime(Number(e.target.value) || 1)}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Tags <span className="text-xs text-gray-400 font-normal">comma-separated</span></label>
                    <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        className={inputClass}
                        placeholder="Pratyagra Silks, Indian Handloom, Handwoven Silk Sarees"
                    />
                </div>

                <div>
                    <label className={labelClass}>Introduction *</label>
                    <RichTextEditor value={introHtml} onChange={setIntroHtml} placeholder="Opening paragraphs…" />
                </div>

                <div>
                    <label className={labelClass}>
                        Meta Description <span className="text-xs text-gray-400 font-normal">falls back to the intro if left blank</span>
                    </label>
                    <textarea
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        rows={2}
                        className={inputClass}
                    />
                </div>
            </div>

            {/* ── Sections ─────────────────────────────────────────────── */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Sections</h2>
                    <button
                        type="button"
                        onClick={addSection}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Section
                    </button>
                </div>

                {sections.length === 0 && (
                    <p className="text-sm text-gray-400 py-4">No sections yet — add one to break the post into parts.</p>
                )}

                <div className="space-y-5">
                    {sections.map((section, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <GripVertical className="w-4 h-4" />
                                    <span className="text-xs font-medium">Section {i + 1}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                        {(['section', 'callout'] as const).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => updateSection(i, { blockType: type })}
                                                className={`px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                                                    section.blockType === type
                                                        ? 'bg-amber-600 text-white'
                                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                {type === 'callout' ? 'Did you know?' : 'Section'}
                                            </button>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => removeSection(i)} className="text-red-500 hover:text-red-700">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <input
                                type="text"
                                value={section.heading}
                                onChange={(e) => updateSection(i, { heading: e.target.value })}
                                placeholder="Heading"
                                className={inputClass}
                            />
                            <RichTextEditor
                                value={section.bodyHtml}
                                onChange={(html) => updateSection(i, { bodyHtml: html })}
                                placeholder="Body text…"
                            />

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Second Image (optional — placed after this section)
                                </label>
                                <BlogImageUploader
                                    imageUrl={section.secondImageUrl}
                                    onImageChange={(url) => updateSection(i, { secondImageUrl: url })}
                                    alt={section.secondImageAlt}
                                    onAltChange={(alt) => updateSection(i, { secondImageAlt: alt })}
                                    displayMode={section.secondImageMode}
                                    onDisplayModeChange={(mode) => updateSection(i, { secondImageMode: mode })}
                                    label="section image"
                                />
                            </div>

                            {/* Sub-sections */}
                            <div className="pl-4 border-l-2 border-gray-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-500">Sub-sections</span>
                                    <button
                                        type="button"
                                        onClick={() => addSubsection(i)}
                                        className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-medium"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Sub-section
                                    </button>
                                </div>
                                {section.subsections.map((sub, j) => (
                                    <div key={j} className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">Sub-section {j + 1}</span>
                                            <button type="button" onClick={() => removeSubsection(i, j)} className="text-red-400 hover:text-red-600">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={sub.heading}
                                            onChange={(e) => updateSubsection(i, j, { heading: e.target.value })}
                                            placeholder="Sub-heading"
                                            className={`${inputClass} text-sm py-1.5`}
                                        />
                                        <RichTextEditor
                                            value={sub.bodyHtml}
                                            onChange={(html) => updateSubsection(i, j, { bodyHtml: html })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Q&A ──────────────────────────────────────────────────── */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Q&amp;A</h2>
                    <button
                        type="button"
                        onClick={addQna}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Q&amp;A
                    </button>
                </div>
                {qna.length === 0 && <p className="text-sm text-gray-400 py-4">No Q&amp;A pairs yet.</p>}
                <div className="space-y-3">
                    {qna.map((item, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-400">Q{i + 1}</span>
                                <button type="button" onClick={() => removeQna(i)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={item.question}
                                onChange={(e) => updateQna(i, { question: e.target.value })}
                                placeholder="Question"
                                className={inputClass}
                            />
                            <textarea
                                value={item.answer}
                                onChange={(e) => updateQna(i, { answer: e.target.value })}
                                placeholder="Answer"
                                rows={2}
                                className={inputClass}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── CTA block ────────────────────────────────────────────── */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Call to Action</h2>
                <div className="mb-4">
                    <label className={labelClass}>Intro Text</label>
                    <textarea
                        value={ctaIntroText}
                        onChange={(e) => setCtaIntroText(e.target.value)}
                        rows={2}
                        className={inputClass}
                        placeholder="Explore our collection of heirloom sarees…"
                    />
                </div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Buttons</span>
                    <button
                        type="button"
                        onClick={addCtaButton}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Button
                    </button>
                </div>
                <div className="space-y-2">
                    {ctaButtons.map((btn, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={btn.label}
                                onChange={(e) => updateCtaButton(i, { label: e.target.value })}
                                placeholder="Button label"
                                className={`${inputClass} flex-1`}
                            />
                            <input
                                type="text"
                                value={btn.url}
                                onChange={(e) => updateCtaButton(i, { url: e.target.value })}
                                placeholder="/collection"
                                className={`${inputClass} flex-1`}
                            />
                            <button type="button" onClick={() => removeCtaButton(i)} className="text-red-500 hover:text-red-700 flex-shrink-0">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Actions ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Post'}
                </button>
                <Link
                    href="/admin/blog"
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
