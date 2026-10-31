import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  form;
  total = 0;
  errorMessage = '';
  submitting = false;
  constructor(private fb: FormBuilder, private cartService: CartService, private orderService: OrderService, private profileService: ProfileService, private router: Router) {
    this.form = this.fb.group({
      customerName: ['', [Validators.required, Validators.maxLength(150)]],
      address: ['', [Validators.required, Validators.maxLength(250)]],
      phone: ['', [Validators.required, Validators.maxLength(30)]]
    });
  }
  ngOnInit(): void {
    this.cartService.getCart().subscribe({ next: cart => this.total = cart.total, error: () => this.router.navigate(['/cart']) });
    this.profileService.get().subscribe(profile => this.form.patchValue({
      customerName: profile.fullName,
      address: profile.address,
      phone: profile.phone
    }));
  }
  submit(): void {
    if (this.form.invalid || this.submitting) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    this.orderService.create(this.form.getRawValue() as { customerName: string; address: string; phone: string }).subscribe({
      next: result => this.router.navigate(['/orders'], { queryParams: { created: result.orderId } }),
      error: err => { this.errorMessage = err.error?.message || 'Narudžbu nije moguće kreirati.'; this.submitting = false; }
    });
  }
}
