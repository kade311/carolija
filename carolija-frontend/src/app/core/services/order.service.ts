import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../config/api-config';

export interface CheckoutRequest {
  customerName: string;
  address: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = `${apiBaseUrl}/api/orders`;
  constructor(private http: HttpClient) {}
  create(request: CheckoutRequest): Observable<{ orderId: number; totalAmount: number }> {
    return this.http.post<{ orderId: number; totalAmount: number }>(this.apiUrl, request);
  }
  getMine(): Observable<any[]> { return this.http.get<any[]>(this.apiUrl); }
  cancel(id: number): Observable<{ orderId: number; status: string }> {
    return this.http.post<{ orderId: number; status: string }>(`${this.apiUrl}/${id}/cancel`, {});
  }
  getAdmin(status = ''): Observable<any[]> {
    const url = status ? `${this.apiUrl}/admin?status=${encodeURIComponent(status)}` : `${this.apiUrl}/admin`;
    return this.http.get<any[]>(url);
  }
  updateStatus(id: number, status: string): Observable<{ orderId: number; status: string }> {
    return this.http.put<{ orderId: number; status: string }>(`${this.apiUrl}/${id}/status`, { status });
  }
  getSummary(): Observable<any> { return this.http.get<any>(`${this.apiUrl}/admin/summary`); }
}
