import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ClientSession, MeDto } from '@/features/auth/types';

/** Access token lives only here (memory). The refresh token never reaches JS — it's an httpOnly cookie. */
export interface AuthState {
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  me: MeDto | null;
  currentBranchId: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  accessTokenExpiresAt: null,
  me: null,
  currentBranchId: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionReceived(state, action: PayloadAction<ClientSession>) {
      state.accessToken = action.payload.accessToken;
      state.accessTokenExpiresAt = action.payload.accessTokenExpiresAt;
    },
    meLoaded(state, action: PayloadAction<MeDto>) {
      state.me = action.payload;
      const branchIds = action.payload.branches.map((branch) => branch.id);
      if (!state.currentBranchId || !branchIds.includes(state.currentBranchId)) {
        state.currentBranchId = branchIds[0] ?? null;
      }
    },
    branchChanged(state, action: PayloadAction<string>) {
      state.currentBranchId = action.payload;
    },
    /** Handled at the root reducer: wipes auth + the whole RTK Query cache. */
    loggedOut() {
      return initialState;
    },
  },
  selectors: {
    selectAccessToken: (state) => state.accessToken,
    selectMe: (state) => state.me,
    selectCurrentBranchId: (state) => state.currentBranchId,
  },
});

export const { sessionReceived, meLoaded, branchChanged, loggedOut } = authSlice.actions;
export const { selectAccessToken, selectMe, selectCurrentBranchId } = authSlice.selectors;
