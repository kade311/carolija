import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout.component';
import { CategoryManageComponent } from './features/admin/admin-categories/category-manage/category-manage.component';
import { ProductManageComponent } from './features/admin/admin-products/product-manage/product-manage.component';
import { ProductImagesComponent } from './features/admin/admin-products/product-images/product-images.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { adminGuard } from './core/guards/admin.guard';
import { ShopComponent } from './features/shop/shop.component';
import { ProductDetailsComponent } from './features/shop/product-details/product-details.component';
import { CartComponent } from './features/shop/cart/cart.component';
import { CheckoutComponent } from './features/shop/checkout/checkout.component';
import { OrdersComponent } from './features/shop/orders/orders.component';
import { FavoritesComponent } from './features/shop/favorites/favorites.component';
import { ProfileComponent } from './features/profile/profile.component';
import { AdminOrdersComponent } from './features/admin/admin-orders/admin-orders.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component:LoginComponent},
    {path: 'register', component:RegisterComponent},
    {path: 'shop', component:ShopComponent},
    {path: 'products/:id', component: ProductDetailsComponent},
    {path: 'cart', component: CartComponent},
    {path: 'checkout', component: CheckoutComponent},
    {path: 'orders', component: OrdersComponent},
    {path: 'favorites', component: FavoritesComponent},
    {path: 'profile', component: ProfileComponent},
    {
        path:'admin',
        canActivate:[adminGuard],
        component:AdminLayoutComponent,
        children:[
            {path:'',redirectTo:'dashboard',pathMatch:'full'},
            {path:'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)},
            {path:'orders', component: AdminOrdersComponent},
            {path: 'categories', loadComponent: () => import('./features/admin/admin-categories/admin-categories.component').then(m=>m.AdminCategoriesComponent)},
            {path:'product-manage/:catId', component:ProductManageComponent},
            {path:'products/edit/:id', component:ProductManageComponent},
            {path:'products/:id', loadComponent: () => import('./features/admin/admin-products/admin-products.component').then(m=>m.AdminProductsComponent)},
            {path:'products/images/:id', component: ProductImagesComponent},
            {path: 'categories/manage', component:CategoryManageComponent},
            {path: 'categories/manage/:id', component:CategoryManageComponent}
        ]
    }
];
