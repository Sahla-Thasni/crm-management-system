"use client";
import { useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  TextField,
  Chip,
  Popover,
} from "@mui/material";

// MUI Icons
import AttachFileIcon from "@mui/icons-material/AttachFile";
import LinkIcon from "@mui/icons-material/Link";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import ActivityModal from "./ActivityModal";
import { EmailFormData, EmailFormProps } from "./types";

const initialState: EmailFormData = {
  recipients: "",
  cc: "",
  bcc: "",
  subject: "",
  body: "",
  emailEndpoint: "",
  attachments: [],
};

export default function EmailForm({ open, onClose, onSave, recipientEmail, emailEndpoint, attachments: availableAttachments = [], }: EmailFormProps) {
  //State Variable
  const [formData, setFormData] = useState<EmailFormData>(initialState);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [attachments, setAttachments] = useState<File[]>([]);

  const [linkAnchor, setLinkAnchor] = useState<null | HTMLElement>(null);

  const [linkUrl, setLinkUrl] = useState("");

  const [emojiAnchor, setEmojiAnchor] = useState<null | HTMLElement>(null);

  const openMenu = Boolean(anchorEl);

  const [selectedAttachments, setSelectedAttachments] = useState<
    NonNullable<EmailFormProps["attachments"]>
  >([]);

  // File Input Refs
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [attachmentMenuAnchor, setAttachmentMenuAnchor] =
    useState<null | HTMLElement>(null);

  const handleAttachmentMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAttachmentMenuAnchor(event.currentTarget);
  };


  const handleAttachment = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files) return;

    setAttachments((prev) => [
      ...prev,
      ...Array.from(files),
    ]);

    event.target.value = "";
  };


  const handleAttachmentMenuClose = () => {
    setAttachmentMenuAnchor(null);
  };

  useEffect(() => {
    if (open) {
      setAttachments([]);
      setSelectedAttachments([]);

      if (recipientEmail) {
        setFormData((prev) => ({
          ...prev,
          recipients: recipientEmail,
        }));
      }
    }
  }, [open, recipientEmail]);


  // Save / Send
  const handleSave = () => {
    onSave?.(formData);

    setFormData(initialState);

    onClose();
  };

  const handleSend = async () => {
    const signature = `
  
Warm regards,

Sales Executive
CRM Pvt. Ltd.
+91-9876543210
crmliveproject.demo@gmail.com
`;

    if (!emailEndpoint) {
      console.error("Email endpoint is missing");
      return;
    }

    if (!formData.recipients.trim()) {
      console.error("Recipient email is required");
      return;
    }

    if (!formData.subject.trim()) {
      console.error("Subject is required");
      return;
    }

    if (!formData.body.trim()) {
      console.error("Email body is required");
      return;
    }

    try {
      const formDataToSend = new FormData();

      formDataToSend.append(
        "recipients",
        JSON.stringify([formData.recipients.trim()])
      );

      formDataToSend.append(
        "cc",
        JSON.stringify(
          formData.cc
            ? [formData.cc.trim()]
            : []
        )
      );

      formDataToSend.append(
        "bcc",
        JSON.stringify(
          formData.bcc
            ? [formData.bcc.trim()]
            : []
        )
      );

      formDataToSend.append(
        "subject",
        formData.subject.trim()
      );

      formDataToSend.append(
        "body",
        `${formData.body.trim()}\n${signature}`
      );

      const existingFiles = await Promise.all(
        selectedAttachments.map(async (attachment) => {
          const response = await fetch(attachment.file);

          const blob = await response.blob();

          return new File(
            [blob],
            attachment.file_name,
            {
              type: blob.type,
            }
          );
        })
      );


      // Add local attachments
      attachments.forEach((file) => {
        formDataToSend.append("attachments", file);
      });

      // Add right-side attachments as real files
      existingFiles.forEach((file) => {
        formDataToSend.append("attachments", file);
      });
      console.log("EMAIL ATTACHMENT IDS:",
        selectedAttachments.map((attachment) => attachment.id)
      );

      const response = await apiRequest(
        emailEndpoint,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      console.log(
        "Email sent successfully:",
        response
      );

      onSave?.({
        ...formData,
        attachments,
      });

      setFormData(initialState);
      setAttachments([]);
      setSelectedAttachments([]);
      onClose();

    } catch (error) {
      console.error(
        "Failed to send email:",
        error
      );
    }
  };

  // Send Menu

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  //  Emoji List
  const emojis = ["😀", "😁", "😂", "😍", "😊", "👍", "❤️", "🎉"];

  // Attachment
  const handleSelectExistingAttachment = (
    attachment: NonNullable<EmailFormProps["attachments"]>[number]
  ) => {
    setSelectedAttachments((prev) => {
      const exists = prev.some(
        (item) => item.id === attachment.id
      );
      console.log("SELECTED RIGHT SIDE FILE:", attachment);

      if (exists) {
        return prev;
      }

      return [...prev, attachment];
    });

    handleAttachmentMenuClose();
  };

  //Image Upload
  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files) return;

    setAttachments((prev) => [...prev, ...Array.from(files)]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  //Insert Link
  const handleLink = (event: React.MouseEvent<HTMLElement>) => {
    setLinkAnchor(event.currentTarget);
  };

  const handleCloseLink = () => {
    setLinkAnchor(null);
  };

  const handleInsertLink = () => {
    if (!linkUrl) return;

    setFormData((prev) => ({
      ...prev,
      body: `${prev.body}\n${linkUrl}`,
    }));

    setLinkUrl("");

    handleCloseLink();
  };

  // Emoji
  const handleEmoji = (event: React.MouseEvent<HTMLElement>) => {
    setEmojiAnchor(event.currentTarget);
  };

  const handleCloseEmoji = () => {
    setEmojiAnchor(null);
  };

  const handleSelectEmoji = (emoji: string) => {
    setFormData((prev) => ({
      ...prev,
      body: prev.body + emoji,
    }));

    handleCloseEmoji();
  };

  // Delete Email
  const handleDelete = () => {
    setFormData(initialState);
    setAttachments([]);
    setSelectedAttachments([]);
  };
  return (
    <ActivityModal
      open={open}
      title="New Email"
      variant="dialog"
      hideFooter
      onClose={onClose}
      titleSx={{
        bgcolor: "primary.main",
        color: "primary.contrastText",
      }}
      paperSx={{
        width: 600,
        maxWidth: "90vw",
        maxHeight: "85vh",
      }}
    >

      {/* Hidden Image Input */}
      <input
        type="file"
        accept="image/*"
        hidden
        multiple
        ref={imageInputRef}
        onChange={handleImage}
      />

      <input
        type="file"
        hidden
        multiple
        ref={attachmentInputRef}
        onChange={handleAttachment}
      />



      {/*  Recipients */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 1,
          gap: 1,
        }}
      >
        <Typography
          sx={{
            width: 90,
            color: "text.secondary",
            fontSize: 14,
          }}
        >
          Recipients
        </Typography>
        <input
          value={formData.recipients}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev) => ({
              ...prev,
              recipients: event.target.value,
            }));
          }}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "14px",
            background: "transparent",
          }}
        />

        <Button
          size="small"
          sx={{
            minWidth: "auto",
            textTransform: "none",
            color: "text.secondary",
          }}
        >
          Cc
        </Button>

        <Button
          size="small"
          sx={{
            minWidth: "auto",
            textTransform: "none",
            color: "text.secondary",
          }}
        >
          Bcc
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 1,
          gap: 1,
        }}
      >
        {/* Subject */}
        <Typography
          sx={{
            width: 90,
            color: "text.secondary",
            fontSize: 14,
          }}
        >
          Subject
        </Typography>

        <input
          value={formData.subject}
          onChange={(e) =>
            setFormData({
              ...formData,
              subject: e.target.value,
            })
          }
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "14px",
            background: "transparent",
          }}
        />
      </Box>

      {/* Body Text */}
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="body2"
          sx={{
            mb: 1,
            color: "text.primary",
            fontWeight: 500,
          }}
        >
          Body Text
        </Typography>
        <TextField
          fullWidth
          multiline
          placeholder="Enter"
          value={formData.body}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              body: e.target.value,
            }))
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              p: 2,
              height: 260,
              alignItems: "flex-start",
            },

            "& textarea": {
              height: "100% !important",
              overflowY: "auto",
            },
          }}
        />
      </Box>

      {/* Selected Attachments */}
      {/* System-selected attachments */}
      {attachments.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "nowrap",
            alignItems: "center",
            gap: 1,
            mt: 2,
            mb: 2,
            overflowX: "auto",
          }}
        >
          {attachments.map((file, index) => (
            <Chip
              key={index}
              label={file.name}
              variant="outlined"
              onDelete={() => handleRemoveAttachment(index)}
            />
          ))}
        </Box>
      )}

      {/* Right-side selected attachments */}
      {selectedAttachments.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            mt: 2,
          }}
        >
          {selectedAttachments.map((attachment) => (
            <Chip
              key={attachment.id}
              label={attachment.file_name}
              variant="outlined"
              onDelete={() =>
                setSelectedAttachments((prev) =>
                  prev.filter(
                    (item) => item.id !== attachment.id
                  )
                )
              }
            />
          ))}
        </Box>
      )}


      {/* Footer Divider */}
      <Divider sx={{ mt: 2 }} />

      {/* Email Footer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
        }}
      >
        {/* Send Button   */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Button
            variant="contained"
            endIcon={<ArrowDropDownIcon />}
            onClick={handleMenuOpen}
          >
            Send
          </Button>

          <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                handleSend();
                handleMenuClose();
              }}
            >
              Send
            </MenuItem>

            <MenuItem
              onClick={() => {
                console.log("Save as Draft");
                handleMenuClose();
              }}
            >
              Save as Draft
            </MenuItem>

            <MenuItem
              onClick={() => {
                console.log("Schedule Send");
                handleMenuClose();
              }}
            >
              Schedule Send
            </MenuItem>
          </Menu>

          {/* Link Popover */}
          <Popover
            open={Boolean(linkAnchor)}
            anchorEl={linkAnchor}
            onClose={handleCloseLink}
            anchorOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <Box sx={{ p: 2, width: 250 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Paste URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />

              <Button
                sx={{ mt: 2 }}
                variant="contained"
                fullWidth
                onClick={handleInsertLink}
              >
                Insert
              </Button>
            </Box>
          </Popover>

          {/* Emoji Popover */}
          <Popover
            open={Boolean(emojiAnchor)}
            anchorEl={emojiAnchor}
            onClose={handleCloseEmoji}
          >
            <Box
              sx={{
                p: 1,
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 1,
              }}
            >
              {emojis.map((emoji) => (
                <IconButton
                  key={emoji}
                  onClick={() => handleSelectEmoji(emoji)}
                >
                  {emoji}
                </IconButton>
              ))}
            </Box>
          </Popover>

          {/* Toolbar Icons */}

          {/* Attachment */}
          <IconButton onClick={handleAttachmentMenuOpen}>
            <AttachFileIcon />
          </IconButton>

          <Menu
            anchorEl={attachmentMenuAnchor}
            open={Boolean(attachmentMenuAnchor)}
            onClose={handleAttachmentMenuClose}
          >
            {availableAttachments.length > 0 ? (
              availableAttachments.map((attachment) => (
                <MenuItem
                  key={attachment.id}
                  onClick={() =>
                    handleSelectExistingAttachment(attachment)
                  }
                >
                  {attachment.file_name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>
                No attachments available
              </MenuItem>
            )}


            <Divider />

            <MenuItem
              onClick={() => {
                handleAttachmentMenuClose();
                attachmentInputRef.current?.click();
              }}
            >
              + Select more files
            </MenuItem>
          </Menu>

          <IconButton onClick={handleLink}>
            <LinkIcon />
          </IconButton>

          <IconButton onClick={handleEmoji}>
            <InsertEmoticonIcon />
          </IconButton>

          <IconButton onClick={() => imageInputRef.current?.click()}>
            <ImageIcon />
          </IconButton>
        </Box>


        {/* Delete Email */}
        <IconButton color="error" onClick={handleDelete}>
          <DeleteIcon />
        </IconButton>
      </Box>
    </ActivityModal>
  );
}
