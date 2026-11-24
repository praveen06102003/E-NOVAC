
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import {
  AuthService,
  AuthResponse,
  OtpResponse
} from '../../../core/services/auth.services';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  fullName = '';
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

  // Step 1: Request OTP
  requestOtp(): void {

    this.errorMessage = '';
    this.successMessage = '';

    const name = this.fullName.trim();
    const mobile = this.mobileNumber.trim();

    if (!name || !mobile) {
      this.errorMessage = 'Please enter your full name and mobile number.';
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      this.errorMessage = 'Please enter a valid 10-digit Indian mobile number.';
      return;
    }

    this.isLoading = true;

    this.authService.registerRequestOtp(name, mobile).subscribe({

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

  // Step 2: Verify OTP and create account
  verifyOtp(): void {

    this.errorMessage = '';
    this.successMessage = '';

    const enteredOtp = this.otp.trim();

    if (!/^\d{6}$/.test(enteredOtp)) {
      this.errorMessage = 'Please enter a valid 6-digit OTP.';
      return;
    }

    if (!this.verificationId) {
      this.errorMessage = 'Registration session expired. Please request OTP again.';
      return;
    }

    this.isLoading = true;

    this.authService.registerVerifyOtp(
      this.mobileNumber.trim(),
      this.verificationId,
      enteredOtp
    ).subscribe({

      next: (response: AuthResponse) => {

        this.authService.saveSession(response);

        this.successMessage = 'Registration successful!';
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);

      },

      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.error?.message ||
          'OTP verification failed. Please try again.';

        this.isLoading = false;
      }

    });
  }

}
