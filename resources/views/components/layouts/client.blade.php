<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ?? 'Client Portal' }} — Logikraf</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230052FF'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold' font-size='16'>LK</text></svg>">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
    <!-- Midtrans Snap -->
    <script type="text/javascript"
      src="{{ config('services.midtrans.is_production') ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js' }}"
      data-client-key="{{ \App\Models\Setting::get('midtrans_client_key', config('services.midtrans.client_key')) }}"></script>
</head>
<body class="min-h-screen bg-canvas-overlay font-body text-txt-main antialiased"
      x-data="{ sidebarOpen: true, mobileSidebarOpen: false }">

    <!-- Mobile Sidebar Overlay -->
    <div x-show="mobileSidebarOpen" 
         x-transition.opacity 
         class="fixed inset-0 z-30 bg-black/50 lg:hidden"
         @click="mobileSidebarOpen = false" x-cloak></div>

    <div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside class="fixed inset-y-0 left-0 z-40 flex flex-col bg-canvas-dark transition-all duration-300 transform lg:translate-x-0"
               :class="[
                   sidebarOpen ? 'w-64' : 'w-20',
                   mobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
               ]">
            <!-- Logo -->
            <div class="flex items-center h-16 px-4 border-b border-white/10">
                <a href="{{ route('client.dashboard') }}" class="flex items-center gap-3 overflow-hidden">
                    <img src="{{ asset('images/logo.png') }}" alt="Logikraf Logo" class="h-10 w-auto object-contain shrink-0">
                    <span class="font-display font-bold text-white text-lg tracking-tight whitespace-nowrap mt-1"
                          x-show="sidebarOpen || mobileSidebarOpen" x-transition>Client Portal</span>
                </a>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                @php
                    $navItems = [
                        ['route' => 'client.dashboard', 'label' => 'Dashboard', 'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>'],
                        ['route' => 'client.orders.index', 'label' => 'My Orders', 'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>'],
                        ['route' => 'client.tickets.index', 'label' => 'Helpdesk', 'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>'],
                    ];
                @endphp

                @foreach($navItems as $item)
                    @php $isActive = request()->routeIs($item['route'] . '*'); @endphp
                    <a href="{{ route($item['route']) }}"
                       class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                              {{ $isActive ? 'bg-brand-primary text-white' : 'text-white/60 hover:text-white hover:bg-white/5' }}">
                        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {!! $item['icon'] !!}
                        </svg>
                        <span x-show="sidebarOpen || mobileSidebarOpen" x-transition class="whitespace-nowrap">{{ $item['label'] }}</span>
                    </a>
                @endforeach
            </nav>

            <!-- Sidebar Footer -->
            <div class="p-3 border-t border-white/10">
                <div class="flex items-center gap-3 px-3 py-2">
                    <div class="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
                        <span class="text-brand-primary text-xs font-bold">{{ substr(auth()->user()->name, 0, 1) }}</span>
                    </div>
                    <div x-show="sidebarOpen || mobileSidebarOpen" x-transition class="overflow-hidden">
                        <p class="text-white text-sm font-medium truncate">{{ auth()->user()->name }}</p>
                        <p class="text-white/40 text-xs truncate">{{ auth()->user()->email }}</p>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Content Area -->
        <div class="flex-1 transition-all duration-300 w-full" :class="sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'">
            <!-- Top Bar -->
            <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border-minimal h-16 flex items-center px-6">
                <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-4">
                        <!-- Toggle Sidebar -->
                        <button @click="window.innerWidth < 1024 ? mobileSidebarOpen = !mobileSidebarOpen : sidebarOpen = !sidebarOpen" class="p-2 rounded-lg text-txt-muted hover:text-txt-main hover:bg-gray-100 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                            </svg>
                        </button>
                        <h1 class="font-display text-lg font-semibold text-txt-main">{{ $title ?? 'Dashboard' }}</h1>
                    </div>

                    <div class="flex items-center gap-3">
                        <!-- Visit Site -->
                        <a href="/" target="_blank" class="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-medium text-txt-muted hover:text-brand-primary rounded-lg hover:bg-brand-primary/5 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                            Lihat Website
                        </a>
                        <!-- Logout -->
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit" class="flex items-center gap-2 px-3 py-2 text-xs font-medium text-txt-muted hover:text-status-danger rounded-lg hover:bg-status-danger/5 transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                                Logout
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <main class="p-6 lg:p-8">
                <!-- Flash Messages -->
                @if(session('success'))
                    <div class="mb-6 p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-lg flex items-center gap-3" x-data="{ show: true }" x-show="show" x-transition>
                        <svg class="w-5 h-5 text-brand-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        <p class="text-brand-accent text-sm font-medium">{{ session('success') }}</p>
                        <button @click="show = false" class="ml-auto text-brand-accent/50 hover:text-brand-accent"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                    </div>
                @endif

                {{ $slot }}
            </main>
        </div>
    </div>

    @livewireScripts
</body>
</html>
