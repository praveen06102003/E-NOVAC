
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FoodLike {
  foodLikeId: number;
  menuItemId: number;
  foodName: string;
  price: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FoodLikeService {

  private readonly apiUrl = `${environment.apiUrl}/FoodLikes`;

  constructor(private http: HttpClient) {}

likeFood(menuItemId: number): Observable<string> {
  return this.http.post(
    `${this.apiUrl}/${menuItemId}`,
    {},
    { responseType: 'text' }
  );
}

unlikeFood(menuItemId: number): Observable<string> {
  return this.http.delete(
    `${this.apiUrl}/${menuItemId}`,
    { responseType: 'text' }
  );
}

  getMyLikes(): Observable<FoodLike[]> {
    return this.http.get<FoodLike[]>(
      `${this.apiUrl}/my-likes`
    );
  }


}
