@extends('emails.layout')
@section('content')
<h2 style="margin:0 0 8px;font-size:22px;color:#111;">Your Subscription Is Expiring Soon</h2>
<p style="color:#4b5563;margin:0 0 20px;">Hi <strong>{{ $recipient_name }}</strong>, your subscription expires on <strong>{{ $ends_at }}</strong>. Renew now to keep your landing pages live.</p>

<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:18px 20px;margin-bottom:20px;">
<tr><td style="font-size:13px;color:#92400e;">Current Package</td><td style="font-size:14px;font-weight:600;text-align:right;">{{ $package_name }}</td></tr>
<tr><td style="font-size:13px;color:#92400e;padding-top:6px;">Expires</td><td style="font-size:14px;font-weight:600;color:#dc2626;text-align:right;padding-top:6px;">{{ $ends_at }}</td></tr>
@if (! empty($days_left))
<tr><td style="font-size:13px;color:#92400e;padding-top:6px;">Days Left</td><td style="font-size:18px;font-weight:700;color:#dc2626;text-align:right;padding-top:6px;">{{ $days_left }}</td></tr>
@endif
</table>

<div style="text-align:center;margin:24px 0;">
<a href="{{ $renew_url ?? url('/subscription') }}" style="display:inline-block;background:#0d6efd;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Renew Subscription</a>
</div>
@endsection
