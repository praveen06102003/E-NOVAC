
import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  cartItems: CartItem[] = [];
  totalAmount = 0;
  isPlacingOrder = false;
errorMessage = '';
successMessage = '';
  constructor(private cartService: CartService, private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartItems = this.cartService.getCartItems();
    this.totalAmount = this.cartService.getTotal();
  }

  increaseQuantity(menuItemId: number): void {
    this.cartService.increaseQuantity(menuItemId);
    this.loadCart();
  }

  decreaseQuantity(menuItemId: number): void {
    this.cartService.decreaseQuantity(menuItemId);
    this.loadCart();
  }

  removeItem(menuItemId: number): void {
    this.cartService.removeFromCart(menuItemId);
    this.loadCart();
  }
  placeOrder(): void {
  if (this.cartItems.length === 0 || this.isPlacingOrder) {
    return;
  }

  const orderItems = this.cartItems.map(item => ({
    menuItemId: item.menuItem.menuItemId,
    quantity: item.quantity
  }));

  this.isPlacingOrder = true;
  this.errorMessage = '';

  this.orderService.placeOrder(orderItems).subscribe({
    next: (response) => {
      this.cartService.clearCart();
      this.loadCart();

      this.successMessage = 'Order placed successfully!';
      this.isPlacingOrder = false;

      console.log('Order response:', response);
    },
    error: (error) => {
      this.errorMessage =
        error.error || 'Unable to place your order. Please try again.';

      this.isPlacingOrder = false;
    }
  });
}
}
