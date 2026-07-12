<div class="mt-8 border-t border-border-minimal pt-8">
    <div class="flex items-center justify-between mb-6">
        <div>
            <h3 class="font-display font-bold text-lg text-txt-main">Progress & Task Board (Kanban)</h3>
            <p class="text-sm text-txt-muted mt-1">Kelola tugas harian untuk proyek ini. Klien dapat melihat status ini secara transparan.</p>
        </div>
    </div>

    @if(session('success'))
        <div class="mb-6 p-4 bg-status-success/10 text-status-success rounded-lg border border-status-success/20 text-sm font-medium">
            {{ session('success') }}
        </div>
    @endif

    <!-- Add Task Form -->
    <div class="card p-5 mb-6 bg-canvas-overlay">
        <form wire:submit="addTask" class="flex flex-col sm:flex-row gap-3 items-start">
            <div class="flex-1 w-full space-y-2">
                <input type="text" wire:model="title" class="form-input w-full" placeholder="Nama tugas (cth: Desain Homepage)" required>
                @error('title') <span class="text-status-danger text-xs">{{ $message }}</span> @enderror
            </div>
            <div class="flex-1 w-full space-y-2">
                <input type="text" wire:model="description" class="form-input w-full" placeholder="Deskripsi singkat (opsional)">
                @error('description') <span class="text-status-danger text-xs">{{ $message }}</span> @enderror
            </div>
            <button type="submit" class="btn bg-brand-primary text-white hover:bg-brand-primary-hover px-6 py-2 shrink-0">
                + Tambah Tugas
            </button>
        </form>
    </div>

    <!-- Kanban Columns -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <!-- TODO -->
        <div class="bg-canvas-overlay rounded-xl p-4 border border-border-minimal flex flex-col h-full min-h-[400px]">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-border-minimal">
                <h4 class="font-bold text-sm text-txt-main">TO DO</h4>
                <span class="bg-canvas-light text-txt-muted text-xs px-2 py-0.5 rounded-full font-semibold">{{ count($columns['todo']) }}</span>
            </div>
            <div class="space-y-3 flex-1">
                @foreach($columns['todo'] as $task)
                    <div class="bg-white p-3 rounded-lg border border-border-minimal shadow-sm">
                        <div class="font-semibold text-sm text-txt-main mb-1">{{ $task->title }}</div>
                        @if($task->description)
                            <div class="text-xs text-txt-muted mb-3 line-clamp-2">{{ $task->description }}</div>
                        @endif
                        <div class="flex items-center justify-between mt-3 pt-3 border-t border-border-minimal">
                            <button wire:click="deleteTask({{ $task->id }})" wire:confirm="Hapus tugas ini?" class="text-status-danger hover:underline text-[10px] font-medium">Hapus</button>
                            <button wire:click="updateTaskStatus({{ $task->id }}, 'in_progress')" class="text-brand-primary hover:underline text-[10px] font-medium font-bold">Mulai Kerja &rarr;</button>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- IN PROGRESS -->
        <div class="bg-brand-accent/5 rounded-xl p-4 border border-brand-accent/20 flex flex-col h-full min-h-[400px]">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-brand-accent/20">
                <h4 class="font-bold text-sm text-brand-accent">IN PROGRESS</h4>
                <span class="bg-brand-accent/20 text-brand-accent text-xs px-2 py-0.5 rounded-full font-semibold">{{ count($columns['in_progress']) }}</span>
            </div>
            <div class="space-y-3 flex-1">
                @foreach($columns['in_progress'] as $task)
                    <div class="bg-white p-3 rounded-lg border border-border-minimal shadow-sm border-l-4 border-l-brand-accent">
                        <div class="font-semibold text-sm text-txt-main mb-1">{{ $task->title }}</div>
                        @if($task->description)
                            <div class="text-xs text-txt-muted mb-3 line-clamp-2">{{ $task->description }}</div>
                        @endif
                        <div class="flex items-center justify-between mt-3 pt-3 border-t border-border-minimal">
                            <button wire:click="updateTaskStatus({{ $task->id }}, 'todo')" class="text-txt-muted hover:underline text-[10px] font-medium">&larr; Batal</button>
                            <button wire:click="updateTaskStatus({{ $task->id }}, 'review')" class="text-brand-primary hover:underline text-[10px] font-medium font-bold">Ke Review &rarr;</button>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- REVIEW -->
        <div class="bg-status-warning/5 rounded-xl p-4 border border-status-warning/20 flex flex-col h-full min-h-[400px]">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-status-warning/20">
                <h4 class="font-bold text-sm text-status-warning">REVIEW</h4>
                <span class="bg-status-warning/20 text-status-warning text-xs px-2 py-0.5 rounded-full font-semibold">{{ count($columns['review']) }}</span>
            </div>
            <div class="space-y-3 flex-1">
                @foreach($columns['review'] as $task)
                    <div class="bg-white p-3 rounded-lg border border-border-minimal shadow-sm border-l-4 border-l-status-warning">
                        <div class="font-semibold text-sm text-txt-main mb-1">{{ $task->title }}</div>
                        @if($task->description)
                            <div class="text-xs text-txt-muted mb-3 line-clamp-2">{{ $task->description }}</div>
                        @endif
                        <div class="flex items-center justify-between mt-3 pt-3 border-t border-border-minimal">
                            <button wire:click="updateTaskStatus({{ $task->id }}, 'in_progress')" class="text-txt-muted hover:underline text-[10px] font-medium">&larr; Revisi</button>
                            <button wire:click="updateTaskStatus({{ $task->id }}, 'done')" class="text-status-success hover:underline text-[10px] font-medium font-bold">Approve &rarr;</button>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- DONE -->
        <div class="bg-status-success/5 rounded-xl p-4 border border-status-success/20 flex flex-col h-full min-h-[400px]">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-status-success/20">
                <h4 class="font-bold text-sm text-status-success">DONE</h4>
                <span class="bg-status-success/20 text-status-success text-xs px-2 py-0.5 rounded-full font-semibold">{{ count($columns['done']) }}</span>
            </div>
            <div class="space-y-3 flex-1">
                @foreach($columns['done'] as $task)
                    <div class="bg-white p-3 rounded-lg border border-border-minimal shadow-sm border-l-4 border-l-status-success opacity-75">
                        <div class="font-semibold text-sm text-txt-main mb-1 line-through">{{ $task->title }}</div>
                        @if($task->description)
                            <div class="text-xs text-txt-muted mb-3 line-clamp-2">{{ $task->description }}</div>
                        @endif
                        <div class="flex items-center justify-between mt-3 pt-3 border-t border-border-minimal">
                            <button wire:click="updateTaskStatus({{ $task->id }}, 'review')" class="text-txt-muted hover:underline text-[10px] font-medium">&larr; Batal Selesai</button>
                            <button wire:click="deleteTask({{ $task->id }})" wire:confirm="Hapus tugas ini?" class="text-status-danger hover:underline text-[10px] font-medium">Hapus</button>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

    </div>
</div>
