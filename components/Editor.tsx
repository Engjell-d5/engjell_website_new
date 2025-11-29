'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Mail
} from 'lucide-react';
import { useCallback, useState } from 'react';
import ImageResizer from './ImageResizer';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function Editor({ content, onChange }: EditorProps) {
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<{ url: string; node: any } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: null,
              parseHTML: element => element.getAttribute('width') || element.style.width,
              renderHTML: attributes => {
                if (!attributes.width) {
                  return {};
                }
                return {
                  width: attributes.width,
                };
              },
            },
            height: {
              default: null,
              parseHTML: element => element.getAttribute('height') || element.style.height,
              renderHTML: attributes => {
                if (!attributes.height) {
                  return {};
                }
                return {
                  height: attributes.height,
                };
              },
            },
            style: {
              default: null,
              parseHTML: element => element.getAttribute('style'),
              renderHTML: attributes => {
                if (!attributes.style) {
                  return {};
                }
                return {
                  style: attributes.style,
                };
              },
            },
          };
        },
      }).configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image cursor-pointer hover:opacity-80 transition-opacity',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Color,
      TextStyle,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4',
      },
      handleClick: (view, pos, event) => {
        const { state } = view;
        const { selection } = state;
        const node = state.doc.nodeAt(selection.from);
        
        if (node && node.type.name === 'image') {
          event.preventDefault();
          const attrs = node.attrs;
          setEditingImage({ url: attrs.src, node });
          return true;
        }
        return false;
      },
    },
  });

  const handleImageUpload = useCallback(async () => {
    if (!editor) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
        } else {
          alert(data.error || 'Failed to upload image');
        }
      } catch (error) {
        alert('Failed to upload image');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertSubscribeSnippet = useCallback(() => {
    if (!editor) return;
    
    // Insert a special HTML div that we'll replace when rendering
    // Use a more explicit format to ensure it's preserved
    editor.chain().focus().insertContent('<div class="subscribe-snippet-placeholder"></div>').run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-[var(--border-color)] bg-[var(--rich-black)] rounded-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-[var(--border-color)] bg-[var(--rich-black)]">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-[var(--border-color)] pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-2 rounded-sm transition-colors ${
              editor.isActive('bold')
                ? 'bg-[var(--primary-mint)] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-2 rounded-sm transition-colors ${
              editor.isActive('italic')
                ? 'bg-[var(--primary-mint)] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded-sm transition-colors ${
              editor.isActive('underline')
                ? 'bg-[var(--primary-mint)] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={`p-2 rounded-sm transition-colors ${
              editor.isActive('strike')
                ? 'bg-[var(--primary-mint)] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-[var(--border-color)] pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded-sm transition-colors ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-[var(--primary-mint)] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-sm transition-colors ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-[var(--primary-mint)] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded-sm transition-colors ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-[var(--primary-mint)] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-[var(--border-color)] pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-sm transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-[var(--primary-mint)] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-sm transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-[var(--primary-mint)] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-sm transition-colors ${
              editor.isActive('blockquote')
                ? 'bg-[var(--primary-mint)] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r border-[var(--border-color)] pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded-sm transition-colors ${
              editor.isActive({ textAlign: 'left' })
                ? 'bg-[var(--primary-mint)] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded-sm transition-colors ${
              editor.isActive({ textAlign: 'center' })
                ? 'bg-[var(--primary-mint)] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded-sm transition-colors ${
              editor.isActive({ textAlign: 'right' })
                ? 'bg-[var(--primary-mint)] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 rounded-sm transition-colors ${
              editor.isActive({ textAlign: 'justify' })
                ? 'bg-[var(--primary-mint)] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Media */}
        <div className="flex items-center gap-1 border-r border-[var(--border-color)] pr-2">
          <button
            type="button"
            onClick={handleImageUpload}
            disabled={uploading}
            className="p-2 rounded-sm transition-colors text-gray-400 hover:text-white hover:bg-[var(--rich-black)] disabled:opacity-50"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={setLink}
            className={`p-2 rounded-sm transition-colors ${
              editor.isActive('link')
                ? 'bg-[var(--primary-mint)] text-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertSubscribeSnippet}
            className="p-2 rounded-sm transition-colors text-gray-400 hover:text-white hover:bg-[var(--rich-black)]"
            title="Insert Subscribe Form"
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 rounded-sm transition-colors text-gray-400 hover:text-white hover:bg-[var(--rich-black)] disabled:opacity-50"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 rounded-sm transition-colors text-gray-400 hover:text-white hover:bg-[var(--rich-black)] disabled:opacity-50"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="bg-white text-black min-h-[400px]">
        <EditorContent editor={editor} />
      </div>

      {/* Image Editor Modal */}
      {editingImage && editor && (
        <ImageResizer
          imageUrl={editingImage.url}
          onUpdate={(url, width, height, align, fullWidth) => {
            const { state } = editor.view;
            const { selection } = state;
            
            // Find the image node
            let imagePos = -1;
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'image' && node.attrs.src === editingImage.url) {
                imagePos = pos;
                return false;
              }
            });
            
            if (imagePos !== -1) {
              const attrs: any = { src: url };
              
              if (fullWidth) {
                // Full width image styling
                attrs.class = 'editor-image-fullwidth';
                attrs.style = 'width: 100%; height: auto; display: block; margin: 2em 0;';
              } else {
                if (width) attrs.width = width;
                if (height && height !== 'auto') attrs.height = height;
                
                let style = '';
                if (align === 'center') {
                  style = 'display: block; margin: 0 auto;';
                } else if (align === 'right') {
                  style = 'display: block; margin-left: auto;';
                } else {
                  style = 'display: block;';
                }
                if (width) style += ` width: ${width};`;
                if (height && height !== 'auto') style += ` height: ${height};`;
                
                if (style) attrs.style = style;
              }
              
              editor.chain()
                .focus()
                .setNodeSelection(imagePos)
                .setImage(attrs)
                .run();
            }
            setEditingImage(null);
          }}
          onClose={() => setEditingImage(null)}
        />
      )}
    </div>
  );
}

