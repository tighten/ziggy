<?php

namespace Tests\Unit;

use Tests\TestCase;
use Tightenco\Ziggy\Ziggy;

class ZiggyTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $router = app('router');

        $router->get('home', $this->noop())->name('home');
        $router->get('posts', $this->noop())->name('posts.index');
        $router->get('posts/{post}', $this->noop())->name('posts.show');
        $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        $router->post('posts', $this->noop())->middleware(['auth', 'role:admin'])->name('posts.store');
        $router->get('admin/users', $this->noop())->middleware(['role:admin'])->name('admin.users.index');

        if ($this->laravelVersion(7)) {
            $router->get('/posts/{post}/comments/{comment:uuid}', $this->noop())->name('postComments.show');
        }

        $router->getRoutes()->refreshNameLookups();
    }

    /**
     * If running Laravel 7 or higher, add a 'bindings' key to every route.
     */
    protected function addBindings(array &$routes): void
    {
        if ($this->laravelVersion(7)) {
            $routes = array_map(function ($route) {
                return array_merge($route, ['bindings' => []]);
            }, $routes);
        }
    }

    /**
     * If running Laravel 7 or higher, the 'postComments.show' route.
     */
    protected function addPostCommentsRouteWithBindings(array &$routes): void
    {
        if ($this->laravelVersion(7)) {
            $routes['postComments.show'] = [
                'uri' => 'posts/{post}/comments/{comment}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
                'bindings' => [
                    'comment' => 'uuid',
                ],
            ];
        }
    }

    /** @test */
    public function can_filter_to_only_include_routes_matching_a_pattern()
    {
        $ziggy = new Ziggy;
        $routes = $ziggy->filter(['posts.s*', 'home'], true);

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

        $this->addBindings($expected);

        $this->assertEquals($expected, $routes->toArray());
    }

    /** @test */
    public function can_filter_to_exclude_routes_matching_a_pattern()
    {
        $ziggy = new Ziggy;
        $routes = $ziggy->filter(['posts.s*', 'home', 'admin.*'], false);

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

        $this->addBindings($expected);
        $this->addPostCommentsRouteWithBindings($expected);

        $this->assertEquals($expected, $routes->toArray());
    }

    /** @test */
    public function can_set_included_routes_using_only_config()
    {
        config(['ziggy' => [
            'only' => ['posts.s*', 'home'],
        ]]);
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

        $this->addBindings($expected);

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function can_set_excluded_routes_using_except_config()
    {
        config(['ziggy' => [
            'except' => ['posts.s*', 'home', 'admin.*'],
        ]]);
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

        $this->addBindings($expected);
        $this->addPostCommentsRouteWithBindings($expected);

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function returns_unfiltered_routes_when_both_only_and_except_configs_set()
    {
        config(['ziggy' => [
            'except' => ['posts.s*'],
            'only' => ['home'],
        ]]);
        $routes = (new Ziggy)->toArray()['namedRoutes'];

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

        $this->addBindings($expected);
        $this->addPostCommentsRouteWithBindings($expected);

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function can_set_included_routes_using_groups_config()
    {
        config(['ziggy' => [
            'groups' => [
                'authors' => ['home', 'posts.*'],
            ],
        ]]);
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

        $this->addBindings($expected);

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function can_ignore_passed_group_not_set_in_config()
    {
        // The 'authors' group doesn't exist
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

        $this->addBindings($expected);
        $this->addPostCommentsRouteWithBindings($expected);

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function can_include_middleware()
    {
        config(['ziggy' => [
            'middleware' => true,
        ]]);
        $routes = (new Ziggy)->toArray()['namedRoutes'];

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

        $this->addBindings($expected);
        $this->addPostCommentsRouteWithBindings($expected);
        if ($this->laravelVersion(7)) {
            $expected['postComments.show']['middleware'] = [];
        }

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function can_include_only_middleware_set_in_config()
    {
        config(['ziggy' => [
            'middleware' => ['auth'],
        ]]);
        $routes = (new Ziggy)->toArray()['namedRoutes'];

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

        $this->addBindings($expected);
        $this->addPostCommentsRouteWithBindings($expected);
        if ($this->laravelVersion(7)) {
            $expected['postComments.show']['middleware'] = [];
        }

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function route_payload_can_array_itself()
    {
        $ziggy = new Ziggy;

        $expected = [
            'baseUrl' => 'http://ziggy.dev/',
            'baseProtocol' => 'http',
            'baseDomain' => 'ziggy.dev',
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

        $this->addBindings($expected['namedRoutes']);
        $this->addPostCommentsRouteWithBindings($expected['namedRoutes']);

        $this->assertSame($expected, $ziggy->toArray());
        $this->assertSame($expected, $ziggy->jsonSerialize());
    }

    /** @test */
    public function route_payload_can_json_itself()
    {
        config(['ziggy' => [
            'only' => ['postComments.*'],
        ]]);

        $expected = [
            'baseUrl' => 'http://ziggy.dev/',
            'baseProtocol' => 'http',
            'baseDomain' => 'ziggy.dev',
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

        $this->addBindings($expected['namedRoutes']);
        $this->addPostCommentsRouteWithBindings($expected['namedRoutes']);

        $json = '{"baseUrl":"http:\/\/ziggy.dev\/","baseProtocol":"http","baseDomain":"ziggy.dev","basePort":null,"defaultParameters":[],"namedRoutes":{"postComments.index":{"uri":"posts\/{post}\/comments","methods":["GET","HEAD"],"domain":null}}}';

        if ($this->laravelVersion(7)) {
            $json = str_replace(
                '"domain":null}',
                '"domain":null,"bindings":[]},"postComments.show":{"uri":"posts\/{post}\/comments\/{comment}","methods":["GET","HEAD"],"domain":null,"bindings":{"comment":"uuid"}}',
                $json,
            );
        }

        $this->assertSame($expected, json_decode(json_encode(new Ziggy), true));
        $this->assertSame($json, json_encode(new Ziggy));
        $this->assertSame($json, (new Ziggy)->toJson());
    }

    /** @test */
    public function route_payload_can_automatically_json_itself_in_a_response()
    {
        config(['ziggy' => [
            'only' => ['postComments.*'],
        ]]);

        app('router')->get('json', function () {
            return response()->json(new Ziggy);
        });

        $response = $this->get('json');

        $response->assertSuccessful();
        $this->assertSame((new Ziggy)->toJson(), $response->getContent());
    }
}
