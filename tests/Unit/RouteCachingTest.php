<?php

namespace Tests\Unit;

use Tests\TestCase;
use Tightenco\Ziggy\Ziggy;

class RouteCachingTest extends TestCase
{
    /** @test */
    public function can_exclude_routes_with_randomly_generated_names()
    {
        app('router')->get('users', $this->noop())->name('users');
        app('router')->get('cached', $this->noop())->name('generated::ZRopaJJwzA27wRLa');

        $expected = [
            'users' => [
                'uri' => 'users',
                'methods' => ['GET', 'HEAD'],
            ],
        ];

        $this->assertSame($expected, (new Ziggy)->toArray()['routes']);
    }
}
