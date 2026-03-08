import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoryService } from '../../../../core/services/category.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-manage',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './category-manage.component.html',
  styleUrl: './category-manage.component.scss'
})
export class CategoryManageComponent implements OnInit{

  isEditMode = false;
  categoryId: number | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  categoryData = {
    name:'',
    description:''
  };

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private router: Router
  ){}

  ngOnInit(): void {
      const id = this.route.snapshot.paramMap.get('id');
      if(id){
        this.isEditMode = true;
        this.categoryId = +id;
        this.loadCategoryData(this.categoryId);
      }else{
        this.isEditMode = false;
        this.categoryId = 0;
      }
  }

  loadCategoryData(id:number){
    this.categoryService.getCategoryById(id).subscribe(
      data => {
        this.categoryData.name = data.categoryName;
        this.categoryData.description = data.categoryDescription || '';
      }
    )
  }

  onFileSelected(event: any){
    const file = event.target.files[0];
    if(file){
      this.selectedFile = file;
      console.log('odabrani fajl: ',this.selectedFile?.name)

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(){
    if(this.isEditMode){
      this.categoryService.updateCategory(this.categoryId!, this.categoryData.name, this.categoryData.description, this.selectedFile)
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/categories']);
        },
        error: (err) => console.error('Greska: ',err)
      });
    }else{
      this.categoryService.addCategory(this.categoryData.name,this.categoryData.description, this.selectedFile)
      .subscribe(() => this.router.navigate(['/admin/categories']))
    }
  }
}
