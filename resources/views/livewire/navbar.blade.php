<nav x-data="{ scrolled: {{ request()->routeIs('home') ? 'false' : 'true' }}, isHome: {{ request()->routeIs('home') ? 'true' : 'false' }}, mobileOpen: false }"
    x-init="window.addEventListener('scroll', () => { if(isHome) { scrolled = window.scrollY > 50 } })"
    :class="scrolled ? 'bg-canvas-light/95 backdrop-blur-md shadow-sm border-b border-border-minimal' : 'bg-transparent'"
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
    <div class="container-narrow">
        <div class="flex items-center justify-between h-20">
            <!-- Logo -->
            <a href="/" class="flex items-center gap-2 group">
                <img src="{{ asset('images/logo.png') }}" alt="Logikraf Logo"
                    class="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105 shrink-0">
                <span class="font-display font-bold text-xl tracking-tight mt-1"
                    :class="scrolled ? 'text-txt-main' : 'text-white'">
                    LOGIKRAF
                </span>
            </a>

            <!-- Desktop Nav Links -->
            <div class="hidden md:flex items-center gap-8">
                @foreach($navLinks as $link)
                    <a href="{{ $link['href'] }}"
                        :class="scrolled ? 'text-txt-muted hover:text-brand-primary' : 'text-white/80 hover:text-white'"
                        class="font-body text-sm font-medium transition-colors duration-200 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-brand-primary after:transition-all after:duration-200 hover:after:w-full">
                        {{ $link['label'] }}
                    </a>
                @endforeach
                @auth
                    @if(auth()->user()->role === 'admin')
                        <a href="{{ route('admin.dashboard') }}" class="btn-primary text-sm !py-2.5 !px-5">
                            Portal Admin
                        </a>
                    @else
                        <a href="{{ route('client.dashboard') }}" class="btn-primary text-sm !py-2.5 !px-5">
                            Portal Klien
                        </a>
                    @endif
                @else
                    <a href="{{ route('login') }}"
                        :class="scrolled ? 'text-txt-muted hover:text-brand-primary' : 'text-white/80 hover:text-white'"
                        class="font-body text-sm font-medium transition-colors duration-200">
                        Masuk
                    </a>
                    <a href="{{ route('packages.index') }}" class="btn-primary text-sm !py-2.5 !px-5">
                        Pesan Paket
                    </a>
                @endauth
            </div>

            <!-- Mobile Hamburger -->
            <button @click="mobileOpen = !mobileOpen" class="md:hidden p-2 rounded-lg transition-colors duration-200"
                :class="scrolled ? 'text-txt-main hover:bg-gray-100' : 'text-white hover:bg-white/10'"
                aria-label="Toggle menu">
                <svg x-show="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg x-show="mobileOpen" x-cloak class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Mobile Menu -->
        <div x-show="mobileOpen" x-cloak x-transition:enter="transition ease-out duration-200"
            x-transition:enter-start="opacity-0 -translate-y-2" x-transition:enter-end="opacity-100 translate-y-0"
            x-transition:leave="transition ease-in duration-150" x-transition:leave-start="opacity-100 translate-y-0"
            x-transition:leave-end="opacity-0 -translate-y-2" class="md:hidden pb-6">
            <div class="bg-canvas-card rounded-xl shadow-lg border border-border-minimal p-4 space-y-1">
                @foreach($navLinks as $link)
                    <a href="{{ $link['href'] }}" @click="mobileOpen = false"
                        class="block px-4 py-3 text-txt-main hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg font-body text-sm font-medium transition-colors duration-200">
                        {{ $link['label'] }}
                    </a>
                @endforeach
                <div class="pt-2 space-y-2">
                    @auth
                        @if(auth()->user()->role === 'admin')
                            <a href="{{ route('admin.dashboard') }}" class="btn-primary w-full text-center text-sm">
                                Portal Admin
                            </a>
                        @else
                            <a href="{{ route('client.dashboard') }}" class="btn-primary w-full text-center text-sm">
                                Portal Klien
                            </a>
                        @endif
                    @else
                        <a href="{{ route('login') }}" class="block px-4 py-2.5 text-center text-txt-main hover:bg-gray-100 rounded-lg font-body text-sm font-medium">
                            Masuk ke Portal Klien
                        </a>
                        <a href="{{ route('packages.index') }}" class="btn-primary w-full text-center text-sm">
                            Pesan Paket
                        </a>
                    @endauth
                </div>
            </div>
        </div>
    </div>
</nav>