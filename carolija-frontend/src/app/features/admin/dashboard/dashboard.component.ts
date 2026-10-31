import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  productCount = 0;
  categoryCount = 0;
  availableCount = 0;
  revenue = 0;
  pendingOrders = 0;
  criticalStock: any[] = [];
  loading = true;

  constructor(private products: ProductService, private categories: CategoryService, private orders: OrderService) {}

  ngOnInit(): void {
    this.categories.getCategoriesAdmin().subscribe(categories => this.categoryCount = categories.length);
    this.products.getProducts({ pageNumber: 1, pageSize: 50, sortBy: 'name_asc' }).subscribe(result => {
      this.productCount = result.totalCount;
      this.availableCount = result.items.filter(product => product.available).length;
      this.loading = false;
    }, () => this.loading = false);
    this.orders.getSummary().subscribe(summary => {
      this.revenue = summary.revenue;
      this.pendingOrders = summary.pendingOrders;
      this.criticalStock = summary.criticalStock;
    });
  }

}
