<div class="space-y-6" x-data="{
    activeAccordion: 1,
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            Livewire.dispatch('swal', [{title: 'Disalin!', text: 'Kode berhasil disalin ke clipboard', icon: 'success', timer: 1500}]);
        });
    }
}">
    <div class="flex justify-between items-center border-b border-border-minimal pb-4">
        <div>
            <h2 class="text-3xl font-display font-bold text-txt-main">API Documentation</h2>
            <p class="text-txt-muted text-sm mt-1">Panduan integrasi Logikraf Payment Hub untuk Aplikasi Anda.</p>
        </div>
    </div>

    <!-- Accordion Container -->
    <div class="space-y-4 mt-6">
        
        <!-- Accordion 1: API Keys Section -->
        <section class="bg-canvas-card rounded-2xl border border-border-minimal shadow-sm overflow-hidden transition-all duration-300">
            <button @click="activeAccordion = activeAccordion === 1 ? null : 1" class="w-full flex justify-between items-center p-6 bg-white hover:bg-gray-50/50 transition-colors text-left focus:outline-none">
                <h3 class="text-xl font-bold text-txt-main flex items-center gap-3">
                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary text-sm">1</span>
                    Autentikasi (API Key)
                </h3>
                <svg :class="{'rotate-180': activeAccordion === 1}" class="w-6 h-6 text-gray-400 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div x-show="activeAccordion === 1" x-collapse>
                <div class="p-6 pt-0 border-t border-gray-100">
                    <p class="text-gray-600 mb-5 leading-relaxed mt-4">Setiap <i>request</i> ke Payment Hub wajib menyertakan <b>API Key</b> di dalam Header HTTP. API Key ini bisa didapatkan pada menu <a href="{{ route('admin.payment-hub.saas-apps') }}" class="text-brand-primary hover:underline font-semibold">Aplikasi Terintegrasi</a>.</p>
                    
                    <div class="bg-gray-900 rounded-xl p-5 relative group shadow-inner" style="background-color: #111827;">
                        <button @click="copyToClipboard('{\n    &quot;Content-Type&quot;: &quot;application/json&quot;,\n    &quot;Accept&quot;: &quot;application/json&quot;,\n    &quot;X-Logikraf-API-Key&quot;: &quot;sk_test_...&quot;\n}')" class="absolute top-4 right-4 text-gray-400 hover:text-white transition-opacity p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 focus:opacity-100">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                            <span class="text-xs font-semibold">Copy</span>
                        </button>
                        <pre class="text-sm font-mono text-gray-300 pr-24 overflow-x-auto"><code class="block"><span style="color: #c4b5fd;">Headers:</span>
{
    <span style="color: #86efac;">"Content-Type"</span>: <span style="color: #fde047;">"application/json"</span>,
    <span style="color: #86efac;">"Accept"</span>: <span style="color: #fde047;">"application/json"</span>,
    <span style="color: #86efac;">"X-Logikraf-API-Key"</span>: <span style="color: #fde047;">"sk_test_..."</span>
}</code></pre>
                    </div>
                </div>
            </div>
        </section>

        <!-- Accordion 2: Create Sub Account -->
        <section class="bg-canvas-card rounded-2xl border border-border-minimal shadow-sm overflow-hidden transition-all duration-300">
            <button @click="activeAccordion = activeAccordion === 2 ? null : 2" class="w-full flex justify-between items-center p-6 bg-white hover:bg-gray-50/50 transition-colors text-left focus:outline-none">
                <h3 class="text-xl font-bold text-txt-main flex items-center gap-3">
                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary text-sm">2</span>
                    Pendaftaran Entitas (Create Sub-Account)
                </h3>
                <svg :class="{'rotate-180': activeAccordion === 2}" class="w-6 h-6 text-gray-400 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div x-show="activeAccordion === 2" x-collapse>
                <div class="p-6 pt-0 border-t border-gray-100">
                    <p class="text-gray-600 mb-5 leading-relaxed mt-4">Gunakan API ini saat Anda mendaftarkan komunitas/RT baru di SaaS Anda. Sistem akan membuatkan Sub-Akun Xendit otomatis agar dana tagihan warga langsung terpisah dari rekening utama Logikraf.</p>
                    
                    <div class="flex items-center gap-3 mb-5 bg-gray-50 p-3 rounded-lg border border-gray-200 w-fit">
                        <span class="bg-blue-600 text-white font-bold px-3 py-1 rounded-md text-xs tracking-wider">POST</span>
                        <code class="font-mono text-sm text-gray-800">https://logikraf.id/api/payment-hub/v1/sub-accounts</code>
                    </div>

                    <div class="bg-gray-900 rounded-xl p-5 relative group shadow-inner" style="background-color: #111827;">
                        <button @click="copyToClipboard(document.getElementById('code-sub-account').innerText)" class="absolute top-4 right-4 text-gray-400 hover:text-white transition-opacity p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 focus:opacity-100">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                            <span class="text-xs font-semibold">Copy</span>
                        </button>
                        <pre class="text-sm font-mono text-gray-300 pr-24 overflow-x-auto"><code id="code-sub-account" class="block whitespace-pre-wrap">{
    <span style="color: #86efac;">"external_reference_id"</span>: <span style="color: #fde047;">"RT01-PERUM-MAWAR"</span>, <span style="color: #9ca3af;">// ID unik perumahan di database SaaS Anda</span>
    <span style="color: #86efac;">"business_name"</span>: <span style="color: #fde047;">"Kas RT 01 Perum Mawar"</span>,
    <span style="color: #86efac;">"email"</span>: <span style="color: #fde047;">"pengurus.rt01@example.com"</span>
}</code></pre>
                    </div>
                </div>
            </div>
        </section>

        <!-- Accordion 3: Create Invoice -->
        <section class="bg-canvas-card rounded-2xl border border-border-minimal shadow-sm overflow-hidden transition-all duration-300">
            <button @click="activeAccordion = activeAccordion === 3 ? null : 3" class="w-full flex justify-between items-center p-6 bg-white hover:bg-gray-50/50 transition-colors text-left focus:outline-none">
                <h3 class="text-xl font-bold text-txt-main flex items-center gap-3">
                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary text-sm">3</span>
                    Pembuatan Tagihan (Create Invoice)
                </h3>
                <svg :class="{'rotate-180': activeAccordion === 3}" class="w-6 h-6 text-gray-400 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div x-show="activeAccordion === 3" x-collapse>
                <div class="p-6 pt-0 border-t border-gray-100">
                    <p class="text-gray-600 mb-5 leading-relaxed mt-4">Buat tagihan iuran untuk warga. Uang akan dipotong otomatis sesuai `platform_fee_amount` ke kas Logikraf, sisanya akan masuk ke rekening warga.</p>
                    
                    <div class="flex items-center gap-3 mb-5 bg-gray-50 p-3 rounded-lg border border-gray-200 w-fit">
                        <span class="bg-blue-600 text-white font-bold px-3 py-1 rounded-md text-xs tracking-wider">POST</span>
                        <code class="font-mono text-sm text-gray-800">https://logikraf.id/api/payment-hub/v1/invoices</code>
                    </div>

                    <div class="bg-gray-900 rounded-xl p-5 relative group shadow-inner" style="background-color: #111827;">
                        <button @click="copyToClipboard(document.getElementById('code-invoice').innerText)" class="absolute top-4 right-4 text-gray-400 hover:text-white transition-opacity p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 focus:opacity-100">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                            <span class="text-xs font-semibold">Copy</span>
                        </button>
                        <pre class="text-sm font-mono text-gray-300 pr-24 overflow-x-auto"><code id="code-invoice" class="block whitespace-pre-wrap">{
    <span style="color: #86efac;">"external_id"</span>: <span style="color: #fde047;">"INV-WARGA-001"</span>, <span style="color: #9ca3af;">// ID tagihan di database SaaS Anda</span>
    <span style="color: #86efac;">"external_reference_id"</span>: <span style="color: #fde047;">"RT01-PERUM-MAWAR"</span>, <span style="color: #9ca3af;">// Tujuan dana (Sama spt registrasi)</span>
    <span style="color: #86efac;">"amount"</span>: <span style="color: #fde047;">50000</span>, <span style="color: #9ca3af;">// Total tagihan yang dibayar warga</span>
    <span style="color: #86efac;">"platform_fee_amount"</span>: <span style="color: #fde047;">2000</span>, <span style="color: #9ca3af;">// Nominal keuntungan SaaS</span>
    <span style="color: #86efac;">"payer_email"</span>: <span style="color: #fde047;">"warga.a@gmail.com"</span>,
    <span style="color: #86efac;">"description"</span>: <span style="color: #fde047;">"Iuran Kebersihan Bulan Juli 2026"</span>
}</code></pre>
                    </div>
                    
                    <div class="mt-5 bg-amber-50/80 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3">
                        <svg class="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <p class="text-sm text-amber-800 leading-relaxed">
                            <strong>Response:</strong> Endpoint ini akan mengembalikan objek JSON berisi <code>checkout_url</code> Xendit. Arahkan pengguna (pembayar) ke URL tersebut untuk melunasi tagihan.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Accordion 4: Webhook Integration -->
        <section class="bg-canvas-card rounded-2xl border border-border-minimal shadow-sm overflow-hidden transition-all duration-300">
            <button @click="activeAccordion = activeAccordion === 4 ? null : 4" class="w-full flex justify-between items-center p-6 bg-white hover:bg-gray-50/50 transition-colors text-left focus:outline-none">
                <h3 class="text-xl font-bold text-txt-main flex items-center gap-3">
                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary text-sm">4</span>
                    Notifikasi Pembayaran (Webhook)
                </h3>
                <svg :class="{'rotate-180': activeAccordion === 4}" class="w-6 h-6 text-gray-400 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div x-show="activeAccordion === 4" x-collapse>
                <div class="p-6 pt-0 border-t border-gray-100">
                    <p class="text-gray-600 mb-5 leading-relaxed mt-4">Ketika warga berhasil membayar, Logikraf akan mengirimkan HTTP POST ke <b>Webhook URL</b> yang didaftarkan di menu SaaS Apps. Sistem Anda harus menangkap webhook ini untuk mengubah status tagihan.</p>
                    
                    <div class="bg-gray-900 rounded-xl p-5 relative group shadow-inner" style="background-color: #111827;">
                        <button @click="copyToClipboard(document.getElementById('code-webhook').innerText)" class="absolute top-4 right-4 text-gray-400 hover:text-white transition-opacity p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 focus:opacity-100">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                            <span class="text-xs font-semibold">Copy</span>
                        </button>
                        <pre class="text-sm font-mono text-gray-300 pr-24 overflow-x-auto"><code id="code-webhook" class="block whitespace-pre-wrap"><span style="color: #9ca3af;">// Contoh Kode PHP untuk menangkap Webhook dari Logikraf</span>
$payload = json_decode(file_get_contents('php://input'), true);
$signature = $_SERVER['HTTP_X_LOGIKRAF_SIGNATURE'] ?? '';

<span style="color: #9ca3af;">// 1. Validasi Keamanan (Pastikan dari Logikraf)</span>
$expectedSignature = hash_hmac('sha256', json_encode($payload), env('LOGIKRAF_API_KEY'));
if (!hash_equals($expectedSignature, $signature)) {
    die("Invalid Signature");
}

<span style="color: #9ca3af;">// 2. Ambil external_id (Format dari Logikraf: PHUB-{SaaS_ID}-{External_ID})</span>
$logikrafId = $payload['external_id'];
$parts = explode('-', $logikrafId, 3);
$myInvoiceId = $parts[2]; <span style="color: #9ca3af;">// Hasil: "INV-WARGA-001"</span>

<span style="color: #9ca3af;">// 3. Update Status di Database Anda</span>
if ($payload['status'] === 'PAID') {
    Tagihan::where('id_tagihan', $myInvoiceId)->update(['status' => 'lunas']);
}</code></pre>
                    </div>
                </div>
            </div>
        </section>

    </div>
</div>
