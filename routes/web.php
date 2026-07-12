<?php

use App\Http\Controllers\Auth\LoginController;
use App\Livewire\Admin\Dashboard;
use App\Models\Portfolio;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — logikraf.id
|--------------------------------------------------------------------------
*/

// Homepage
Route::get('/', function () {
    return view('home');
})->name('home');

Route::view('/tentang-kami', 'pages.about')->name('about');
Route::view('/syarat-ketentuan', 'pages.terms')->name('terms');
Route::view('/kebijakan-privasi', 'pages.privacy')->name('privacy');
Route::view('/kontak', 'pages.contact')->name('contact');

Route::get('/layanan/{slug}', function ($slug) {
    $services = [
        'software-development' => [
            'title' => 'Software Development',
            'short_desc' => 'Pembuatan perangkat lunak khusus yang dirancang untuk menskalakan bisnis Anda.',
            'content' => '<p>Dari aplikasi web skala perusahaan hingga sistem manajemen internal yang kompleks, tim engineer kami membangun arsitektur yang tangguh, aman, dan dapat diskalakan.</p><p>Kami menggunakan tumpukan teknologi modern seperti Laravel, React, Vue, dan AWS untuk memastikan produk Anda siap menghadapi masa depan.</p>',
            'features' => ['Custom Web Applications', 'SaaS Development', 'API Integrations', 'Legacy System Modernization'],
            'color' => '#0052FF',
            'icon' => '<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>'
        ],
        'ui-ux-design' => [
            'title' => 'UI/UX Design',
            'short_desc' => 'Desain antarmuka pengguna yang memukau dan pengalaman pengguna yang intuitif.',
            'content' => '<p>Desain yang baik bukan hanya tentang estetika, tetapi bagaimana produk tersebut bekerja. Kami menggabungkan riset mendalam dengan prinsip desain berpusat pada manusia.</p><p>Hasilnya adalah antarmuka yang tidak hanya terlihat indah, tetapi juga sangat intuitif, meningkatkan retensi dan kepuasan pengguna Anda.</p>',
            'features' => ['User Research & Personas', 'Wireframing & Prototyping', 'High-Fidelity UI Design', 'Usability Testing'],
            'color' => '#FF3B30',
            'icon' => '<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>'
        ],
        'digital-marketing' => [
            'title' => 'Digital Marketing',
            'short_desc' => 'Strategi pemasaran digital berbasis data untuk mendorong pertumbuhan.',
            'content' => '<p>Tingkatkan visibilitas merek Anda di dunia digital. Kami merancang kampanye pemasaran terarah yang menjangkau audiens yang tepat pada waktu yang tepat.</p><p>Dari SEO hingga iklan media sosial berbayar, setiap keputusan didasarkan pada analitik data untuk memaksimalkan ROI Anda.</p>',
            'features' => ['Search Engine Optimization (SEO)', 'Social Media Management', 'Performance Marketing (Ads)', 'Content Strategy'],
            'color' => '#34C759',
            'icon' => '<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>'
        ],
        'branding' => [
            'title' => 'Branding',
            'short_desc' => 'Membangun identitas merek yang kuat dan tak terlupakan.',
            'content' => '<p>Merek Anda lebih dari sekadar logo. Ini adalah cerita, suara, dan nilai yang Anda tawarkan kepada dunia.</p><p>Kami membantu Anda menggali esensi bisnis Anda dan menerjemahkannya ke dalam identitas visual dan pesan komunikasi yang kohesif, mendalam, dan relevan.</p>',
            'features' => ['Brand Strategy & Positioning', 'Logo & Visual Identity', 'Brand Guidelines', 'Brand Voice & Messaging'],
            'color' => '#FF9500',
            'icon' => '<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"/></svg>'
        ]
    ];

    if (!array_key_exists($slug, $services)) {
        abort(404);
    }

    return view('pages.services.show', ['service' => $services[$slug]]);
})->name('services.show');

