import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { apiBaseUrl } from '../config/api-config';

@Injectable({
  providedIn: 'root'
})
export class TurnstileService {
  private apiUrl = `${apiBaseUrl}/api/auth/turnstile-site-key`;

  constructor(private http: HttpClient) {}

  getSiteKey(): Observable<string> {
    return this.http.get<{ siteKey: string }>(this.apiUrl).pipe(
      map(response => response.siteKey)
    );
  }
}
