import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Transient UI state. The sidebar collapse flag is *not* here: it lives on <html data-sidebar>
 * (set before paint from localStorage) so the shell renders at its final width with no layout shift
 * — see hooks/useSidebar.ts.
 */
export interface UiState {
  mobileNavOpen: boolean;
  commandPaletteOpen: boolean;
  /** Prepared for dark mode; tokens.css already has the [data-theme="dark"] block. */
  theme: 'light' | 'dark';
}

const initialState: UiState = { mobileNavOpen: false, commandPaletteOpen: false, theme: 'light' };

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    mobileNavToggled(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload;
    },
    commandPaletteToggled(state, action: PayloadAction<boolean>) {
      state.commandPaletteOpen = action.payload;
    },
  },
  selectors: {
    selectMobileNavOpen: (state) => state.mobileNavOpen,
    selectCommandPaletteOpen: (state) => state.commandPaletteOpen,
  },
});

export const { mobileNavToggled, commandPaletteToggled } = uiSlice.actions;
export const { selectMobileNavOpen, selectCommandPaletteOpen } = uiSlice.selectors;
