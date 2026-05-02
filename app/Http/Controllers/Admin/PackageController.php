<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(): Response
    {
        $packages = Package::orderBy('sort_order')->get();

        return Inertia::render('admin/packages/index', [
            'packages' => $packages,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/packages/form', [
            'package' => null,
        ]);
    }

    public function edit(Package $package): Response
    {
        return Inertia::render('admin/packages/form', [
            'package' => $package,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data['slug'] = Str::slug($data['name']);

        Package::create($data);

        return redirect('/admin/packages')->with('success', 'Package created.');
    }

    public function update(Request $request, Package $package)
    {
        $data = $this->validateData($request, $package->id);
        if (! $package->isTrial()) {
            $data['slug'] = Str::slug($data['name']);
        }

        $package->update($data);

        return redirect('/admin/packages')->with('success', 'Package updated.');
    }

    public function destroy(Package $package)
    {
        if ($package->isTrial()) {
            return back()->with('error', 'Trial package cannot be deleted.');
        }
        if ($package->subscriptions()->whereIn('status', ['active', 'trial'])->exists()) {
            return back()->with('error', 'Package has active subscribers.');
        }

        $package->delete();
        return back()->with('success', 'Package deleted.');
    }

    public function toggle(Package $package)
    {
        $package->update(['is_active' => ! $package->is_active]);
        return back()->with('success', 'Package status updated.');
    }

    private function validateData(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'name'                  => ['required', 'string', 'max:100'],
            'description'           => ['nullable', 'string'],
            'price'                 => ['required', 'numeric', 'min:0'],
            'billing_cycle'         => ['required', 'in:monthly,yearly'],
            'tag'                   => ['required', 'in:normal,promo,trial'],
            'max_landing_pages'     => ['required', 'integer', 'min:1'],
            'max_products'          => ['nullable', 'integer', 'min:0'],
            'can_use_tinymce'       => ['boolean'],
            'can_use_drag_drop'     => ['boolean'],
            'can_connect_courier'   => ['boolean'],
            'can_print_awb'         => ['boolean'],
            'can_use_custom_domain' => ['boolean'],
            'sort_order'            => ['nullable', 'integer'],
            'is_active'             => ['boolean'],
        ]);
    }
}
