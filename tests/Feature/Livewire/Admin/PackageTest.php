<?php

namespace Tests\Feature\Livewire\Admin;

use App\Livewire\Admin\Packages\Index;
use App\Models\Order;
use App\Models\Package;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PackageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
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

    public function test_admin_can_view_packages_page()
    {
        $admin = $this->getAdminUser();

        $this->actingAs($admin)
            ->get('/admin/packages')
            ->assertSuccessful()
            ->assertSeeLivewire(Index::class);
    }

    public function test_admin_can_create_package()
    {
        $admin = $this->getAdminUser();

        Livewire::actingAs($admin)
            ->test(Index::class)
            ->set('name', 'Paket Gold')
            ->set('tagline', 'Paket Terlaris')
            ->set('price', 150000)
            ->set('features_text', "Fitur 1\nFitur 2")
            ->set('is_featured', true)
            ->set('is_active', true)
            ->set('sort_order', 1)
            ->call('store')
            ->assertDispatched('swal');

        $this->assertDatabaseHas('packages', [
            'name' => 'Paket Gold',
            'price' => 150000,
        ]);
    }

    public function test_admin_can_delete_package_without_orders()
    {
        $admin = $this->getAdminUser();
        $package = Package::create([
            'name' => 'Test Package',
            'price' => 1000,
            'sort_order' => 1
        ]);

        Livewire::actingAs($admin)
            ->test(Index::class)
            ->call('delete', $package->id)
            ->assertDispatched('swal');

        $this->assertDatabaseMissing('packages', [
            'id' => $package->id,
        ]);
    }

    public function test_admin_cannot_delete_package_with_orders()
    {
        $admin = $this->getAdminUser();
        $package = Package::create([
            'name' => 'Test Package 2',
            'price' => 1000,
            'sort_order' => 1
        ]);
        $service = Service::create([
            'name' => 'Test Service Pkg',
            'category' => 'software',
            'description' => 'desc',
            'base_price' => 1000
        ]);
        
        Order::insert([
            'user_id' => $admin->id,
            'service_id' => $service->id,
            'package_id' => $package->id,
            'order_number' => 'TEST-PKG-123',
            'project_name' => 'Project Test Pkg',
            'project_brief' => 'Brief Test Pkg',
            'status' => 'pending',
            'total_amount' => 1000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Livewire::actingAs($admin)
            ->test(Index::class)
            ->call('delete', $package->id)
            ->assertDispatched('swal'); 

        $this->assertDatabaseHas('packages', [
            'id' => $package->id,
        ]);
    }
}
