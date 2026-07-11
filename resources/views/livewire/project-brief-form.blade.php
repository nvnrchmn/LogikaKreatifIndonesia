<section id="konsultasi" class="section-padding bg-canvas-dark relative overflow-hidden">
    <!-- Background Decoration -->
    <div class="absolute inset-0 gradient-radial-hero opacity-50"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[150px]"></div>

    <div class="container-narrow relative z-10">
        <div class="max-w-3xl mx-auto">
            <!-- Section Header -->
            <div class="text-center mb-12">
                <span class="badge bg-brand-primary/10 text-brand-primary mb-4">Konsultasi Gratis</span>
                <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                    Mulai Proyek Impian Anda
                </h2>
                <p class="font-body text-lg text-white/50 leading-relaxed">
                    Ceritakan kebutuhan Anda dan dapatkan estimasi proyek dalam 24 jam.
                </p>
            </div>

            @if($submitted)
                {{-- Success State --}}
                <div class="card p-12 text-center animate-scale-in">
                    <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-accent/10 flex items-center justify-center">
                        <svg class="w-10 h-10 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>
                    <h3 class="font-display text-2xl font-bold text-txt-main mb-3">Terima Kasih!</h3>
                    <p class="font-body text-txt-muted mb-2">Pengajuan proyek Anda telah berhasil dikirim.</p>
                    <p class="font-body text-sm text-txt-muted">Tim kami akan menghubungi Anda dalam waktu <strong class="text-brand-primary">1x24 jam</strong>.</p>
                </div>
            @else
                {{-- Form Card --}}
                <div class="card p-8 lg:p-10">
                    <!-- Progress Bar -->
                    <div class="mb-10">
                        <div class="flex items-center justify-between mb-3">
                            @for($i = 1; $i <= $totalSteps; $i++)
                                <div class="flex items-center gap-2 {{ $i <= $step ? 'text-brand-primary' : 'text-txt-muted/40' }}">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                                                {{ $i < $step ? 'bg-brand-accent text-white' : ($i === $step ? 'bg-brand-primary text-white' : 'bg-gray-100 text-txt-muted/50') }}">
                                        @if($i < $step)
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                                        @else
                                            {{ $i }}
                                        @endif
                                    </div>
                                    <span class="hidden sm:inline font-body text-xs font-medium">
                                        {{ ['Info Kontak', 'Detail Proyek', 'Budget & Timeline'][$i - 1] }}
                                    </span>
                                </div>
                                @if($i < $totalSteps)
                                    <div class="flex-1 h-px mx-2 {{ $i < $step ? 'bg-brand-accent' : 'bg-border-minimal' }} transition-colors duration-300"></div>
                                @endif
                            @endfor
                        </div>
                    </div>

                    <form wire:submit="{{ $step === $totalSteps ? 'submit' : 'nextStep' }}">
                        {{-- Step 1: Contact Info --}}
                        @if($step === 1)
                            <div class="space-y-5 animate-fade-in">
                                <h3 class="font-display text-xl font-bold text-txt-main mb-6">Informasi Kontak</h3>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label for="name" class="block font-body text-sm font-medium text-txt-main mb-2">Nama Lengkap <span class="text-status-danger">*</span></label>
                                        <input wire:model="name" id="name" type="text" class="form-input" placeholder="John Doe">
                                        @error('name') <span class="text-status-danger text-xs mt-1 block">{{ $message }}</span> @enderror
                                    </div>
                                    <div>
                                        <label for="email" class="block font-body text-sm font-medium text-txt-main mb-2">Email <span class="text-status-danger">*</span></label>
                                        <input wire:model="email" id="email" type="email" class="form-input" placeholder="john@company.com">
                                        @error('email') <span class="text-status-danger text-xs mt-1 block">{{ $message }}</span> @enderror
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label for="phone" class="block font-body text-sm font-medium text-txt-main mb-2">No. Telepon</label>
                                        <input wire:model="phone" id="phone" type="tel" class="form-input" placeholder="08xx-xxxx-xxxx">
                                    </div>
                                    <div>
                                        <label for="company" class="block font-body text-sm font-medium text-txt-main mb-2">Perusahaan</label>
                                        <input wire:model="company" id="company" type="text" class="form-input" placeholder="PT. Company Name">
                                    </div>
                                </div>
                            </div>
                        @endif

                        {{-- Step 2: Project Details --}}
                        @if($step === 2)
                            <div class="space-y-5 animate-fade-in">
                                <h3 class="font-display text-xl font-bold text-txt-main mb-6">Detail Proyek</h3>

                                <div>
                                    <label class="block font-body text-sm font-medium text-txt-main mb-3">Kategori Layanan <span class="text-status-danger">*</span></label>
                                    <div class="grid grid-cols-2 gap-3">
                                        @foreach(['software' => 'Software Development', 'uiux' => 'UI/UX Design', 'marketing' => 'Digital Marketing', 'branding' => 'Branding'] as $key => $label)
                                            <label class="cursor-pointer">
                                                <input wire:model="service_category" type="radio" value="{{ $key }}" class="sr-only peer">
                                                <div class="p-4 rounded-xl border-2 transition-all duration-200 text-center
                                                            peer-checked:border-brand-primary peer-checked:bg-brand-primary/5
                                                            border-border-minimal hover:border-brand-primary/30">
                                                    <span class="font-body text-sm font-medium peer-checked:text-brand-primary">{{ $label }}</span>
                                                </div>
                                            </label>
                                        @endforeach
                                    </div>
                                    @error('service_category') <span class="text-status-danger text-xs mt-1 block">{{ $message }}</span> @enderror
                                </div>

                                <div>
                                    <label for="project_description" class="block font-body text-sm font-medium text-txt-main mb-2">Deskripsi Proyek <span class="text-status-danger">*</span></label>
                                    <textarea wire:model="project_description" id="project_description" rows="4" class="form-input resize-none" placeholder="Ceritakan tentang proyek yang ingin Anda bangun..."></textarea>
                                    @error('project_description') <span class="text-status-danger text-xs mt-1 block">{{ $message }}</span> @enderror
                                </div>

                                <div>
                                    <label for="estimated_pages" class="block font-body text-sm font-medium text-txt-main mb-2">Estimasi Jumlah Halaman/Fitur</label>
                                    <input wire:model="estimated_pages" id="estimated_pages" type="text" class="form-input" placeholder="Contoh: 5-10 halaman, 3 fitur utama">
                                </div>
                            </div>
                        @endif

                        {{-- Step 3: Budget & Timeline --}}
                        @if($step === 3)
                            <div class="space-y-5 animate-fade-in">
                                <h3 class="font-display text-xl font-bold text-txt-main mb-6">Budget & Timeline</h3>

                                <div>
                                    <label class="block font-body text-sm font-medium text-txt-main mb-3">Estimasi Budget <span class="text-status-danger">*</span></label>
                                    <div class="space-y-2">
                                        @foreach([
                                            'under_10m' => 'Di bawah Rp 10 Juta',
                                            '10m_25m' => 'Rp 10 - 25 Juta',
                                            '25m_50m' => 'Rp 25 - 50 Juta',
                                            '50m_100m' => 'Rp 50 - 100 Juta',
                                            'above_100m' => 'Di atas Rp 100 Juta',
                                        ] as $key => $label)
                                            <label class="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                                          {{ $budget_range === $key ? 'border-brand-primary bg-brand-primary/5' : 'border-border-minimal hover:border-brand-primary/30' }}">
                                                <input wire:model="budget_range" type="radio" value="{{ $key }}"
                                                       class="w-4 h-4 text-brand-primary border-border-minimal focus:ring-brand-primary">
                                                <span class="font-body text-sm {{ $budget_range === $key ? 'text-brand-primary font-medium' : 'text-txt-main' }}">{{ $label }}</span>
                                            </label>
                                        @endforeach
                                    </div>
                                    @error('budget_range') <span class="text-status-danger text-xs mt-1 block">{{ $message }}</span> @enderror
                                </div>

                                <div>
                                    <label for="target_launch" class="block font-body text-sm font-medium text-txt-main mb-2">Target Peluncuran</label>
                                    <input wire:model="target_launch" id="target_launch" type="text" class="form-input" placeholder="Contoh: 3 bulan, Q1 2026">
                                </div>
                            </div>
                        @endif

                        {{-- Navigation Buttons --}}
                        <div class="flex items-center justify-between mt-10 pt-6 border-t border-border-minimal">
                            @if($step > 1)
                                <button type="button" wire:click="prevStep"
                                        class="inline-flex items-center gap-2 font-body text-sm font-medium text-txt-muted hover:text-txt-main transition-colors duration-200">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                                    </svg>
                                    Kembali
                                </button>
                            @else
                                <div></div>
                            @endif

                            <button type="submit" class="btn-primary">
                                @if($step === $totalSteps)
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                                    </svg>
                                    Kirim Pengajuan
                                @else
                                    Lanjutkan
                                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                    </svg>
                                @endif
                            </button>
                        </div>
                    </form>
                </div>
            @endif
        </div>
    </div>
</section>
