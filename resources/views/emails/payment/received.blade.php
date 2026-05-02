@extends('emails.layout')
@section('content')
<div style="text-align:center;margin-bottom:20px;">
<div style="display:inline-block;background:#dcfce7;color:#16a34a;padding:14px;border-radius:50%;font-size:32px;line-height:1;">&#10003;</div>
</div>
<h2 style="margin:0 0 8px;font-size:22px;color:#111;text-align:center;">Payment Confirmed</h2>
<p style="color:#4b5563;margin:0 0 24px;text-align:center;">Hi <strong>{{ $recipient_name }}</strong>, we've received your payment for order <strong>{{ $order_number }}</strong>.</p>

<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:18px 20px;margin-bottom:20px;">
<tr><td style="font-size:13px;color:#15803d;">Total Paid</td><td style="font-size:20px;font-weight:700;color:#15803d;text-align:right;">RM {{ $total }}</td></tr>
@if (! empty($payment_gateway))
<tr><td style="font-size:13px;color:#15803d;padding-top:6px;">Method</td><td style="font-size:13px;text-align:right;text-transform:capitalize;padding-top:6px;">{{ $payment_gateway }}</td></tr>
@endif
</table>

<p style="color:#4b5563;margin:0 0 20px;">Your order is now being prepared. You'll receive another email when it ships with the AWB number.</p>
<p style="color:#6b7280;font-size:13px;margin:0;">Confirmed at {{ now()->format('Y-m-d H:i') }}</p>
@endsection
