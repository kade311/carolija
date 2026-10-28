import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import {jwtDecode} from 'jwt-decode';
import { apiBaseUrl } from '../config/api-config';

@Injectable({
    providedIn: 'root'
})
export class AuthService{
    private apiUrl = `${apiBaseUrl}/api/auth`;

    constructor(private http: HttpClient){}

    register(data: any) : Observable<any>{
        return this.http.post(`${this.apiUrl}/register`, data);
    }

    login(data: any) : Observable<any>{
        return this.http.post<any>(`${this.apiUrl}/login`,data).pipe(
            tap({
                next: (res) => {
                    if(res.token){
                        localStorage.setItem('token', res.token)
                    }
                }
            })
        )
    }

    logout(){
        localStorage.removeItem('token');
    }

    getToken() : string|null{
        return localStorage.getItem('token');
    }

    isLoggedIn() : boolean{
        const token = this.getToken();
        if(!token){
            return false;
        }

        if(this.isTokenExpired(token)){
            this.logout();
            return false;
        }

        return true;
    }

    getUserEmail():string|null{
        const token = localStorage.getItem('token');

        if(!token){
            return null;
        }

        try{
            const decoded: any = jwtDecode(token);
            return decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
            || decoded['name']
            || decoded['sub'];
        }
        catch(error){
            console.error("Greska pri dekodiranju tokena - ", error);
            return null;
        }
    }

    isAdmin():boolean{
        const token = localStorage.getItem('token');
        if(!token || this.isTokenExpired(token)) return false;

        try{
            const decoded: any = jwtDecode(token);
            const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            return role === 'Admin';
        }
        catch(error){
            return false;
        }
    }

    isTokenExpired(token: string): boolean{
        try{
            const decoded: any = jwtDecode(token);
            const exp = decoded?.exp;

            if(!exp){
                return true;
            }

            return Date.now() >= exp * 1000;
        }
        catch{
            return true;
        }
    }
}
