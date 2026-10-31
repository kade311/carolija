import { Category } from "./category.model";
import { ProductImage } from "./productimage.model";

export interface Product {
    productId: number;
    categoryID: number;
    productName: string;
    productDescription?: string;
    productPrice: number;
    available: boolean;
    lightRequirement: string;
    wateringRequirement: string;
    isPetFriendly: boolean;
    stockQuantity: number;
    createdAt: string;
    category?: Category;
    productImages?: ProductImage[];
}