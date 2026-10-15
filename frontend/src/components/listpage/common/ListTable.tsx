"use client";

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Box,
} from "@mui/material";

import TableContainer from "./TableContainer";
import StatusChip from "./StatusChip";
import ActionButtons from "./ActionButtons";

import { useRouter } from "next/navigation";

type Props = {
  type: "leads" | "companies" | "deals" | "tickets";
  data: any[];

  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
};

export default function ListTable({ type, data, onEdit, onDelete }: Props) {
  const router = useRouter();

  const getColumns = () => {
    switch (type) {
      // =====================================================
      // LEADS
      // =====================================================

      case "leads":
        return [
          {
            field: "name",
            headerName: "NAME",

            render: (row: any) => {
              const firstName = row.first_name ?? "";
              const lastName = row.last_name ?? "";

              const fullName = `${firstName} ${lastName}`.trim();

              return fullName || "-";
            },
          },

          {
            field: "email",
            headerName: "EMAIL",

            render: (row: any) => row.email || "-",
          },

          {
            field: "phone_number",
            headerName: "PHONE NUMBER",

            render: (row: any) => row.phone_number || "-",
          },

          {
            field: "created_at",
            headerName: "CREATED DATE",

            render: (row: any) => {
              if (!row.created_at) {
                return "-";
              }

              return new Date(row.created_at).toLocaleDateString();
            },
          },

          {
            field: "lead_status",
            headerName: "LEAD STATUS",

            render: (row: any) => (
              <StatusChip status={row.lead_status || "-"} />
            ),
          },

          // =================================================
          // ACTIONS
          // =================================================

          {
            field: "actions",
            headerName: "ACTIONS",

            render: (row: any) => (
              <ActionButtons
                onEdit={() => {
                  console.log("Edit clicked:", row);

                  onEdit?.(row);
                }}
                onDelete={() => {
                  console.log("Delete clicked:", row);

                  onDelete?.(row);
                }}
              />
            ),
          },
        ];

      // =====================================================
      // COMPANIES
      // =====================================================

      case "companies":
        return [
          {
            field: "company_name",
            headerName: "COMPANY NAME",
          },

          {
            field: "company_owner_name",
            headerName: "COMPANY OWNER",
          },

          {
            field: "phone_number",
            headerName: "PHONE NUMBER",
          },

          {
            field: "industry_name",
            headerName: "INDUSTRY",
          },

          {
            field: "city",
            headerName: "CITY",
          },

          {
            field: "country",
            headerName: "COUNTRY/REGION",
          },

          {
            field: "created_at",
            headerName: "CREATED DATE",

            render: (row: any) => {
              if (!row.created_at) {
                return "-";
              }

              return new Date(row.created_at).toLocaleDateString();
            },
          },

          {
            field: "actions",
            headerName: "ACTIONS",

            render: (row: any) => (
              <ActionButtons
                onEdit={() => onEdit?.(row)}
                onDelete={() => onDelete?.(row)}
              />
            ),
          },
        ];

      // =====================================================
      // DEALS
      // =====================================================

      case "deals":
        return [
          {
            field: "deal_name",
            headerName: "DEAL NAME",
          },

          {
            field: "associated_lead_details",
            headerName: "LEAD NAME",
            render: (row: any) => {
              const lead = row.associated_lead_details;

              if (!lead) {
                return "-";
              }

              return (
                `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim() || "-"
              );
            },
          },

          {
            field: "deal_stage",
            headerName: "DEAL STAGE",
            render: (row: any) => <StatusChip status={row.deal_stage ?? "-"} />,
          },

          {
            field: "close_date",
            headerName: "CLOSE DATE",
            render: (row: any) => {
              if (!row.close_date) {
                return "-";
              }

              return new Date(row.close_date).toLocaleDateString();
            },
          },

          {
            field: "deal_owner_details",
            headerName: "DEAL OWNER",
            render: (row: any) => {
              const owners = row.deal_owner_details;

              if (!owners || owners.length === 0) {
                return "-";
              }

              return owners
                .map((owner: any) =>
                  `${owner.first_name ?? ""} ${owner.last_name ?? ""}`.trim(),
                )
                .filter(Boolean)
                .join(", ");
            },
          },

          {
            field: "amount",
            headerName: "AMOUNT",
            render: (row: any) => {
              if (row.amount === null || row.amount === undefined) {
                return "-";
              }

              return `$${Number(row.amount).toLocaleString()}`;
            },
          },

          {
            field: "priority",
            headerName: "PRIORITY",
            render: (row: any) => <StatusChip status={row.priority ?? "-"} />,
          },

          {
            field: "actions",
            headerName: "ACTIONS",

            render: (row: any) => (
              <Box onClick={(event) => event.stopPropagation()}>
                <ActionButtons
                  onEdit={() => onEdit?.(row)}
                  onDelete={() => onDelete?.(row)}
                />
              </Box>
            ),
          },
        ];

      // =====================================================
      // TICKETS
      // =====================================================

      case "tickets":
        return [
          {
            field: "ticketName",
            headerName: "TICKET NAME",
          },

          {
            field: "dealName",
            headerName: "DEAL NAME",
          },

          {
            field: "status",
            headerName: "TICKET STATUS",
          },

          {
            field: "priority",
            headerName: "PRIORITY",
          },

          {
            field: "source",
            headerName: "SOURCE",
          },

          {
            field: "ticketOwner",
            headerName: "TICKET OWNER",
          },

          {
            field: "createdDate",
            headerName: "CREATED DATE",
          },

          {
            field: "actions",
            headerName: "ACTIONS",

            render: (row: any) => (
              <ActionButtons
                onEdit={() => onEdit?.(row)}
                onDelete={() => onDelete?.(row)}
              />
            ),
          },
        ];

      default:
        return [];
    }
  };

  const columns = getColumns();

  return (
    <Box
      sx={{
        py: 1,
        width: "100%",
        flex: 1,
        overflow: "visible",
      }}
    >
      <TableContainer
        sx={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 1100,
            tableLayout: "auto",

            "& .MuiTableCell-root": {
              whiteSpace: "nowrap",
            },
          }}
        >
          {/* HEADER */}

          <TableHead>
            <TableRow>
              <TableCell
                padding="checkbox"
                sx={{
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                <Checkbox
                  sx={{
                    color: "white",
                  }}
                />
              </TableCell>

              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  sx={{
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: 300,
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* BODY */}

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  align="center"
                  sx={{
                    py: 4,
                    color: "text.secondary",
                  }}
                >
                  No {type} found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={row.id ?? index}
                  hover
                  onClick={() => {
                    if (row.id) {
                      router.push(`/${type}/${row.id}`);
                    }
                  }}
                  sx={{
                    cursor: "pointer",
                  }}
                >
                  {/* CHECKBOX */}

                  <TableCell padding="checkbox">
                    <Checkbox onClick={(e) => e.stopPropagation()} />
                  </TableCell>

                  {/* COLUMNS */}

                  {columns.map((col) => (
                    <TableCell key={col.field}>
                      {col.render
                        ? col.render(row)
                        : (row.profile?.[col.field] ?? row[col.field] ?? "-")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
