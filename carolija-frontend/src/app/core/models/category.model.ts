export interface Category {
  categoryID: number;
  categoryName: string;
  categoryDescription?: string;
  imageUrl?: string;
  imageDeleteHash? : string;
  isDeleted : boolean;
}
