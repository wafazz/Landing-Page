<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $q = $request->input('q');
        $status = $request->input('status');
        $gateway = $request->input('gateway');

        $payments = SubscriptionPayment::with(['user:id,name,email', 'subscription.package:id,name'])
            ->when($q, fn ($w) => $w->whereHas('user', fn ($u) =>
                $u->where('name', 'like', "%$q%")->orWhere('email', 'like', "%$q%")
            )->orWhere('gateway_ref', 'like', "%$q%"))
            ->when($status, fn ($w) => $w->where('status', $status))
            ->when($gateway, fn ($w) => $w->where('gateway', $gateway))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($p) => [
                'id'          => $p->id,
                'user'        => [
                    'name'  => $p->user?->name,
                    'email' => $p->user?->email,
                ],
                'package'     => $p->subscription?->package?->name,
                'amount'      => $p->amount,
                'gateway'     => $p->gateway,
                'gateway_ref' => $p->gateway_ref,
                'status'      => $p->status,
                'paid_at'     => $p->paid_at?->toDateTimeString(),
                'created_at'  => $p->created_at?->toDateTimeString(),
            ]);

        $monthStart = now()->startOfMonth();

        $kpis = [
            'total_paid'      => (float) SubscriptionPayment::where('status', 'paid')->sum('amount'),
            'month_revenue'   => (float) SubscriptionPayment::where('status', 'paid')
                ->where('paid_at', '>=', $monthStart)->sum('amount'),
            'pending_count'   => SubscriptionPayment::where('status', 'pending')->count(),
            'failed_count'    => SubscriptionPayment::where('status', 'failed')->count(),
        ];

        return Inertia::render('admin/payments/index', [
            'payments' => $payments,
            'kpis'     => $kpis,
            'filters'  => ['q' => $q, 'status' => $status, 'gateway' => $gateway],
        ]);
    }
}
