
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import {
  AuthService,
  AuthResponse,
  OtpResponse
} from '../../../core/services/auth.services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  mobileNumber = '';
  otp = '';
  verificationId = '';

  otpSent = false;
  isLoading = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Request Login OTP
  requestOtp(): void {

    this.errorMessage = '';
    this.successMessage = '';

    const mobile = this.mobileNumber.trim();

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number.';
      return;
    }

    this.isLoading = true;

    this.authService.loginRequestOtp(mobile).subscribe({

      next: (response: OtpResponse) => {
        this.verificationId = response.verificationId;
        this.otpSent = true;
        this.successMessage = 'OTP sent successfully.';
        this.isLoading = false;
      },

      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.error?.message ||
          'Unable to send OTP. Please try again.';

        this.isLoading = false;
      }

    });
  }

  // Verify Login OTP

verifyOtp(): void {

  // Prevent duplicate verification requests
  if (this.isLoading) return;

  this.errorMessage = '';
  this.successMessage = '';

  const enteredOtp = this.otp.trim();

  if (!/^\d{6}$/.test(enteredOtp)) {
    this.errorMessage = 'Please enter a valid 6-digit OTP.';
    return;
  }

  if (!this.verificationId) {
    this.errorMessage = 'Session expired. Please request OTP again.';
    return;
  }

  this.isLoading = true;

  console.log('Verification ID:', this.verificationId);
  console.log('Verify OTP called');

  this.authService.loginVerifyOtp(
    this.mobileNumber.trim(),
    this.verificationId,
    enteredOtp
  ).subscribe({

next: (response: AuthResponse) => {

  console.log('1. Login successful:', response);

  this.authService.saveSession(response);

  console.log('2. Token saved:', !!this.authService.getToken());

  console.log('3. Is logged in:', this.authService.isLoggedIn());

  console.log('4. User role:', response.role);

  this.isLoading = false;

  this.router.navigate(['/dashboard']).then(success => {
    console.log('5. Navigation result:', success);
  });

},

    error: (error: HttpErrorResponse) => {
      this.errorMessage =
        error.error?.message ||
        'Invalid OTP. Please try again.';

      this.isLoading = false;
    }

  });
}


}
