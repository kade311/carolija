import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../config/api-config';
import { Cart } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = `${apiBaseUrl}/api/cart`;
  constructor(private http: HttpClient) {}
  getCart(): Observable<Cart> { return this.http.get<Cart>(this.apiUrl); }
  addItem(productId: number, quantity = 1): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, { productId, quantity });
  }
  updateItem(productId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/items/${productId}`, { productId, quantity });
  }
  removeItem(productId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${productId}`);
  }
}
