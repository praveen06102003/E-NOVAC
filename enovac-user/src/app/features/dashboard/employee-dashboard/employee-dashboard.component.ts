
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { AuthService } from '../../../core/services/auth.services';
import { FoodImageService } from '../../../core/services/food-image.service';
import {
  MenuService,
  MenuItem
} from '../../../core/services/menu.service';

import {
  FoodLikeService,
  FoodLike
} from '../../../core/services/food-like.service';

import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';

import { interval, Subscription } from 'rxjs';

export interface OrderItem {
  orderItemId: number;
  menuItemId: number;
  quantity: number;
  unitPrice: number;
  menuItem: {
    foodName: string;
  };
}

export interface EmployeeOrder {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  orderItems: OrderItem[];
}


@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {

  employeeName = localStorage.getItem('fullName') || 'Employee';

  todayMenu: MenuItem[] = [];
  isLoading = false;
  errorMessage = '';

  yesterdayMenu: MenuItem[] = [];
  isYesterdayLoading = false;

  activeMenu: 'today' | 'yesterday' | 'likes' | 'orders' = 'today';

  likedMenuItemIds: number[] = [];
  myLikes: FoodLike[] = [];

  orders: EmployeeOrder[] = [];
  isOrdersLoading = false;
  ordersError = '';

  selectedMealTypeId: number | null = null;
  bannerImages: string[] = [
  'assets/food-images/masala-dosa.jpg',
  'assets/food-images/veg-biryani.jpg',
  'assets/food-images/veg-pizza.jpg',
  'assets/food-images/veg-sandwich.jpg',
  'assets/food-images/veg-pasta.jpg',
  'assets/food-images/veg-burger.jpg'
];

currentBannerImage = 0;
private bannerInterval: any;

  private orderPollingSubscription?: Subscription;
  private menuPollingSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private menuService: MenuService,
    private foodLikeService: FoodLikeService,
    private cartService: CartService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    private foodImageService: FoodImageService
  ) {}

ngOnInit(): void {
  this.loadTodayMenu();
  this.loadMyLikes();
  this.startBannerRotation();
  // Refresh today's menu every 5 seconds
this.menuPollingSubscription = interval(5000).subscribe(() => {
  if (this.activeMenu === 'today') {
    this.menuService.getTodayMenu().subscribe({
      next: menu => {
        this.todayMenu = menu;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Menu refresh failed:', error);
      }
    });
  }
});

  // Refresh orders every 5 seconds when Orders section is active
  this.orderPollingSubscription = interval(5000).subscribe(() => {
    if (this.activeMenu === 'orders') {
      this.loadMyOrders();
    }
  });
}

ngOnDestroy(): void {
  this.orderPollingSubscription?.unsubscribe();
  this.menuPollingSubscription?.unsubscribe();
  if (this.bannerInterval) {
  clearInterval(this.bannerInterval);
}
}

bannerImageOne = this.bannerImages[0];
bannerImageTwo = this.bannerImages[1];

activeBannerLayer: 'one' | 'two' = 'one';



startBannerRotation(): void {
  this.bannerInterval = setInterval(() => {

    this.currentBannerImage =
      (this.currentBannerImage + 1) % this.bannerImages.length;

    if (this.activeBannerLayer === 'one') {
      this.bannerImageTwo =
        this.bannerImages[this.currentBannerImage];

      this.activeBannerLayer = 'two';

    } else {
      this.bannerImageOne =
        this.bannerImages[this.currentBannerImage];

      this.activeBannerLayer = 'one';
    }

  }, 3000);
}
getFoodImage(foodName: string): string {
  return this.foodImageService.getFoodImage(foodName);
}
  loadMyOrders(): void {
    const employeeId = localStorage.getItem('employeeId');


    this.isOrdersLoading = this.orders.length === 0;
    this.ordersError = '';

    this.orderService.getMyOrders(Number(employeeId)).subscribe({
      next: (orders: EmployeeOrder[]) => {
        this.orders = orders;
        this.isOrdersLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Unable to load orders:', error);
        this.ordersError = 'Unable to load your orders.';
        this.isOrdersLoading = false;
      }
    });
  }

  loadTodayMenu(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.menuService.getTodayMenu().subscribe({
      next: (menu) => {
        this.todayMenu = [...menu].sort(
  (a, b) => b.menuItemId - a.menuItemId
);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Menu loading failed:', error);
        this.errorMessage = "Unable to load today's menu.";
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

get filteredMenu(): MenuItem[] {
  const sortedMenu = [...this.todayMenu].sort(
    (a, b) => b.menuItemId - a.menuItemId
  );

  if (this.selectedMealTypeId === null) {
    return sortedMenu;
  }

  return sortedMenu.filter(
    item => item.mealTypeId === this.selectedMealTypeId
  );
}

  filterMenu(mealTypeId: number | null): void {
    this.selectedMealTypeId = mealTypeId;
  }

  loadYesterdayMenu(): void {
    this.isYesterdayLoading = true;

    this.menuService.getYesterdayMenu().subscribe({
      next: (menu) => {
        this.yesterdayMenu = menu;
        this.isYesterdayLoading = false;
      },
      error: (error) => {
        console.error('Yesterday menu loading failed:', error);
        this.isYesterdayLoading = false;
      }
    });
  }

  showMenu(menu: 'today' | 'yesterday' | 'likes' | 'orders'): void {
    this.activeMenu = menu;

    if (menu === 'yesterday' && this.yesterdayMenu.length === 0) {
      this.loadYesterdayMenu();
    }

    if (menu === 'likes') {
      this.loadMyLikes();
    }

    if (menu === 'orders') {
      this.loadMyOrders();
    }
  }

  get filteredYesterdayMenu(): MenuItem[] {
    if (this.selectedMealTypeId === null) {
      return this.yesterdayMenu;
    }

    return this.yesterdayMenu.filter(
      item => Number(item.mealTypeId) === this.selectedMealTypeId
    );
  }

  loadMyLikes(): void {
    this.foodLikeService.getMyLikes().subscribe({
      next: likes => {
        this.myLikes = likes;

        this.likedMenuItemIds = likes.map(
          like => Number(like.menuItemId)
        );
      },
      error: error => {
        console.error('Unable to load likes:', error);
      }
    });
  }

  toggleLike(menuItemId: number): void {
    const id = Number(menuItemId);
    const isLiked = this.likedMenuItemIds.includes(id);

    const request = isLiked
      ? this.foodLikeService.unlikeFood(id)
      : this.foodLikeService.likeFood(id);

    request.subscribe({
      next: () => {
        if (isLiked) {
          this.likedMenuItemIds =
            this.likedMenuItemIds.filter(x => x !== id);
        } else {
          this.likedMenuItemIds = [...this.likedMenuItemIds, id];
        }

        this.loadMyLikes();
      },
      error: error => {
        console.error('Like operation failed:', error);
      }
    });
  }

  addToCart(item: MenuItem): void {
    this.cartService.addToCart(item);
    alert(`${item.foodName} added to cart!`);
  }
  get displayedOrders(): EmployeeOrder[] {
  const ongoing = this.orders.filter(
    order => order.orderStatus !== 'Collected'
  );

  const collected = this.orders
    .filter(order => order.orderStatus === 'Collected')
    .sort((a, b) =>
      new Date(b.orderDate).getTime() -
      new Date(a.orderDate).getTime()
    )
    .slice(0, 3);

  return [...ongoing, ...collected];
}
}
