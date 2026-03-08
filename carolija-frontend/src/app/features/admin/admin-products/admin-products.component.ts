import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-admin-products',
  imports: [RouterLink, CommonModule],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss'
})
export class AdminProductsComponent implements OnInit, OnDestroy{
  products: Product[] = [];
  categoryId!: number;
  categoryName: string = '';
  showModal: boolean = false;
  modalType : 'delete' | 'restore' = 'delete';
  selectedProductId:number|null=null;
  selectedProductName: string = '';
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  currentPage: number = 1;
  pageSize: number = 20;


  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private categoryService: CategoryService
  ){}

  ngOnInit(): void {
      const catId = this.route.snapshot.paramMap.get('id');

      if(catId){
        this.categoryId = +catId;
        this.loadCategoryName();
        this.loadProducts('');

        this.searchSubscription = this.searchSubject.pipe(
          debounceTime(300),
          distinctUntilChanged()
        ).subscribe(searchTerm => {
          this.loadProducts(searchTerm);
        });
      }
  }

  loadProducts(search: string =''){
    this.productService.getProductsByCategoryId(this.categoryId, search, this.currentPage, this.pageSize).subscribe({
      next: (data) => {this.products = data},
      error: (err) => console.error('Greska pri ucitavanju proizvoda po kategoriji',err)
    })
  }

  addProduct(){
    console.log('Navigacija na ID:', this.categoryId);
    this.router.navigate(['/admin/product-manage', this.categoryId]);

  }

  editProduct(id: number){
  
    this.router.navigate(['/admin/products/edit', id]);
  }

  openGallery(id:number){
    this.router.navigate(['/admin/products/images', id]);
  }

  getMainImage(product: Product){
    if(!product.productImages || product.productImages.length === 0){
      return null;
    }
    const mainImage = product.productImages?.find((img:any) => img.isMain) || product.productImages[0];

    return mainImage?.imageUrl || null;
  }

  openModal(prod: Product, type: 'delete'|'restore'){
      this.selectedProductId = prod.productId;
      this.selectedProductName = prod.productName;
      this.modalType = type;
      this.showModal = true;
  }
  
  closeModal(){
    this.selectedProductId = null;
    this.selectedProductName = '';
    this.showModal = false;
  }

  productDeleteOrRestore(){
    if(!this.selectedProductId) return;

    if(this.modalType === 'delete'){
      this.productService.deleteProduct(this.selectedProductId).subscribe({
        next: ()=> {this.loadProducts(); this.closeModal(); },
        error: (err) => {console.error(err); this.closeModal(); }
      });
    }
    else{
      this.productService.restoreProduct(this.selectedProductId).subscribe({
        next: () => {
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {console.error(err); this.closeModal(); }
      })
    }
  }

  loadCategoryName(){
    this.categoryService.getCategoryById(this.categoryId).subscribe({
      next: (cat) => {
        this.categoryName = cat.categoryName;
      },
      error: (err) => {console.error('Greska pri dohvatanju imena kategorije: ',err)}
    });
  }

  onSearch(event: any){
    this.currentPage = 1;
    const term = event.target.value;
    this.searchSubject.next(term);
  }

  ngOnDestroy(): void {
      this.searchSubscription?.unsubscribe();
  }

  nextPage(){
    this.currentPage++;
    this.loadProducts();
  }

  prevPage(){
    if(this.currentPage > 1){
      this.currentPage--;
      this.loadProducts();
    }
  }
}
