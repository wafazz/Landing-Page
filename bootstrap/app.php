<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(prepend: [
            \App\Http\Middleware\ResolveDomain::class,
        ], append: [
            HandleInertiaRequests::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureRole::class,
            'subscription' => \App\Http\Middleware\EnsureSubscription::class,
        ]);

        $middleware->preventRequestForgery(except: [
            'webhooks/billplz/*',
            'webhooks/senangpay/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function ($response) {
            $status = $response->getStatusCode();

            if (in_array($status, [403, 404, 419, 500, 503]) && ! app()->environment('local')) {
                return Inertia\Inertia::render("errors/{$status}")
                    ->toResponse(request())
                    ->setStatusCode($status);
            }

            return $response;
        });
    })->create();
