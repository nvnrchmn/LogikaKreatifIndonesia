<div>
    <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-xl font-bold text-txt-main">
            {{ $invoice && $invoice->exists ? 'Edit' : 'Buat' }} {{ $type === 'quotation' ? 'Quotation' : 'Invoice' }}
        </h2>
        <a href="{{ route('admin.invoices.index') }}" class="text-txt-muted hover:text-txt-main text-sm">← Kembali</a>
    </div>

    @if (session()->has('success'))
        <div class="bg-green-100 text-green-800 text-sm p-3 rounded-lg mb-4">{{ session('success') }}</div>
    @endif

    <div class="card p-6 space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Tipe</label>
                <select wire:model="type" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
                    <option value="quotation">Quotation (Penawaran)</option>
                    <option value="invoice">Invoice (Tagihan)</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Status</label>
                <select wire:model="status" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Nama Klien *</label>
                <input type="text" wire:model="client_name" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
                @error('client_name') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
            </div>
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Email Klien</label>
                <input type="email" wire:model="client_email" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Perusahaan</label>
                <input type="text" wire:model="client_company" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-txt-main mb-1">Subject *</label>
            <input type="text" wire:model="subject" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
            @error('subject') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
        </div>

        <div>
            <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-txt-main">Items</label>
                <button type="button" wire:click="addItem" class="text-sm text-brand-primary hover:underline">+ Tambah Item</button>
            </div>
            <div class="space-y-2">
                @foreach ($items as $i => $item)
                    <div class="flex gap-2 items-start">
                        <input type="text" wire:model="items.{{ $i }}.description" placeholder="Deskripsi" class="flex-[3] px-3 py-2 bg-white border border-border-minimal rounded-lg text-sm">
                        <input type="number" wire:model="items.{{ $i }}.qty" placeholder="Qty" class="flex-1 px-3 py-2 bg-white border border-border-minimal rounded-lg text-sm">
                        <input type="number" wire:model="items.{{ $i }}.unit_price" placeholder="Harga" class="flex-1 px-3 py-2 bg-white border border-border-minimal rounded-lg text-sm">
                        <button type="button" wire:click="removeItem({{ $i }})" class="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg">✕</button>
                    </div>
                    @error('items.' . $i . '.description') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                @endforeach
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Discount (Rp)</label>
                <input type="number" wire:model="discount_amount" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Pajak (%)</label>
                <input type="number" wire:model="tax_percent" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-txt-main mb-1">Due Date</label>
                <input type="date" wire:model="due_date" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm">
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-txt-main mb-1">Notes</label>
            <textarea wire:model="notes" rows="3" class="w-full px-4 py-2.5 bg-white border border-border-minimal rounded-xl text-sm"></textarea>
        </div>

        <div class="flex justify-end gap-3">
            @if ($invoice && $invoice->exists)
                <a href="{{ route('admin.invoices.pdf', $invoice) }}" target="_blank" class="btn-outline text-sm !py-3 !px-8">Download PDF</a>
            @endif
            <button type="button" wire:click="save" class="btn-primary text-sm !py-3 !px-8">Simpan</button>
        </div>
    </div>
</div>
