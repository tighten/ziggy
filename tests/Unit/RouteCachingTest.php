<?php

use Illuminate\Support\Facades\Route;
use Tighten\Ziggy\Ziggy;

test('exclude routes with generated names', function () {
    Route::get('users', fn () => '')->name('users');
    Route::get('cached', fn () => '')->name('generated::ZRopaJJwzA27wRLa');

    expect((new Ziggy)->toArray()['routes'])->toBe([
        'users' => [
            'uri' => 'users',
            'methods' => ['GET', 'HEAD'],
        ],
    ]);
});
