@extends('emails.layout')
@section('content')
<h2 style="margin:0 0 8px;font-size:22px;color:#111;">Your Order Has Shipped</h2>
<p style="color:#4b5563;margin:0 0 20px;">Hi <strong>{{ $recipient_name }}</strong>, your order is on its way.</p>

<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f9fafb;border-radius:8px;padding:18px 20px;margin-bottom:20px;">
<tr><td style="font-size:13px;color:#6b7280;">Order</td><td style="font-size:14px;font-weight:600;text-align:right;">{{ $order_number }}</td></tr>
<tr><td style="font-size:13px;color:#6b7280;padding-top:6px;">Courier</td><td style="font-size:14px;font-weight:600;text-align:right;text-transform:uppercase;padding-top:6px;">{{ $courier }}</td></tr>
<tr><td style="font-size:13px;color:#6b7280;padding-top:6px;">AWB / Tracking #</td><td style="font-family:monospace;font-size:14px;font-weight:700;color:#0d6efd;text-align:right;padding-top:6px;">{{ $awb_number }}</td></tr>
</table>

@if (! empty($tracking_url))
<div style="text-align:center;margin:24px 0;">
<a href="{{ $tracking_url }}" style="display:inline-block;background:#0d6efd;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Track Shipment</a>
</div>
@endif

<p style="color:#6b7280;font-size:13px;margin:0;">Shipped at {{ now()->format('Y-m-d H:i') }}</p>
@endsection
