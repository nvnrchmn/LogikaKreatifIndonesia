<?php

use Livewire\Component;
use Livewire\WithFileUploads;
use App\Models\OrderFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\On;

new class extends Component
{
    use WithFileUploads;

    public $order_id;
    public $file;

    public function mount($order_id)
    {
        $this->order_id = $order_id;
    }

    public function uploadFile()
    {
        $this->validate([
            'file' => 'required|file|max:20480', // 20MB max
        ]);

        $path = $this->file->store('order-files', 'public');

        OrderFile::create([
            'order_id' => $this->order_id,
            'user_id' => Auth::id(),
            'file_name' => $this->file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $this->file->getSize(),
            'file_type' => $this->file->getClientMimeType(),
        ]);

        $this->file = null;
        $this->dispatch('file-uploaded');
        session()->flash('success', 'File berhasil diunggah.');
    }

    public function deleteFile($id)
    {
        $file = OrderFile::where('order_id', $this->order_id)->findOrFail($id);
        
        // Hanya yang upload atau admin yang boleh hapus
        if ($file->user_id === Auth::id() || Auth::user()->hasRole('admin')) {
            Storage::disk('public')->delete($file->file_path);
            $file->delete();
            $this->dispatch('file-deleted');
            session()->flash('success', 'File dihapus.');
        }
    }

    public function downloadFile($id)
    {
        $file = OrderFile::where('order_id', $this->order_id)->findOrFail($id);
        return Storage::disk('public')->download($file->file_path, $file->file_name);
    }

    #[On('file-uploaded')]
    #[On('file-deleted')]
    public function with(): array
    {
        return [
            'files' => OrderFile::with('user')
                ->where('order_id', $this->order_id)
                ->orderBy('created_at', 'desc')
                ->get()
        ];
    }
};
?>

<div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
    <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-800">File & Aset Proyek</h3>
    </div>
    
    <div class="p-6">
        @if (session()->has('success'))
            <div class="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
                {{ session('success') }}
            </div>
        @endif

        <form wire:submit="uploadFile" class="mb-6">
            <div class="flex items-end gap-3">
                <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Unggah File (Max 20MB)</label>
                    <input type="file" wire:model="file" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-gray-300 rounded-lg">
                </div>
                <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium" wire:loading.attr="disabled">
                    <span wire:loading.remove wire:target="uploadFile">Unggah</span>
                    <span wire:loading wire:target="uploadFile">Mengunggah...</span>
                </button>
            </div>
            @error('file') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
        </form>

        <div class="space-y-3">
            @forelse($files as $file)
                <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div class="w-10 h-10 shrink-0 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        </div>
                        <div class="truncate">
                            <p class="text-sm font-medium text-gray-900 truncate">{{ $file->file_name }}</p>
                            <p class="text-xs text-gray-500">
                                {{ number_format($file->file_size / 1024 / 1024, 2) }} MB &bull; Diunggah oleh {{ $file->user->name }}
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button wire:click="downloadFile({{ $file->id }})" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Unduh">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        </button>
                        @if($file->user_id === auth()->id() || auth()->user()->hasRole('admin'))
                            <button wire:click="deleteFile({{ $file->id }})" wire:confirm="Yakin ingin menghapus file ini?" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        @endif
                    </div>
                </div>
            @empty
                <div class="text-center py-6 text-gray-500">
                    <p class="text-sm">Belum ada file yang diunggah.</p>
                </div>
            @endforelse
        </div>
    </div>
</div>