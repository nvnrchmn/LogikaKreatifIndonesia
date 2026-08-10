// Livewire v4 sudah menyertakan Alpine.js secara internal (via @livewireScripts).
// Memanggil Alpine.start() manual di sini membuat dua instance Alpine yang
// bertabrakan dan menyebabkan Livewire gagal meng-attach komponen
// (wire:click / wire:submit tidak merespons).
//
// Semua direktif Alpine (x-data, x-show, x-model) tetap berfungsi karena
// disediakan oleh Livewire v4 itu sendiri.
