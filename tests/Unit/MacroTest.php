<?php

namespace Tightenco\Tests\Unit;

use Tightenco\Tests\TestCase;
use Tightenco\Ziggy\Ziggy;

class MacroTest extends TestCase
{
    /** @test */
    function only_matching_routes_excluded_with_except_group_are_filtered()
    {
        $router = app('router');

        $router->except(function ($router) {
            $router->get('/posts', function () { return ''; });
            $router->get('/posts/show', function () { return ''; })
                ->name('posts.show');
        });

        $router->get('/tags/{tag}', function () { return ''; })
                ->name('tags.show');

        $router->getRoutes()->refreshNameLookups();

        $payload = (new Ziggy)->toArray()['namedRoutes'];

        $this->assertEquals(['tags.show'], array_keys($payload));
    }

    /** @test */
    function only_matching_routes_excluded_with_except_fluent_method_are_filtered()
    {
        $router = app('router');

        $router->get('/', function () { return ''; });

        $router->except()
            ->get('/pages', function () { return ''; })
            ->name('pages.index');

        $router->get('/pages/{slug}', function () { return ''; })
            ->name('pages.show');

        $router->getRoutes()->refreshNameLookups();

        $payload = (new Ziggy)->toArray()['namedRoutes'];

        $this->assertEquals(['pages.show'], array_keys($payload));
    }

    /** @test */
    function only_matching_routes_excluded_with_except_fluent_method_and_group_are_filtered()
    {
        $router = app('router');

        $router->get('/', function () { return ''; });

        $router->except(function ($router) {
            $router->get('/posts', function () { return ''; });
            $router->get('/posts/show', function () { return ''; })
                ->name('posts.show');
        });

        $router->get('/tags/{tag}', function () { return ''; })
                ->name('tags.show');

        $router->except()
            ->get('/pages', function () { return ''; })
            ->name('pages.index');

        $router->get('/pages/{slug}', function () { return ''; })
            ->name('pages.show');

        $router->getRoutes()->refreshNameLookups();

        $payload = (new Ziggy)->toArray()['namedRoutes'];

        $this->assertEquals(['tags.show', 'pages.show'], array_keys($payload));
    }

    /** @test */
    function only_matching_routes_included_with_only_fluent_method_are_filtered()
    {
        $router = app('router');

        $router->get('/tags/{tag}', function () { return ''; })
                ->name('tags.show');

        $router->only()
            ->get('/pages', function () { return ''; })
            ->name('pages.index');

        $router->getRoutes()->refreshNameLookups();

        $payload = (new Ziggy)->toArray()['namedRoutes'];

        $this->assertEquals(['pages.index'], array_keys($payload));
    }

    /** @test */
    function only_matching_routes_included_with_only_group_method_are_filtered()
    {
        $router = app('router');

        $router->get('/', function () { return ''; });

        $router->only(function ($router) {
            $router->get('/posts', function () { return ''; });
            $router->get('/posts/show', function () { return ''; })
                ->name('posts.show');
        });

        $router->get('/tags/{tag}', function () { return ''; })
                ->name('tags.show');

        $router->getRoutes()->refreshNameLookups();

        $payload = (new Ziggy)->toArray()['namedRoutes'];

        $this->assertEquals(['posts.show'], array_keys($payload));
    }

    /** @test */
    function only_matching_routes_included_with_only_group_and_fluent_method_are_filtered()
    {
        $router = app('router');

        $router->get('/', function () { return ''; });

        $router->only(function ($router) {
            $router->get('/posts', function () { return ''; });
            $router->get('/posts/show', function () { return ''; })
                ->name('posts.show');
        });

        $router->get('/tags/{tag}', function () { return ''; })
                ->name('tags.show');

        $router->only()
            ->get('/pages', function () { return ''; })
            ->name('pages.index');

        $router->get('/pages/{slug}', function () { return ''; })
            ->name('pages.show');

        $router->getRoutes()->refreshNameLookups();

        $payload = (new Ziggy)->toArray()['namedRoutes'];

        $this->assertEquals(['posts.show', 'pages.index'], array_keys($payload));
    }
}
