<?php

namespace App\Http\Controllers\Subscriber;

use App\Http\Controllers\Controller;
use App\Models\CustomDomain;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomDomainController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $sub = $user->activeSubscription()->with('package')->first();
        $canUseCustom = (bool) $sub?->package?->can_use_custom_domain;

        $domains = CustomDomain::where('user_id', $user->id)->latest()->get();

        return Inertia::render('subscriber/domains/index', [
            'domains' => $domains,
            'canUseCustomDomain' => $canUseCustom,
            'subdomain' => $user->subscriber_slug,
            'primaryHost' => config('app.primary_host', 'lpage.my'),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $sub = $user->activeSubscription()->with('package')->first();

        if (! $sub?->package?->can_use_custom_domain) {
            return back()->with('error', 'Custom domains are not available on your plan.');
        }

        $data = $request->validate([
            'domain' => [
                'required', 'string', 'max:253',
                'regex:/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i',
                'unique:custom_domains,domain',
            ],
        ]);

        $domain = strtolower($data['domain']);
        if (str_starts_with($domain, 'www.')) {
            $domain = substr($domain, 4);
        }

        CustomDomain::create([
            'user_id' => $user->id,
            'domain' => $domain,
            'verification_token' => Str::random(32),
            'is_verified' => false,
            'ssl_status' => 'pending',
        ]);

        return redirect('/domains')->with('success', 'Domain added. Follow the DNS instructions to verify.');
    }

    public function verify(Request $request, CustomDomain $domain)
    {
        abort_if($domain->user_id !== $request->user()->id, 403);

        $primary = config('app.primary_host', 'lpage.my');
        $cnameOk = false;

        $records = @dns_get_record($domain->domain, DNS_CNAME);
        if (is_array($records)) {
            foreach ($records as $r) {
                if (isset($r['target']) && strtolower($r['target']) === strtolower($primary)) {
                    $cnameOk = true;
                    break;
                }
            }
        }

        if (! $cnameOk) {
            $aRecords = @dns_get_record($primary, DNS_A);
            $primaryIps = is_array($aRecords) ? array_column($aRecords, 'ip') : [];
            $domainA = @dns_get_record($domain->domain, DNS_A);
            if (is_array($domainA) && $primaryIps) {
                foreach ($domainA as $r) {
                    if (in_array($r['ip'] ?? null, $primaryIps, true)) {
                        $cnameOk = true;
                        break;
                    }
                }
            }
        }

        if (! $cnameOk) {
            return back()->with('error', "DNS not pointing to {$primary} yet. Propagation can take up to 24 hours.");
        }

        $domain->update([
            'is_verified' => true,
            'verified_at' => Carbon::now(),
            'ssl_status' => 'pending',
        ]);

        // SSL provisioning hook — production server-side cron picks up pending domains
        // and runs certbot --webroot for HTTP-01 challenge.

        return back()->with('success', 'Domain verified. SSL will be provisioned within minutes.');
    }

    public function destroy(Request $request, CustomDomain $domain)
    {
        abort_if($domain->user_id !== $request->user()->id, 403);
        $domain->delete();
        return back()->with('success', 'Domain removed.');
    }
}
