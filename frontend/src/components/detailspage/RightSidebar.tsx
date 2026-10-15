"use client";

import { Box, Divider, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/api";

type RightSidebarProps = {
  title: string;
  summary: string;
  attachments?: any[];
  attachmentEndpoint?: string;
  onAttachmentChange?: () => void;
};

export default function RightSidebar({ title, summary, attachments = [], attachmentEndpoint, onAttachmentChange, }: RightSidebarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [displayAttachments, setDisplayAttachments] =
    useState<any[]>(attachments);

  useEffect(() => {
    setDisplayAttachments(attachments);
  }, [attachments]);


  return (
    <>
      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];

          if (!file || !attachmentEndpoint) {
            return;
          }

          try {
            const formData = new FormData();

            formData.append("file", file);

            const response = await apiRequest<any>(
              attachmentEndpoint,
              {
                method: "POST",
                body: formData,
              }
            );

            setDisplayAttachments((prev) => [
              response,
              ...prev,
            ]);

            setAttachmentsOpen(true);

            onAttachmentChange?.();


          } catch (error) {
            console.error(
              "Failed to upload attachment:",
              error
            );
          }

          e.target.value = "";
        }}
      />

      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 2,
        }}
      >
        {/* AI Summary */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            display: "block",
            boxSizing: "border-box",
            p: 2,
            border: "1px solid",
            borderColor: "primary.main",
            borderRadius: 2,
            bgcolor: "background.default",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <Image
              src="/ai-summary.jpg"
              alt="AI Summary"
              width={20}
              height={22}

            />

            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "primary.main",
              }}
            >
              {title}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              lineHeight: "24px",
              color: "text.primary",
            }}
          >
            {summary}
          </Typography>
        </Paper>

        {/* Attachment */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            display: "block",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box
              onClick={() => setAttachmentsOpen(!attachmentsOpen)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
              }}
            >
              <KeyboardArrowDownIcon
                sx={{
                  color: "primary.main",
                  fontSize: 18,
                  transition: ".2s",
                  transform: attachmentsOpen
                    ? "rotate(-90deg)"
                    : "rotate(0deg)",
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                }}
              >
                Attachments
              </Typography>
            </Box>

            <Box
              onClick={() => inputRef.current?.click()}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.3,
                cursor: "pointer",
              }}
            >
              <AddIcon
                sx={{
                  color: "primary.main",
                  fontSize: 16,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "primary.main",
                }}
              >
                Add
              </Typography>
            </Box>
          </Box>

          {attachmentsOpen ? (
            <>
              <Divider />

              <Box sx={{ px: 2, py: 2 }}>
                {displayAttachments.length === 0 ? (
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 400,
                      lineHeight: "24px",
                      color: "text.secondary",
                    }}
                  >
                    No attachments yet
                  </Typography>
                ) : (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 400,
                        color: "text.secondary",
                        mb: 1,
                      }}
                    >
                      Recently uploaded
                    </Typography>

                    {displayAttachments.map((file) => (
                      <Paper
                        key={file.id}
                        elevation={0}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: "#EBF1F5",
                        }}
                      >
                        {/* Thumbnail */}
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: "8px",
                            bgcolor: "#D9D9D9",
                            flexShrink: 0,
                          }}
                        />

                        {/* File Info */}
                        <Box sx={{ flex: 1 }}>
                          <Box
                            component="a"
                            href={file.file_url || file.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              textDecoration: "none",
                              color: "inherit",
                              cursor: "pointer",
                              minWidth: 0,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: "text.primary",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {file.file_name}
                            </Typography>
                          </Box>

                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 400,
                              color: "text.secondary",
                            }}
                          >

                            {new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Typography>
                        </Box>

                        {/* Delete */}
                        {/* <CloseIcon*/}

                        <CloseIcon
                          onClick={async () => {
                            console.log("DELETE ATTACHMENT:", {
                              id: file.id,
                              file_name: file.file_name,
                              attachmentEndpoint,
                            });

                            if (!attachmentEndpoint) return;

                            try {
                              await apiRequest(
                                `${attachmentEndpoint}${file.id}/`,
                                {
                                  method: "DELETE",
                                }
                              );

                              setDisplayAttachments((prev) =>
                                prev.filter(
                                  (attachment) =>
                                    attachment.id !== file.id
                                )
                              );

                              onAttachmentChange?.();

                            } catch (error) {
                              console.error(
                                "Failed to delete attachment:",
                                error
                              );
                            }
                          }}
                          sx={{
                            fontSize: 18,
                            color: "text.secondary",
                            cursor: "pointer",
                          }}
                        />
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Box
              sx={{
                width: "100%",
                px: 2,
                pb: 2,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  lineHeight: "24px",
                }}
              >
                See the files attached to your activities or uploaded to this
                record.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </>
  );
}
