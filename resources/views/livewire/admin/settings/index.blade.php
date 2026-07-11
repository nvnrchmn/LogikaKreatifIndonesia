<div>
    <div class="mb-6">
        <h1 class="font-display text-2xl font-bold text-txt-main">Pengaturan Global</h1>
        <p class="text-txt-muted text-sm mt-1">Kelola preferensi dan pengaturan sistem utama.</p>
    </div>

    @if(session('success'))
        <div class="mb-6 p-4 bg-status-success/10 text-status-success rounded-lg border border-status-success/20 text-sm font-medium">
            {{ session('success') }}
        </div>
    @endif

    <div class="space-y-6">
        <!-- Card Payment Gateway -->
        <div class="bg-white p-6 rounded-xl border border-border-minimal shadow-sm max-w-3xl">
            <form wire:submit="savePayment">
                <h3 class="font-display font-semibold text-lg text-txt-main mb-4 border-b border-border-minimal pb-2">Payment Gateway</h3>
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-txt-main mb-2">Vendor Payment Gateway Aktif</label>
                    <p class="text-xs text-txt-muted mb-3">Pilih *gateway* yang akan digunakan oleh klien saat melakukan pembayaran *invoice*. Anda bisa menggunakan mode Sandbox (bawaan) untuk simulasi.</p>
                    <div class="space-y-3">
                        <label class="flex items-center gap-3 p-3 border border-border-minimal rounded-lg cursor-pointer hover:bg-canvas-light transition-colors">
                            <input wire:model.live="paymentGateway" type="radio" value="xendit" class="w-4 h-4 text-brand-primary focus:ring-brand-primary border-border-minimal">
                            <span class="font-medium text-txt-main">Xendit (Invoice URL)</span>
                        </label>
                        <label class="flex items-center gap-3 p-3 border border-border-minimal rounded-lg cursor-pointer hover:bg-canvas-light transition-colors">
                            <input wire:model.live="paymentGateway" type="radio" value="midtrans" class="w-4 h-4 text-brand-primary focus:ring-brand-primary border-border-minimal">
                            <span class="font-medium text-txt-main">Midtrans (Snap Popup)</span>
                        </label>
                    </div>
                </div>

                <h3 class="font-display font-semibold text-lg text-txt-main mb-4 border-b border-border-minimal pb-2 mt-8">Kredensial API</h3>

                @if($paymentGateway === 'xendit')
                    <div class="mb-6 space-y-4 animate-scale-in">
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Xendit Secret Key</label>
                            <input wire:model="xenditSecretKey" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="xnd_development_...">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Xendit Public Key</label>
                            <input wire:model="xenditPublicKey" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="xnd_public_development_...">
                        </div>
                        <p class="text-xs text-txt-muted mt-2">Dapatkan dari dashboard Xendit pada menu Settings > API Keys.</p>
                    </div>
                @endif

                @if($paymentGateway === 'midtrans')
                    <div class="mb-6 space-y-4 animate-scale-in">
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Midtrans Server Key</label>
                            <input wire:model="midtransServerKey" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="SB-Mid-server-...">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Midtrans Client Key</label>
                            <input wire:model="midtransClientKey" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="SB-Mid-client-...">
                        </div>
                        <p class="text-xs text-txt-muted mt-2">Dapatkan dari dashboard Midtrans pada menu Settings > Access Keys.</p>
                    </div>
                @endif

                <!-- Submit Button -->
                <div class="flex justify-end pt-4 border-t border-border-minimal">
                    <button type="submit" class="btn bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors">
                        Simpan Payment Gateway
                    </button>
                </div>
            </form>
        </div>

        <!-- Card Kontak Logikraf -->
        <div class="bg-white p-6 rounded-xl border border-border-minimal shadow-sm max-w-3xl">
            <form wire:submit="saveContact">
                <h3 class="font-display font-semibold text-lg text-txt-main mb-4 border-b border-border-minimal pb-2">Kontak Logikraf</h3>
                
                <div class="mb-6 space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-txt-main mb-2">Email Perusahaan</label>
                        <input wire:model="companyEmail" type="email" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="hello@logikraf.id">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-txt-main mb-2">Nomor Telepon / WhatsApp</label>
                        <input wire:model="companyPhone" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="+62 811-1234-5678">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-txt-main mb-2">Alamat Kantor</label>
                        <textarea wire:model="companyAddress" rows="2" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main resize-none" placeholder="Gedung Inovasi Lt. 3..."></textarea>
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="flex justify-end pt-4 border-t border-border-minimal">
                    <button type="submit" class="btn bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors">
                        Simpan Kontak
                    </button>
                </div>
            </form>
        </div>
    </div>
        
        <!-- Card Pengaturan SMTP Email -->
        <div class="bg-white p-6 rounded-xl border border-border-minimal shadow-sm max-w-3xl mt-6">
            <form wire:submit="saveEmail">
                <h3 class="font-display font-semibold text-lg text-txt-main mb-4 border-b border-border-minimal pb-2">Pengaturan SMTP Email</h3>
                <p class="text-xs text-txt-muted mb-6">Konfigurasi *server* email yang digunakan untuk mengirim notifikasi kepada klien.</p>
                
                <div class="mb-6 space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Mail Host</label>
                            <input wire:model="mailHost" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="smtp.gmail.com">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Mail Port</label>
                            <input wire:model="mailPort" type="text" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="587">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-txt-main mb-2">Mail Username (Email)</label>
                        <input wire:model="mailUsername" type="email" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="email@domain.com">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-txt-main mb-2">Mail Password (App Password)</label>
                        <input wire:model="mailPassword" type="password" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="********">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
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
                            <input wire:model="mailFromAddress" type="email" class="w-full px-4 py-2 bg-canvas-light border border-border-minimal rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="hello@logikraf.id">
                        </div>
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="flex justify-end pt-4 border-t border-border-minimal">
                    <button type="submit" class="btn bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors">
                        Simpan Pengaturan Email
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
