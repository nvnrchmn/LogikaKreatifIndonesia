<?php

namespace App\Livewire\Client\Orders;

use Livewire\Component;
use Livewire\Attributes\Layout;
use App\Models\Order;
use App\Models\Transaction;

#[Layout('components.layouts.client')]
class Show extends Component
{
    public Order $order;
    
    // We will hold the snap token for the currently selected transaction
    public $snapToken = null;
    public $selectedTransactionId = null;

    public function mount(Order $order)
    {
        // Ensure client only views their own orders
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }
        
        $this->order = $order->load(['service', 'transactions' => function($q) {
            $q->orderBy('id', 'asc');
        }]);
    }

    public function payTransaction($transactionId, \App\Contracts\PaymentGatewayInterface $gateway)
    {
        $transaction = $this->order->transactions->firstWhere('id', $transactionId);
        
        if (!$transaction || $transaction->status === 'settlement' || $transaction->status === 'cancelled') {
            return;
        }

        $this->selectedTransactionId = $transaction->id;

        try {
            $paymentData = $gateway->generatePaymentToken($transaction, auth()->user());
            
            if ($paymentData['driver'] === 'midtrans') {
                $this->snapToken = $paymentData['token'];
                $this->dispatch('open-snap', token: $this->snapToken);
            } elseif ($paymentData['driver'] === 'xendit') {
                return redirect()->to($paymentData['invoice_url']);
            }
        } catch (\Exception $e) {
            session()->flash('error', 'Gagal memproses pembayaran: ' . $e->getMessage());
        }
    }
    
    public function cancelOrder()
    {
        if ($this->order->status === 'completed' || $this->order->status === 'cancelled') {
            return;
        }
        
        $this->order->update([
            'status' => 'cancelled',
            'milestone_status' => 'cancelled',
        ]);
        
        // Cancel all unpaid transactions
        $this->order->transactions()->where('status', 'pending')->update([
            'status' => 'cancelled'
        ]);
        
        session()->flash('success', 'Proyek berhasil dibatalkan. Tagihan yang belum lunas otomatis ikut dibatalkan.');
        $this->mount($this->order);
    }

    public function render()
    {
        return view('livewire.client.orders.show')
               ->title('Detail Order & Invoice');
    }
}
