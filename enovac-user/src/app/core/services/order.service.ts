
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = `${environment.apiUrl}/Orders`;

  constructor(private http: HttpClient) {}

  placeOrder(orderItems: { menuItemId: number; quantity: number }[]): Observable<any> {
    return this.http.post(this.apiUrl, { orderItems });
  }
  getMyOrders(employeeId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.apiUrl}/employee/${employeeId}`
  );
}
getActiveOrders(): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.apiUrl}/provider/active`
  );
}
updateOrderStatus(orderId: number, status: string): Observable<any> {
  return this.http.put(
    `${this.apiUrl}/${orderId}/status`,
    { status }
  );
}
clearOrder(orderId: number): Observable<string> {
  return this.http.put(
    `${this.apiUrl}/${orderId}/clear`,
    {},
    { responseType: 'text' }
  );
}
}
  