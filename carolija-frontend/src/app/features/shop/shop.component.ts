import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CategoryService } from '../../core/services/category.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatInputModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  loading: boolean = false;
  allLoaded: boolean = false;
  
  filters = {
    categoryId: null as number | null,
    search: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    sortBy: 'name_asc',
    pageNumber: 1,
    pageSize: 12
  };

  private filterSubject = new Subject<void>();
  private subscription: Subscription = new Subscription();
  categories: any[] = [];

  constructor(private productService: ProductService, private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    });
    this.loadProducts(false);

    this.subscription = this.filterSubject.pipe(
      debounceTime(400)
    ).subscribe(() => {
      this.resetAndLoad();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadProducts(isAppending: boolean) {
    if (this.loading) return;
    this.loading = true;

    this.productService.getProducts(this.filters).subscribe({
      next: (data) => {
        if (isAppending) {
          this.products = [...this.products, ...data];
          if (data.length < this.filters.pageSize) this.allLoaded = true;
        } else {
          this.products = data;
          this.allLoaded = data.length < this.filters.pageSize;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  resetAndLoad() {
    this.filters.pageNumber = 1;
    this.allLoaded = false;
    this.loadProducts(false);
  }

  onFilterChange() {
    if (this.filters.minPrice !== null && this.filters.minPrice < 0) this.filters.minPrice = 0;
    if (this.filters.maxPrice !== null && this.filters.minPrice !== null && this.filters.maxPrice < this.filters.minPrice) {
      this.filters.maxPrice = null;
    }
    this.filterSubject.next();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500 && !this.loading && !this.allLoaded) {
      this.filters.pageNumber++;
      this.loadProducts(true);
    }
  }

  getMainImage(product: Product): string {
    return product.productImages?.[0]?.imageUrl || '';
  }
}