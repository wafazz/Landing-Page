<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{ $subject ?? 'Notification' }}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f7fa;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05);">
<tr><td style="background:linear-gradient(135deg,#0d6efd,#3b82f6);padding:24px 28px;color:#fff;">
<div style="font-size:20px;font-weight:700;">{{ \App\Models\Setting::get('site_name', 'LPage.my') }}</div>
<div style="font-size:13px;opacity:.85;margin-top:4px;">Build. Sell. Grow.</div>
</td></tr>
<tr><td style="padding:32px 28px;">
@yield('content')
</td></tr>
<tr><td style="background:#f9fafb;padding:18px 28px;color:#6b7280;font-size:12px;text-align:center;border-top:1px solid #e5e7eb;">
Powered by {{ \App\Models\Setting::get('site_name', 'LPage.my') }}<br>
You received this email because you transacted on a page hosted on our platform.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
