import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiRequest } from "@/lib/api";

// =====================================================
// DEAL OWNER
// =====================================================

export interface DealOwner {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

// =====================================================
// ASSOCIATED LEAD
// =====================================================

export interface AssociatedLead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

// =====================================================
// DEAL
// =====================================================

export interface Deal {
  id: number;

  deal_name: string;

  associated_lead: number;
  associated_lead_details: AssociatedLead;

  deal_stage: string;

  amount: string;

  deal_owner: number[];
  deal_owner_details: DealOwner[];

  close_date: string;

  priority: string;

  created_by: number;
  created_by_name: string;

  is_active: boolean;

  created_at: string;
  updated_at: string;
}

// =====================================================
// CREATE DEAL PAYLOAD
// =====================================================

export interface CreateDealPayload {
  deal_name: string;
  associated_lead: number;
  deal_stage: string;
  deal_owner: number[];
  close_date: string;
  priority: string;
}

export interface UpdateDealPayload {
  id: number;
  data: Partial<CreateDealPayload>;
}

// =====================================================
// API RESPONSE
// =====================================================

interface DealsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Deal[];
}

// =====================================================
// FETCH PARAMETERS
// =====================================================

export interface FetchDealsParams {
  page: number;
  pageSize: number;

  search?: string;

  // Filters
  deal_stage?: string;
  priority?: string;
  associated_lead?: string;
  deal_owner?: string;
  created_by?: string;
  close_date?: string;
  is_active?: boolean;
}

// =====================================================
// REDUX STATE
// =====================================================

interface DealsState {
  deals: Deal[];

  count: number;

  next: string | null;
  previous: string | null;

  loading: boolean;

  error: string | null;
}

// =====================================================
// INITIAL STATE
// =====================================================

const initialState: DealsState = {
  deals: [],

  count: 0,

  next: null,
  previous: null,

  loading: false,

  error: null,
};

// =====================================================
// FETCH DEALS
// =====================================================

export const fetchDeals = createAsyncThunk<
  DealsApiResponse,
  FetchDealsParams,
  { rejectValue: string }
>(
  "deals/fetchDeals",

  async (
    {
      page,
      pageSize,
      search,
      deal_stage,
      priority,
      associated_lead,
      deal_owner,
      created_by,
      close_date,
      is_active,
    },
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();

      // -------------------------------------------------
      // PAGINATION
      // -------------------------------------------------

      params.set("page", String(page));

      params.set("page_size", String(pageSize));

      // -------------------------------------------------
      // SEARCH
      // -------------------------------------------------

      if (search?.trim()) {
        params.set("search", search.trim());
      }

      // -------------------------------------------------
      // DEAL STAGE
      // -------------------------------------------------

      if (deal_stage) {
        params.set("deal_stage", deal_stage);
      }

      // -------------------------------------------------
      // PRIORITY
      // -------------------------------------------------

      if (priority) {
        params.set("priority", priority);
      }

      // -------------------------------------------------
      // ASSOCIATED LEAD
      // -------------------------------------------------

      if (associated_lead) {
        params.set("associated_lead", associated_lead);
      }

      // -------------------------------------------------
      // DEAL OWNER
      // -------------------------------------------------

      if (deal_owner) {
        params.set("deal_owner", deal_owner);
      }

      // -------------------------------------------------
      // CREATED BY
      // -------------------------------------------------

      if (created_by) {
        params.set("created_by", created_by);
      }

      // -------------------------------------------------
      // CLOSE DATE
      // -------------------------------------------------

      if (close_date) {
        params.set("close_date", close_date);
      }

      // -------------------------------------------------
      // ACTIVE
      // -------------------------------------------------

      if (is_active !== undefined) {
        params.set("is_active", String(is_active));
      }

      // -------------------------------------------------
      // API REQUEST
      // -------------------------------------------------

      const response = await apiRequest<DealsApiResponse>(
        `/deals/?${params.toString()}`,
      );

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch deals",
      );
    }
  },
);
// =====================================================
// CREATE DEAL
// =====================================================

export const createDeal = createAsyncThunk<
  Deal,
  CreateDealPayload,
  { rejectValue: string }
>(
  "deals/createDeal",

  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiRequest<Deal>("/deals/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create deal",
      );
    }
  },
);

export const updateDeal = createAsyncThunk<
  Deal,
  UpdateDealPayload,
  { rejectValue: string }
>(
  "deals/updateDeal",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await apiRequest<Deal>(`/deals/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update deal",
      );
    }
  },
);

export const deleteDeal = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "deals/deleteDeal",
  async (id, { rejectWithValue }) => {
    try {
      await apiRequest<void>(`/deals/${id}/`, {
        method: "DELETE",
      });

      return id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete deal",
      );
    }
  },
);
// =====================================================
// DEALS SLICE
// =====================================================

const dealsSlice = createSlice({
  name: "deals",

  initialState,

  reducers: {
    clearDealsError: (state) => {
      state.error = null;
    },

    clearDeals: (state) => {
      state.deals = [];
      state.count = 0;
      state.next = null;
      state.previous = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =================================================
      // FETCH PENDING
      // =================================================

      .addCase(fetchDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // =================================================
      // FETCH SUCCESS
      // =================================================

      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.loading = false;

        state.deals = action.payload.results;

        state.count = action.payload.count;

        state.next = action.payload.next;

        state.previous = action.payload.previous;

        state.error = null;
      })

      // =================================================
      // FETCH ERROR
      // =================================================

      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload ?? "Failed to fetch deals";
      })

      // =================================================
      // CREATE DEAL - PENDING
      // =================================================

      .addCase(createDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // =================================================
      // CREATE DEAL - SUCCESS
      // =================================================

      .addCase(createDeal.fulfilled, (state, action) => {
        state.loading = false;

        state.deals.unshift(action.payload);

        state.count += 1;

        state.error = null;
      })

      // =================================================
      // CREATE DEAL - ERROR
      // =================================================

      .addCase(createDeal.rejected, (state, action) => {
        state.loading = false;

        // state.error = action.payload ?? "Failed to create deal";
      })
            .addCase(updateDeal.fulfilled, (state, action) => {
        const index = state.deals.findIndex(
          (deal) => deal.id === action.payload.id,
        );

        if (index !== -1) {
          state.deals[index] = action.payload;
        }
      })

      .addCase(deleteDeal.fulfilled, (state, action) => {
        state.deals = state.deals.filter(
          (deal) => deal.id !== action.payload,
        );

        state.count = Math.max(0, state.count - 1);
      });
  },
});

// =====================================================
// ACTIONS
// =====================================================

export const { clearDealsError, clearDeals } = dealsSlice.actions;

// =====================================================
// REDUCER
// =====================================================

export default dealsSlice.reducer;
