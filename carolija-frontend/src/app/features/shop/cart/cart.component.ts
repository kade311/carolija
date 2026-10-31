import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Cart, CartItem } from '../../../core/models/cart.model';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cart?: Cart;
  loading = true;
  message = '';
  constructor(private cartService: CartService, private auth: AuthService, private router: Router) {}
  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.load();
  }
  load(): void {
    this.cartService.getCart().subscribe({ next: cart => { this.cart = cart; this.loading = false; }, error: () => { this.message = 'Košarica trenutno nije dostupna.'; this.loading = false; } });
  }
  change(item: CartItem, quantity: number): void {
    if (quantity < 1) return;
    this.cartService.updateItem(item.productId, quantity).subscribe(cart => this.cart = cart);
  }
  remove(item: CartItem): void {
    this.cartService.removeItem(item.productId).subscribe(cart => this.cart = cart);
  }
}
