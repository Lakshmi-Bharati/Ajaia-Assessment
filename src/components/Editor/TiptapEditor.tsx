"use client";

import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "./EditorToolbar";

interface TiptapEditorProps {
  initialContent: string;
  canEdit: boolean;
  onContentChange: (html: string, json: string) => void;
  onStatsChange?: (stats: { words: number; characters: number }) => void;
  editorRef?: React.MutableRefObject<unknown>;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  initialContent,
  canEdit,
  onContentChange,
  onStatsChange,
  editorRef,
}) => {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder: canEdit
          ? "Start writing, drafting, or type '#' for headings..."
          : "View-only document. You do not have permission to edit this document.",
      }),
    ],
    content: initialContent || "<p></p>",
    editable: canEdit,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = JSON.stringify(editor.getJSON());
      const text = editor.getText();

      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const characters = text.length;
      onStatsChange?.({ words, characters });

      // Debounce the save call by 600ms
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        onContentChange(html, json);
      }, 600);
    },
  });

  useEffect(() => {
    if (editor && editorRef) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(canEdit);
    }
  }, [editor, canEdit]);

  useEffect(() => {
    // If content changes externally (e.g. AI insertion or initial fetch)
    if (editor && initialContent && editor.getHTML() !== initialContent && !editor.isFocused) {
      editor.commands.setContent(initialContent, false);
    }
  }, [initialContent, editor]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, height: "100%", width: "100%", overflow: "hidden" }}>
      <EditorToolbar editor={editor} disabled={!canEdit} />

      <div className="editor-scroll-area">
        <div className="document-paper">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};
