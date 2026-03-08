import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-categories',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.scss'
})
export class AdminCategoriesComponent implements OnInit{
  categories: Category[] = [];
  showModal: boolean = false;
  modalType : 'delete' | 'restore' = 'delete';
  selectedCategoryId:number|null=null;
  selectedCategoryName: string = '';

  constructor(
    private categoryService: CategoryService,
    private router: Router,
  ){}

  ngOnInit(): void {
      this.loadCategories();
  }

  loadCategories(){
    this.categoryService.getCategoriesAdmin().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.log(err)
    });
  }

  editCategory(id: number){
    this.router.navigate(['/admin/categories/manage',id]);
  };

  openModal(cat: Category, type: 'delete'|'restore'){
    this.selectedCategoryId = cat.categoryID;
    this.selectedCategoryName = cat.categoryName;
    this.modalType = type;
    this.showModal = true;
  }

  closeModal(){
    this.selectedCategoryId = null;
    this.selectedCategoryName = '';
    this.showModal = false;
  }

  categoryDeleteOrRestore(){
    if(!this.selectedCategoryId) return;

    if(this.modalType === 'delete'){
      this.categoryService.softDeleteCategory(this.selectedCategoryId).subscribe({
        next: ()=> {this.loadCategories(); this.closeModal(); },
        error: (err) => {console.error(err); this.closeModal(); }
      });
    }
    else{
      this.categoryService.restoreCategory(this.selectedCategoryId).subscribe({
        next: () => {
          const cat = this.categories.find(c=>c.categoryID===this.selectedCategoryId);
          if (cat) cat.isDeleted = false;
          this.closeModal();
        },
        error: (err) => {console.error(err); this.closeModal(); }
      })
    }
  }
}
