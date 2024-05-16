<?php

use Tighten\Ziggy\Ziggy;


test('can exclude routes with randomly generated names', function () {
    app('router')->get('users', fn () => '')->name('users');
    app('router')->get('cached', fn () => '')->name('generated::ZRopaJJwzA27wRLa');

    $expected = [
        'users' => [
            'uri' => 'users',
            'methods' => ['GET', 'HEAD'],
        ],
    ];

    expect((new Ziggy)->toArray()['routes'])->toBe($expected);
});
