<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    private const KEYS = [
        'site_name',
        'trial_days',
        'grace_period_days',
        'site_logo',
        'billplz_api_key',
        'billplz_collection_id',
        'billplz_x_signature',
        'billplz_sandbox',
        'brevo_api_key',
        'onsend_api_key',
        'onsend_instance_id',
    ];

    public function index(): Response
    {
        $values = collect(self::KEYS)
            ->mapWithKeys(fn ($k) => [$k => Setting::get($k)])
            ->toArray();

        return Inertia::render('admin/settings', [
            'settings' => $values,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'site_name'             => ['nullable', 'string', 'max:100'],
            'trial_days'            => ['required', 'integer', 'min:0', 'max:365'],
            'grace_period_days'     => ['required', 'integer', 'min:0', 'max:30'],
            'billplz_api_key'       => ['nullable', 'string'],
            'billplz_collection_id' => ['nullable', 'string'],
            'billplz_x_signature'   => ['nullable', 'string'],
            'billplz_sandbox'       => ['boolean'],
            'brevo_api_key'         => ['nullable', 'string'],
            'onsend_api_key'        => ['nullable', 'string'],
            'onsend_instance_id'    => ['nullable', 'string'],
            'logo'                  => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('logo')) {
            $oldLogo = Setting::get('site_logo');
            if ($oldLogo && Storage::disk('public')->exists(str_replace('/storage/', '', $oldLogo))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldLogo));
            }
            $path = $request->file('logo')->store('logos', 'public');
            Setting::set('site_logo', '/storage/' . $path, 'string');
        }

        foreach ($data as $k => $v) {
            if ($k === 'logo') continue;
            Setting::set($k, is_bool($v) ? (string) (int) $v : $v);
        }

        return back()->with('success', 'Settings saved.');
    }
}
