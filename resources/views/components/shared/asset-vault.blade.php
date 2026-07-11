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
        $fileCount = OrderFile::where('order_id', $this->order_id)->count();
        if ($fileCount >= 10) {
            $this->addError('file', 'Batas maksimal 10 file per proyek telah tercapai.');
            return;
        }

        $this->validate([
            'file' => 'required|file|mimes:pdf,zip|max:20480', // 20MB max, pdf/zip
        ], [
            'file.mimes' => 'Hanya format PDF atau ZIP yang diizinkan.',
            'file.max' => 'Ukuran file maksimal 20MB.'
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
                ->get(),
            'fileCount' => OrderFile::where('order_id', $this->order_id)->count()
        ];
    }
};
?>

<div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
    <div class="px-6 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path></svg>
            File & Aset Proyek
        </h3>
        <span class="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{{ $fileCount }} / 10 File</span>
    </div>
    
    <div class="p-6 bg-gray-50/50">
        @if (session()->has('success'))
            <div class="mb-5 p-3.5 bg-green-50 text-green-700 text-sm font-medium rounded-xl border border-green-100 flex items-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                {{ session('success') }}
            </div>
        @endif

        <form wire:submit="uploadFile" class="mb-8 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <label class="block text-sm font-bold text-gray-700 mb-3">Unggah File Baru</label>
            
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div class="flex-1 w-full relative">
                    <input type="file" wire:model="file" accept=".pdf,.zip" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition">
                </div>
                
                <div class="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    @if($file)
                        <button type="button" wire:click="$set('file', null)" class="px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition text-sm font-medium border border-gray-200">Batal</button>
                    @endif
                    <button type="submit" class="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm font-medium flex items-center justify-center gap-2" wire:loading.attr="disabled">
                        <svg wire:loading.remove wire:target="uploadFile" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        <svg wire:loading wire:target="uploadFile" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span wire:loading.remove wire:target="uploadFile">Unggah</span>
                        <span wire:loading wire:target="uploadFile">Mengunggah...</span>
                    </button>
                </div>
            </div>
            <div class="mt-3 flex items-center justify-between text-xs">
                <span class="text-gray-500">Format: <strong class="text-gray-700">.PDF, .ZIP</strong> (Maks: 20MB)</span>
            </div>
            @error('file') <div class="text-red-500 text-sm mt-3 bg-red-50 p-2.5 rounded-lg border border-red-100">{{ $message }}</div> @enderror
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