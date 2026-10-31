import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carousel',
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements OnInit {
  @Input() items: Product[] = [];
  @ViewChild('track') track?: ElementRef<HTMLDivElement>;

  constructor(private router: Router){}

  ngOnInit(): void {
      if(this.items.length === 0){
        console.warn('Carousel: nema proizvoda a prikaz');
      }
  }

  scroll(direction: number): void {
    this.track?.nativeElement.scrollBy({ left: direction * 310, behavior: 'smooth' });
  }

  openProduct(product: Product): void {
    this.router.navigate(['/products', product.productId]);
  }
}
