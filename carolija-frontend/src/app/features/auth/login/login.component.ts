import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TurnstileService } from '../../../core/services/turnstile.service';
import { TurnstileComponent } from '../../../shared/components/turnstile/turnstile.component';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TurnstileComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{
  @ViewChild(TurnstileComponent) turnstileComponent?: TurnstileComponent;

  loginForm!: FormGroup;
  showPassword = false;
  errorMessage: string = '';
  isSubmitting = false;
  turnstileToken = '';
  turnstileSiteKey = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private turnstileService: TurnstileService,
    private fb: FormBuilder
  ){}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.turnstileService.getSiteKey().subscribe({
      next: (siteKey) => {
        this.turnstileSiteKey = siteKey;
      },
      error: () => {
        this.errorMessage = 'Turnstile konfiguracija nije dostupna.';
      }
    });
  }

  onLogin(){
    this.errorMessage = '';

    if (!this.turnstileToken) {
      this.errorMessage = 'Potvrdi da nisi robot.';
      return;
    }

    if(this.loginForm.valid && !this.isSubmitting){
      this.isSubmitting = true;
      this.authService.login({
        ...this.loginForm.value,
        turnstileToken: this.turnstileToken
      }).subscribe({
        next: () => {
          this.router.navigate(['']);
        },
        error: (err) => {
          if(err.error && err.error.message){
            this.errorMessage = err.error.message;
          }
          else{
            this.errorMessage = 'Pogresan email ili lozinka';
          }
          this.turnstileToken = '';
          this.turnstileComponent?.reset();
        }
      }).add(() => {
        this.isSubmitting = false;
      });
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onTurnstileTokenChange(token: string): void {
    this.turnstileToken = token;
  }
}
