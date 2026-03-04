import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Product } from './productsSlice';

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

interface CartTotals {
  subtotal: string;
  shipping_cost: string;
  tax: string;
  total: string;
}

interface CartState {
  items: CartItem[];
  totals: CartTotals | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  totals: null,
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (data: { product_id: number; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart/add', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (data: { item_id: number; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/cart/items/${data.item_id}`, { quantity: data.quantity });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      return itemId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to remove item');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/cart');
      return [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to clear cart');
    }
  }
);

export const fetchCartTotals = createAsyncThunk(
  'cart/fetchCartTotals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cart/totals');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch totals');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const existingItem = state.items.find(item => item.product_id === action.payload.product_id);
        if (existingItem) {
          existingItem.quantity = action.payload.quantity;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const item = state.items.find(item => item.id === action.payload.id);
        if (item) {
          item.quantity = action.payload.quantity;
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      })
      // Fetch Cart Totals
      .addCase(fetchCartTotals.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchCartTotals.fulfilled, (state, action) => {
        state.totals = action.payload;
      })
      .addCase(fetchCartTotals.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = cartSlice.actions;
export default cartSlice.reducer;
