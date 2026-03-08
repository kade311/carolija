import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
//modeli
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
//servisi
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
//komponente
import { CarouselComponent } from '../../shared/components/carousel/carousel.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule,RouterModule,CarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
 latestAddedProducts: Product[] = [];
 categories: Category[] = [];
 
 constructor(
  private productService: ProductService,
  private categoryService: CategoryService
 ){}

 ngOnInit(): void {
     this.loadLatestProducts();
     this.loadCategories();
 }

 loadLatestProducts():void{
  this.productService.getLatestProducts(15).subscribe({
    next: (data) => {
      this.latestAddedProducts = data;
    },
    error: (err) => console.error('Greska pri ucitavanju zadnjih proizvoda', err)
  });
 }

 loadCategories():void{
  this.categoryService.getCategories().subscribe({
    next: (data) => {
      this.categories = data;
    },
    error: (err) => console.error('Greska pri ucitavanju kategorija', err)
  });
 }
}
