<?php

namespace Tightenco\Tests\Unit;

use Tightenco\Tests\TestCase;
use Tightenco\Ziggy\RoutePayload;
use Tightenco\Ziggy\ZiggyServiceProvider;

class MacroTest extends TestCase
{
    /** @test */
    function only_matching_routes_excluded_with_exclude_group_are_filtered()
    {
        $router = app('router');

        $router->exclude(function ($router) {
            $router->get('/posts', function () { return ''; });
            $router->get('/posts/show', function () { return ''; })
                ->name('posts.show');
        });

        $router->get('/tags/{tag}', function () { return ''; })
                ->name('tags.show');

        $router->getRoutes()->refreshNameLookups();

        $payload = RoutePayload::compile($router);

        $this->assertEquals(['tags.show'], array_keys($payload->toArray()));
    }

    /** @test */
    function only_matching_routes_excluded_with_exclude_fluent_method_are_filtered()
    {
        $router = app('router');

        $router->get('/', function () { return ''; });

        $router->exclude()
            ->get('/pages', function () { return ''; })
            ->name('pages.index');

        $router->get('/pages/{slug}', function () { return ''; })
            ->name('pages.show');

        $router->getRoutes()->refreshNameLookups();

        $payload = RoutePayload::compile($router);

        $this->assertEquals(['pages.show'], array_keys($payload->toArray()));
    }

    /** @test */
    function only_matching_routes_excluded_with_exclude_fluent_method_and_group_are_filtered()
    {
        $router = app('router');

        $router->get('/', function () { return ''; });

        $router->exclude(function ($router) {
            $router->get('/posts', function () { return ''; });
            $router->get('/posts/show', function () { return ''; })
                ->name('posts.show');
        });

        $router->get('/tags/{tag}', function () { return ''; })
                ->name('tags.show');

        $router->exclude()
            ->get('/pages', function () { return ''; })
            ->name('pages.index');

        $router->get('/pages/{slug}', function () { return ''; })
            ->name('pages.show');

        $router->getRoutes()->refreshNameLookups();

        $payload = RoutePayload::compile($router);

        $this->assertEquals(['tags.show', 'pages.show'], array_keys($payload->toArray()));
    }

    /** @test */
    function only_matching_routes_included_with_include_fluent_method_are_filtered()
    {
        $router = app('router');

        $router->get('/tags/{tag}', function () { return ''; })
                ->name('tags.show');

        $router->include()
            ->get('/pages', function () { return ''; })
            ->name('pages.index');

        $router->getRoutes()->refreshNameLookups();

        $payload = RoutePayload::compile($router);

        $this->assertEquals(['pages.index'], array_keys($payload->toArray()));
    }

    /** @test */
    function only_matching_routes_included_with_include_group_method_are_filtered()
    {
        $router = app('router');

        $router->get('/', function () { return ''; });

        $router->include(function ($router) {
            $router->get('/posts', function () { return ''; });
            $router->get('/posts/show', function () { return ''; })
                ->name('posts.show');
        });

        $router->get('/tags/{tag}', function () { return ''; })
                ->name('tags.show');

        $router->getRoutes()->refreshNameLookups();

        $payload = RoutePayload::compile($router);

        $this->assertEquals(['posts.show'], array_keys($payload->toArray()));
    }

    /** @test */
    function only_matching_routes_included_with_include_group_and_fluent_method_are_filtered()
    {
        $router = app('router');

        $router->get('/', function () { return ''; });

        $router->include(function ($router) {
            $router->get('/posts', function () { return ''; });
            $router->get('/posts/show', function () { return ''; })
                ->name('posts.show');
        });

        $router->get('/tags/{tag}', function () { return ''; })
                ->name('tags.show');

        $router->include()
            ->get('/pages', function () { return ''; })
            ->name('pages.index');

        $router->get('/pages/{slug}', function () { return ''; })
            ->name('pages.show');

        $router->getRoutes()->refreshNameLookups();

        $payload = RoutePayload::compile($router);

        $this->assertEquals(['posts.show', 'pages.index'], array_keys($payload->toArray()));
    }
}
