
import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import {
  interval,
  startWith,
  switchMap,
  Subscription,
  catchError,
  EMPTY
} from 'rxjs';
import { MenuService, MenuItem } from '../../../core/services/menu.service';
import { AuthService } from '../../../core/services/auth.services';
import { FoodImageService } from '../../../core/services/food-image.service';
@Component({
  selector: 'app-provider-dashboard',
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.scss']
})
export class ProviderDashboardComponent implements OnInit, OnDestroy {

  activeOrders: any[] = [];
  isLoading = false;
  errorMessage = '';
  activeSection:
  | 'dashboard'
  | 'manage-menu'
  | 'active-orders'
  | 'collected-orders' = 'dashboard';
  editingMenuItemId: number | null = null;
  private pollingSubscription?: Subscription;
  menuItems: MenuItem[] = [];
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
newMenuItem = {
  menuDate: new Date().toLocaleDateString('en-CA'),
  mealTypeId: 0,
  foodName: '',
  description: '',
  price: 0,
  isAvailable: true
};
providerName = localStorage.getItem('fullName') || 'Provider';

get providerInitial(): string {
  return this.providerName.charAt(0).toUpperCase();
}

menuMessage = '';
isMenuLoading = false;
  constructor(
  private orderService: OrderService,
  private menuService: MenuService,
   private authService: AuthService,
    private foodImageService: FoodImageService
) {}

  ngOnInit(): void {
    this.loadActiveOrders();
    this.startBannerRotation();
    this.pollingSubscription = interval(5000).pipe(
      startWith(0),
      switchMap(() =>
        this.orderService.getActiveOrders().pipe(
          catchError(error => {
            console.error('Error loading orders:', error);
            this.errorMessage = 'Unable to load orders.';
            return EMPTY;
          })
        )
      )
    ).subscribe(orders => {
      this.activeOrders = orders;
      this.isLoading = false;
      this.errorMessage = '';
    });
  }
  logout(): void {
  this.authService.logout();
  window.location.href = '/login';
}
getFoodImage(foodName: string): string {
  return this.foodImageService.getFoodImage(foodName);
}
showSection(
  section: 'dashboard' | 'manage-menu' | 'active-orders' | 'collected-orders'
): void {
  this.activeSection = section;

  if (section === 'manage-menu') {
    this.loadMenuItems();
  }

  if (section === 'active-orders' || section === 'collected-orders') {
    this.loadActiveOrders();
  }
}
  loadActiveOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getActiveOrders().subscribe({
      next: (orders) => {
        this.activeOrders = orders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading active orders:', error);
        this.errorMessage = 'Unable to load orders.';
        this.isLoading = false;
      }
    });
  }

  get preparingCount(): number {
    return this.activeOrders.filter(
      o => o.orderStatus === 'Preparing'
    ).length;
  }

  get readyCount(): number {
    return this.activeOrders.filter(
      o => o.orderStatus === 'Ready'
    ).length;
  }

  get collectedCount(): number {
    return this.activeOrders.filter(
      o => o.orderStatus === 'Collected'
    ).length;
  }

  updateStatus(orderId: number, status: string): void {
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.loadActiveOrders();
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.errorMessage = 'Unable to update order status.';
      }
    });
  }

  clearOrder(orderId: number): void {
    this.orderService.clearOrder(orderId).subscribe({
      next: () => {
        this.loadActiveOrders();
      },
      error: (error) => {
        console.error('Error clearing order:', error);
        this.errorMessage = 'Unable to clear order.';
      }
    });
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
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
saveMenuItem(): void {

  if (
    !this.newMenuItem.foodName.trim() ||
    this.newMenuItem.mealTypeId === 0 ||
    this.newMenuItem.price <= 0
  ) {
    this.menuMessage = 'Please fill in all required fields.';
    return;
  }

  this.isMenuLoading = true;
  this.menuMessage = '';

  const request = this.editingMenuItemId
    ? this.menuService.updateMenuItem(
        this.editingMenuItemId,
        this.newMenuItem
      )
    : this.menuService.addMenuItem(this.newMenuItem);

  request.subscribe({
    next: () => {
      this.menuMessage = this.editingMenuItemId
        ? 'Menu item updated successfully!'
        : 'Menu item added successfully!';

      this.editingMenuItemId = null;

      this.newMenuItem = {
        menuDate: new Date().toLocaleDateString('en-CA'),
        mealTypeId: 0,
        foodName: '',
        description: '',
        price: 0,
        isAvailable: true
      };

      this.loadMenuItems();
    },
    error: error => {
      console.error(error);
      this.menuMessage = 'Unable to save menu item.';
      this.isMenuLoading = false;
    }
  });
}
loadMenuItems(): void {
  this.isMenuLoading = true;

  this.menuService.getTodayMenu().subscribe({
    next: items => {
      this.menuItems = [...items].sort(
  (a, b) => b.menuItemId - a.menuItemId
);
      this.isMenuLoading = false;
    },
    error: error => {
      console.error(error);
      this.menuMessage = 'Unable to load menu items.';
      this.isMenuLoading = false;
    }
  });
}
editMenuItem(item: MenuItem): void {
  this.editingMenuItemId = item.menuItemId;

  this.newMenuItem = {
    menuDate: item.menuDate.substring(0, 10),
    mealTypeId: item.mealTypeId,
    foodName: item.foodName,
    description: item.description || '',
    price: item.price,
    isAvailable: item.isAvailable
  };

  this.menuMessage = '';

  // Automatically scroll to the edit form
  setTimeout(() => {
    const form = document.getElementById('menu-form');

    form?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, 100);
}
deleteMenuItem(id: number): void {
  if (!confirm('Are you sure you want to delete this menu item?')) {
    return;
  }

  this.menuService.deleteMenuItem(id).subscribe({
    next: () => {
      this.menuMessage = 'Menu item deleted successfully.';
      this.loadMenuItems();
    },
    error: error => {
      console.error(error);
      this.menuMessage = 'Unable to delete menu item.';
    }
  });
}
cancelEdit(): void {
  this.editingMenuItemId = null;
  this.menuMessage = '';

  this.newMenuItem = {
    menuDate: new Date().toLocaleDateString('en-CA'),
    mealTypeId: 0,
    foodName: '',
    description: '',
    price: 0,
    isAvailable: true
  };
}
get ongoingOrders(): any[] {
  return this.activeOrders.filter(
    order => order.orderStatus !== 'Collected'
  );
}

get collectedOrders(): any[] {
  return this.activeOrders.filter(
    order => order.orderStatus === 'Collected'
  );
}
}
