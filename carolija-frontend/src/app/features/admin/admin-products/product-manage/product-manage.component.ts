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
  errorMessage = '';
  productData = {
    name: '',
    description: '',
    price: '',
    lightRequirement: 'Indirect',
    wateringRequirement: 'Moderate',
    isPetFriendly: false
    ,stockQuantity: 0
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
    this.errorMessage = '';

    if(this.isEditMode){
      this.productService.updateProduct(this.productId!, this.productData.name, this.productData.description, Number(this.productData.price), this.productData.lightRequirement, this.productData.wateringRequirement, this.productData.isPetFriendly, Number(this.productData.stockQuantity))
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/products',this.categoryId]);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || this.getValidationMessage(err) || 'Spremanje proizvoda nije uspjelo.';
        }
      }).add(() => {
        this.isSubmitting = false;
      });
    }else{
      this.productService.addProduct(
      this.productData.name,
      this.productData.description,
      Number(this.productData.price),
      this.categoryId,
      this.productData.lightRequirement,
      this.productData.wateringRequirement,
      this.productData.isPetFriendly
      ,Number(this.productData.stockQuantity)
    ).subscribe({
      next: () => this.router.navigate(['/admin/products', this.categoryId]),
      error: (err) => {
        this.errorMessage = err.error?.message || this.getValidationMessage(err) || 'Dodavanje proizvoda nije uspjelo.';
      }
    })
    .add(() => {
      this.isSubmitting = false;
    });
    }

  }

  private getValidationMessage(error: any): string {
    const errors = error?.error?.errors;
    if (!errors) return '';
    return Object.values(errors).flat().join(' ');
  }

  loadProductData(id: number){
    this.productService.getProductById(id).subscribe(
      data => {
        this.productData.name = data.productName;
        this.productData.description = data.productDescription || '';
        this.productData.price = data.productPrice.toString();
        this.categoryId = data.categoryID;
        this.productData.lightRequirement = data.lightRequirement || 'Indirect';
        this.productData.wateringRequirement = data.wateringRequirement || 'Moderate';
        this.productData.isPetFriendly = data.isPetFriendly;
        this.productData.stockQuantity = data.stockQuantity || 0;
      }
    )
  }
}
