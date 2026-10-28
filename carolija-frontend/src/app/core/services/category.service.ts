import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Category } from "../models/category.model";
import { apiBaseUrl } from '../config/api-config';

@Injectable({
    providedIn: 'root'
})
export class CategoryService{
    private apiUrl = `${apiBaseUrl}/api/categories`;

    constructor(private http: HttpClient){}

    getCategories(): Observable<Category[]>{
        return this.http.get<Category[]>(this.apiUrl)
    };

    addCategory(name: string, description: string, image: File | null): Observable<Category>{
        const formData = new FormData();
        formData.append('name',name);
        formData.append('description',description);
        if(image){
            formData.append('image', image, image.name);
        }

        return this.http.post<Category>(`${this.apiUrl}`, formData);
    };

    getCategoryById(id:number): Observable<Category>{
        return this.http.get<Category>(`${this.apiUrl}/${id}`)
    };

    getCategoryAdminById(id:number): Observable<Category>{
        return this.http.get<Category>(`${this.apiUrl}/admin/${id}`)
    };

    updateCategory(id:number, name: string, description: string, image: File | null) : Observable<Category>{
        const formData = new FormData();
        formData.append('name',name);
        formData.append('description',description);
        if(image){
            formData.append('image', image, image.name);
        }
        return this.http.put<Category>(`${this.apiUrl}/${id}`, formData);
    }

    getCategoriesAdmin(): Observable<Category[]>{
        return this.http.get<Category[]>(`${this.apiUrl}/admin`)
    };

    softDeleteCategory(id:number) : Observable<any>{
        return this.http.delete<Category>(`${this.apiUrl}/${id}`);
    }

    restoreCategory(id: number) : Observable<Category>{
        return this.http.put<Category>(`${this.apiUrl}/restore/${id}`, {});
    }
}
