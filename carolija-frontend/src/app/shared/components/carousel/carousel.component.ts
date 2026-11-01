import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carousel',
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() items: Product[] = [];
  @ViewChild('track') track?: ElementRef<HTMLDivElement>;
  private rotationTimer?: ReturnType<typeof setInterval>;

  constructor(private router: Router){}

  ngOnInit(): void {
      if(this.items.length === 0){
        console.warn('Carousel: nema proizvoda a prikaz');
      }
  }

  ngAfterViewInit(): void {
    this.rotationTimer = setInterval(() => this.scroll(1), 3500);
  }

  ngOnDestroy(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }
  }

  scroll(direction: number): void {
    const element = this.track?.nativeElement;
    if (!element) {
      return;
    }

    const nextPosition = element.scrollLeft + direction * 310;
    if (direction > 0 && nextPosition + element.clientWidth >= element.scrollWidth - 8) {
      element.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }

    element.scrollBy({ left: direction * 310, behavior: 'smooth' });
  }

  openProduct(product: Product): void {
    this.router.navigate(['/products', product.productId]);
  }
}
