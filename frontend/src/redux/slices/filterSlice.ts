import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy: string;
  sortOrder: string;
  skip: number;
  limit: number;
}

const initialState: FilterState = {
  categoryId: undefined,
  search: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  minRating: undefined,
  sortBy: 'created_at',
  sortOrder: 'desc',
  skip: 0,
  limit: 20,
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setCategoryId: (state, action: PayloadAction<number | undefined>) => {
      state.categoryId = action.payload;
      state.skip = 0;
    },
    setSearch: (state, action: PayloadAction<string | undefined>) => {
      state.search = action.payload;
      state.skip = 0;
    },
    setMinPrice: (state, action: PayloadAction<number | undefined>) => {
      state.minPrice = action.payload;
      state.skip = 0;
    },
    setMaxPrice: (state, action: PayloadAction<number | undefined>) => {
      state.maxPrice = action.payload;
      state.skip = 0;
    },
    setMinRating: (state, action: PayloadAction<number | undefined>) => {
      state.minRating = action.payload;
      state.skip = 0;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
      state.skip = 0;
    },
    setSortOrder: (state, action: PayloadAction<string>) => {
      state.sortOrder = action.payload;
      state.skip = 0;
    },
    setSkip: (state, action: PayloadAction<number>) => {
      state.skip = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    resetFilters: (state) => {
      return initialState;
    },
    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      return { ...state, ...action.payload, skip: 0 };
    },
  },
});

export const {
  setCategoryId,
  setSearch,
  setMinPrice,
  setMaxPrice,
  setMinRating,
  setSortBy,
  setSortOrder,
  setSkip,
  setLimit,
  resetFilters,
  setFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
