import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-carousel',
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements OnInit {
  @Input() items: Product[] = [];

  constructor(){}

  ngOnInit(): void {
      if(this.items.length === 0){
        console.warn('Carousel: nema proizvoda a prikaz');
      }
  }

  get infiniteItems(){
    return [...this.items, ...this.items];
  }
}
