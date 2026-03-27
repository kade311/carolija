import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TurnstileService {
  private apiUrl = 'http://localhost:7200/api/auth/turnstile-site-key';

  constructor(private http: HttpClient) {}

  getSiteKey(): Observable<string> {
    return this.http.get<{ siteKey: string }>(this.apiUrl).pipe(
      map(response => response.siteKey)
    );
  }
}
