<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Invoices;

use App\Models\Invoice;
use App\Models\User;
use Illuminate\Support\Str;
use Livewire\Component;

class Form extends Component
{
    public ?Invoice $invoice = null;

    public string $type = 'quotation';
    public string $client_name = '';
    public string $client_email = '';
    public string $client_company = '';
    public string $subject = '';
    public string $notes = '';
    public array $items = [];
    public int $discount_amount = 0;
    public int $tax_percent = 0;
    public string $due_date = '';
    public string $status = 'draft';

    public function mount(?Invoice $invoice = null): void
    {
        $this->invoice = $invoice;
        if ($invoice && $invoice->exists) {
            $this->type = $invoice->type;
            $this->client_name = $invoice->client_name;
            $this->client_email = (string) $invoice->client_email;
            $this->client_company = (string) $invoice->client_company;
            $this->subject = $invoice->subject;
            $this->notes = (string) $invoice->notes;
            $this->items = $invoice->items ?? [];
            $this->discount_amount = $invoice->discount_amount;
            $this->tax_percent = $invoice->subtotal > 0
                ? (int) round($invoice->tax_amount / $invoice->subtotal * 100)
                : 0;
            $this->due_date = $invoice->due_date?->format('Y-m-d') ?? '';
            $this->status = $invoice->status;
        } else {
            $this->items = [['description' => '', 'qty' => 1, 'unit_price' => 0]];
        }
    }

    public function addItem(): void
    {
        $this->items[] = ['description' => '', 'qty' => 1, 'unit_price' => 0];
    }

    public function removeItem(int $i): void
    {
        unset($this->items[$i]);
        $this->items = array_values($this->items);
    }

    protected function rules(): array
    {
        return [
            'type' => 'required|in:quotation,invoice',
            'client_name' => 'required|string|max:255',
            'client_email' => 'nullable|email',
            'client_company' => 'nullable|string|max:255',
            'subject' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.qty' => 'required|numeric|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_percent' => 'nullable|numeric|min:0|max:100',
            'due_date' => 'nullable|date',
            'status' => 'required|in:draft,sent,approved,rejected,paid,cancelled',
        ];
    }

    public function save(): void
    {
        $this->validate();

        $subtotal = 0;
        foreach ($this->items as &$item) {
            $item['qty'] = (int) $item['qty'];
            $item['unit_price'] = (int) $item['unit_price'];
            $subtotal += $item['qty'] * $item['unit_price'];
        }
        unset($item);

        $taxAmount = (int) round($subtotal * ($this->tax_percent / 100));
        $total = $subtotal + $taxAmount - (int) $this->discount_amount;

        $client = User::where('email', $this->client_email)->first();

        $data = [
            'type' => $this->type,
            'client_id' => $client?->id,
            'client_name' => $this->client_name,
            'client_email' => $this->client_email ?: null,
            'client_company' => $this->client_company ?: null,
            'subject' => $this->subject,
            'notes' => $this->notes ?: null,
            'items' => $this->items,
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'discount_amount' => (int) $this->discount_amount,
            'total' => max(0, $total),
            'due_date' => $this->due_date ?: null,
            'status' => $this->status,
        ];

        if ($this->invoice && $this->invoice->exists) {
            $this->invoice->update($data);
        } else {
            $prefix = $this->type === 'quotation' ? 'QUO' : 'INV';
            $data['number'] = $prefix . '-' . date('Ymd') . '-' . strtoupper(Str::random(4));
            $data['issue_date'] = now()->toDateString();
            Invoice::create($data);
        }

        session()->flash('success', 'Invoice/Quotation tersimpan.');
        $this->redirectRoute('admin.invoices.index');
    }

    public function render()
    {
        return view('livewire.admin.invoices.form')
            ->layout('components.layouts.admin');
    }
}
