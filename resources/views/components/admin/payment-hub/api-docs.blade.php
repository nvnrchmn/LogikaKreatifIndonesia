<div class="space-y-8" x-data="{
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            Livewire.dispatch('swal', [{title: 'Disalin!', text: 'Kode berhasil disalin ke clipboard', icon: 'success', timer: 1500}]);
        });
    }
}">
    <div class="flex justify-between items-center border-b border-border-minimal pb-4">
        <div>
            <h2 class="text-3xl font-display font-bold text-txt-main">API Documentation</h2>
            <p class="text-txt-muted text-sm mt-1">Panduan integrasi Logikraf Payment Hub untuk Produk SaaS Anda.</p>
        </div>
    </div>

    <!-- API Keys Section -->
    <section class="bg-canvas-card rounded-2xl border border-border-minimal p-6 shadow-sm">
        <h3 class="text-xl font-bold text-txt-main mb-2 flex items-center gap-2">
            <svg class="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
            Autentikasi (API Key)
        </h3>
        <p class="text-txt-muted mb-4">Setiap <i>request</i> ke Payment Hub wajib menyertakan <b>API Key</b> di dalam Header HTTP. API Key ini bisa didapatkan pada menu <a href="{{ route('admin.payment-hub.saas-apps') }}" class="text-brand-primary hover:underline font-medium">SaaS Apps</a>.</p>
        
        <div class="bg-[#1e1e1e] rounded-xl p-4 relative group">
            <button @click="copyToClipboard('X-Logikraf-API-Key: sk_test_xxxxx')" class="absolute top-3 right-3 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-700/50 rounded">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
            </button>
            <pre class="text-sm font-mono text-gray-300"><code><span class="text-purple-400">Headers:</span>
{
    <span class="text-green-400">"Content-Type"</span>: <span class="text-yellow-300">"application/json"</span>,
    <span class="text-green-400">"Accept"</span>: <span class="text-yellow-300">"application/json"</span>,
    <span class="text-green-400">"X-Logikraf-API-Key"</span>: <span class="text-yellow-300">"sk_test_..."</span>
}</code></pre>
        </div>
    </section>

    <!-- Create Sub Account -->
    <section class="bg-canvas-card rounded-2xl border border-border-minimal p-6 shadow-sm">
        <h3 class="text-xl font-bold text-txt-main mb-2">1. Pendaftaran Entitas Warga (Create Sub-Account)</h3>
        <p class="text-txt-muted mb-4">Gunakan API ini saat Anda mendaftarkan komunitas/RT baru di SaaS Anda. Sistem akan membuatkan Sub-Akun Xendit otomatis agar dana tagihan warga langsung terpisah dari rekening utama Logikraf.</p>
        
        <div class="flex items-center gap-3 mb-4">
            <span class="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-xs">POST</span>
            <code class="font-mono text-sm bg-canvas-light px-3 py-1 rounded text-txt-main">https://logikraf.id/api/payment-hub/v1/sub-accounts</code>
        </div>

        <div class="bg-[#1e1e1e] rounded-xl p-4 relative group">
            <button @click="copyToClipboard(document.getElementById('code-sub-account').innerText)" class="absolute top-3 right-3 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-700/50 rounded">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
            </button>
            <pre id="code-sub-account" class="text-sm font-mono text-gray-300 whitespace-pre-wrap"><code>{
    <span class="text-green-400">"external_reference_id"</span>: <span class="text-yellow-300">"RT01-PERUM-MAWAR"</span>, <span class="text-gray-500">// ID unik perumahan di database SaaS Anda</span>
    <span class="text-green-400">"business_name"</span>: <span class="text-yellow-300">"Kas RT 01 Perum Mawar"</span>,
    <span class="text-green-400">"email"</span>: <span class="text-yellow-300">"pengurus.rt01@example.com"</span>
}</code></pre>
        </div>
    </section>

    <!-- Create Invoice -->
    <section class="bg-canvas-card rounded-2xl border border-border-minimal p-6 shadow-sm">
        <h3 class="text-xl font-bold text-txt-main mb-2">2. Pembuatan Tagihan (Create Invoice)</h3>
        <p class="text-txt-muted mb-4">Buat tagihan iuran untuk warga. Uang akan dipotong otomatis sesuai `platform_fee_amount` ke kas Logikraf, sisanya akan masuk ke rekening warga.</p>
        
        <div class="flex items-center gap-3 mb-4">
            <span class="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-xs">POST</span>
            <code class="font-mono text-sm bg-canvas-light px-3 py-1 rounded text-txt-main">https://logikraf.id/api/payment-hub/v1/invoices</code>
        </div>

        <div class="bg-[#1e1e1e] rounded-xl p-4 relative group">
            <button @click="copyToClipboard(document.getElementById('code-invoice').innerText)" class="absolute top-3 right-3 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-700/50 rounded">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
            </button>
            <pre id="code-invoice" class="text-sm font-mono text-gray-300 whitespace-pre-wrap"><code>{
    <span class="text-green-400">"external_id"</span>: <span class="text-yellow-300">"INV-WARGA-001"</span>, <span class="text-gray-500">// ID tagihan di database SaaS Anda</span>
    <span class="text-green-400">"external_reference_id"</span>: <span class="text-yellow-300">"RT01-PERUM-MAWAR"</span>, <span class="text-gray-500">// Tujuan dana (Sama seperti saat registrasi akun)</span>
    <span class="text-green-400">"amount"</span>: <span class="text-yellow-300">50000</span>, <span class="text-gray-500">// Total tagihan yang dibayar warga (Harus >= 10.000)</span>
    <span class="text-green-400">"platform_fee_amount"</span>: <span class="text-yellow-300">2000</span>, <span class="text-gray-500">// Nominal keuntungan SaaS (Masuk ke Logikraf)</span>
    <span class="text-green-400">"payer_email"</span>: <span class="text-yellow-300">"warga.a@gmail.com"</span>,
    <span class="text-green-400">"description"</span>: <span class="text-yellow-300">"Iuran Kebersihan Bulan Juli 2026"</span>
}</code></pre>
        </div>
        
        <p class="text-sm text-txt-muted mt-4 bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-200">
            <strong>Response:</strong> Endpoint ini akan mengembalikan URL Xendit Checkout (`checkout_url`). Anda harus me-<i>redirect</i> warga (pembayar) ke URL tersebut untuk melunasi tagihannya.
        </p>
    </section>

    <!-- Webhook Integration -->
    <section class="bg-canvas-card rounded-2xl border border-border-minimal p-6 shadow-sm">
        <h3 class="text-xl font-bold text-txt-main mb-2">3. Notifikasi Pembayaran (Webhook)</h3>
        <p class="text-txt-muted mb-4">Ketika warga berhasil membayar, Logikraf akan menembak sebuah HTTP POST ke <b>Webhook URL</b> yang Anda daftarkan di menu SaaS Apps. Sistem Anda (SB Digital) harus menangkap webhook ini untuk mengupdate status tagihan.</p>
        
        <div class="bg-[#1e1e1e] rounded-xl p-4 relative group">
            <button @click="copyToClipboard(document.getElementById('code-webhook').innerText)" class="absolute top-3 right-3 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-700/50 rounded">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
            </button>
            <pre id="code-webhook" class="text-sm font-mono text-gray-300 whitespace-pre-wrap"><code><span class="text-gray-500">// Contoh Kode PHP untuk menangkap Webhook di sisi SB Digital</span>
$payload = json_decode(file_get_contents('php://input'), true);
$signature = $_SERVER['HTTP_X_LOGIKRAF_SIGNATURE'] ?? '';

<span class="text-gray-500">// 1. Validasi Keamanan (Pastikan dari Logikraf)</span>
$expectedSignature = hash_hmac('sha256', json_encode($payload), env('LOGIKRAF_API_KEY'));
if (!hash_equals($expectedSignature, $signature)) {
    die("Invalid Signature");
}

<span class="text-gray-500">// 2. Ambil external_id (Ini formatnya: PHUB-{SaaS_ID}-{External_ID})</span>
$logikrafId = $payload['external_id'];
$parts = explode('-', $logikrafId, 3);
$myInvoiceId = $parts[2]; <span class="text-gray-500">// Hasil: "INV-WARGA-001"</span>

<span class="text-gray-500">// 3. Update Status di Database SB Digital Anda</span>
if ($payload['status'] === 'PAID') {
    Tagihan::where('id_tagihan', $myInvoiceId)->update(['status' => 'lunas']);
}</code></pre>
        </div>
    </section>
</div>
