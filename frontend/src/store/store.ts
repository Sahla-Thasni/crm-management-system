import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import selectionReducer from "./slices/selectionSlice";
import usersReducer from "./slices/usersSlice";
import leadsReducer from "./slices/leadsSlice";
import productsReducer from "./slices/productsSlice";
import companiesReducer from "./slices/companiesSlice";
import dealsReducer from "./slices/dealsSlice";
import dashboardReducer from "./slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    selection: selectionReducer,
    users: usersReducer,
    leads: leadsReducer,
    deals: dealsReducer,
    dashboard: dashboardReducer,

    products: productsReducer,
    companies: companiesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;