// Portfolio Detail
Route::get('/portfolio/{slug}', function (string $slug) {
    $portfolio = Portfolio::where('slug', $slug)
        ->published()
        ->with('service')
        ->firstOrFail();

    return view('portfolio.show', compact('portfolio'));
})->name('portfolio.show');

// Auth Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);
});
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Admin Panel Routes
Route::middleware('auth')->group(function () {
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', App\Livewire\Admin\Dashboard::class)->name('dashboard');
        Route::get('/services', App\Livewire\Admin\Services\Index::class)->name('services.index');
        Route::get('/portfolios', App\Livewire\Admin\Portfolios\Index::class)->name('portfolios.index');
        Route::get('/leads', App\Livewire\Admin\Leads\Index::class)->name('leads.index');
        Route::get('/orders', App\Livewire\Admin\Orders\Index::class)->name('orders.index');
        \Livewire\Livewire::component('admin.orders.show', 'components.admin.orders.show');
        Route::get('/orders/{order}', function (\App\Models\Order $order) { return view('components.admin.orders.show', ['order' => $order]); })->name('orders.show');
        Route::get('/transactions', App\Livewire\Admin\Transactions\Index::class)->name('transactions.index');
        Route::get('/tickets', App\Livewire\Admin\Tickets\Index::class)->name('tickets.index');
        Route::get('/tickets/{ticket}', App\Livewire\Admin\Tickets\Show::class)->name('tickets.show');
        Route::get('/settings', App\Livewire\Admin\Settings\Index::class)->name('settings.index');
        Route::get('/payment-hub/saas-apps', App\Livewire\Admin\PaymentHub\SaasApps::class)->name('payment-hub.saas-apps');
        Route::get('/payment-hub/transactions', App\Livewire\Admin\PaymentHub\Transactions::class)->name('payment-hub.transactions');
        Route::get('/payment-hub/api-docs', App\Livewire\Admin\PaymentHub\ApiDocs::class)->name('payment-hub.api-docs');
        Route::get('/payment-hub/tax-reports', App\Livewire\Admin\PaymentHub\TaxReports::class)->name('payment-hub.tax-reports');
    });

    // Client Routes
    Route::middleware(['role:client', 'force_password'])->prefix('client')->name('client.')->group(function () {
        Route::get('/force-password-reset', App\Livewire\Client\ForcePasswordReset::class)->name('force_password_reset')->withoutMiddleware('force_password');
        Route::get('/dashboard', App\Livewire\Client\Dashboard\Index::class)->name('dashboard');
        Route::get('/orders', App\Livewire\Client\Orders\Index::class)->name('orders.index');
        Route::get('/orders/{order}', App\Livewire\Client\Orders\Show::class)->name('orders.show');
        Route::get('/orders/{order}/pdf', [App\Http\Controllers\Client\OrderPdfController::class, 'download'])->name('orders.pdf');
        Route::get('/tickets', App\Livewire\Client\Tickets\Index::class)->name('tickets.index');
        Route::get('/tickets/{ticket}', App\Livewire\Client\Tickets\Show::class)->name('tickets.show');
    });
});

// Webhooks (API)
Route::post('/webhooks/midtrans', [App\Http\Controllers\MidtransWebhookController::class, 'handle'])->name('midtrans.webhook');
Route::post('/webhooks/xendit', [App\Http\Controllers\XenditWebhookController::class, 'handle'])->name('xendit.webhook');



// Webhook Deployment
Route::get('/api/deploy/{token}', function ($token) {
    if ($token !== env('DEPLOY_TOKEN')) {
        abort(403, 'Unauthorized');
    }
    
    // Karena shell_exec sering dinonaktifkan di server (DirectAdmin),
    // kita akan menggunakan metode "Flag File" yang akan dideteksi oleh Cronjob.
    file_put_contents(storage_path('app/deploy.flag'), 'deploy_requested');
    
    return response()->json([
        'status' => 'success', 
        'message' => 'Deploy request queued! Cronjob akan mengeksekusinya dalam beberapa saat.'
    ]);
});

