import { Category } from "./category.model";
import { ProductImage } from "./productimage.model";

export interface Product {
    productId: number;
    categoryID: number;
    productName: string;
    productDescription?: string;
    productPrice: number;
    available: boolean;
    createdAt: string;
    category?: Category;
    productImages?: ProductImage[];
}