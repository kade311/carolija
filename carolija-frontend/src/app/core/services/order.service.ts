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
}
