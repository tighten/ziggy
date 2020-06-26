<?php

namespace Tightenco\Tests\Unit;

use Tightenco\Tests\TestCase;
use Tightenco\Ziggy\Ziggy;

class ZiggyTest extends TestCase
{
    protected $router;

    public function setUp(): void
    {
        parent::setUp();

        $this->router = app('router');
        $this->router->get('/home', function () {
            return '';
        })
            ->name('home');

        $this->router->get('/posts', function () {
            return '';
        })
            ->name('posts.index');

        $this->router->get('/posts/{post}', function () {
            return '';
        })
            ->name('posts.show');

        $this->router->get('/posts/{post}/comments', function () {
            return '';
        })
            ->name('postComments.index');

        $this->router->post('/posts', function () {
            return '';
        })
            ->name('posts.store')->middleware(['auth', 'role:admin']);

        $this->router->get('/admin/users', function () {
            return '';
        })
            ->name('admin.users.index')->middleware('role:admin');

        $this->router->getRoutes()->refreshNameLookups();
    }

    /** @test */
    public function only_matching_routes_included_with_include_enabled()
    {
        $routePayload = new Ziggy;
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
        $routePayload = new Ziggy;
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

        $routes = (new Ziggy)->toArray()['namedRoutes'];

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

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function existence_of_except_config_causes_routes_to_be_excluded()
    {
        app()['config']->set('ziggy', [
            'except' => ['posts.s*', 'home', 'admin.*'],
        ]);

        $routes = (new Ziggy)->toArray()['namedRoutes'];

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

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function existence_of_both_configs_returns_unfiltered_routes()
    {
        app()['config']->set('ziggy', [
            'except' => ['posts.s*'],
            'only' => ['home'],
        ]);

        $routes = (new Ziggy)->toArray()['namedRoutes'];

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
            'admin.users.index' => [
                'uri' => 'admin/users',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
        ];

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function only_matching_routes_included_with_group_enabled()
    {
        app()['config']->set('ziggy', [
            'groups' => [
                'authors' => ['home', 'posts.*'],
            ],
        ]);

        $routes = (new Ziggy('authors'))->toArray()['namedRoutes'];

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

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function non_existence_of_group_returns_unfiltered_routes()
    {
        $routes = (new Ziggy('authors'))->toArray()['namedRoutes'];

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
            'admin.users.index' => [
                'uri' => 'admin/users',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
        ];

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function retrieves_middleware_if_config_is_set()
    {
        app()['config']->set('ziggy', [
            'middleware' => true,
        ]);

        $routes = (new Ziggy)->toArray()['namedRoutes'];

        $expected = [
            'posts.index' => [
                'uri' => 'posts',
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
            'home' => [
                'uri' => 'home',
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

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function retrieves_only_configured_middleware()
    {
        app()['config']->set('ziggy', [
            'middleware' => ['auth'],
        ]);

        $routes = (new Ziggy)->toArray()['namedRoutes'];

        $expected = [
            'posts.index' => [
                'uri' => 'posts',
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
            'home' => [
                'uri' => 'home',
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

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function route_payload_can_array_itself()
    {
        $ziggy = new Ziggy;

        $expected = [
            'baseUrl' => 'http://myapp.com/',
            'baseProtocol' => 'http',
            'baseDomain' => 'myapp.com',
            'basePort' => null,
            'defaultParameters' => [],
            'namedRoutes' => [
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
            ],
        ];

        $this->assertSame($expected, $ziggy->toArray());
        $this->assertSame($expected, $ziggy->jsonSerialize());
    }

    /** @test */
    public function route_payload_can_json_itself()
    {
        app('config')->set('ziggy', ['only' => ['postComments.*']]);
        $ziggy = new Ziggy;

        $expected = [
            'baseUrl' => 'http://myapp.com/',
            'baseProtocol' => 'http',
            'baseDomain' => 'myapp.com',
            'basePort' => null,
            'defaultParameters' => [],
            'namedRoutes' => [
                'postComments.index' => [
                    'uri' => 'posts/{post}/comments',
                    'methods' => ['GET', 'HEAD'],
                    'domain' => null,
                ],
            ],
        ];

        $json = '{"baseUrl":"http:\/\/myapp.com\/","baseProtocol":"http","baseDomain":"myapp.com","basePort":null,"defaultParameters":[],"namedRoutes":{"postComments.index":{"uri":"posts\/{post}\/comments","methods":["GET","HEAD"],"domain":null}}}';

        $this->assertSame($expected, json_decode(json_encode($ziggy), true));
        $this->assertSame($json, json_encode($ziggy));
        $this->assertSame($json, $ziggy->toJson());
    }

    /** @test */
    public function route_payload_can_automatically_json_itself_as_part_of_a_response()
    {
        app('config')->set('ziggy', ['only' => ['postComments.*']]);
        $this->router->get('json', function () {
            return response()->json(new Ziggy);
        });

        $response = $this->get('json');

        $response->assertSuccessful();
        $this->assertSame((new Ziggy)->toJson(), $response->getContent());
    }
}
