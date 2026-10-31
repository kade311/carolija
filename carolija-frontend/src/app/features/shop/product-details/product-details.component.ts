import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { ProductImageService } from '../../../core/services/productimage.service';
import { ProductImage } from '../../../core/models/productimage.model';
import { CartService } from '../../../core/services/cart.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  product?: Product;
  images: ProductImage[] = [];
  selectedImage = '';
  loading = true;
  errorMessage = '';
  quantity = 1;
  actionMessage = '';
  isFavorite = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private imageService: ProductImageService,
    private cartService: CartService,
    private favoriteService: FavoriteService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Proizvod nije pronađen.';
      this.loading = false;
      if (this.authService.isLoggedIn()) {
        this.favoriteService.getIds().subscribe(ids => this.isFavorite = ids.includes(id));
      }
      return;
    }

    this.productService.getProductById(id).subscribe({
      next: product => {
        this.product = product;
        this.images = product.productImages ?? [];
        this.selectedImage = this.getMainImage();
        this.imageService.getImagesByProductId(id).subscribe({
          next: images => {
            if (images.length > 0) {
              this.images = images;
              this.selectedImage = this.getMainImage();
            }
          }
        });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Proizvod nije pronađen ili trenutno nije dostupan.';
        this.loading = false;
      }
    });
  }

  getMainImage(): string {
    return this.images.find(image => image.isMain)?.imageUrl
      || this.images[0]?.imageUrl
      || '';
  }

  selectImage(image: ProductImage): void {
    this.selectedImage = image.imageUrl;
  }

  addToCart(): void {
    if (!this.product || !this.authService.isLoggedIn()) {
      this.actionMessage = 'Prijavite se kako biste dodali proizvod u košaricu.';
      return;
    }
    this.cartService.addItem(this.product.productId, this.quantity).subscribe({
      next: () => this.actionMessage = 'Proizvod je dodan u košaricu.',
      error: () => this.actionMessage = 'Proizvod nije moguće dodati u košaricu.'
    });
  }

  toggleFavorite(): void {
    if (!this.product || !this.authService.isLoggedIn()) {
      this.actionMessage = 'Prijavite se kako biste koristili favorite.';
      return;
    }
    this.favoriteService.toggle(this.product.productId).subscribe(result => {
      this.isFavorite = result.isFavorite;
      this.actionMessage = this.isFavorite ? 'Dodano u favorite.' : 'Uklonjeno iz favorita.';
    });
  }
}
