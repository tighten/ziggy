<?php

namespace Tests\Unit;

use Tests\TestCase;
use Tightenco\Ziggy\Ziggy;
use ReflectionClass;

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
     * If running Laravel 7 or higher, add the 'postComments.show' route.
     */
    protected function addPostCommentsRouteWithBindings(array &$routes): void
    {
        if ($this->laravelVersion(7)) {
            $routes['postComments.show'] = [
                'uri' => 'posts/{post}/comments/{comment}',
                'methods' => ['GET', 'HEAD'],
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
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
            ],
        ];

        $this->assertSame($expected, $routes->toArray()['routes']);
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
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
            ],
        ];

        $this->addPostCommentsRouteWithBindings($expected);

        $this->assertSame($expected, $routes->toArray()['routes']);
    }

    /** @test */
    public function can_set_included_routes_using_only_config()
    {
        config(['ziggy' => [
            'only' => ['posts.s*', 'home'],
        ]]);
        $routes = (new Ziggy)->toArray()['routes'];

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
            ],
        ];

        $this->assertSame($expected, $routes);
    }

    /** @test */
    public function can_set_excluded_routes_using_except_config()
    {
        config(['ziggy' => [
            'except' => ['posts.s*', 'home', 'admin.*'],
        ]]);
        $routes = (new Ziggy)->toArray()['routes'];

        $expected = [
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
            ],
        ];

        $this->addPostCommentsRouteWithBindings($expected);

        $this->assertSame($expected, $routes);
    }

    /** @test */
    public function returns_unfiltered_routes_when_both_only_and_except_configs_set()
    {
        config(['ziggy' => [
            'except' => ['posts.s*'],
            'only' => ['home'],
        ]]);
        $routes = (new Ziggy)->toArray()['routes'];

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
            ],
            'admin.users.index' => [
                'uri' => 'admin/users',
                'methods' => ['GET', 'HEAD'],
            ],
        ];

        $this->addPostCommentsRouteWithBindings($expected);

        $this->assertSame($expected, $routes);
    }

    /** @test */
    public function can_set_included_routes_using_groups_config()
    {
        config(['ziggy' => [
            'groups' => [
                'authors' => ['home', 'posts.*'],
            ],
        ]]);
        $routes = (new Ziggy('authors'))->toArray()['routes'];

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
            ],
        ];

        $this->assertSame($expected, $routes);
    }

    /** @test */
    public function can_ignore_passed_group_not_set_in_config()
    {
        // The 'authors' group doesn't exist
        $routes = (new Ziggy('authors'))->toArray()['routes'];

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
            ],
            'admin.users.index' => [
                'uri' => 'admin/users',
                'methods' => ['GET', 'HEAD'],
            ],
        ];

        $this->addPostCommentsRouteWithBindings($expected);

        $this->assertSame($expected, $routes);
    }

    /** @test */
    public function can_include_middleware()
    {
        config(['ziggy' => [
            'middleware' => true,
        ]]);
        $routes = (new Ziggy)->toArray()['routes'];

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
                'middleware' => ['auth', 'role:admin'],
            ],
            'admin.users.index' => [
                'uri' => 'admin/users',
                'methods' => ['GET', 'HEAD'],
                'middleware' => ['role:admin'],
            ],
        ];

        $this->addPostCommentsRouteWithBindings($expected);

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function can_include_subdomain()
    {
        app('router')->domain('{team}.ziggy.dev')->post('/', function () {
            return response()->json(new Ziggy);
        })->name('home');
        app('router')->getRoutes()->refreshNameLookups();

        $this->post(route('home', ['team' => 'tgtn']))
            ->assertJson([
                'url' => 'http://tgtn.ziggy.dev',
            ]);
    }

    /** @test */
    public function can_include_port()
    {
        app('router')->post('/', function () {
            return response()->json(new Ziggy);
        })->name('home');
        app('router')->getRoutes()->refreshNameLookups();

        $this->post('http://ziggy.dev:3000')
            ->assertJson([
                'url' => 'http://ziggy.dev:3000',
                'port' => 3000,
            ]);
    }

    /** @test */
    public function can_include_only_middleware_set_in_config()
    {
        config(['ziggy' => [
            'middleware' => ['auth'],
        ]]);
        $routes = (new Ziggy)->toArray()['routes'];

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
                'middleware' => ['auth'],
            ],
            'admin.users.index' => [
                'uri' => 'admin/users',
                'methods' => ['GET', 'HEAD'],
            ],
        ];

        $this->addPostCommentsRouteWithBindings($expected);

        $this->assertEquals($expected, $routes);
    }

    /** @test */
    public function can_order_fallback_routes_last()
    {
        app('router')->fallback($this->noop())->name('fallback');
        app('router')->get('/users', $this->noop())->name('users.index');

        app('router')->getRoutes()->refreshNameLookups();
        $routes = (new Ziggy)->toArray()['routes'];

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
            ],
            'admin.users.index' => [
                'uri' => 'admin/users',
                'methods' => ['GET', 'HEAD'],
            ],
        ];

        $this->addPostCommentsRouteWithBindings($expected);

        $expected['users.index'] = [
            'uri' => 'users',
            'methods' => ['GET', 'HEAD'],
        ];

        $expected['fallback'] = [
            'uri' => '{fallbackPlaceholder}',
            'methods' => ['GET', 'HEAD'],
        ];

        $this->assertSame($expected, $routes);
    }

    /** @test */
    public function route_payload_can_array_itself()
    {
        $ziggy = new Ziggy;

        $expected = [
            'url' => 'http://ziggy.dev',
            'port' => null,
            'defaults' => [],
            'routes' => [
                'home' => [
                    'uri' => 'home',
                    'methods' => ['GET', 'HEAD'],
                ],
                'posts.index' => [
                    'uri' => 'posts',
                    'methods' => ['GET', 'HEAD'],
                ],
                'posts.show' => [
                    'uri' => 'posts/{post}',
                    'methods' => ['GET', 'HEAD'],
                ],
                'postComments.index' => [
                    'uri' => 'posts/{post}/comments',
                    'methods' => ['GET', 'HEAD'],
                ],
                'posts.store' => [
                    'uri' => 'posts',
                    'methods' => ['POST'],
                ],
                'admin.users.index' => [
                    'uri' => 'admin/users',
                    'methods' => ['GET', 'HEAD'],
                ],
            ],
        ];

        $this->addPostCommentsRouteWithBindings($expected['routes']);

        $this->assertSame($expected, $ziggy->toArray());
    }

    /** @test */
    public function route_payload_can_json_itself()
    {
        config(['ziggy' => [
            'only' => ['postComments.*'],
        ]]);

        $expected = [
            'url' => 'http://ziggy.dev',
            'port' => null,
            'defaults' => [],
            'routes' => [
                'postComments.index' => [
                    'uri' => 'posts/{post}/comments',
                    'methods' => ['GET', 'HEAD'],
                ],
            ],
        ];

        $this->addPostCommentsRouteWithBindings($expected['routes']);

        $json = '{"url":"http:\/\/ziggy.dev","port":null,"defaults":{},"routes":{"postComments.index":{"uri":"posts\/{post}\/comments","methods":["GET","HEAD"]}}}';

        if ($this->laravelVersion(7)) {
            $json = str_replace(
                '}}}',
                '},"postComments.show":{"uri":"posts\/{post}\/comments\/{comment}","methods":["GET","HEAD"],"bindings":{"comment":"uuid"}}}}',
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

     public function isExcluded($routeName)
     {
         $class = new Ziggy;
         $reflection = new ReflectionClass($class);

         $method = $reflection->getMethod('isExcluded');
         $method->setAccessible(true);

         return $method->invokeArgs($class, [$routeName]);
     }

    /** @test */
    public function isExcluded_can_identify_excluded_route_via_except()
    {
        config(['ziggy' => [
            'except' => ['exclude.*'],
        ]]);

        // isExcluded should return true if a route is excluded, and false otherwise
        $expected = $this->isExcluded('exclude.index');
        $this->assertEquals(true, $expected);
    }

    /** @test */
    public function isExcluded_can_identify_excluded_route_via_only()
    {
        config(['ziggy' => [
            'only' => ['include.*'],
        ]]);

        $expected = $this->isExcluded('exclude.index');
        $this->assertEquals(true, $expected);
    }

    /** @test */
    public function isExcluded_can_identify_included_route_via_only()
    {
        config(['ziggy' => [
            'only' => ['include.*'],
        ]]);

        $expected = $this->isExcluded('include.index');
        $this->assertEquals(false, $expected);
    }

    /** @test */
    public function isExcluded_can_identify_included_route_via_groups()
    {
        config(['ziggy' => [
            'groups' => [
                'group' => ['include.*'],
            ],
        ]]);

        $expected = $this->isExcluded('include.index');
        $this->assertEquals(false, $expected);
    }

     /** @test */
     public function isExcluded_can_identify_included_route_via_groups_when_only_is_also_set()
     {
         config(['ziggy' => [
             'only' => ['include.*'],
             'groups' => [
                 'group' => ['alsoInclude.*'],
             ],
         ]]);

         $expected = $this->isExcluded('alsoInclude.index');
         $this->assertEquals(false, $expected);
     }


    /** @test */
    public function isExcluded_can_identify_route_in_both_excluded_and_groups_as_included()
    {
        config(['ziggy' => [
            'except' => ['exclude.*', 'include.*'],
            'groups' => [
                'group' => ['include.*'],
            ],
        ]]);

        $expected = $this->isExcluded('include.index');
        $this->assertEquals(false, $expected);

        $expected = $this->isExcluded('exclude.index');
        $this->assertEquals(true, $expected);
    }

    /** @test */
    public function isExcluded_can_ignore_excluded_route_when_both_except_and_only_are_set()
    {
        config(['ziggy' => [
            'except' => ['exclude.*'],
            'only' => ['include.*'],
        ]]);

        $expected = $this->isExcluded('exclude.index');
        $this->assertEquals(false, $expected);
    }

    /** @test */
    public function isExcluded_can_ignore_route_when_no_config_set()
    {
        $expected = $this->isExcluded('include.index');
        $this->assertEquals(false, $expected);
    }

}
