import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "@/lib/api";

/* =========================================================
   CREATE LEAD PAYLOAD
========================================================= */

export interface CreateLeadPayload {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  job_title: string;

  contact_owner: number[];

  products: number[];

  company: number | null;

  city: string;

  lead_status: string;

  lead_date: string;
}

/* =========================================================
   LEAD
========================================================= */

export interface Lead {
  status: string;
  id: number;

  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  job_title: string;

  contact_owner: number[];

  contact_owner_details?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }[];

  products: number[];

  product_details?: {
    id: number;
    name: string;
    sku: string;
    unit_price: string | number;
  }[];

  company: number | null;

  company_details?: {
    id: number;
    company_name: string;
    email: string;
    phone_number: string;
  } | null;

  city: string;

  lead_status: string;

  lead_date: string;

  created_by: number;

  created_by_name?: string;

  is_active: boolean;

  created_at: string;

  updated_at: string;
}

/* =========================================================
   API RESPONSE
========================================================= */

interface LeadsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Lead[];
}

/* =========================================================
   STATE
========================================================= */

interface LeadsState {
  leads: Lead[];

  loading: boolean;

  error: string | null;

  totalCount: number;

  currentPage: number;

  pageSize: number;

  nextPage: string | null;

  previousPage: string | null;
}

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState: LeadsState = {
  leads: [],

  loading: false,

  error: null,

  totalCount: 0,

  currentPage: 1,

  pageSize: 10,

  nextPage: null,

  previousPage: null,
};

/* =========================================================
   FETCH LEADS PARAMS
========================================================= */

export interface FetchLeadsParams {
  search?: string;

  created_at?: string;

  lead_status?: string;

  page?: number;

  page_size?: number;
}

/* =========================================================
   FETCH LEADS
========================================================= */

export const fetchLeads = createAsyncThunk<
  LeadsApiResponse,
  FetchLeadsParams | undefined,
  {
    rejectValue: string;
  }
>(
  "leads/fetchLeads",

  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      /* =====================================================
         SEARCH
      ===================================================== */

      if (params?.search?.trim()) {
        queryParams.set(
          "search",
          params.search.trim()
        );
      }
      if (params?.lead_status?.trim()) {
  queryParams.set(
    "lead_status",
    params.lead_status.trim()
  );
}

      /* =====================================================
         CREATED DATE
      ===================================================== */

      if (params?.created_at) {
        queryParams.set(
          "created_at__date",
          params.created_at
        );
      }

      /* =====================================================
         LEAD STATUS
      ===================================================== */

      if (params?.lead_status?.trim()) {
        queryParams.set(
          "lead_status",
          params.lead_status.trim()
        );
      }

      /* =====================================================
         PAGE
      ===================================================== */

      if (params?.page) {
        queryParams.set(
          "page",
          String(params.page)
        );
      }

      /* =====================================================
         PAGE SIZE
      ===================================================== */

      if (params?.page_size) {
        queryParams.set(
          "page_size",
          String(params.page_size)
        );
      }

      /* =====================================================
         BUILD URL
      ===================================================== */

      const queryString =
        queryParams.toString();

      const url = queryString
        ? `/leads/?${queryString}`
        : "/leads/";

      console.log(
        "FETCH LEADS URL:",
        url
      );

      /* =====================================================
         API REQUEST
      ===================================================== */

      const response =
        await apiRequest<LeadsApiResponse>(
          url
        );

      /* =====================================================
         DEBUG
      ===================================================== */

      console.log(
        "LEADS API RESPONSE:",
        response
      );

      console.log(
        "TOTAL COUNT:",
        response.count
      );

      console.log(
        "RESULTS:",
        response.results.length
      );

      /* =====================================================
         RETURN COMPLETE RESPONSE
      ===================================================== */

      return response;

    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch leads"
      );
    }
  }
);

/* =========================================================
   CREATE LEAD
========================================================= */

export const createLead = createAsyncThunk<
  Lead,
  CreateLeadPayload,
  {
    rejectValue: string;
  }
>(
  "leads/createLead",

  async (
    payload,
    { rejectWithValue }
  ) => {
    try {
      const response =
        await apiRequest<Lead>(
          "/leads/",
          {
            method: "POST",

            body: JSON.stringify(
              payload
            ),
          }
        );

      return response;

    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to create lead"
      );
    }
  }
);

/* =========================================================
   UPDATE LEAD
========================================================= */

export const updateLead = createAsyncThunk<
  Lead,
  {
    id: number;
    payload: CreateLeadPayload;
  },
  {
    rejectValue: string;
  }
