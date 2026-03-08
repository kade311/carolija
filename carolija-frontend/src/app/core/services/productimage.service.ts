import { Injectable } from "@angular/core";
import { HttpClient, HttpEvent } from "@angular/common/http";
import { Observable } from "rxjs";
import { ProductImage } from "../models/productimage.model";

@Injectable({
    providedIn: 'root'
})
export class ProductImageService{
    private apiUrl = 'http://localhost:7200/api/productimages';

    constructor(private http: HttpClient){}

    getImagesByProductId(productId: number) : Observable<ProductImage[]>{
        return this.http.get<ProductImage[]>(`${this.apiUrl}/${productId}/images`);
    }

    uploadImage(productId: number, image: File):Observable<HttpEvent<any>>{
        const formData = new FormData();
        formData.append('image', image)
        return this.http.post(`${this.apiUrl}/${productId}`, formData, {
            reportProgress: true,
            observe: 'events'
        });
    }

    changeImageToMain(id:number): Observable<ProductImage>{
        return this.http.put<ProductImage>(`${this.apiUrl}/${id}/set-main`,{})
    }

    deleteImage(id: number):Observable<ProductImage>{
        return this.http.delete<ProductImage>(`${this.apiUrl}/${id}/delete-image`)
    }
}