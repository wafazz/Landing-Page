<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('auth/register');
    }

    public function store(Request $request, SubscriptionService $subscriptions)
    {
        $data = $request->validate([
            'name'            => ['required', 'string', 'max:255'],
            'email'           => ['required', 'email', 'max:255', 'unique:users,email'],
            'subscriber_slug' => [
                'required', 'string', 'min:3', 'max:30',
                'regex:/^[a-z0-9-]+$/',
                'unique:users,subscriber_slug',
            ],
            'phone'           => ['nullable', 'string', 'max:20'],
            'password'        => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name'            => $data['name'],
            'email'           => $data['email'],
            'subscriber_slug' => $data['subscriber_slug'],
            'phone'           => $data['phone'] ?? null,
            'password'        => Hash::make($data['password']),
            'role'            => 'subscriber',
        ]);

        $subscriptions->startTrial($user);

        Auth::login($user);

        return redirect('/dashboard')->with('success', 'Welcome to LPage.my! Your 15-day free trial has started.');
    }

    public function checkSlug(Request $request)
    {
        $slug = $request->input('slug');

        if (! preg_match('/^[a-z0-9-]+$/', $slug) || strlen($slug) < 3) {
            return response()->json(['available' => false, 'reason' => 'invalid']);
        }

        $exists = User::where('subscriber_slug', $slug)->exists();

        return response()->json(['available' => ! $exists]);
    }
}
