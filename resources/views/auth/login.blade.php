<x-layouts.app title="Login — Logika Kreatif Indonesia">
    <section class="min-h-[80vh] flex items-center justify-center bg-canvas-light py-20">
        <div class="w-full max-w-md mx-auto px-4">
            <div class="card p-8 lg:p-10">
                <!-- Header -->
                <div class="text-center mb-8">
                    <a href="/" class="inline-flex items-center gap-2 mb-6">
                        <div class="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center">
                            <span class="text-white font-display font-bold text-sm">LK</span>
                        </div>
                        <span class="font-display font-bold text-xl text-txt-main tracking-tight">LOGIKRAF</span>
                    </a>
                    <h1 class="font-display text-2xl font-bold text-txt-main">Masuk ke Panel Admin</h1>
                    <p class="font-body text-sm text-txt-muted mt-2">Silakan login untuk mengelola konten website.</p>
                </div>

                <!-- Error Messages -->
                @if($errors->any())
                    <div class="mb-6 p-4 bg-status-danger/10 border border-status-danger/20 rounded-lg">
                        <p class="text-status-danger text-sm font-body">{{ $errors->first() }}</p>
                    </div>
                @endif

                <!-- Login Form -->
                <form method="POST" action="{{ route('login') }}" class="space-y-5">
                    @csrf

                    <div>
                        <label for="email" class="block font-body text-sm font-medium text-txt-main mb-2">Email</label>
                        <input type="email" id="email" name="email" value="{{ old('email') }}" required autofocus
                               class="form-input" placeholder="admin@logikraf.id">
                    </div>

                    <div>
                        <label for="password" class="block font-body text-sm font-medium text-txt-main mb-2">Password</label>
                        <input type="password" id="password" name="password" required
                               class="form-input" placeholder="••••••••">
                    </div>

                    <div class="flex items-center justify-between">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="remember" class="w-4 h-4 text-brand-primary border-border-minimal rounded focus:ring-brand-primary">
                            <span class="font-body text-sm text-txt-muted">Ingat saya</span>
                        </label>
                    </div>

                    <button type="submit" class="btn-primary w-full justify-center text-base !py-3.5">
                        Masuk
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <a href="/" class="font-body text-sm text-txt-muted hover:text-brand-primary transition-colors">
                        ← Kembali ke Beranda
                    </a>
                </div>
            </div>
        </div>
    </section>
</x-layouts.app>
