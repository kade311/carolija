import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Product } from "../models/product.model";
import { PagedResult } from "../models/paged-result.model";
import { apiBaseUrl } from '../config/api-config';

@Injectable({
    providedIn: 'root'
})
export class ProductService{
    private apiUrl = `${apiBaseUrl}/api/products`;

    constructor(private http: HttpClient){}

    getProducts(filters: any) : Observable<PagedResult<Product>>{
        let params = new HttpParams();

        if(filters.categoryId) params = params.set('categoryId', filters.categoryId.toString());
        if(filters.search) params = params.set('search',filters.search);
        if(filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
        if(filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
        if(filters.sortBy) params = params.set('sortBy', filters.sortBy);

        params = params.set('pageNumber', filters.pageNumber.toString());
        params = params.set('pageSize', filters.pageSize.toString());

        return this.http.get<PagedResult<Product>>(this.apiUrl, {params});
    }

    getLatestProducts(arraySize:number=15): Observable<Product[]>{
        return this.http.get<Product[]>(`${this.apiUrl}/latest?arraySize=${arraySize}`);
    }

    getProductsByCategoryId(categoryId: number, search:string ='', pageNumber:number =1, pageSize:number=20): Observable<PagedResult<Product>>{
        let params = new HttpParams()
        .set('search',search)
        .set('pageNumber', pageNumber.toString())
        .set('pageSize',pageSize.toString());
        return this.http.get<PagedResult<Product>>(`${this.apiUrl}/category/${categoryId}`, {params})
    }

    getProductsByCategoryAdmin(categoryId: number, search:string ='', pageNumber:number =1, pageSize:number=20): Observable<PagedResult<Product>>{
        let params = new HttpParams()
        .set('search',search)
        .set('pageNumber', pageNumber.toString())
        .set('pageSize',pageSize.toString());
        return this.http.get<PagedResult<Product>>(`${this.apiUrl}/admin/category/${categoryId}`, {params})
    }

    deleteProduct(id: number): Observable<any>{
        return this.http.delete<Product>(`${this.apiUrl}/${id}`)
    }

    restoreProduct(id: number) : Observable<Product>{
        return this.http.put<Product>(`${this.apiUrl}/restore/${id}`, {})
    }

    addProduct(name: string, description: string, price: number, categoryId: number) : Observable<Product>{
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price.toString());
        formData.append('categoryId', categoryId.toString());

        return this.http.post<Product>(this.apiUrl, formData);
    }

    getProductById(id:number): Observable<Product>{
        return this.http.get<Product>(`${this.apiUrl}/${id}`)
    };

    updateProduct(id: number, name: string, description: string, price: number) : Observable<Product>{
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price.toString());
        return this.http.put<Product>(`${this.apiUrl}/${id}`, formData);
    }
}