>(
  "leads/updateLead",

  async (
    { id, payload },
    { rejectWithValue }
  ) => {
    try {
      const response =
        await apiRequest<Lead>(
          `/leads/${id}/`,
          {
            method: "PATCH",

            body: JSON.stringify(
              payload
            ),
          }
        );

      return response;

    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to update lead"
      );
    }
  }
);

/* =========================================================
   DELETE LEAD
========================================================= */

export const deleteLead = createAsyncThunk<
  number,
  number,
  {
    rejectValue: string;
  }
>(
  "leads/deleteLead",

  async (
    id,
    { rejectWithValue }
  ) => {
    try {
      await apiRequest(
        `/leads/${id}/`,
        {
          method: "DELETE",
        }
      );

      return id;

    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to delete lead"
      );
    }
  }
);

/* =========================================================
   SLICE
========================================================= */

const leadsSlice = createSlice({
  name: "leads",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* =====================================================
         FETCH PENDING
      ===================================================== */

      .addCase(
        fetchLeads.pending,
        (state) => {
          state.loading = true;

          state.error = null;
        }
      )

      /* =====================================================
         FETCH SUCCESS
      ===================================================== */

      .addCase(
  fetchLeads.fulfilled,
  (state, action) => {
    state.loading = false;

    state.leads =
      action.payload.results;

    state.totalCount =
      action.payload.count;

    state.nextPage =
      action.payload.next;

    state.previousPage =
      action.payload.previous;

    /*
     * Page number comes from the
     * thunk meta argument.
     */

    const requestedPage =
      action.meta.arg?.page ?? 1;

    state.currentPage =
      requestedPage;

    state.pageSize =
      action.meta.arg?.page_size ??
      state.pageSize;

    console.log(
      "CURRENT PAGE:",
      requestedPage
    );

    console.log(
      "TOTAL COUNT:",
      action.payload.count
    );

    console.log(
      "TOTAL PAGES:",
      Math.ceil(
        action.payload.count /
          (action.meta.arg?.page_size ??
            state.pageSize)
      )
    );
  }
)
      /* =====================================================
         FETCH ERROR
      ===================================================== */

      .addCase(
        fetchLeads.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ??
            "Failed to fetch leads";
        }
      )

      /* =====================================================
         UPDATE PENDING
      ===================================================== */

      .addCase(
        updateLead.pending,
        (state) => {
          state.loading = true;

          state.error = null;
        }
      )

      /* =====================================================
         UPDATE SUCCESS
      ===================================================== */

      .addCase(
        updateLead.fulfilled,
        (state, action) => {
          state.loading = false;

          const index =
            state.leads.findIndex(
              (lead) =>
                lead.id ===
                action.payload.id
            );

          if (index !== -1) {
            state.leads[index] =
              action.payload;
          }
        }
      )

      /* =====================================================
         UPDATE ERROR
      ===================================================== */

      .addCase(
        updateLead.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ??
            "Failed to update lead";
        }
      )

      /* =====================================================
         CREATE PENDING
      ===================================================== */

      .addCase(
        createLead.pending,
        (state) => {
          state.loading = true;

          state.error = null;
        }
      )

      /* =====================================================
         CREATE SUCCESS
      ===================================================== */

      .addCase(
        createLead.fulfilled,
        (state, action) => {
          state.loading = false;

          state.leads.unshift(
            action.payload
          );

          /*
           * Increase total count because
           * a new lead was created.
           */

          state.totalCount += 1;
        }
      )

      /* =====================================================
         CREATE ERROR
      ===================================================== */

      .addCase(
        createLead.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ??
            "Failed to create lead";
        }
      )

      /* =====================================================
         DELETE PENDING
      ===================================================== */

      .addCase(
        deleteLead.pending,
        (state) => {
          state.loading = true;

          state.error = null;
        }
      )

      /* =====================================================
         DELETE SUCCESS
      ===================================================== */

      .addCase(
        deleteLead.fulfilled,
        (state, action) => {
          state.loading = false;

          state.leads =
            state.leads.filter(
              (lead) =>
                lead.id !==
                action.payload
            );

          /*
           * Decrease total count.
           */

          state.totalCount =
            Math.max(
              0,
              state.totalCount - 1
            );
        }
      )

      /* =====================================================
         DELETE ERROR
      ===================================================== */

      .addCase(
        deleteLead.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ??
            "Failed to delete lead";
        }
      );
  },
})

/* =========================================================
   EXPORT
========================================================= */

export default leadsSlice.reducer;