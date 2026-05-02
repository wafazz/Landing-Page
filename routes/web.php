<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\PackageController as AdminPackage;
use App\Http\Controllers\Admin\PaymentController as AdminPayment;
use App\Http\Controllers\Admin\SettingController as AdminSetting;
use App\Http\Controllers\Admin\SubscriberController as AdminSubscriber;
use App\Http\Controllers\Admin\SubscriptionController as AdminSubscription;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Public\CheckoutController;
use App\Http\Controllers\Public\PageController as PublicPage;
use App\Http\Controllers\Public\WebhookController;
use App\Http\Controllers\Subscriber\AnalyticsController;
use App\Http\Controllers\Subscriber\AwbController;
use App\Http\Controllers\Subscriber\CourierSettingController;
use App\Http\Controllers\Subscriber\NotificationPrefController;
use App\Http\Controllers\Subscriber\CustomDomainController;
use App\Http\Controllers\Subscriber\DashboardController as SubscriberDashboard;
use App\Http\Controllers\Subscriber\OrderController as SubscriberOrder;
use App\Http\Controllers\Subscriber\PageController as SubscriberPage;
use App\Http\Controllers\Subscriber\PaymentSettingController;
use App\Http\Controllers\Subscriber\ProductController as SubscriberProduct;
use App\Http\Controllers\Subscriber\ShipmentController;
use App\Http\Controllers\Subscriber\SubscriptionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Root: render public landing page if host is a subdomain or custom domain;
// otherwise fall through to marketing welcome page.
Route::get('/', function (\Illuminate\Http\Request $request) {
    if ($request->attributes->get('resolved_user')) {
        return app(PublicPage::class)->show($request);
    }
    return Inertia::render('welcome');
})->name('home');

// Public landing page rendering (subdomain or custom domain)
Route::get('/p/{slug}', [PublicPage::class, 'show'])
    ->where('slug', '[a-z0-9-]+')
    ->name('public.page');

// Local-dev fallback: /u/{slug}/{pageslug?}
Route::get('/u/{subscriberSlug}/{slug?}', [PublicPage::class, 'show'])
    ->where('subscriberSlug', '[a-z0-9-]+')
    ->where('slug', '[a-z0-9-]+')
    ->name('public.page.fallback');

// Public checkout (guest-accessible)
Route::get('/checkout/{userSlug}/{pageSlug}', [CheckoutController::class, 'init'])
    ->where('userSlug', '[a-z0-9-]+')
    ->where('pageSlug', '[a-z0-9-]+')
    ->name('checkout.init');
Route::post('/checkout/{userSlug}/{pageSlug}', [CheckoutController::class, 'store'])
    ->where('userSlug', '[a-z0-9-]+')
    ->where('pageSlug', '[a-z0-9-]+')
    ->name('checkout.store');
Route::get('/checkout/return/{orderNumber}', [WebhookController::class, 'returnUrl'])->name('checkout.return');
Route::get('/checkout/success/{orderNumber}', [CheckoutController::class, 'success'])->name('checkout.success');
Route::get('/checkout/failed/{orderNumber}', [CheckoutController::class, 'failed'])->name('checkout.failed');

// Gateway webhooks (CSRF-exempt via bootstrap/app.php)
Route::post('/webhooks/billplz/{userId}', [WebhookController::class, 'billplz'])->name('webhooks.billplz');
Route::post('/webhooks/senangpay/{userId}', [WebhookController::class, 'senangpay'])->name('webhooks.senangpay');

