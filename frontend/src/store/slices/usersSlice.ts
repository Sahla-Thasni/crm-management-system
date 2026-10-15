import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "@/lib/api";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_superuser?: boolean;
}

interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

// --------------------------------------------------
// FETCH USERS
// Backend endpoint:
// /api/v1/users/list/
// --------------------------------------------------

export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>("users/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await apiRequest<UsersResponse>(
      "/users/list/"
    );

    return response.results;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "Failed to fetch users"
    );
  }
});

// --------------------------------------------------
// USERS SLICE
// --------------------------------------------------

const usersSlice = createSlice({
  name: "users",
  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      // -------------------------------
      // FETCH USERS - PENDING
      // -------------------------------

      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // -------------------------------
      // FETCH USERS - SUCCESS
      // -------------------------------

      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.users = action.payload;
      })

      // -------------------------------
      // FETCH USERS - ERROR
      // -------------------------------

      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Failed to fetch users";
      });
  },
});

export default usersSlice.reducer;