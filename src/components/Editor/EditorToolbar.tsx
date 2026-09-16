"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, disabled = false }) => {
  if (!editor) return null;

  return (
    <div className="toolbar-container">
      {/* History */}
      <button
        type="button"
        className="toolbar-btn"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={disabled || !editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo size={16} />
      </button>
      <button
        type="button"
        className="toolbar-btn"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={disabled || !editor.can().redo()}
        title="Redo (Ctrl+Y)"
      >
        <Redo size={16} />
      </button>

      <div className="toolbar-divider" />

      {/* Text Styles */}
      <button
        type="button"
        className={`toolbar-btn ${editor.isActive("bold") ? "active" : ""}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={disabled}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </button>

      <button
        type="button"
        className={`toolbar-btn ${editor.isActive("italic") ? "active" : ""}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={disabled}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </button>

      <button
        type="button"
        className={`toolbar-btn ${editor.isActive("underline") ? "active" : ""}`}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={disabled}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon size={16} />
      </button>

      <div className="toolbar-divider" />

      {/* Headings */}
      <button
        type="button"
        className={`toolbar-btn ${editor.isActive("heading", { level: 1 }) ? "active" : ""}`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={disabled}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>

      <button
        type="button"
        className={`toolbar-btn ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={disabled}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>

      <button
        type="button"
        className={`toolbar-btn ${editor.isActive("heading", { level: 3 }) ? "active" : ""}`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={disabled}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </button>

      <div className="toolbar-divider" />

      {/* Lists */}
      <button
        type="button"
        className={`toolbar-btn ${editor.isActive("bulletList") ? "active" : ""}`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={disabled}
        title="Bullet List"
      >
        <List size={16} />
      </button>

      <button
        type="button"
        className={`toolbar-btn ${editor.isActive("orderedList") ? "active" : ""}`}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={disabled}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>

      <div className="toolbar-divider" />

      {/* Blockquote & Code */}
      <button
        type="button"
        className={`toolbar-btn ${editor.isActive("blockquote") ? "active" : ""}`}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        disabled={disabled}
        title="Blockquote"
      >
        <Quote size={16} />
      </button>

      <button
        type="button"
        className={`toolbar-btn ${editor.isActive("codeBlock") ? "active" : ""}`}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        disabled={disabled}
        title="Code Block"
      >
        <Code size={16} />
      </button>
    </div>
  );
};
