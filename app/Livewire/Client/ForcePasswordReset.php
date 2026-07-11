<?php

namespace App\Livewire\Client;

use Livewire\Component;
use Livewire\Attributes\Layout;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

#[Layout('components.layouts.app')]
class ForcePasswordReset extends Component
{
    public $password = '';
    public $password_confirmation = '';

    protected function rules()
    {
        return [
            'password' => ['required', 'confirmed', Password::min(8)],
        ];
    }

    protected function messages()
    {
        return [
            'password.required' => 'Password baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'password.min' => 'Password minimal 8 karakter.',
        ];
    }

    public function save()
    {
        $this->validate();

        $user = auth()->user();
        $user->password = Hash::make($this->password);
        $user->must_change_password = false;
        $user->save();

        session()->flash('success', 'Password berhasil diperbarui! Selamat datang di Portal Klien.');
        
        return redirect()->route('client.dashboard');
    }

    public function render()
    {
        return view('livewire.client.force-password-reset')->title('Wajib Ganti Password');
    }
}
