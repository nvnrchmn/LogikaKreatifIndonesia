<div class="mt-8 border-t border-border-minimal pt-8">
    <div class="flex items-center justify-between mb-6">
        <div>
            <h3 class="font-display font-bold text-lg text-txt-main">Progress Pengerjaan Proyek</h3>
            <p class="text-sm text-txt-muted mt-1">Pantau perkembangan tugas dan fitur yang sedang dikerjakan oleh tim kami.</p>
        </div>
    </div>

    @if($tasks->isEmpty())
        <div class="card p-8 text-center text-txt-muted text-sm">
            Belum ada daftar tugas spesifik untuk proyek ini.
        </div>
    @else
        <div class="card p-0 overflow-hidden">
            <ul class="divide-y divide-border-minimal">
                @foreach($tasks as $task)
                    <li class="p-4 flex items-center gap-4 hover:bg-canvas-light transition-colors">
                        <!-- Icon Status -->
                        <div class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
                            @if($task->status === 'done') bg-status-success/20 text-status-success
                            @elseif($task->status === 'in_progress') bg-brand-accent/20 text-brand-accent
                            @elseif($task->status === 'review') bg-status-warning/20 text-status-warning
                            @else bg-canvas-overlay text-txt-muted
                            @endif">
                            
                            @if($task->status === 'done')
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            @elseif($task->status === 'in_progress')
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            @elseif($task->status === 'review')
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            @else
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                            @endif
                        </div>

                        <!-- Info -->
                        <div class="flex-1">
                            <h4 class="font-bold text-sm text-txt-main {{ $task->status === 'done' ? 'line-through opacity-70' : '' }}">{{ $task->title }}</h4>
                            @if($task->description)
                                <p class="text-xs text-txt-muted mt-1 {{ $task->status === 'done' ? 'opacity-70' : '' }}">{{ $task->description }}</p>
                            @endif
                        </div>

                        <!-- Status Text -->
                        <div class="shrink-0 text-right">
                            @if($task->status === 'done')
                                <span class="badge bg-status-success/10 text-status-success text-[10px]">Selesai</span>
                            @elseif($task->status === 'in_progress')
                                <span class="badge bg-brand-accent/10 text-brand-accent text-[10px]">Sedang Dikerjakan</span>
                            @elseif($task->status === 'review')
                                <span class="badge bg-status-warning/10 text-status-warning text-[10px]">Review</span>
                            @else
                                <span class="badge bg-canvas-overlay text-txt-muted text-[10px]">Akan Dikerjakan</span>
                            @endif
                        </div>
                    </li>
                @endforeach
            </ul>
        </div>
    @endif
</div>
