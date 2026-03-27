import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TurnstileService } from '../../../core/services/turnstile.service';
import { TurnstileComponent } from '../../../shared/components/turnstile/turnstile.component';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TurnstileComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  @ViewChild(TurnstileComponent) turnstileComponent?: TurnstileComponent;

  registerForm!: FormGroup;
  errorMessage: string = '';
  showPassword = false;
  isSubmitting = false;
  turnstileToken = '';
  turnstileSiteKey = '';

  constructor(
    private authService : AuthService,
    private route : ActivatedRoute,
    private router : Router,
    private turnstileService: TurnstileService,
    private fb: FormBuilder
  ){}

  ngOnInit(): void {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

      this.registerForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(passwordRegex)]]
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

  onRegister(){
    this.errorMessage = '';

    if (!this.turnstileToken) {
      this.errorMessage = 'Potvrdi da nisi robot.';
      return;
    }

    if(this.registerForm.valid && !this.isSubmitting){
      this.isSubmitting = true;
      this.authService.register({
        ...this.registerForm.value,
        turnstileToken: this.turnstileToken
      }).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } 
          else if (Array.isArray(err.error)) {
            this.errorMessage = err.error[0]?.description || 'Greska pri registraciji.';
          }
          else {
            this.errorMessage = 'Doslo je do nepredvidene greske.';
          }
          this.turnstileToken = '';
          this.turnstileComponent?.reset();
        }
      }).add(() => {
        this.isSubmitting = false;
      });
    }
  }

  togglePassword(){
    this.showPassword = !this.showPassword;
  }

  onTurnstileTokenChange(token: string): void {
    this.turnstileToken = token;
  }
}