// Guest routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'show'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);

    Route::get('/register', [RegisterController::class, 'show'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
    Route::post('/register/check-slug', [RegisterController::class, 'checkSlug'])->name('register.check-slug');
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    // Subscriber
    Route::middleware('role:subscriber')->group(function () {
        // Subscription page (no subscription middleware — must be reachable when sub expired)
        Route::get('/subscription', [SubscriptionController::class, 'index'])->name('subscription');

        // Subscription-gated subscriber routes
        Route::middleware('subscription')->group(function () {
            Route::get('/dashboard', [SubscriberDashboard::class, 'index'])->name('dashboard');

            Route::get('/pages', [SubscriberPage::class, 'index'])->name('pages.index');
            Route::get('/pages/create', [SubscriberPage::class, 'create'])->name('pages.create');
            Route::post('/pages', [SubscriberPage::class, 'store'])->name('pages.store');
            Route::get('/pages/{page}/edit', [SubscriberPage::class, 'edit'])->name('pages.edit');
            Route::put('/pages/{page}', [SubscriberPage::class, 'update'])->name('pages.update');
            Route::delete('/pages/{page}', [SubscriberPage::class, 'destroy'])->name('pages.destroy');
            Route::post('/pages/{page}/toggle-publish', [SubscriberPage::class, 'togglePublish'])->name('pages.toggle-publish');

            // Custom domains
            Route::get('/domains', [CustomDomainController::class, 'index'])->name('domains.index');
            Route::post('/domains', [CustomDomainController::class, 'store'])->name('domains.store');
            Route::post('/domains/{domain}/verify', [CustomDomainController::class, 'verify'])->name('domains.verify');
            Route::delete('/domains/{domain}', [CustomDomainController::class, 'destroy'])->name('domains.destroy');

            // Products
            Route::get('/products', [SubscriberProduct::class, 'index'])->name('products.index');
            Route::get('/products/create', [SubscriberProduct::class, 'create'])->name('products.create');
            Route::post('/products', [SubscriberProduct::class, 'store'])->name('products.store');
            Route::get('/products/{product}/edit', [SubscriberProduct::class, 'edit'])->name('products.edit');
            Route::put('/products/{product}', [SubscriberProduct::class, 'update'])->name('products.update');
            Route::delete('/products/{product}', [SubscriberProduct::class, 'destroy'])->name('products.destroy');

            // Orders
            Route::get('/orders', [SubscriberOrder::class, 'index'])->name('orders.index');
            Route::get('/orders/export', [SubscriberOrder::class, 'export'])->name('orders.export');
            Route::get('/orders/{order}', [SubscriberOrder::class, 'show'])->name('orders.show');

            // Analytics
            Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

            // Payment settings
            Route::get('/payment-settings', [PaymentSettingController::class, 'index'])->name('payment-settings.index');
            Route::post('/payment-settings', [PaymentSettingController::class, 'update'])->name('payment-settings.update');
            Route::post('/payment-settings/default', [PaymentSettingController::class, 'setDefault'])->name('payment-settings.default');

            // Courier settings
            Route::get('/courier-settings', [CourierSettingController::class, 'index'])->name('courier-settings.index');
            Route::post('/courier-settings', [CourierSettingController::class, 'update'])->name('courier-settings.update');
            Route::post('/courier-settings/default', [CourierSettingController::class, 'setDefault'])->name('courier-settings.default');

            // Notification preferences
            Route::get('/notification-prefs', [NotificationPrefController::class, 'index'])->name('notification-prefs.index');
            Route::post('/notification-prefs', [NotificationPrefController::class, 'update'])->name('notification-prefs.update');

            // Shipments
            Route::post('/orders/{order}/shipment', [ShipmentController::class, 'store'])->name('orders.shipment.store');
            Route::post('/orders/{order}/shipment/track', [ShipmentController::class, 'track'])->name('orders.shipment.track');
            Route::get('/orders/{order}/awb', [AwbController::class, 'show'])->name('orders.awb');
        });
    });

    // Admin
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('dashboard');

        Route::get('/subscribers', [AdminSubscriber::class, 'index'])->name('subscribers.index');
        Route::get('/subscribers/{subscriber}', [AdminSubscriber::class, 'show'])->name('subscribers.show');

        Route::get('/packages', [AdminPackage::class, 'index'])->name('packages.index');
        Route::get('/packages/create', [AdminPackage::class, 'create'])->name('packages.create');
        Route::post('/packages', [AdminPackage::class, 'store'])->name('packages.store');
        Route::get('/packages/{package}/edit', [AdminPackage::class, 'edit'])->name('packages.edit');
        Route::put('/packages/{package}', [AdminPackage::class, 'update'])->name('packages.update');
        Route::delete('/packages/{package}', [AdminPackage::class, 'destroy'])->name('packages.destroy');
        Route::post('/packages/{package}/toggle', [AdminPackage::class, 'toggle'])->name('packages.toggle');

        Route::get('/subscriptions', [AdminSubscription::class, 'index'])->name('subscriptions.index');
        Route::get('/payments', [AdminPayment::class, 'index'])->name('payments.index');

        Route::get('/settings', [AdminSetting::class, 'index'])->name('settings.index');
        Route::post('/settings', [AdminSetting::class, 'update'])->name('settings.update');
    });
});
