export interface JwtPayload {
  id: string;
  email: string;
  name: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
