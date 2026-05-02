<?php

namespace App\Http\Controllers\Subscriber;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\ShipmentService;
use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    public function __construct(private ShipmentService $service) {}

    public function store(Request $request, Order $order)
    {
        abort_if($order->user_id !== $request->user()->id, 403);
        abort_if($order->payment_status !== 'paid', 422, 'Order is not paid yet.');

        $shipment = $this->service->createForOrder($order);

        if (! $shipment) {
            return back()->with('error', 'No active courier configured.');
        }

        if ($shipment->status === 'failed') {
            return back()->with('error', 'Shipment creation failed. Check logs.');
        }

        return back()->with('success', "AWB created: {$shipment->awb_number}");
    }

    public function track(Request $request, Order $order)
    {
        abort_if($order->user_id !== $request->user()->id, 403);
        abort_if(! $order->shipment, 404, 'No shipment yet.');

        $this->service->track($order->shipment);

        return back()->with('success', 'Shipment status refreshed.');
    }
}
