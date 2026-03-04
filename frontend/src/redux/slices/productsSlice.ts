import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: string;
  discount_percentage: number;
  discount_price?: string;
  stock: number;
  image_url?: string;
  rating: number;
  review_count: number;
  category_id: number;
  created_at: string;
}

interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  relatedProducts: Product[];
  total: number;
  loading: boolean;
  error: string | null;
  skip: number;
  limit: number;
}

const initialState: ProductsState = {
  products: [],
  selectedProduct: null,
  relatedProducts: [],
  total: 0,
  loading: false,
  error: null,
  skip: 0,
  limit: 20,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: {
    category_id?: number;
    search?: string;
    min_price?: number;
    max_price?: number;
    min_rating?: number;
    sort_by?: string;
    sort_order?: string;
    skip?: number;
    limit?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch product');
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  'products/fetchRelatedProducts',
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${productId}/related`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch related products');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.items;
        state.total = action.payload.total;
        state.skip = action.payload.skip;
        state.limit = action.payload.limit;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.relatedProducts = action.payload;
      });
  },
});

export const { clearSelectedProduct, clearError } = productsSlice.actions;
export default productsSlice.reducer;
