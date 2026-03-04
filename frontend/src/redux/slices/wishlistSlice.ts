import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Product } from './productsSlice';

export interface WishlistItem {
  id: number;
  product_id: number;
  product: Product;
  created_at: string;
}

interface WishlistState {
  items: WishlistItem[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (params: { skip?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/wishlist', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/wishlist/${productId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to remove from wishlist');
    }
  }
);

export const checkWishlist = createAsyncThunk(
  'wishlist/checkWishlist',
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/wishlist/${productId}/check`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to check wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.total += 1;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.product_id !== action.payload);
        state.total -= 1;
      });
  },
});

export const { clearError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
