<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LeadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create the User (Client)
        $user = \App\Models\User::firstOrCreate(
            ['email' => 'xendit@logikraf.id'],
            [
                'name' => 'Bapak Tester Xendit',
                'password' => bcrypt('password'),
            ]
        );
        $user->assignRole('client');

        // 3. Create an Order
        $order = \App\Models\Order::create([
            'order_number' => 'LK-TESTXENDIT-001',
            'user_id' => $user->id,
            'service_id' => 1, // Assumes Service ID 1 exists
            'project_name' => 'Simulasi Website Tester',
            'total_amount' => 10000000,
            'status' => 'pending',
            'milestone_status' => 'dp_pending',
        ]);

        // 4. Create Transactions (Milestones)
        $milestones = [
            ['name' => 'Down Payment (30%)', 'percentage' => 0.3],
            ['name' => 'Development Phase (40%)', 'percentage' => 0.4],
            ['name' => 'UAT & Handover (30%)', 'percentage' => 0.3],
        ];

        foreach ($milestones as $index => $milestone) {
            \App\Models\Transaction::create([
                'order_id' => $order->id,
                'transaction_reference' => "TRX-TESTXENDIT-" . ($index + 1),
                'milestone_name' => $milestone['name'],
                'amount' => $order->total_amount * $milestone['percentage'],
                'status' => 'pending',
            ]);
        }
    }
}
