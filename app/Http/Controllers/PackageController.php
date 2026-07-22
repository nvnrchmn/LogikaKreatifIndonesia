<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Package;
use App\Models\Service;
use App\Models\Setting;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PackageController extends Controller
{
    /**
     * Halaman publik: daftar paket + form pemesanan (tanpa login).
     * Ini yang dijadikan bukti "produk/jasa, harga, dan halaman checkout"
     * untuk verifikasi payment gateway.
     */
    public function index()
    {
        $packages = Package::active()->orderBy('sort_order')->get();

        return view('pages.packages.index', compact('packages'));
    }

    /**
     * Proses checkout: buat Order + Transaction, lalu buat Xendit Invoice
     * beneran (bukan dummy) dan arahkan pembeli ke halaman pembayaran
     * resmi Xendit.
     */
    public function checkout(Request $request, Package $package): RedirectResponse
    {
        if (!$package->is_active) {
            abort(404);
        }

        $validated = $request->validate([
            'guest_name' => 'required|string|max:255',
            'guest_email' => 'required|email|max:255',
            'guest_phone' => 'required|string|max:30',
            'project_brief' => 'nullable|string|max:2000',
        ]);

        // 1. Cari/buat akun klien ringan berdasarkan email pembeli.
        //    Dengan ini pembeli juga otomatis punya akses ke Portal Klien
        //    untuk memantau progres, tanpa perlu proses signup terpisah.
        $user = User::firstOrNew(['email' => $validated['guest_email']]);
        if (!$user->exists) {
            $user->name = $validated['guest_name'];
            $user->password = bcrypt('logikraf123');
            $user->must_change_password = true;
            $user->save();
            $user->assignRole('client');
        }

        // Login-kan otomatis jika pengunjung belum terautentikasi (mencapai portal tanpa 403)
        if (!Auth::check()) {
            Auth::login($user);
        }

        // 2. Service generik untuk grup "Paket Website UMKM" (dibuat sekali,
        //    dipakai ulang oleh semua order paket).
        $service = Service::firstOrCreate(
            ['slug' => 'paket-website-umkm'],
            [
                'name' => 'Paket Website UMKM',
                'category' => 'software',
                'description' => 'Paket website siap pakai untuk UMKM: harga tetap, proses cepat.',
                'short_description' => 'Paket website siap pakai untuk UMKM.',
                'base_price' => $package->price,
                'is_active' => true,
                'sort_order' => 99,
            ]
        );

        // 3. Buat Order.
        $order = Order::create([
            'user_id' => $user->id,
            'service_id' => $service->id,
            'package_id' => $package->id,
            'guest_name' => $validated['guest_name'],
            'guest_email' => $validated['guest_email'],
            'guest_phone' => $validated['guest_phone'],
            'project_name' => $package->name,
            'project_brief' => $validated['project_brief'] ?? null,
            'total_amount' => $package->price,
            'status' => 'pending',
            'milestone_status' => 'dp_pending',
        ]);

        // 4. Buat Xendit Invoice sungguhan (bukan simulasi).
        $reference = 'ORD-' . $order->id . '-' . Str::upper(Str::random(6));
        $secretKey = Setting::get('xendit_secret_key', config('services.xendit.secret_key'));

        $response = Http::withBasicAuth($secretKey, '')->post('https://api.xendit.co/v2/invoices', [
            'external_id' => $reference,
            'amount' => $package->price,
            'payer_email' => $validated['guest_email'],
            'description' => 'Pembayaran ' . $package->name . ' — Order ' . $order->order_number,
            'success_redirect_url' => route('packages.success', $order->order_number),
        ]);

        if ($response->failed()) {
            Log::error('Xendit Invoice (Package Checkout) Failed', ['response' => $response->json()]);

            return back()
                ->withInput()
                ->with('checkout_error', 'Gagal membuat invoice pembayaran. Silakan coba lagi atau hubungi kami langsung.');
        }

        $xenditData = $response->json();

        $transaction = Transaction::create([
            'order_id' => $order->id,
            'transaction_reference' => $reference,
            'milestone_name' => 'dp_kickoff',
            'amount' => $package->price,
            'status' => 'pending',
            'payment_url' => $xenditData['invoice_url'],
            'raw_gateway_response' => $xenditData,
        ]);

        // 5. Kirim email invoice Xendit & kredensial akun portal klien ke pembeli
        try {
            Setting::configureMail();
            \Illuminate\Support\Facades\Mail::to($validated['guest_email'])
                ->send(new \App\Mail\PackageOrderInvoiceNotification($order, $transaction, $isNewUser ?? false));
        } catch (\Exception $e) {
            Log::error('Failed sending package order invoice email: ' . $e->getMessage());
        }

        // 6. Arahkan pembeli ke halaman pembayaran resmi Xendit (invoice_url).
        return redirect()->away($xenditData['invoice_url']);
    }

    /**
     * Halaman terima kasih setelah redirect sukses dari Xendit.
     */
    public function success(string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->with(['transactions', 'package'])->firstOrFail();
        $latestTrx = $order->transactions()->latest()->first();

        // Jika halaman sukses diakses dan transaksi lunas, pastikan email bukti lunas terkirim jika belum
        if ($latestTrx) {
            try {
                Setting::configureMail();
                $recipientEmail = $order->guest_email ?? $order->user->email ?? null;
                if ($recipientEmail) {
                    \Illuminate\Support\Facades\Mail::to($recipientEmail)
                        ->send(new \App\Mail\PackagePaymentSuccessNotification($order, $latestTrx));
                }
            } catch (\Exception $e) {
                Log::error('Failed sending package payment success email on success page: ' . $e->getMessage());
            }
        }

        return view('pages.packages.success', compact('order'));
    }
}
