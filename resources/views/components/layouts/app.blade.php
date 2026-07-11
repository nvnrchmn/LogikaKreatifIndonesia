<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ $title ?? 'Logika Kreatif Indonesia — Digital Creative Agency & Software House' }}</title>
    <meta name="description" content="{{ $metaDescription ?? 'PT. Logika Kreatif Indonesia — Agensi kreatif digital & software house yang menjembatani solusi berbasis logika teknologi dengan eksekusi kreativitas. Software Development, UI/UX Design, Digital Marketing, dan Branding.' }}">
    <meta name="keywords" content="software house indonesia, digital agency, ui/ux design, web development, branding, digital marketing, logikraf">
    <meta name="author" content="PT. Logika Kreatif Indonesia">

    <!-- Open Graph -->
    <meta property="og:title" content="{{ $title ?? 'Logika Kreatif Indonesia' }}">
    <meta property="og:description" content="{{ $metaDescription ?? 'Digital Creative Agency & Software House' }}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230052FF'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold' font-size='16'>LK</text></svg>">

    <!-- Google Fonts: Sora + Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
</head>
<body class="min-h-screen flex flex-col">
    <!-- Navbar -->
    <livewire:navbar />

    <!-- Main Content -->
    <main class="flex-1">
        {{ $slot }}
    </main>

    <!-- Footer -->
    <livewire:footer />

    @livewireScripts
</body>
</html>
