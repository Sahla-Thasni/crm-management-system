"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  IconButton,
  Button,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";

import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api";

// =====================================================
// TYPES
// =====================================================

type SearchResult = {
  type: "lead" | "company" | "deal" | "ticket";
  id: number;

  // Lead
  first_name?: string;
  last_name?: string;
  status?: string;
  phone_number?: string;
  company?: string | null;

  // Company
  company_name?: string;
  city?: string;

  // Deal
  deal_name?: string;
  amount?: number | string;

  // Ticket
  ticket_name?: string;
  priority?: string;
};

type GlobalSearchResponse = {
  search: string;
  results: SearchResult[];
};

// =====================================================
// API
// =====================================================

const GLOBAL_SEARCH_URL = "/global-search/";

// =====================================================
// PAGE
// =====================================================

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQuery =
    searchParams.get("search") || "";

  const [results, setResults] = useState<
    SearchResult[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  // ===================================================
  // SEARCH API
  // ===================================================

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response =
          (await apiRequest(
            `${GLOBAL_SEARCH_URL}?search=${encodeURIComponent(
              searchQuery
            )}`,
            {
              method: "GET",
            }
          )) as GlobalSearchResponse;

        console.log(
          "Global Search Results:",
          response
        );

        setResults(response.results || []);
      } catch (err) {
        console.error(
          "Global search page error:",
          err
        );

        setError(
          "Unable to load search results."
        );

        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  // ===================================================
  // RESULT TITLE
  // ===================================================

  const getResultTitle = (
    result: SearchResult
  ) => {
    switch (result.type) {
      case "lead":
        return `${result.first_name || ""} ${
          result.last_name || ""
        }`.trim();

      case "company":
        return result.company_name || "Company";

      case "deal":
        return result.deal_name || "Deal";

      case "ticket":
        return result.ticket_name || "Ticket";

      default:
        return "Result";
    }
  };

  // ===================================================
  // RESULT SUBTITLE
  // ===================================================

  const getResultSubtitle = (
    result: SearchResult
  ) => {
    switch (result.type) {
      case "lead":
        return (
          result.company ||
          result.phone_number ||
          ""
        );

      case "company":
        return (
          result.city ||
          result.phone_number ||
          ""
        );

      case "deal":
        return result.amount
          ? `Amount: ${result.amount}`
          : "";

      case "ticket":
        return result.priority
          ? `Priority: ${result.priority}`
          : "";

      default:
        return "";
    }
  };

  // ===================================================
  // RESULT CLICK
  // ===================================================

  const handleResultClick = (
    result: SearchResult
  ) => {
    switch (result.type) {
      case "lead":
        router.push(`/leads/${result.id}`);
        break;

      case "company":
        router.push(`/companies/${result.id}`);
        break;

      case "deal":
        router.push(`/deals/${result.id}`);
        break;

      case "ticket":
        router.push(`/tickets/${result.id}`);
        break;

      default:
        break;
    }
  };

  // ===================================================
  // GROUP RESULTS
  // ===================================================

  const leads = results.filter(
    (result) => result.type === "lead"
  );

  const companies = results.filter(
    (result) => result.type === "company"
  );

  const deals = results.filter(
    (result) => result.type === "deal"
  );

  const tickets = results.filter(
    (result) => result.type === "ticket"
  );

  // ===================================================
  // RESULT SECTION
  // ===================================================

  const renderSection = (
    title: string,
    sectionResults: SearchResult[]
  ) => {
    if (sectionResults.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mb: 4 }}>
        {/* Section Header */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600 }}
          >
            {title}
          </Typography>

          <Chip
            label={sectionResults.length}
            size="small"
            color="primary"
          />
        </Box>

        {/* Results */}

        <Paper
          elevation={0}
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {sectionResults.map(
            (result, index) => (
              <Box
                key={`${result.type}-${result.id}`}
                onClick={() =>
                  handleResultClick(result)
                }
                sx={{
                  px: 2,
                  py: 2,
                  cursor: "pointer",

                  borderBottom:
                    index !==
                    sectionResults.length - 1
                      ? 1
                      : 0,

                  borderColor: "divider",

                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: 2,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {getResultTitle(
                        result
                      )}
                    </Typography>

                    {getResultSubtitle(
                      result
                    ) && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {getResultSubtitle(
                          result
                        )}
                      </Typography>
                    )}
                  </Box>

                  <Chip
                    label={result.type}
                    size="small"
                    variant="outlined"
                    sx={{
                      textTransform:
                        "capitalize",
                      flexShrink: 0,
                    }}
                  />
                </Box>

                {result.status && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mt: 0.5,
                    }}
                  >
                    Status: {result.status}
                  </Typography>
                )}

                {result.priority && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mt: 0.5,
                    }}
                  >
                    Priority:{" "}
                    {result.priority}
                  </Typography>
                )}
              </Box>
            )
          )}
        </Paper>
      </Box>
    );
  };

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        px: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        py: 3,
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <IconButton
          onClick={() => router.back()}
          size="small"
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
          }}
        >
          Global Search
        </Typography>
      </Box>

      {/* =================================================
          SEARCH QUERY
      ================================================= */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 4,
          ml: 1,
        }}
      >
        <SearchIcon
          fontSize="small"
          color="action"
        />

        <Typography
          variant="body1"
          color="text.secondary"
        >
          Search results for{" "}
          <strong>"{searchQuery}"</strong>
        </Typography>
      </Box>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {!loading && error && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography
            color="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Typography>

          <Button
            variant="contained"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </Button>
        </Paper>
      )}

      {/* =================================================
          EMPTY SEARCH
      ================================================= */}

      {!loading &&
        !error &&
        !searchQuery.trim() && (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: "center",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <SearchIcon
              sx={{
                fontSize: 50,
                color: "text.secondary",
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              sx={{ mb: 1 }}
            >
              Search CRM
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Use the navbar search to find
              leads, companies, deals and
              tickets.
            </Typography>
          </Paper>
        )}

      {/* =================================================
          NO RESULTS
      ================================================= */}

      {!loading &&
        !error &&
        searchQuery.trim() &&
        results.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: "center",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <SearchIcon
              sx={{
                fontSize: 50,
                color: "text.secondary",
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              sx={{ mb: 1 }}
            >
              No results found
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              No leads, companies, deals or
              tickets matched "{searchQuery}".
            </Typography>
          </Paper>
        )}

      {/* =================================================
          RESULTS
      ================================================= */}

      {!loading &&
        !error &&
        results.length > 0 && (
          <>
            {renderSection(
              "Leads",
              leads
            )}

            {renderSection(
              "Companies",
              companies
            )}

            {renderSection(
              "Deals",
              deals
            )}

            {renderSection(
              "Tickets",
              tickets
            )}
          </>
        )}
    </Box>
  );
}