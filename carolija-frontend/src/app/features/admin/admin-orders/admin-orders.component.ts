import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  selectedStatus = '';
  statuses = ['Pending', 'Approved', 'Shipped', 'Canceled'];
  loading = false;

  constructor(private orderService: OrderService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.orderService.getAdmin(this.selectedStatus).subscribe({
      next: orders => { this.orders = orders; this.loading = false; },
      error: () => this.loading = false
    });
  }
  updateStatus(order: any, status: string): void {
    this.orderService.updateStatus(order.orderId, status).subscribe(() => order.status = status);
  }
}
