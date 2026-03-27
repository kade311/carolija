import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
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
export class ShopComponent implements OnInit, AfterViewInit, OnDestroy {
  products: Product[] = [];
  loading: boolean = false;
  allLoaded: boolean = false;
  totalCount = 0;
  private observer?: IntersectionObserver;

  @ViewChild('scrollAnchor') scrollAnchor?: ElementRef<HTMLDivElement>;
  
  filters = {
    categoryId: null as number | null,
    search: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    sortBy: 'name_asc',
    pageNumber: 1,
    pageSize: 15
  };

  private filterSubject = new Subject<void>();
  private subscription: Subscription = new Subscription();
  categories: any[] = [];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const categoryId = this.route.snapshot.queryParamMap.get('categoryId');
    if (categoryId) {
      this.filters.categoryId = Number(categoryId);
    }

    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    });
    this.loadProducts(1, false);

    this.subscription = this.filterSubject.pipe(
      debounceTime(400)
    ).subscribe(() => {
      this.resetAndLoad();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.observer?.disconnect();
  }

  ngAfterViewInit(): void {
    this.setupScrollObserver();
  }

  loadProducts(pageNumber: number, isAppending: boolean) {
    if (this.loading) return;
    this.loading = true;

    const requestFilters = {
      ...this.filters,
      pageNumber
    };

    this.productService.getProducts(requestFilters).subscribe({
      next: (response) => {
        this.totalCount = response.totalCount;
        this.filters.pageNumber = response.pageNumber;

        if (isAppending) {
          this.products = [...this.products, ...response.items];
        } else {
          this.products = response.items;
        }

        this.allLoaded = this.products.length >= response.totalCount || response.items.length === 0;
        this.loading = false;
        this.checkIfMoreProductsShouldBeLoaded();
      },
      error: () => this.loading = false
    });
  }

  resetAndLoad() {
    this.filters.pageNumber = 1;
    this.allLoaded = false;
    this.loadProducts(1, false);
  }

  onFilterChange() {
    if (this.filters.minPrice !== null && this.filters.minPrice < 0) this.filters.minPrice = 0;
    if (this.filters.maxPrice !== null && this.filters.minPrice !== null && this.filters.maxPrice < this.filters.minPrice) {
      this.filters.maxPrice = null;
    }
    this.filterSubject.next();
  }

  private setupScrollObserver() {
    if (!this.scrollAnchor || typeof IntersectionObserver === 'undefined') {
      return;
    }

    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          this.loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: '0px 0px 150px 0px',
        threshold: 0.1
      }
    );

    this.observer.observe(this.scrollAnchor.nativeElement);
  }

  private loadNextPage() {
    if (this.loading || this.allLoaded) {
      return;
    }

    this.loadProducts(this.filters.pageNumber + 1, true);
  }

  private checkIfMoreProductsShouldBeLoaded() {
    if (this.loading || this.allLoaded || !this.scrollAnchor) {
      return;
    }

    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

    if (pageHeight <= window.innerHeight + 50) {
      queueMicrotask(() => this.loadNextPage());
    }
  }

  getMainImage(product: Product): string {
    return product.productImages?.find(img => img.isMain)?.imageUrl || product.productImages?.[0]?.imageUrl || '';
  }

  trackByProductId(_index: number, product: Product): number {
    return product.productId;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.filters.pageSize));
  }

  get displayedCount(): number {
    return this.products.length;
  }
}
