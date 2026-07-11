<?php

declare(strict_types=1);

namespace App\Livewire\Admin\Orders;

use App\Models\Order;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Livewire\Component;
use Livewire\WithPagination;

class Index extends Component
{
    use WithPagination;

    public $search = '';
    public $statusFilter = '';
    
    public $isModalOpen = false;
    public $viewingOrder = null;

    // Form fields for new order
    public $user_id = '';
    public $lead_id = '';
    public $service_id = '';
    public $project_name = '';
    public $total_amount = 0;

    protected $rules = [
        'user_id' => 'required_without:lead_id',
        'lead_id' => 'required_without:user_id',
        'service_id' => 'required|exists:services,id',
        'project_name' => 'required|string|max:255',
        'total_amount' => 'required|numeric|min:0',
    ];

    public function updatingSearch()
    {
        $this->resetPage();
    }

    public function updatingStatusFilter()
    {
        $this->resetPage();
    }

    public function create()
    {
        $this->resetForm();
        $this->isModalOpen = true;
    }

    public function store()
    {
        $this->validate();

        DB::transaction(function () {
            if ($this->lead_id) {
                $lead = \App\Models\Lead::findOrFail($this->lead_id);
                $user = User::firstOrCreate(
                    ['email' => $lead->email],
                    [
                        'name' => $lead->name,
                        'password' => 'logikraf123',
                        'must_change_password' => true,
                    ]
                );
                if (!$user->hasRole('client')) {
                    $user->assignRole('client');
                }
                $this->user_id = $user->id;
            }

            // Generate Order Number: LK-YYYYMMDD-XXXX
            $datePrefix = date('Ymd');
            $latestOrder = Order::where('order_number', 'like', "LK-{$datePrefix}-%")->orderBy('id', 'desc')->first();
            
            $sequence = 1;
            if ($latestOrder) {
                $parts = explode('-', $latestOrder->order_number);
                $sequence = (int)end($parts) + 1;
            }
            
            $orderNumber = sprintf("LK-%s-%04d", $datePrefix, $sequence);

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $this->user_id,
                'service_id' => $this->service_id,
                'project_name' => $this->project_name,
                'total_amount' => $this->total_amount,
                'status' => 'pending',
                'milestone_status' => 'dp_pending',
            ]);

            // Generate 3 Milestone Transactions
            $milestones = [
                ['name' => 'Down Payment (30%)', 'percentage' => 0.3],
                ['name' => 'Development Phase (40%)', 'percentage' => 0.4],
                ['name' => 'UAT & Handover (30%)', 'percentage' => 0.3],
            ];

            foreach ($milestones as $index => $milestone) {
                Transaction::create([
                    'order_id' => $order->id,
                    'transaction_reference' => "TRX-{$orderNumber}-" . ($index + 1),
                    'milestone_name' => $milestone['name'],
                    'amount' => $this->total_amount * $milestone['percentage'],
                    'payment_method' => null,
                    'status' => 'pending',
                    'settled_at' => null,
                ]);
            }
        });

        session()->flash('success', 'Order dan tagihan milestone berhasil dibuat. Jika Lead baru, akun Client dibuat otomatis (Password Default: logikraf123).');
        $this->closeModal();
    }

    public function viewOrder(int $id)
    {
        $this->viewingOrder = Order::with(['user', 'service', 'transactions'])->findOrFail($id);
    }

    public function closeViewModal()
    {
        $this->viewingOrder = null;
    }

    public function closeModal()
    {
        $this->isModalOpen = false;
        $this->resetForm();
    }

    public function cancelOrder(int $id)
    {
        $order = Order::findOrFail($id);
        
        if ($order->status === 'completed' || $order->status === 'cancelled') {
            return;
        }
        
        $order->update([
            'status' => 'cancelled',
            'milestone_status' => 'cancelled',
        ]);
        
        // Cancel all unpaid transactions by setting them to expired
        $order->transactions()->where('status', 'pending')->update([
            'status' => 'expired'
        ]);
        
        session()->flash('success', 'Proyek berhasil dibatalkan. Tagihan yang belum lunas otomatis dibatalkan.');
        if ($this->viewingOrder && $this->viewingOrder->id === $id) {
            $this->viewOrder($id);
        }
    }

    private function resetForm()
    {
        $this->user_id = '';
        $this->lead_id = '';
        $this->service_id = '';
        $this->project_name = '';
        $this->total_amount = 0;
        $this->resetValidation();
    }

    public function render()
    {
        $query = Order::with(['user', 'service']);
        
        if ($this->search) {
            $query->where(function($q) {
                $q->where('order_number', 'like', '%' . $this->search . '%')
                  ->orWhere('project_name', 'like', '%' . $this->search . '%')
                  ->orWhereHas('user', function($qu) {
                      $qu->where('name', 'like', '%' . $this->search . '%');
                  });
            });
        }
        
        if ($this->statusFilter) {
            $query->where('status', $this->statusFilter);
        }
        
        $orders = $query->orderBy('created_at', 'desc')->paginate(15);
        
        $clients = User::role('client')->get(); // get users with client role
        if ($clients->isEmpty()) {
            // fallback if no clients exist yet (for testing)
            $clients = User::all();
        }
        $services = Service::where('is_active', true)->get();

        $leads = \App\Models\Lead::where('status', 'converted')->get();

        return view('livewire.admin.orders.index', compact('orders', 'clients', 'services', 'leads'))
            ->layout('components.layouts.admin', ['title' => 'Manajemen Orders']);
    }
}
