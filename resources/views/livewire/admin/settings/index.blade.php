<div class="max-w-5xl">
    {{-- Page header --}}
    <div class="mb-6">
        <h1 class="font-display text-2xl font-bold text-txt-main">Pengaturan Global</h1>
        <p class="text-txt-muted text-sm mt-1">Kelola preferensi dan pengaturan sistem utama.</p>
    </div>

    @if(session('success'))
        <div class="mb-6 p-4 bg-status-success/10 text-status-success rounded-lg border border-status-success/20 text-sm font-medium">
            {{ session('success') }}
        </div>
    @endif

    {{-- Single card container: semua section di dalam 1 card, tombol di footer --}}
    <div class="bg-white rounded-xl border border-border-minimal shadow-sm" x-data="{ tab: 'payment', gateway: '{{ $paymentGateway }}' }">

        {{-- Tab navigation --}}
        <div class="flex border-b border-border-minimal overflow-x-auto">
            <button type="button" @click="tab = 'payment'" :class="tab === 'payment' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-txt-muted hover:text-txt-main'" class="px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap">Payment Gateway</button>
            <button type="button" @click="tab = 'kontak'" :class="tab === 'kontak' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-txt-muted hover:text-txt-main'" class="px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap">Kontak Logikraf</button>
            <button type="button" @click="tab = 'profil'" :class="tab === 'profil' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-txt-muted hover:text-txt-main'" class="px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap">Profil Perusahaan</button>
            <button type="button" @click="tab = 'smtp'" :class="tab === 'smtp' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-txt-muted hover:text-txt-main'" class="px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap">SMTP Email</button>
        </div>

        {{-- ============ PAYMENT GATEWAY ============ --}}
        <section class="p-6" x-show="tab === 'payment'">
            <header class="mb-4">
                <h3 class="font-display font-semibold text-lg text-txt-main">Payment Gateway</h3>
                <p class="text-xs text-txt-muted mt-1">Pilih gateway untuk invoice klien. Mode Sandbox tersedia untuk simulasi.</p>
            </header>

            <div class="mb-6 max-w-md">
                <label class="block text-sm font-semibold text-txt-main mb-2">Vendor Payment Gateway Aktif</label>
                <select x-model="gateway" @change="$wire.set('paymentGateway', gateway)"
                        class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main">
                    <option value="xendit">Xendit (Invoice URL)</option>
                    <option value="midtrans">Midtrans (Snap Popup)</option>
                </select>
            </div>

            <h4 class="font-display font-semibold text-txt-main mb-3 text-sm uppercase tracking-wide text-txt-muted">Kredensial API</h4>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4" x-show="gateway === 'xendit'" style="display: {{ $paymentGateway === 'xendit' ? 'grid' : 'none' }};">
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Xendit Secret Key</label>
                    <input wire:model="xenditSecretKey" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="xnd_development_...">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Xendit Public Key</label>
                    <input wire:model="xenditPublicKey" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="xnd_public_development_...">
                </div>
                <p class="text-xs text-txt-muted md:col-span-2">Dapatkan dari dashboard Xendit pada menu Settings &gt; API Keys.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4" x-show="gateway === 'midtrans'" style="display: {{ $paymentGateway === 'midtrans' ? 'grid' : 'none' }};">
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Midtrans Server Key</label>
                    <input wire:model="midtransServerKey" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="SB-Mid-server-...">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Midtrans Client Key</label>
                    <input wire:model="midtransClientKey" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="SB-Mid-client-...">
                </div>
                <p class="text-xs text-txt-muted md:col-span-2">Dapatkan dari dashboard Midtrans pada menu Settings &gt; Access Keys.</p>
            </div>

            <div class="mt-6 pt-4 border-t border-border-minimal">
                <button type="button" wire:click="savePayment" wire:loading.attr="disabled" class="btn bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors w-full">
                    <span wire:loading.remove wire:target="savePayment">Simpan Payment Gateway</span>
                    <span wire:loading wire:target="savePayment">Menyimpan...</span>
                </button>
            </div>
        </section>

        {{-- ============ KONTAK ============ --}}
        <section class="p-6" x-show="tab === 'kontak'">
            <header class="mb-4">
                <h3 class="font-display font-semibold text-lg text-txt-main">Kontak Logikraf</h3>
            </header>
            <form wire:submit="saveContact" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Email Perusahaan</label>
                    <input wire:model="companyEmail" type="email" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main {{ optional($errors)->has('companyEmail') ? 'border-status-danger' : '' }}" placeholder="hello@logikraf.id">
                    @if(isset($errors) && $errors->has('companyEmail')) <p class="text-status-danger text-xs mt-1">{{ $errors->first('companyEmail') }}</p> @endif
                </div>
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Nomor Telepon / WhatsApp</label>
                    <input wire:model="companyPhone" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="+62 811-1234-5678">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-semibold text-txt-main mb-2">Alamat Kantor</label>
                    <textarea wire:model="companyAddress" rows="2" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main resize-none" placeholder="Gedung Inovasi Lt. 3..."></textarea>
                </div>
                <div class="md:col-span-2 pt-2">
                    <button type="submit" wire:loading.attr="disabled" class="btn bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors w-full">
                        <span wire:loading.remove wire:target="saveContact">Simpan Kontak</span>
                        <span wire:loading wire:target="saveContact">Menyimpan...</span>
                    </button>
                </div>
            </form>
        </section>

        {{-- ============ PROFIL PERUSAHAAN ============ --}}
        <section class="p-6" x-show="tab === 'profil'">
            <header class="mb-4">
                <h3 class="font-display font-semibold text-lg text-txt-main">Profil Perusahaan (Untuk Invoice)</h3>
                <p class="text-xs text-txt-muted mt-1">Data ini tampil di header &amp; informasi pembayaran pada PDF invoice/quotation.</p>
            </header>
            <form wire:submit="saveProfile" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Nama Perusahaan</label>
                    <input wire:model="companyName" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="PT. Logika Kreatif Indonesia">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">NPWP</label>
                    <input wire:model="companyNpwp" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="01.234.567.8-901.000">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Nama Bank</label>
                    <input wire:model="companyBankName" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="BCA">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">No. Rekening</label>
                    <input wire:model="companyBankAccount" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="1234567890">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Atas Nama</label>
                    <input wire:model="companyBankHolder" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="Nova Nurachman">
                </div>
                <div></div>
                <div class="md:col-span-3 pt-2">
                    <button type="submit" wire:loading.attr="disabled" class="btn bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors w-full">
                        <span wire:loading.remove wire:target="saveProfile">Simpan Profil</span>
                        <span wire:loading wire:target="saveProfile">Menyimpan...</span>
                    </button>
                </div>
            </form>
        </section>

        {{-- ============ SMTP EMAIL ============ --}}
        <section class="p-6" x-show="tab === 'smtp'">
            <header class="mb-4">
                <h3 class="font-display font-semibold text-lg text-txt-main">Pengaturan SMTP Email</h3>
                <p class="text-xs text-txt-muted mt-1">Konfigurasi server email untuk notifikasi klien.</p>
            </header>
            <form wire:submit="saveEmail" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Mail Host</label>
                    <input wire:model="mailHost" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="smtp.gmail.com">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Mail Port</label>
                    <input wire:model="mailPort" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main {{ optional($errors)->has('mailPort') ? 'border-status-danger' : '' }}" placeholder="587">
                    @if(isset($errors) && $errors->has('mailPort')) <p class="text-status-danger text-xs mt-1">{{ $errors->first('mailPort') }}</p> @endif
                </div>
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Mail Username (Email)</label>
                    <input wire:model="mailUsername" type="email" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="email@domain.com">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Mail Password (App Password)</label>
                    <input wire:model="mailPassword" type="password" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="********">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Mail Encryption</label>
                    <select wire:model="mailEncryption" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main">
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                        <option value="">None</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-txt-main mb-2">Email Pengirim (From Address)</label>
                    <input wire:model="mailFromAddress" type="email" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main {{ optional($errors)->has('mailFromAddress') ? 'border-status-danger' : '' }}" placeholder="hello@logikraf.id">
                    @if(isset($errors) && $errors->has('mailFromAddress')) <p class="text-status-danger text-xs mt-1">{{ $errors->first('mailFromAddress') }}</p> @endif
                </div>
                <div class="md:col-span-2 pt-2">
                    <button type="submit" wire:loading.attr="disabled" class="btn bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors w-full">
                        <span wire:loading.remove wire:target="saveEmail">Simpan Pengaturan Email</span>
                        <span wire:loading wire:target="saveEmail">Menyimpan...</span>
                    </button>
                </div>
            </form>
        </section>

    </div>
</div>
