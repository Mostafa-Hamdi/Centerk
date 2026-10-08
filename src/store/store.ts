import { combineReducers, configureStore, type UnknownAction } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import { authSlice, loggedOut } from './authSlice';
import { uiSlice } from './uiSlice';

const appReducer = combineReducers({
  [authSlice.reducerPath]: authSlice.reducer,
  [uiSlice.reducerPath]: uiSlice.reducer,
  [api.reducerPath]: api.reducer,
});

/** Logging out resets everything, including every cached query. */
const rootReducer = (state: Parameters<typeof appReducer>[0], action: UnknownAction) =>
  appReducer(loggedOut.match(action) ? undefined : state, action);

export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
