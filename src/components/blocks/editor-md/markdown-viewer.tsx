'use client'

import { parseMarkdownToHtml } from '@/lib/markdown-serializer'

import { cn } from '@/lib/utils'

import Link from '@tiptap/extension-link'

import TaskItem from '@tiptap/extension-task-item'

import TaskList from '@tiptap/extension-task-list'

import Typography from '@tiptap/extension-typography'

import { EditorContent, useEditor } from '@tiptap/react'

import StarterKit from '@tiptap/starter-kit'

import { useEffect } from 'react'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Typography,
    ],
    content: parseMarkdownToHtml(content || ''),
    editable: false,
    editorProps: {
      attributes: {
        // class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  })

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const htmlContent = parseMarkdownToHtml(content || '')
      const currentContent = editor.getHTML()

      if (htmlContent !== currentContent) {
        editor.commands.setContent(htmlContent)
      }
    }
  }, [content, editor])

  if (!content || content.trim() === '') {
    return (
      <div className={cn('text-muted-foreground italic p-3', className)}>
        Nenhum conteúdo disponível
      </div>
    )
  }

  if (!editor) {
    return null
  }

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:font-bold',
        'prose-h1:text-base prose-h2:text-base prose-h3:text-base prose-h4:text-base prose-h5:text-base prose-h6:text-base',
        'prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800',
        'prose-ul:list-disc prose-ol:list-decimal',
        'prose-li:marker:text-foreground',
        'prose-strong:font-bold',
        'prose-em:italic',
        className
      )}
    >
      <EditorContent editor={editor} />
    </div>
  )
}
