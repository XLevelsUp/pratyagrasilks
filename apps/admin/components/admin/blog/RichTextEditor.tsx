'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

// Shared rich-text field for every body in the blog's fixed structure (intro,
// section/subsection/callout bodies). Basic formatting only — bold, italic,
// links, lists — no image node, so writers can't break the fixed layout by
// dropping images mid-paragraph; images are handled by BlogImageUploader in
// their own dedicated slots.
export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: false,
                blockquote: false,
                horizontalRule: false,
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
        ],
        content: value,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] px-3 py-2',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('Link URL', previousUrl ?? 'https://');
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const toolbarBtn = (
        active: boolean,
        onClick: () => void,
        Icon: React.ElementType,
        label: string,
    ) => (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={`p-1.5 rounded transition-colors ${
                active ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500">
            <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1">
                {toolbarBtn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), Bold, 'Bold')}
                {toolbarBtn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), Italic, 'Italic')}
                {toolbarBtn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), List, 'Bullet list')}
                {toolbarBtn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), ListOrdered, 'Numbered list')}
                {toolbarBtn(editor.isActive('link'), setLink, LinkIcon, 'Link')}
                <div className="w-px h-4 bg-gray-300 mx-1" />
                {toolbarBtn(false, () => editor.chain().focus().undo().run(), Undo, 'Undo')}
                {toolbarBtn(false, () => editor.chain().focus().redo().run(), Redo, 'Redo')}
            </div>
            <EditorContent editor={editor} placeholder={placeholder} />
        </div>
    );
}
