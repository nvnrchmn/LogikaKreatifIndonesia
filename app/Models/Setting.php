<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'value'];

    public static function get($key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    public static function set($key, $value)
    {
        return static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public static function configureMail(): void
    {
        $mailHost = static::get('mail_host', env('MAIL_HOST'));
        if ($mailHost) {
            config([
                'mail.default' => static::get('mail_mailer', env('MAIL_MAILER', 'smtp')),
                'mail.mailers.smtp.host' => $mailHost,
                'mail.mailers.smtp.port' => static::get('mail_port', env('MAIL_PORT', 587)),
                'mail.mailers.smtp.username' => static::get('mail_username', env('MAIL_USERNAME')),
                'mail.mailers.smtp.password' => static::get('mail_password', env('MAIL_PASSWORD')),
                'mail.mailers.smtp.encryption' => static::get('mail_encryption', env('MAIL_ENCRYPTION', 'tls')),
                'mail.from.address' => static::get('mail_from_address', env('MAIL_FROM_ADDRESS', 'hello@logikraf.id')),
                'mail.from.name' => static::get('mail_from_name', env('MAIL_FROM_NAME', 'Logika Kreatif Indonesia')),
            ]);

            app('mail.manager')->purge('smtp');
        }
    }
}
