import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SelectionState {
  selectedUserIds: number[];
}

const initialState: SelectionState = {
  selectedUserIds: [],
};

const selectionSlice = createSlice({
  name: "selection",
  initialState,

  reducers: {
    setSelectedUserIds: (
      state,
      action: PayloadAction<number[]>
    ) => {
      state.selectedUserIds = action.payload;
    },

    addSelectedUser: (
      state,
      action: PayloadAction<number>
    ) => {
      if (!state.selectedUserIds.includes(action.payload)) {
        state.selectedUserIds.push(action.payload);
      }
    },

    removeSelectedUser: (
      state,
      action: PayloadAction<number>
    ) => {
      state.selectedUserIds = state.selectedUserIds.filter(
        (id) => id !== action.payload
      );
    },

    clearSelectedUsers: (state) => {
      state.selectedUserIds = [];
    },
  },
});

export const {
  setSelectedUserIds,
  addSelectedUser,
  removeSelectedUser,
  clearSelectedUsers,
} = selectionSlice.actions;

export default selectionSlice.reducer;