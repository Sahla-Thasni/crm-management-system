import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { apiRequest } from "@/lib/api";

// =====================================================
// COMPANY TYPE
// =====================================================

export interface Company {
  id: number;

  company_name: string;
  domain_name: string;
  email: string;
  phone_number: string;

  company_owner: number[];
  company_owner_name: string;

  industry: number;
  industry_name: string;

  company_type: number;
  company_type_name: string;

  city: string;
  country: string;

  number_of_employees: number;
  annual_revenue: string;

  created_by: number;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

// =====================================================
// API RESPONSE
// =====================================================

interface CompaniesApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Company[];
}

// =====================================================
// FETCH PARAMETERS
// =====================================================

interface FetchCompaniesParams {
  page: number;
  pageSize: number;

  search?: string;

  // Filters
  industry?: string;
  city?: string;
  country?: string;
}

// =====================================================
// REDUX STATE
// =====================================================

interface CompaniesState {
  companies: Company[];

  count: number;

  next: string | null;

  previous: string | null;

  loading: boolean;

  error: string | null;
}

// =====================================================
// INITIAL STATE
// =====================================================

const initialState: CompaniesState = {
  companies: [],

  count: 0,

  next: null,

  previous: null,

  loading: false,

  error: null,
};

// =====================================================
// FETCH COMPANIES
// =====================================================

export const fetchCompanies = createAsyncThunk<
  CompaniesApiResponse,
  FetchCompaniesParams,
  { rejectValue: string }
>(
  "companies/fetchCompanies",

  async (
    {
      page,
      pageSize,
      search,
      industry,
      city,
      country,
    },
    { rejectWithValue }
  ) => {
    try {

      const params = new URLSearchParams();

      // Pagination
      params.set(
        "page",
        String(page)
      );

      params.set(
        "page_size",
        String(pageSize)
      );

      // -------------------------------------------------
      // SEARCH
      // -------------------------------------------------

      if (search?.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      // -------------------------------------------------
      // INDUSTRY FILTER
      // -------------------------------------------------

      if (industry) {
        params.set(
          "industry",
          industry
        );
      }

      // -------------------------------------------------
      // CITY FILTER
      // -------------------------------------------------

      if (city?.trim()) {
        params.set(
          "city",
          city.trim()
        );
      }

      // -------------------------------------------------
      // COUNTRY FILTER
      // -------------------------------------------------

      if (country?.trim()) {
        params.set(
          "country",
          country.trim()
        );
      }

      // -------------------------------------------------
      // API REQUEST
      // -------------------------------------------------

      const response =
        await apiRequest<CompaniesApiResponse>(
          `/companies/?${params.toString()}`
        );

      return response;

    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch companies"
      );
    }
  }
);

// =====================================================
// COMPANIES SLICE
// =====================================================

const companiesSlice = createSlice({
  name: "companies",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      // =================================================
      // FETCH PENDING
      // =================================================

      .addCase(
        fetchCompanies.pending,
        (state) => {
          state.loading = true;

          state.error = null;
        }
      )

      // =================================================
      // FETCH SUCCESS
      // =================================================

      .addCase(
        fetchCompanies.fulfilled,
        (state, action) => {
          state.loading = false;

          state.companies =
            action.payload.results;

          state.count =
            action.payload.count;

          state.next =
            action.payload.next;

          state.previous =
            action.payload.previous;

          state.error = null;
        }
      )

      // =================================================
      // FETCH ERROR
      // =================================================

      .addCase(
        fetchCompanies.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ??
            "Failed to fetch companies";
        }
      );
  },
});

// =====================================================
// EXPORT REDUCER
// =====================================================

export default companiesSlice.reducer;