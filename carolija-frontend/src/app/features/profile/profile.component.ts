import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { UserProfile } from '../../core/models/profile.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  form;
  saving = false;
  message = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private profileService: ProfileService, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(150)]],
      address: ['', [Validators.required, Validators.maxLength(250)]],
      phone: ['', [Validators.required, Validators.maxLength(30)]]
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.profileService.get().subscribe(profile => this.form.patchValue(profile));
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.errorMessage = '';
    this.profileService.update(this.form.getRawValue() as UserProfile).subscribe({
      next: () => {
        this.message = 'Podaci su sačuvani.';
        this.saving = false;
      },
      error: () => {
        this.errorMessage = 'Podaci nisu sačuvani.';
        this.saving = false;
      }
    });
  }
}
