<?php

namespace App\Http\Controllers\Subscriber;

use App\Http\Controllers\Controller;
use App\Models\LandingPage;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $pages = LandingPage::where('user_id', $user->id)
            ->latest()
            ->get(['id', 'title', 'slug', 'editor_mode', 'is_published', 'is_homepage', 'views_count', 'updated_at']);

        $sub = $user->activeSubscription()->with('package')->first();
        $maxPages = $sub?->package?->max_landing_pages ?? 1;

        return Inertia::render('subscriber/pages/index', [
            'pages' => $pages,
            'limit' => [
                'used' => $pages->count(),
                'max' => $maxPages,
            ],
            'subdomain' => $user->subscriber_slug,
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $sub = $user->activeSubscription()->with('package')->first();
        $features = [
            'can_use_drag_drop' => (bool) $sub?->package?->can_use_drag_drop,
        ];

        $count = LandingPage::where('user_id', $user->id)->count();
        $max = $sub?->package?->max_landing_pages ?? 1;
        if ($count >= $max) {
            return redirect('/pages')->with('error', "Page limit reached ({$max}). Upgrade to add more.")->send();
        }

        return Inertia::render('subscriber/pages/form', [
            'page' => null,
            'features' => $features,
        ]);
    }

    public function edit(Request $request, LandingPage $page): Response
    {
        abort_if($page->user_id !== $request->user()->id, 403);

        $user = $request->user();
        $sub = $user->activeSubscription()->with('package')->first();
        $features = [
            'can_use_drag_drop' => (bool) $sub?->package?->can_use_drag_drop,
        ];

        return Inertia::render('subscriber/pages/form', [
            'page' => $page,
            'features' => $features,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $sub = $user->activeSubscription()->with('package')->first();

        $count = LandingPage::where('user_id', $user->id)->count();
        $max = $sub?->package?->max_landing_pages ?? 1;
        if ($count >= $max) {
            return back()->with('error', "Page limit reached ({$max}). Upgrade to add more.");
        }

        $data = $this->validateData($request, $user->id);

        if ($data['editor_mode'] === 'grapesjs' && ! $sub?->package?->can_use_drag_drop) {
            return back()->with('error', 'Drag & Drop editor is not available on your plan.');
        }

        $data['user_id'] = $user->id;
        $data['slug'] = $this->uniqueSlug($user->id, $data['title']);
        if (! empty($data['is_published'])) {
            $data['published_at'] = Carbon::now();
        }

        if (! empty($data['is_homepage'])) {
            LandingPage::where('user_id', $user->id)->update(['is_homepage' => false]);
        }

        $page = LandingPage::create($data);

        return redirect("/pages/{$page->id}/edit")->with('success', 'Page created.');
    }

    public function update(Request $request, LandingPage $page)
    {
        abort_if($page->user_id !== $request->user()->id, 403);
        $user = $request->user();
        $sub = $user->activeSubscription()->with('package')->first();

        $data = $this->validateData($request, $user->id, $page->id);

        if ($data['editor_mode'] === 'grapesjs' && ! $sub?->package?->can_use_drag_drop) {
            return back()->with('error', 'Drag & Drop editor is not available on your plan.');
        }

        if ($data['title'] !== $page->title) {
            $data['slug'] = $this->uniqueSlug($user->id, $data['title'], $page->id);
        }

        if (! empty($data['is_published']) && ! $page->is_published) {
            $data['published_at'] = Carbon::now();
        }

        if (! empty($data['is_homepage'])) {
            LandingPage::where('user_id', $user->id)
                ->where('id', '!=', $page->id)
                ->update(['is_homepage' => false]);
        }

        $page->update($data);

        return back()->with('success', 'Page saved.');
    }

    public function destroy(Request $request, LandingPage $page)
    {
        abort_if($page->user_id !== $request->user()->id, 403);
        $page->delete();
        return redirect('/pages')->with('success', 'Page deleted.');
    }

    public function togglePublish(Request $request, LandingPage $page)
    {
        abort_if($page->user_id !== $request->user()->id, 403);
        $page->update([
            'is_published' => ! $page->is_published,
            'published_at' => ! $page->is_published ? Carbon::now() : $page->published_at,
        ]);
        return back()->with('success', $page->is_published ? 'Page published.' : 'Page unpublished.');
    }

    private function validateData(Request $request, int $userId, ?int $ignoreId = null): array
    {
        return $request->validate([
            'title'           => ['required', 'string', 'max:200'],
            'editor_mode'     => ['required', 'in:tinymce,grapesjs'],
            'content_html'    => ['nullable', 'string'],
            'grapesjs_data'   => ['nullable', 'array'],
            'checkout_mode'   => ['required', 'in:single,cart'],
            'seo_title'       => ['nullable', 'string', 'max:200'],
            'seo_description' => ['nullable', 'string', 'max:500'],
            'og_image'        => ['nullable', 'string', 'max:500'],
            'is_published'    => ['boolean'],
            'is_homepage'     => ['boolean'],
        ]);
    }

    private function uniqueSlug(int $userId, string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;
        while (LandingPage::where('user_id', $userId)->where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "$base-" . ++$i;
        }
        return $slug;
    }
}
