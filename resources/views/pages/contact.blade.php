<x-layouts.app title="Hubungi Kami | Logika Kreatif Indonesia">
    <div class="pt-32 pb-20 bg-canvas-light min-h-screen">
        <div class="container-narrow">
            <div class="text-center max-w-2xl mx-auto mb-16">
                <h1 class="text-4xl font-display font-bold text-txt-main mb-4">Mari Berkolaborasi</h1>
                <p class="text-txt-muted text-sm leading-relaxed">Punya proyek digital impian, atau pertanyaan terkait layanan SaaS kami? Jangan ragu untuk menghubungi tim ahli Logikraf.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <!-- Contact Info -->
                <div class="bg-brand-primary rounded-3xl p-8 md:p-12 text-white relative overflow-hidden group">
                    <!-- Decor -->
                    <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                    <div class="relative z-10">
                        <h3 class="font-display font-bold text-2xl mb-8">Informasi Kontak</h3>
                        
                        <div class="space-y-8">
                            @php
                                $email = \App\Models\Setting::get('company_email', 'hello@logikraf.id');
                                $phone = \App\Models\Setting::get('company_phone', '+62 811-1234-5678');
                                $address = \App\Models\Setting::get('company_address', 'Gedung Inovasi Lt. 3, Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta, 12190');
                            @endphp

                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                </div>
                                <div>
                                    <h4 class="font-bold text-white mb-1">Email Dukungan</h4>
                                    <p class="text-white/70 text-sm">{{ $email }}</p>
                                </div>
                            </div>
                            
                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                </div>
                                <div>
                                    <h4 class="font-bold text-white mb-1">Telepon & WhatsApp</h4>
                                    <p class="text-white/70 text-sm">{{ $phone }}</p>
                                    <p class="text-white/70 text-sm">Senin - Jumat, 09:00 - 17:00 WIB</p>
                                </div>
                            </div>
                            
                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                </div>
                                <div>
                                    <h4 class="font-bold text-white mb-1">Kantor Pusat</h4>
                                    <p class="text-white/70 text-sm">{!! nl2br(e($address)) !!}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contact Form -->
                <div class="bg-white rounded-3xl p-8 md:p-12 border border-border-minimal shadow-sm">
                    <h3 class="font-display font-bold text-2xl text-txt-main mb-6">Kirim Pesan</h3>
                    <form action="#" method="POST" class="space-y-5">
                        <!-- Dummy form for display -->
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Nama Lengkap</label>
                            <input type="text" class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="John Doe" required>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Email</label>
                            <input type="email" class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main" placeholder="john@example.com" required>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Kategori Pesan</label>
                            <select class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main">
                                <option>Proyek Agensi Baru</option>
                                <option>Pertanyaan / Sales SaaS</option>
                                <option>Dukungan Teknis (Support)</option>
                                <option>Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-txt-main mb-2">Pesan</label>
                            <textarea rows="4" class="w-full px-4 py-3 bg-canvas-light border border-border-minimal rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-txt-main resize-none" placeholder="Tuliskan pesan Anda di sini..." required></textarea>
                        </div>
                        <button type="button" class="w-full bg-brand-primary text-white font-semibold py-3 rounded-xl hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/30">
                            Kirim Pesan Sekarang
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-layouts.app>
