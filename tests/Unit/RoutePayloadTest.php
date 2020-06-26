<?php

namespace Tests\Unit;

use Tests\TestCase;
use Tightenco\Ziggy\RoutePayload;

class RoutePayloadTest extends TestCase
{
    protected $router;

    protected function setUp(): void
    {
        parent::setUp();

        $this->router = app('router');

        $this->router->get('home', fn () => '')->name('home');
        $this->router->get('posts', fn () => '')->name('posts.index');
        $this->router->get('posts/{post}', fn () => '')->name('posts.show');
        $this->router->get('posts/{post}/comments', fn () => '')->name('postComments.index');
        $this->router->post('posts', fn () => '')->middleware(['auth', 'role:admin'])->name('posts.store');
        $this->router->get('admin/users', fn () => '')->middleware(['role:admin'])->name('admin.users.index');

        $this->router->getRoutes()->refreshNameLookups();
    }

    /** @test */
    public function only_matching_routes_included_with_include_enabled()
    {
        $routePayload = new RoutePayload($this->router);
        $filters = ['posts.s*', 'home'];
        $routes = $routePayload->filter($filters, true);

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
                'domain' => null,
            ],
        ];

        $this->assertEquals($expected, $routes->toArray());
    }

    /** @test */
    public function only_matching_routes_excluded_with_exclude_enabled()
    {
        $routePayload = new RoutePayload($this->router);
        $filters = ['posts.s*', 'home', 'admin.*'];
        $routes = $routePayload->filter($filters, false);

        $expected = [
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
        ];

        $this->assertEquals($expected, $routes->toArray());
    }

    /** @test */
    public function existence_of_only_config_causes_routes_to_be_included()
    {
        app()['config']->set('ziggy', [
            'only' => ['posts.s*', 'home'],
        ]);

        $routes = RoutePayload::compile($this->router);

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
                'domain' => null,
            ],
        ];

        $this->assertSame($expected, $routes->toArray());
    }

    /** @test */
    public function existence_of_except_config_causes_routes_to_be_excluded()
    {
        app()['config']->set('ziggy', [
            'except' => ['posts.s*', 'home', 'admin.*'],
        ]);

        $routes = RoutePayload::compile($this->router);

        $expected = [
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
        ];

        $this->assertSame($expected, $routes->toArray());
    }

    /** @test */
    public function existence_of_both_configs_returns_unfiltered_routes()
    {
        app()['config']->set('ziggy', [
            'except' => ['posts.s*'],
            'only' => ['home'],
        ]);

        $routes = RoutePayload::compile($this->router);

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
                'domain' => null,
            ],
            'admin.users.index' => [
                'uri' => 'admin/users',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
        ];

        $this->assertSame($expected, $routes->toArray());
    }

    /** @test */
    public function only_matching_routes_included_with_group_enabled()
    {
        app('config')->set('ziggy', [
            'groups' => [
                'authors' => ['home', 'posts.*'],
            ],
        ]);

        $routes = RoutePayload::compile($this->router, 'authors');

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
                'domain' => null,
            ],
        ];

        $this->assertSame($expected, $routes->toArray());
    }

    // can_compile_route_payload
    /** @test */
    public function non_existence_of_group_returns_unfiltered_routes()
    {
        $routes = RoutePayload::compile($this->router, 'authors');

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
                'domain' => null,
            ],
            'admin.users.index' => [
                'uri' => 'admin/users',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
        ];

        $this->assertSame($expected, $routes->toArray());
    }

    /** @test */
    public function retrieves_middleware_if_config_is_set()
    {
        app('config')->set('ziggy', [
            'middleware' => true,
        ]);

        $routes = RoutePayload::compile($this->router);

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
                'middleware' => [],
            ],
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
                'middleware' => [],
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
                'middleware' => [],
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
                'middleware' => [],
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
                'domain' => null,
                'middleware' => ['auth', 'role:admin'],
            ],
            'admin.users.index' => [
                'uri' => 'admin/users',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
                'middleware' => ['role:admin'],
            ],
        ];

        $this->assertSame($expected, $routes->toArray());
    }

    /** @test */
    public function retrieves_only_configured_middleware()
    {
        app('config')->set('ziggy', [
            'middleware' => ['auth'],
        ]);

        $routes = RoutePayload::compile($this->router);

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
                'middleware' => [],
            ],
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
                'middleware' => [],
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
                'middleware' => [],
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
                'middleware' => [],
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
                'domain' => null,
                'middleware' => ['auth'],
            ],
            'admin.users.index' => [
                'uri' => 'admin/users',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
                'middleware' => [],
            ],
        ];

        $this->assertSame($expected, $routes->toArray());
    }
}
