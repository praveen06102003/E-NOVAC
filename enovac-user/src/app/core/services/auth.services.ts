
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
  token: string;
  employeeId: number;
  fullName: string;
  role: string;
}

export interface OtpResponse {
  message: string;
  verificationId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient) {}

  // Registration: Request OTP
  registerRequestOtp(fullName: string, mobileNumber: string): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(
      `${this.apiUrl}/register/request-otp`,
      { fullName, mobileNumber }
    );
  }

  // Registration: Verify OTP
  registerVerifyOtp(mobileNumber: string, verificationId: string, otp: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/register/verify-otp`,
      { mobileNumber, verificationId, otp }
    );
  }

  // Login: Request OTP
  loginRequestOtp(mobileNumber: string): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(
      `${this.apiUrl}/login/request-otp`,
      { mobileNumber }
    );
  }

  // Login: Verify OTP
  loginVerifyOtp(mobileNumber: string, verificationId: string, otp: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login/verify-otp`,
      { mobileNumber, verificationId, otp }
    );
  }

  // Save authentication details
  saveSession(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('employeeId', response.employeeId.toString());
    localStorage.setItem('fullName', response.fullName);
    localStorage.setItem('role', response.role);
  }

  // Logout
  logout(): void {
    localStorage.clear();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

isLoggedIn(): boolean {
  const token = this.getToken();

  if (!token) return false;

  try {
    const payloadPart = token.split('.')[1];

    // Convert Base64URL to standard Base64
    const base64 = payloadPart
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const paddedBase64 = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      '='
    );

    const payload = JSON.parse(atob(paddedBase64));

    return !!payload.exp &&
      Date.now() < payload.exp * 1000;

  } catch (error) {
    console.error('JWT validation error:', error);
    return false;
  }
}

}
