import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../config/api-config';
import { UserProfile } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = `${apiBaseUrl}/api/profile`;
  constructor(private http: HttpClient) {}
  get(): Observable<UserProfile> { return this.http.get<UserProfile>(this.apiUrl); }
  update(profile: UserProfile): Observable<UserProfile> { return this.http.put<UserProfile>(this.apiUrl, profile); }
}
