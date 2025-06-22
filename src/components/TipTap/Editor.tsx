'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import { Toolbar } from './Toolbar';

type Props = {
  content: string;
  onChange: (content: string) => void;
};

export const Editor: React.FC<Props> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    immediatelyRender: false, 
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none border border-border rounded-md p-4 min-h-[300px] focus:outline-none dark:prose-invert',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className='flex flex-col gap-4 justify-stretch'>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};