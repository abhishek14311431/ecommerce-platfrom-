import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  shipping_address: string;
  subtotal: string;
  shipping_cost: string;
  tax: string;
  total: string;
  status: string;
  payment_status: string;
  items: any[];
  created_at: string;
}

interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  total: 0,
  loading: false,
  error: null,
};

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (
    data: { shipping_address: string; payment_method?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/orders', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create order');
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (
    params: { skip?: number; limit?: number } | void,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/orders', { params: params || {} });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch order');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to cancel order');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserOrders.pending, (state) => {
        console.log('⏳ fetchUserOrders pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        console.log('✅ fetchUserOrders fulfilled, payload:', action.payload);
        state.loading = false;
        state.orders = action.payload.items;
        state.total = action.payload.total;
        console.log('✅ Orders set to state:', state.orders);
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        console.error('❌ fetchUserOrders rejected:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });
  },
});

export const { clearSelectedOrder, clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
