<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>AWB {{ $shipment->awb_number }}</title>
<style>
@page { margin: 12mm; size: A6; }
body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #111; margin: 0; }
.label { border: 1.5px solid #000; padding: 8px; }
.head { display: table; width: 100%; border-bottom: 1.5px solid #000; padding-bottom: 6px; margin-bottom: 6px; }
.head .left, .head .right { display: table-cell; vertical-align: middle; }
.head .left { width: 60%; }
.head .right { width: 40%; text-align: right; font-weight: bold; font-size: 14px; text-transform: uppercase; }
.brand { font-size: 16px; font-weight: bold; }
.barcode { text-align: center; padding: 6px 0; border-top: 1px dashed #777; border-bottom: 1px dashed #777; margin: 6px 0; }
.barcode .num { letter-spacing: 1px; font-weight: bold; font-size: 13px; }
.barcode .bars {
    font-family: 'Libre Barcode 39', monospace;
    background: repeating-linear-gradient(to right, #000 0 2px, transparent 2px 5px);
    height: 36px;
    margin: 4px 14px;
    border-left: 6px solid #000;
    border-right: 6px solid #000;
}
.row { display: table; width: 100%; margin-bottom: 4px; }
.col { display: table-cell; vertical-align: top; padding: 2px 4px; width: 50%; }
.col h4 { margin: 0 0 2px; font-size: 9px; text-transform: uppercase; color: #555; letter-spacing: 0.5px; }
.col .v { font-size: 11px; line-height: 1.3; }
.divider { border-top: 1px dashed #999; margin: 6px 0; }
table.items { width: 100%; border-collapse: collapse; margin-top: 4px; }
table.items th, table.items td { border: 1px solid #aaa; padding: 3px 4px; text-align: left; font-size: 9px; }
table.items th { background: #f3f3f3; }
.foot { margin-top: 6px; font-size: 8px; color: #666; text-align: center; }
.cod-badge { display: inline-block; background: #d62828; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 10px; }
</style>
</head>
<body>
<div class="label">
    <div class="head">
        <div class="left">
            <div class="brand">{{ strtoupper($shipment->courier === 'jnt' ? 'J&T Express' : 'NinjaVan') }}</div>
            <div style="font-size:9px;color:#555;">Order #{{ $order->order_number }}</div>
        </div>
        <div class="right">
            {{ strtoupper($shipment->status) }}
        </div>
    </div>

    <div class="barcode">
        <div class="bars"></div>
        <div class="num">{{ $shipment->awb_number }}</div>
    </div>

    <div class="row">
        <div class="col">
            <h4>From (Sender)</h4>
            <div class="v">
                <strong>{{ $sellerName }}</strong><br>
                {{ $pickup['address'] ?? '' }}<br>
                {{ $pickup['postcode'] ?? '' }} {{ $pickup['city'] ?? '' }}<br>
                {{ $pickup['state'] ?? '' }}<br>
                {{ $pickup['phone'] ?? '' }}
            </div>
        </div>
        <div class="col">
            <h4>To (Receiver)</h4>
            <div class="v">
                <strong>{{ $order->customer_name }}</strong><br>
                {{ $order->shipping_address }}<br>
                {{ $order->shipping_postcode }} {{ $order->shipping_city }}<br>
                {{ $order->shipping_state }}<br>
                {{ $order->customer_phone }}
            </div>
        </div>
    </div>

    <div class="divider"></div>

    <table class="items">
        <thead>
            <tr><th>Item</th><th style="width:40px;text-align:center;">Qty</th><th style="width:60px;text-align:right;">Price</th></tr>
        </thead>
        <tbody>
            @foreach ($order->items as $item)
            <tr>
                <td>{{ $item->product_name }}</td>
                <td style="text-align:center;">{{ $item->qty }}</td>
                <td style="text-align:right;">RM {{ number_format($item->subtotal, 2) }}</td>
            </tr>
            @endforeach
            <tr>
                <td colspan="2" style="text-align:right;font-weight:bold;">Total</td>
                <td style="text-align:right;font-weight:bold;">RM {{ number_format($order->total, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="foot">
        Generated {{ now()->format('Y-m-d H:i') }} • Powered by LPage.my
    </div>
</div>
</body>
</html>
