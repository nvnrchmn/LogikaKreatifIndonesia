<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PostSeeder extends Seeder
{
    /**
     * Seed 1 demo published blog post with an author.
     * Idempotent: skip if a post with the same slug already exists.
     */
    public function run(): void
    {
        $author = User::firstOrCreate(
            ['email' => 'author@logikraf.id'],
            [
                'name' => 'Tim Logikraf',
                'password' => Hash::make(env('ADMIN_PASSWORD', 'AdminLogikraf!123')),
            ]
        );

        if (Post::where('slug', 'mengapa-manajemen-perumahan-perlu-digital')->exists()) {
            return;
        }

        Post::create([
            'title' => 'Mengapa Manajemen Perumahan Perlu Digital',
            'slug' => 'mengapa-manajemen-perumahan-perlu-digital',
            'excerpt' => 'Dari iuran otomatis hingga komunikasi warga, transformasi digital membawa ketertiban dan transparansi bagi pengurus RT/RW.',
            'body' => "Pengelolaan perumahan selama ini banyak mengandalkan catatan manual dan grup WhatsApp yang cepat penuh. Padahal, banyak proses yang bisa diotomatisasi.\n\nLangkah pertama adalah pen catatan iuran yang transparan. Warga dapat melihat status tagihan kapan saja, dan pengurus tidak lagi repot menagih satu per satu.\n\nKomunikasi juga berubah drastis. Pengumuman penting tidak lagi tenggelam di tengah obrolan harian, melainkan tersaji rapi di satu dashboard.\n\nTerakhir, dokumen seperti KTP dan KK warga dapat disimpan aman di penyimpanan terpusat dengan akses terkontrol. Inilah inti dari manajemen perumahan modern.",
            'featured_image' => null,
            'is_published' => true,
            'published_at' => now(),
            'author_id' => $author->id,
        ]);
    }
}
