<?php

$models = [
    'Service',
    'Package',
    'Portfolio',
    'Lead',
    'Order',
    'Transaction',
    'SaasApplication',
    'Ticket'
];

foreach ($models as $model) {
    $path = "app/Models/{$model}.php";
    if (file_exists($path)) {
        $content = file_get_contents($path);
        
        if (strpos($content, 'SoftDeletes') !== false) {
            continue;
        }

        // Add import
        $content = preg_replace(
            '/use Illuminate\\\\Database\\\\Eloquent\\\\Model;/',
            "use Illuminate\\Database\\Eloquent\\Model;\nuse Illuminate\\Database\\Eloquent\\SoftDeletes;",
            $content
        );

        // Add trait
        $content = preg_replace(
            '/use HasFactory;/',
            "use HasFactory, SoftDeletes;",
            $content
        );

        file_put_contents($path, $content);
        echo "Updated $model\n";
    } else {
        echo "Not found: $model\n";
    }
}
