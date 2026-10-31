import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../config/api-config';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private apiUrl = `${apiBaseUrl}/api/favorites`;
  constructor(private http: HttpClient) {}
  getIds(): Observable<number[]> { return this.http.get<number[]>(this.apiUrl); }
  toggle(productId: number): Observable<{ isFavorite: boolean }> {
    return this.http.post<{ isFavorite: boolean }>(`${this.apiUrl}/${productId}`, {});
  }
}
