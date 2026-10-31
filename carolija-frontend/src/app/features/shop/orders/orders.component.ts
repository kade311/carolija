import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  createdMessage = '';
  constructor(private ordersService: OrderService, private auth: AuthService, private router: Router, private route: ActivatedRoute) {}
  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    if (this.route.snapshot.queryParamMap.get('created')) this.createdMessage = 'Narudžba je uspješno kreirana.';
    this.ordersService.getMine().subscribe({ next: orders => this.orders = orders });
  }

  cancel(order: any): void {
    if (order.status !== 'Pending') return;
    this.ordersService.cancel(order.orderId).subscribe(() => order.status = 'Canceled');
  }
}
