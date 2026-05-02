<?php

namespace App\Http\Controllers\Subscriber;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\UserCourierSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AwbController extends Controller
{
    public function show(Request $request, Order $order)
    {
        abort_if($order->user_id !== $request->user()->id, 403);

        $package = $request->user()->activeSubscription?->package;
        abort_if(! $package?->can_print_awb, 403, 'AWB printing not available in your package.');

        $order->load('items', 'shipment');
        abort_if(! $order->shipment || ! $order->shipment->awb_number, 404, 'No AWB available yet.');

        $courierSetting = UserCourierSetting::where('user_id', $order->user_id)
            ->where('courier', $order->shipment->courier)
            ->first();

        $pickup = [];
        if ($courierSetting) {
            $creds = $courierSetting->credentials->toArray();
            $pickup = [
                'address' => $creds['pickup_address'] ?? '',
                'city' => $creds['pickup_city'] ?? '',
                'state' => $creds['pickup_state'] ?? '',
                'postcode' => $creds['pickup_postcode'] ?? '',
                'phone' => $creds['pickup_phone'] ?? '',
            ];
        }

        $pdf = Pdf::loadView('pdf.awb', [
            'order' => $order,
            'shipment' => $order->shipment,
            'pickup' => $pickup,
            'sellerName' => $request->user()->name,
        ])->setPaper('a6', 'portrait');

        $filename = "awb-{$order->shipment->awb_number}.pdf";

        if (! $order->shipment->label_path) {
            $path = "awb/{$order->user_id}/{$filename}";
            Storage::disk('local')->put($path, $pdf->output());
            $order->shipment->update(['label_path' => $path]);
        }

        return $pdf->stream($filename);
    }
}
