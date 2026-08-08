<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Invoices;

use App\Models\Invoice;
use Livewire\Component;

class Convert extends Component
{
    public Invoice $invoice;

    public function mount(Invoice $invoice): void
    {
        $this->invoice = $invoice;
    }

    public function convert(): void
    {
        if ($this->invoice->type !== 'quotation') {
            session()->flash('error', 'Hanya quotation yang bisa dikonversi.');
            $this->redirectRoute('admin.invoices.index');
            return;
        }

        $new = $this->invoice->convertToInvoice();

        session()->flash('success', 'Quotation berhasil dikonversi menjadi invoice ' . $new->number . '.');
        $this->redirectRoute('admin.invoices.edit', $new);
    }

    public function render()
    {
        // Langsung convert saat halaman dibuka
        $this->convert();

        return view('livewire.admin.invoices.convert')
            ->layout('components.layouts.admin');
    }
}
