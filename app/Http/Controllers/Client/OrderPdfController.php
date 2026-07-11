<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderPdfController extends Controller
{
    public function download(Order $order)
    {
        // Ensure user is authorized
        if ($order->user_id !== auth()->id() && !auth()->user()->hasRole('admin')) {
            abort(403, 'Unauthorized access.');
        }

        // Load view for PDF
        $pdf = Pdf::loadView('pdf.order-invoice', compact('order'));
        
        // Return download
        return $pdf->download('Invoice-' . $order->order_number . '.pdf');
    }
}
