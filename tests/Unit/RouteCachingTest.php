<?php

use Tighten\Ziggy\Ziggy;

test('exclude routes with generated names', function () {
    app('router')->get('users', fn () => '')->name('users');
    app('router')->get('cached', fn () => '')->name('generated::ZRopaJJwzA27wRLa');
    app('router')->getRoutes()->refreshNameLookups();

    expect((new Ziggy)->toArray()['routes'])->toBe([
        'users' => [
            'uri' => 'users',
            'methods' => ['GET', 'HEAD'],
        ],
    ]);
});
