import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          (config.headers as any).Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(name: string, email: string, password: string) {
    const response = await this.client.post('/auth/register', { name, email, password });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  // Trip endpoints
  async searchTrips(from: string, to: string, date: string) {
    const response = await this.client.get('/trips/search', {
      params: { from, to, date }
    });
    return response.data;
  }

  async getTripById(tripId: string) {
    const response = await this.client.get(`/trips/${tripId}`);
    return response.data;
  }

  async createTrip(tripData: any) {
    const response = await this.client.post('/trips', tripData);
    return response.data;
  }

  async updateSeatStatus(tripId: string, seatIds: string[], status: string) {
    const response = await this.client.patch(`/trips/${tripId}/seats`, { seatIds, status });
    return response.data;
  }

  // Booking endpoints
  async createBooking(tripId: string, seats: { seatId: string; price: number }[]) {
    const response = await this.client.post('/bookings', { tripId, seats });
    return response.data;
  }

  async getUserBookings() {
    const response = await this.client.get('/bookings/user');
    return response.data;
  }

  async getBookingById(bookingId: string) {
    const response = await this.client.get(`/bookings/${bookingId}`);
    return response.data;
  }

  async cancelBooking(bookingId: string) {
    const response = await this.client.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  }
}

export default new ApiService();
