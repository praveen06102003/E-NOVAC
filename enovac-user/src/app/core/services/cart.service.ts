
import { Injectable } from '@angular/core';
import { MenuItem } from './menu.service';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartItems: CartItem[] = [];

  getCartItems(): CartItem[] {
    return this.cartItems;
  }

  addToCart(item: MenuItem): void {
    const existingItem = this.cartItems.find(
      cartItem => cartItem.menuItem.menuItemId === item.menuItemId
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cartItems.push({
        menuItem: item,
        quantity: 1
      });
    }
  }

  increaseQuantity(menuItemId: number): void {
    const item = this.cartItems.find(
      x => x.menuItem.menuItemId === menuItemId
    );

    if (item) item.quantity++;
  }

  decreaseQuantity(menuItemId: number): void {
    const item = this.cartItems.find(
      x => x.menuItem.menuItemId === menuItemId
    );

    if (item) {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        this.removeFromCart(menuItemId);
      }
    }
  }

  removeFromCart(menuItemId: number): void {
    this.cartItems = this.cartItems.filter(
      x => x.menuItem.menuItemId !== menuItemId
    );
  }

  clearCart(): void {
    this.cartItems = [];
  }

  getTotal(): number {
    return this.cartItems.reduce(
      (total, item) =>
        total + item.menuItem.price * item.quantity,
      0
    );
  }
  
}
