<?php

namespace Tests\Feature\Livewire\Admin;

use App\Livewire\Admin\Services\Index;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Buat role admin jika belum ada
        if (!Role::where('name', 'admin')->exists()) {
            Role::create(['name' => 'admin']);
        }
    }

    private function getAdminUser()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        return $admin;
    }

    public function test_admin_can_view_services_page()
    {
        $admin = $this->getAdminUser();

        $this->actingAs($admin)
            ->get('/admin/services')
            ->assertSuccessful()
            ->assertSeeLivewire(Index::class);
    }

    public function test_admin_can_create_service()
    {
        $admin = $this->getAdminUser();

        Livewire::actingAs($admin)
            ->test(Index::class)
            ->set('name', 'Web Development')
            ->set('category', 'software')
            ->set('short_description', 'Bikin web')
            ->set('description', 'Pembuatan website profesional')
            ->set('base_price', 5000000)
            ->set('sort_order', 1)
            ->set('is_active', true)
            ->call('store')
            ->assertDispatched('swal');

        $this->assertDatabaseHas('services', [
            'name' => 'Web Development',
            'category' => 'software',
        ]);
    }

    public function test_admin_can_delete_service_without_orders()
    {
        $admin = $this->getAdminUser();
        $service = Service::create([
            'name' => 'Test Service',
            'category' => 'software',
            'description' => 'test description',
            'base_price' => 1000
        ]);

        Livewire::actingAs($admin)
            ->test(Index::class)
            ->call('delete', $service->id)
            ->assertDispatched('swal');

        $this->assertDatabaseMissing('services', [
            'id' => $service->id,
        ]);
    }

    public function test_admin_cannot_delete_service_with_orders()
    {
        $admin = $this->getAdminUser();
        $service = Service::create([
            'name' => 'Test Service 2',
            'category' => 'software',
            'description' => 'test description',
            'base_price' => 1000
        ]);
        
        // Buat order terkait
        Order::insert([
            'user_id' => $admin->id,
            'service_id' => $service->id,
            'order_number' => 'TEST-123',
            'project_name' => 'Project Test',
            'project_brief' => 'Brief Test',
            'status' => 'pending',
            'total_amount' => 1000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Livewire::actingAs($admin)
            ->test(Index::class)
            ->call('delete', $service->id)
            ->assertDispatched('swal'); // harusnya dispatch swal error

        // Harus masih ada di database
        $this->assertDatabaseHas('services', [
            'id' => $service->id,
        ]);
    }
}
