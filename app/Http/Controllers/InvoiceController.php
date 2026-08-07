<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InvoiceController extends Controller
{
    /**
     * Download invoice/quotation as PDF.
     */
    public function downloadPdf(Invoice $invoice)
    {
        // Hanya admin (atau pemilik klien via portal nanti)
        abort_unless(Auth::check() && Auth::user()->hasRole('admin'), 403);

        $pdf = app('dompdf.wrapper');
        $pdf->loadView('invoices.pdf', [
            'invoice' => $invoice,
            'company' => $this->companyProfile(),
        ]);

        $filename = ($invoice->type === 'quotation' ? 'Quotation' : 'Invoice') . '-' . $invoice->number . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Profil PT dari setting (fallback ke default).
     */
    private function companyProfile(): array
    {
        $get = fn (string $key, string $default) =>
            \App\Models\Setting::where('key', $key)->value('value') ?? $default;

        return [
            'name' => $get('company_name', 'PT. Logika Kreatif Indonesia'),
            'address' => $get('company_address', 'Yogyakarta, Indonesia'),
            'phone' => $get('company_phone', '0895-3085-4594'),
            'email' => $get('company_email', 'admin@logikraf.id'),
            'npwp' => $get('company_npwp', '-'),
            'bank_name' => $get('company_bank_name', '-'),
            'bank_account' => $get('company_bank_account', '-'),
            'bank_holder' => $get('company_bank_holder', '-'),
        ];
    }
}
