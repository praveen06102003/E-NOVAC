
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MenuItem {
  menuItemId: number;
  menuDate: string;
  mealTypeId: number;
  mealType?: {
    mealTypeId: number;
    mealTypeName: string;
  };
  foodName: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private readonly apiUrl = `${environment.apiUrl}/MenuItems`;

  constructor(private http: HttpClient) {}

  // Get today's menu
  getTodayMenu(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/today`);
  }

  // Get yesterday's menu
  getYesterdayMenu(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/yesterday`);
  }

  // Add menu item
  addMenuItem(menuItem: Partial<MenuItem>): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.apiUrl, menuItem);
  }

  // Update menu item
  updateMenuItem(id: number, menuItem: Partial<MenuItem>): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.apiUrl}/${id}`, menuItem);
  }

  // Delete menu item
  deleteMenuItem(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      responseType: 'text'
    });
  }
}
