@extends('emails.layout')
@section('content')
<h2 style="margin:0 0 8px;font-size:22px;color:#111;">Order Received</h2>
<p style="color:#4b5563;margin:0 0 20px;">Hi <strong>{{ $recipient_name }}</strong>, thank you for your order. We'll notify you again once payment is confirmed.</p>

<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
<tr><td style="font-size:13px;color:#6b7280;">Order Number</td><td style="font-size:14px;font-weight:600;text-align:right;">{{ $order_number }}</td></tr>
<tr><td style="font-size:13px;color:#6b7280;padding-top:6px;">Total</td><td style="font-size:18px;font-weight:700;color:#0d6efd;text-align:right;padding-top:6px;">RM {{ $total }}</td></tr>
</table>

@if (! empty($items))
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin-bottom:20px;">
<thead><tr style="background:#f3f4f6;">
<th align="left" style="padding:8px 10px;font-size:12px;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #e5e7eb;">Item</th>
<th align="center" style="padding:8px 10px;font-size:12px;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #e5e7eb;">Qty</th>
<th align="right" style="padding:8px 10px;font-size:12px;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #e5e7eb;">Subtotal</th>
</tr></thead>
<tbody>
@foreach ($items as $i)
<tr><td style="padding:10px;border-bottom:1px solid #f3f4f6;">{{ $i['name'] }}</td>
<td align="center" style="padding:10px;border-bottom:1px solid #f3f4f6;">{{ $i['qty'] }}</td>
<td align="right" style="padding:10px;border-bottom:1px solid #f3f4f6;">RM {{ $i['subtotal'] }}</td></tr>
@endforeach
</tbody>
</table>
@endif

<p style="color:#6b7280;font-size:13px;margin:0;">Order placed at {{ now()->format('Y-m-d H:i') }}</p>
@endsection
