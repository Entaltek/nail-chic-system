export interface ApiResponse<T> {
  status: number; // 0 error | 1 success
  message: string;
  data?: T;
}