import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { AuthService } from '../../../core/services/auth.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { ProductService } from '../../../core/services/product.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent implements OnInit {
  products: Product[] = [];
  constructor(private auth: AuthService, private router: Router, private favorites: FavoriteService, private productsService: ProductService) {}
  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.favorites.getIds().subscribe(ids => {
      if (ids.length > 0) forkJoin(ids.map(id => this.productsService.getProductById(id))).subscribe(products => this.products = products);
    });
  }
}
