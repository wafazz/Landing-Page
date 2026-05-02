<?php

namespace App\Http\Controllers\Subscriber;

use App\Http\Controllers\Controller;
use App\Models\UserCourierSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourierSettingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $package = $user->activeSubscription?->package;

        abort_if(! $package?->can_connect_courier, 403, 'Your package does not include courier integration.');

        $settings = UserCourierSetting::where('user_id', $user->id)->get()->keyBy('courier');

        return Inertia::render('subscriber/courier-settings/index', [
            'ninjavan' => $this->mask($settings->get('ninjavan')),
            'jnt' => $this->mask($settings->get('jnt')),
            'default_courier' => $settings->firstWhere('is_default', true)?->courier,
            'can_print_awb' => (bool) $package?->can_print_awb,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $courier = $request->input('courier');

        if (! in_array($courier, ['ninjavan', 'jnt'])) {
            return back()->with('error', 'Invalid courier.');
        }

        $base = $request->validate([
            'pickup_phone' => ['required', 'string', 'max:30'],
            'pickup_address' => ['required', 'string', 'max:300'],
            'pickup_city' => ['required', 'string', 'max:80'],
            'pickup_postcode' => ['required', 'string', 'max:10'],
            'pickup_state' => ['required', 'string', 'max:60'],
            'is_sandbox' => ['boolean'],
        ]);

        if ($courier === 'ninjavan') {
            $extra = $request->validate([
                'client_id' => ['required', 'string'],
                'client_secret' => ['required', 'string'],
            ]);
        } else {
            $extra = $request->validate([
                'api_account' => ['required', 'string'],
                'private_key' => ['required', 'string'],
                'customer_code' => ['required', 'string'],
            ]);
        }

        UserCourierSetting::updateOrCreate(
            ['user_id' => $user->id, 'courier' => $courier],
            [
                'credentials' => array_merge($extra, [
                    'pickup_phone' => $base['pickup_phone'],
                    'pickup_address' => $base['pickup_address'],
                    'pickup_city' => $base['pickup_city'],
                    'pickup_postcode' => $base['pickup_postcode'],
                    'pickup_state' => $base['pickup_state'],
                ]),
                'is_sandbox' => $base['is_sandbox'] ?? true,
                'is_active' => true,
            ]
        );

        return back()->with('success', strtoupper($courier) . ' configured successfully.');
    }

    public function setDefault(Request $request)
    {
        $user = $request->user();
        $courier = $request->input('courier');

        if (! in_array($courier, ['ninjavan', 'jnt'])) {
            return back()->with('error', 'Invalid courier.');
        }

        UserCourierSetting::where('user_id', $user->id)->update(['is_default' => false]);
        UserCourierSetting::where('user_id', $user->id)->where('courier', $courier)->update(['is_default' => true]);

        return back()->with('success', 'Default courier updated.');
    }

    private function mask(?UserCourierSetting $s): ?array
    {
        if (! $s) return null;
        $creds = $s->credentials->toArray();
        return [
            'courier' => $s->courier,
            'is_sandbox' => $s->is_sandbox,
            'is_default' => $s->is_default,
            'is_configured' => true,
            'preview' => array_map(fn ($v) => $v ? str_repeat('•', 6) . substr((string) $v, -4) : null, $creds),
        ];
    }
}
