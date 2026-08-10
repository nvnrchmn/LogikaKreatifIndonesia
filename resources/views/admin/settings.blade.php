<x-layouts.admin title="Pengaturan Global">
    <div class="max-w-5xl">
        {{-- Page header --}}
        <div class="mb-6">
            <h1 class="font-display text-2xl font-bold text-txt-main">Pengaturan Global</h1>
            <p class="text-txt-muted text-sm mt-1">Kelola preferensi dan pengaturan sistem utama.</p>
        </div>

        @if(session('success'))
            <div class="mb-6 p-4 bg-status-success/10 text-status-success rounded-lg border border-status-success/20 text-sm font-medium">
                ✅ {{ session('success') }}
            </div>
        @endif

        {{-- Single card container: semua section di dalam 1 card, tombol di footer --}}
        <div class="bg-white rounded-xl border border-border-minimal shadow-sm" x-data="{ tab: 'payment', gateway: '{{ $settings['paymentGateway'] }}' }">

            {{-- Tab navigation --}}
            <div class="flex border-b border-border-minimal overflow-x-auto">
                <button type="button" @click="tab = 'payment'" :class="tab === 'payment' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-txt-muted hover:text-txt-main'" class="px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap">Payment Gateway</button>
                <button type="button" @click="tab = 'kontak'" :class="tab === 'kontak' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-txt-muted hover:text-txt-main'" class="px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap">Kontak Logikraf</button>
                <button type="button" @click="tab = 'profil'" :class="tab === 'profil' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-txt-muted hover:text-txt-main'" class="px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap">Profil Perusahaan</button>
                <button type="button" @click="tab = 'smtp'" :class="tab === 'smtp' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-txt-muted hover:text-txt-main'" class="px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap">SMTP Email</button>
            </div>

            <form method="POST" action="{{ route('admin.settings.update') }}">
                @csrf

                {{-- ============ PAYMENT GATEWAY ============ --}}
                <section class="p-6" x-show="tab === 'payment'">
                    <header class="mb-4">
                        <h3 class="font-display font-semibold text-lg text-txt-main">Payment Gateway</h3>
                        <p class="text-xs text-txt-muted mt-1">Pilih gateway untuk invoice klien. Mode Sandbox tersedia untuk simulasi.</p>
                    </header>

                    <div class="mb-6 max-w-md">
                        <label class="block text-sm font-semibold text-txt-main mb-2">Vendor Payment Gateway Aktif</label>
                        <select name="paymentGateway" x-model="gateway"
                                class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main">
                            <option value="xendit" {{ $settings['paymentGateway'] === 'xendit' ? 'selected' : '' }}>Xendit (Invoice URL)</option>
                            <option value="midtrans" {{ $settings['paymentGateway'] === 'midtrans' ? 'selected' : '' }}>Midtrans (Snap Popup)</option>
                        </select>
                    </div>

                    <h4 class="font-display font-semibold text-txt-main mb-3 text-sm uppercase tracking-wide text-txt-muted">Kredensial API</h4>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4" x-show="gateway === 'xendit'" style="display: {{ $settings['paymentGateway'] === 'xendit' ? 'grid' : 'none' }};">
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Xendit Secret Key</label>
                            <input name="xenditSecretKey" type="text" value="{{ $settings['xenditSecretKey'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="xnd_development_...">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Xendit Public Key</label>
                            <input name="xenditPublicKey" type="text" value="{{ $settings['xenditPublicKey'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="xnd_public_development_...">
                        </div>
                        <p class="text-xs text-txt-muted md:col-span-2">Dapatkan dari dashboard Xendit pada menu Settings &gt; API Keys.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4" x-show="gateway === 'midtrans'" style="display: {{ $settings['paymentGateway'] === 'midtrans' ? 'grid' : 'none' }};">
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Midtrans Server Key</label>
                            <input name="midtransServerKey" type="text" value="{{ $settings['midtransServerKey'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="SB-Mid-server-...">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Midtrans Client Key</label>
                            <input name="midtransClientKey" type="text" value="{{ $settings['midtransClientKey'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="SB-Mid-client-...">
                        </div>
                        <p class="text-xs text-txt-muted md:col-span-2">Dapatkan dari dashboard Midtrans pada menu Settings &gt; Access Keys.</p>
                    </div>

                    <div class="mt-6 pt-4 border-t border-border-minimal">
                        <button type="submit" class="btn bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors w-full">
                            Simpan Payment Gateway
                        </button>
                    </div>
                </section>

                {{-- ============ KONTAK ============ --}}
                <section class="p-6" x-show="tab === 'kontak'">
                    <header class="mb-4">
                        <h3 class="font-display font-semibold text-lg text-txt-main">Kontak Logikraf</h3>
                    </header>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Email Perusahaan</label>
                            <input name="companyEmail" type="email" value="{{ $settings['companyEmail'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="hello@logikraf.id">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Nomor Telepon / WhatsApp</label>
                            <input name="companyPhone" type="text" value="{{ $settings['companyPhone'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="+62 811-1234-5678">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-semibold text-txt-main mb-2">Alamat Kantor</label>
                            <textarea name="companyAddress" rows="2" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main resize-none" placeholder="Gedung Inovasi Lt. 3...">{{ $settings['companyAddress'] }}</textarea>
                        </div>
                        <div class="md:col-span-2 pt-2">
                            <button type="submit" class="btn bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors w-full">
                                Simpan Kontak
                            </button>
                        </div>
                    </div>
                </section>

                {{-- ============ PROFIL PERUSAHAAN ============ --}}
                <section class="p-6" x-show="tab === 'profil'">
                    <header class="mb-4">
                        <h3 class="font-display font-semibold text-lg text-txt-main">Profil Perusahaan (Untuk Invoice)</h3>
                        <p class="text-xs text-txt-muted mt-1">Data ini tampil di header &amp; informasi pembayaran pada PDF invoice/quotation.</p>
                    </header>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Nama Perusahaan</label>
                            <input name="companyName" type="text" value="{{ $settings['companyName'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="PT. Logika Kreatif Indonesia">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">NPWP</label>
                            <input name="companyNpwp" type="text" value="{{ $settings['companyNpwp'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="01.234.567.8-901.000">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Nama Bank</label>
                            <input name="companyBankName" type="text" value="{{ $settings['companyBankName'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="BCA">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">No. Rekening</label>
                            <input name="companyBankAccount" type="text" value="{{ $settings['companyBankAccount'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="1234567890">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Atas Nama</label>
                            <input name="companyBankHolder" type="text" value="{{ $settings['companyBankHolder'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="Nova Nurachman">
                        </div>
                        <div></div>
                        <div class="md:col-span-3 pt-2">
                            <button type="submit" class="btn bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors w-full">
                                Simpan Profil
                            </button>
                        </div>
                    </div>
                </section>

                {{-- ============ SMTP EMAIL ============ --}}
                <section class="p-6" x-show="tab === 'smtp'">
                    <header class="mb-4">
                        <h3 class="font-display font-semibold text-lg text-txt-main">Pengaturan SMTP Email</h3>
                        <p class="text-xs text-txt-muted mt-1">Konfigurasi server email untuk notifikasi klien.</p>
                    </header>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Mail Host</label>
                            <input name="mailHost" type="text" value="{{ $settings['mailHost'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="smtp.gmail.com">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Mail Port</label>
                            <input name="mailPort" type="text" value="{{ $settings['mailPort'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="587">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Mail Username (Email)</label>
                            <input name="mailUsername" type="email" value="{{ $settings['mailUsername'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="email@domain.com">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Mail Password (App Password)</label>
                            <input name="mailPassword" type="password" value="{{ $settings['mailPassword'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="********">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Mail Encryption</label>
                            <select name="mailEncryption" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main">
                                <option value="tls" {{ $settings['mailEncryption'] === 'tls' ? 'selected' : '' }}>TLS</option>
                                <option value="ssl" {{ $settings['mailEncryption'] === 'ssl' ? 'selected' : '' }}>SSL</option>
                                <option value="" {{ $settings['mailEncryption'] === '' ? 'selected' : '' }}>None</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Email Pengirim (From Address)</label>
                            <input name="mailFromAddress" type="email" value="{{ $settings['mailFromAddress'] }}" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="hello@logikraf.id">
                        </div>
                        <div class="md:col-span-2 pt-2">
                            <button type="submit" class="btn bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors w-full">
                                Simpan Pengaturan Email
                            </button>
                        </div>
                    </div>
                </section>

            </form>
        </div>
    </div>
</x-layouts.admin>
