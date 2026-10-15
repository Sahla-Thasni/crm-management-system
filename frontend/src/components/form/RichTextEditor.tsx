"use client";

import {
  Box,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import ImageIcon from "@mui/icons-material/Image";

import Image from "@tiptap/extension-image";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;

  placeholder?: string;

  label?: string;

  required?: boolean;

  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  label,
  required = false,
  placeholder = "Enter",
  minHeight = 180,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder,
      }),
    ],

    content: value,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    immediatelyRender: false,
  });

  const [textType, setTextType] = useState("paragraph");

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !editor) return;

    const reader = new FileReader();

    reader.onload = () => {
      editor
        .chain()
        .focus()
        .setImage({
          src: reader.result as string,
        })
        .run();
    };

    reader.readAsDataURL(file);
  };

  const handleTextTypeChange = (event: SelectChangeEvent) => {
    const value = event.target.value;

    setTextType(value);

    if (!editor) return;

    switch (value) {
      case "paragraph":
        editor.chain().focus().setParagraph().run();
        break;

      case "h1":
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;

      case "h2":
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;

      case "h3":
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
    }
  };

  return (
    <Box>
      <Typography
        variant="body2"
        sx={{
          mb: 1,
          fontWeight: 500,
          color: "text.primary",
        }}
      >
        {label}

        {required && (
          <Box
            component="span"
            sx={{
              color: "error.main",
              ml: 0.3,
            }}
          >
            *
          </Box>
        )}
      </Typography>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageUpload}
      />

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        {/* Toolbar will go here */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Select
            size="small"
            value={textType}
            onChange={handleTextTypeChange}
            sx={{
              minWidth: 140,
              border: "none",
              "& fieldset": {
                border: "none",
              },
            }}
          >
            <MenuItem value="paragraph">Normal Text</MenuItem>

            <MenuItem value="h1">Heading 1</MenuItem>

            <MenuItem value="h2">Heading 2</MenuItem>

            <MenuItem value="h3">Heading 3</MenuItem>
          </Select>

          <IconButton
            size="small"
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <FormatBoldIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <FormatItalicIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <FormatUnderlinedIcon fontSize="small" />
          </IconButton>

          <Divider orientation="vertical" flexItem />

          <IconButton
            size="small"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <FormatListNumberedIcon fontSize="small" />
          </IconButton>

          <Divider orientation="vertical" flexItem />

          <IconButton
            size="small"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            p: 2,
            "& .ProseMirror": {
              minHeight,
              outline: "none",
              padding: "8px",
              fontSize: 14,

              "& p": {
                margin: 0,
              },

              "& img": {
                maxWidth: "100%",
                borderRadius: 2,
              },
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Paper>
    </Box>
  );
}
