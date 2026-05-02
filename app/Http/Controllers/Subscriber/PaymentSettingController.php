<?php

namespace App\Http\Controllers\Subscriber;

use App\Http\Controllers\Controller;
use App\Models\UserPaymentSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentSettingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $settings = UserPaymentSetting::where('user_id', $user->id)->get()->keyBy('gateway');

        return Inertia::render('subscriber/payment-settings/index', [
            'billplz' => $this->mask($settings->get('billplz')),
            'senangpay' => $this->mask($settings->get('senangpay')),
            'default_gateway' => $settings->firstWhere('is_default', true)?->gateway,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $gateway = $request->input('gateway');

        if (! in_array($gateway, ['billplz', 'senangpay'])) {
            return back()->with('error', 'Invalid gateway.');
        }

        if ($gateway === 'billplz') {
            $data = $request->validate([
                'api_key' => ['required', 'string'],
                'collection_id' => ['required', 'string'],
                'x_signature' => ['nullable', 'string'],
                'is_sandbox' => ['boolean'],
            ]);
            $credentials = [
                'api_key' => $data['api_key'],
                'collection_id' => $data['collection_id'],
                'x_signature' => $data['x_signature'] ?? null,
            ];
        } else {
            $data = $request->validate([
                'merchant_id' => ['required', 'string'],
                'secret_key' => ['required', 'string'],
                'is_sandbox' => ['boolean'],
            ]);
            $credentials = [
                'merchant_id' => $data['merchant_id'],
                'secret_key' => $data['secret_key'],
            ];
        }

        UserPaymentSetting::updateOrCreate(
            ['user_id' => $user->id, 'gateway' => $gateway],
            [
                'credentials' => $credentials,
                'is_sandbox' => $data['is_sandbox'] ?? true,
                'is_active' => true,
            ]
        );

        return back()->with('success', ucfirst($gateway) . ' configured successfully.');
    }

    public function setDefault(Request $request)
    {
        $user = $request->user();
        $gateway = $request->input('gateway');

        if (! in_array($gateway, ['billplz', 'senangpay'])) {
            return back()->with('error', 'Invalid gateway.');
        }

        UserPaymentSetting::where('user_id', $user->id)->update(['is_default' => false]);
        UserPaymentSetting::where('user_id', $user->id)->where('gateway', $gateway)->update(['is_default' => true]);

        return back()->with('success', 'Default gateway updated.');
    }

    private function mask(?UserPaymentSetting $s): ?array
    {
        if (! $s) return null;
        $creds = $s->credentials->toArray();
        return [
            'gateway' => $s->gateway,
            'is_sandbox' => $s->is_sandbox,
            'is_default' => $s->is_default,
            'is_configured' => true,
            'preview' => array_map(fn ($v) => $v ? str_repeat('•', 8) . substr((string) $v, -4) : null, $creds),
        ];
    }
}
