import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductImage } from '../../../../core/models/productimage.model';
import { ProductImageService } from '../../../../core/services/productimage.service';
import { Location } from '@angular/common';
import { ProductService } from '../../../../core/services/product.service';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-product-images',
  imports: [CommonModule],
  templateUrl: './product-images.component.html',
  styleUrl: './product-images.component.scss'
})
export class ProductImagesComponent implements OnInit{
  images: ProductImage[] = [];
  productId!: number;
  productName: string = '';
  showDeleteModal: boolean = false;
  selectedImageId: number | null = null;
  uploadProgress: number = 0;
  isUploading: boolean = false;

  constructor(
    private router : Router,
    private route: ActivatedRoute,
    private imageService: ProductImageService,
    private location: Location,
    private productService: ProductService
  ){}

  ngOnInit(): void {
    const prodId = this.route.snapshot.paramMap.get('id');

    if(prodId){
      this.productId = +prodId;
      this.loadProductName();
      this.loadImages(this.productId);
    }else{
      console.error('Nema product ID-a');
    }

  }

  loadImages(id: number){
    this.imageService.getImagesByProductId(id).subscribe({
      next: (data) => {
        this.images = data;
      },
      error: (err) => {
        console.error('Greska: ', err);
      }
    })
  }

  addImage(event: any){
    const file: File = event.target.files[0];

    if(file){

      this.isUploading = true;
      this.uploadProgress = 0;

      this.imageService.uploadImage(this.productId, file).subscribe({
        next: (httpEvent: any) => {
          if(httpEvent.type === HttpEventType.UploadProgress){
            this.uploadProgress = Math.round((100 * httpEvent.loaded) / (httpEvent.total || 1))
          }
          else if(httpEvent.type === HttpEventType.Response){
            this.isUploading = false;
            this.loadImages(this.productId);
            event.target.value = '';
          }
        },
        error: (err) => {this.isUploading = false; console.error(err);}
      })
    }
  }

  changeToMain(id: number){
    this.imageService.changeImageToMain(id).subscribe({
      next: () => {
        this.loadImages(this.productId);
      },
      error: (err)=> console.error(err)
    })
  }

  deleteImage(){
    if(this.selectedImageId){
      this.imageService.deleteImage(this.selectedImageId).subscribe({
        next: () => {
          this.loadImages(this.productId);
          this.closeDeleteWindow();
        },
        error: (err) => {
          console.error('Greska pri brisanju ',err);
          this.closeDeleteWindow();
        }
      })
    }
  }

  openDeleteWindow(id: number){
    this.selectedImageId = id;
    this.showDeleteModal = true;
  }

  closeDeleteWindow(){
    this.selectedImageId = null;
    this.showDeleteModal = false;
  }

  backToProducts(){
    this.location.back();
  }

  loadProductName(){
    this.productService.getProductById(this.productId).subscribe({
      next: (prod) => {
        this.productName = prod.productName;
      },
      error: (err) => {console.error('Greska pri dohvatanju imena proizvoda: ',err)}
    });
  }

}
