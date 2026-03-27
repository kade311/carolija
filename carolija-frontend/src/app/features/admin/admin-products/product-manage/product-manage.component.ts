import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-manage',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-manage.component.html',
  styleUrl: './product-manage.component.scss'
})
export class ProductManageComponent implements OnInit{
  categoryId!: number;
  isEditMode= false;
  productId: number | null = null;
  isSubmitting = false;
  productData = {
    name: '',
    description: '',
    price: ''
  };

  constructor(
      private route: ActivatedRoute,
      private productService: ProductService,
      private router: Router
    ){}

  ngOnInit(): void {
    const catIdFromUrl = this.route.snapshot.paramMap.get('catId');
    const id = this.route.snapshot.paramMap.get('id');

    if(catIdFromUrl){
      this.categoryId = Number(catIdFromUrl);
    }

    if(id){
      this.isEditMode = true;
      this.productId = +id;

      if(!isNaN(this.productId)){
        this.loadProductData(this.productId);
      } else{
        console.log('id nije broj:', id);
      }

    }else if (catIdFromUrl){
      this.isEditMode = false;
      this.productId = 0;
    }

  }

  onSubmit(){
    if(this.isSubmitting){
      return;
    }

    this.isSubmitting = true;

    if(this.isEditMode){
      this.productService.updateProduct(this.productId!, this.productData.name, this.productData.description,Number(this.productData.price))
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/products',this.categoryId]);
        },
        error: (err) => console.error('Greska:', err)
      }).add(() => {
        this.isSubmitting = false;
      });
    }else{
      this.productService.addProduct(
      this.productData.name,
      this.productData.description,
      Number(this.productData.price),
      this.categoryId
    ).subscribe(() => this.router.navigate(['/admin/products', this.categoryId]))
    .add(() => {
      this.isSubmitting = false;
    });
    }
  }

  loadProductData(id: number){
    this.productService.getProductById(id).subscribe(
      data => {
        this.productData.name = data.productName;
        this.productData.description = data.productDescription || '';
        this.productData.price = data.productPrice.toString();
        this.categoryId = data.categoryID;
      }
    )
  }
}
