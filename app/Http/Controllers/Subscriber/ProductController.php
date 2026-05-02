<?php

namespace App\Http\Controllers\Subscriber;

use App\Http\Controllers\Controller;
use App\Models\LandingPage;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $sub = $user->activeSubscription()->with('package')->first();
        $maxProducts = $sub?->package?->max_products;

        $products = Product::where('user_id', $user->id)
            ->latest()
            ->get();

        return Inertia::render('subscriber/products/index', [
            'products' => $products,
            'limit' => [
                'used' => $products->count(),
                'max' => $maxProducts,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $sub = $user->activeSubscription()->with('package')->first();

        $count = Product::where('user_id', $user->id)->count();
        $max = $sub?->package?->max_products;
        if ($max !== null && $count >= $max) {
            return redirect('/products')->with('error', "Product limit reached ({$max}).")->send();
        }

        $pages = LandingPage::where('user_id', $user->id)->orderBy('title')->get(['id', 'title']);

        return Inertia::render('subscriber/products/form', [
            'product' => null,
            'attached_pages' => [],
            'pages' => $pages,
        ]);
    }

    public function edit(Request $request, Product $product): Response
    {
        abort_if($product->user_id !== $request->user()->id, 403);

        $pages = LandingPage::where('user_id', $request->user()->id)->orderBy('title')->get(['id', 'title']);
        $attached = $product->landingPages()->pluck('landing_pages.id')->toArray();

        return Inertia::render('subscriber/products/form', [
            'product' => $product,
            'attached_pages' => $attached,
            'pages' => $pages,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $sub = $user->activeSubscription()->with('package')->first();

        $count = Product::where('user_id', $user->id)->count();
        $max = $sub?->package?->max_products;
        if ($max !== null && $count >= $max) {
            return back()->with('error', "Product limit reached ({$max}).");
        }

        $data = $this->validateData($request);
        $data['user_id'] = $user->id;
        $data['slug'] = $this->uniqueSlug($user->id, $data['name']);
        $data['images'] = $this->saveImages($request, $user->id);

        $product = Product::create($data);

        if ($pageIds = $request->input('attached_pages')) {
            $this->syncPages($product, $pageIds, $user->id);
        }

        return redirect('/products')->with('success', 'Product created.');
    }

    public function update(Request $request, Product $product)
    {
        abort_if($product->user_id !== $request->user()->id, 403);

        $data = $this->validateData($request);
        if ($data['name'] !== $product->name) {
            $data['slug'] = $this->uniqueSlug($product->user_id, $data['name'], $product->id);
        }

        $existing = $product->images ?? [];
        $newImages = $this->saveImages($request, $product->user_id);
        $data['images'] = array_merge($existing, $newImages);

        $product->update($data);

        if ($request->has('attached_pages')) {
            $this->syncPages($product, $request->input('attached_pages', []), $product->user_id);
        }

        return back()->with('success', 'Product updated.');
    }

    public function destroy(Request $request, Product $product)
    {
        abort_if($product->user_id !== $request->user()->id, 403);
        foreach ($product->images ?? [] as $img) {
            $path = str_replace('/storage/', '', $img);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
        $product->delete();
        return redirect('/products')->with('success', 'Product deleted.');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'name'        => ['required', 'string', 'max:200'],
            'price'       => ['required', 'numeric', 'min:0'],
            'stock'       => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'weight_kg'   => ['nullable', 'numeric', 'min:0'],
            'is_active'   => ['boolean'],
        ]);
    }

    private function saveImages(Request $request, int $userId): array
    {
        $paths = [];
        foreach ($request->file('new_images', []) as $file) {
            $path = $file->store("products/{$userId}", 'public');
            $paths[] = '/storage/' . $path;
        }
        return $paths;
    }

    private function uniqueSlug(int $userId, string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;
        while (Product::where('user_id', $userId)->where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "$base-" . ++$i;
        }
        return $slug;
    }

    private function syncPages(Product $product, array $pageIds, int $userId): void
    {
        $valid = LandingPage::where('user_id', $userId)
            ->whereIn('id', $pageIds)
            ->pluck('id')
            ->toArray();
        $product->landingPages()->sync($valid);
    }
}
