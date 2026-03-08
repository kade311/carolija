import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  errorMessage: string = '';
  showPassword = false;

  constructor(
    private authService : AuthService,
    private route : ActivatedRoute,
    private router : Router,
    private fb: FormBuilder
  ){}

  ngOnInit(): void {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

      this.registerForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(passwordRegex)]]
      })
  }

  onRegister(){

    this.errorMessage = '';

    if(this.registerForm.valid){
      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          alert('Uspjesna registracija');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.log("Error details:", err);

        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } 
        else if (Array.isArray(err.error)) {
          this.errorMessage = err.error[0]?.description || 'Greška pri registraciji.';
        }
        else {
          this.errorMessage = 'Došlo je do nepredviđene greške.';
        }
        }
      })
    }

    }

    togglePassword(){
      this.showPassword = !this.showPassword;
    }
}
