<?php

namespace Tests\Unit;

use Tests\TestCase;
use Tightenco\Ziggy\RoutePayload;

class MacroTest extends TestCase
{
    protected $router;

    protected function setUp(): void
    {
        parent::setUp();

        $this->router = app('router');
    }

    /** @test */
    public function only_matching_routes_excluded_with_blacklist_group_are_filtered()
    {
        $this->router->blacklist(function ($router) {
            $router->get('posts', fn () => '');
            $router->get('posts/show', fn () => '')->name('posts.show');
        });
        $this->router->get('tags/{tag}', fn () => '')->name('tags.show');

        $this->router->getRoutes()->refreshNameLookups();

        $payload = RoutePayload::compile($this->router);

        $this->assertSame(['tags.show'], array_keys($payload->toArray()));
    }

    /** @test */
    public function only_matching_routes_excluded_with_blacklist_fluent_method_are_filtered()
    {
        $this->router->get('/', fn () => '');
        $this->router->blacklist()->get('pages', fn () => '')->name('pages.index');
        $this->router->get('pages/{slug}', fn () => '')->name('pages.show');

        $this->router->getRoutes()->refreshNameLookups();

        $payload = RoutePayload::compile($this->router);

        $this->assertSame(['pages.show'], array_keys($payload->toArray()));
    }

    /** @test */
    public function only_matching_routes_excluded_with_blacklist_fluent_method_and_group_are_filtered()
    {
        $this->router->get('/', fn () => '');
        $this->router->blacklist(function ($router) {
            $router->get('posts', fn () => '');
            $router->get('posts/show', fn () => '')->name('posts.show');
        });
        $this->router->get('tags/{tag}', fn () => '')->name('tags.show');
        $this->router->blacklist()->get('pages', fn () => '')->name('pages.index');
        $this->router->get('pages/{slug}', fn () => '')->name('pages.show');

        $this->router->getRoutes()->refreshNameLookups();

        $payload = RoutePayload::compile($this->router);

        $this->assertSame(['tags.show', 'pages.show'], array_keys($payload->toArray()));
    }

    /** @test */
    public function only_matching_routes_included_with_whitelist_fluent_method_are_filtered()
    {
        $this->router->get('tags/{tag}', fn () => '')->name('tags.show');
        $this->router->whitelist()->get('pages', fn () => '')->name('pages.index');

        $this->router->getRoutes()->refreshNameLookups();

        $payload = RoutePayload::compile($this->router);

        $this->assertSame(['pages.index'], array_keys($payload->toArray()));
    }

    /** @test */
    public function only_matching_routes_included_with_whitelist_group_method_are_filtered()
    {
        $this->router->get('/', fn () => '');
        $this->router->whitelist(function ($router) {
            $router->get('posts', fn () => '');
            $router->get('posts/show', fn () => '')->name('posts.show');
        });
        $this->router->get('tags/{tag}', fn () => '')->name('tags.show');

        $this->router->getRoutes()->refreshNameLookups();

        $payload = RoutePayload::compile($this->router);

        $this->assertSame(['posts.show'], array_keys($payload->toArray()));
    }

    /** @test */
    public function only_matching_routes_included_with_whitelist_group_and_fluent_method_are_filtered()
    {
        $this->router->get('/', fn () => '');
        $this->router->whitelist(function ($router) {
            $router->get('posts', fn () => '');
            $router->get('posts/show', fn () => '')->name('posts.show');
        });
        $this->router->get('tags/{tag}', fn () => '')->name('tags.show');
        $this->router->whitelist()->get('pages', fn () => '')->name('pages.index');
        $this->router->get('pages/{slug}', fn () => '')->name('pages.show');

        $this->router->getRoutes()->refreshNameLookups();

        $payload = RoutePayload::compile($this->router);

        $this->assertSame(['posts.show', 'pages.index'], array_keys($payload->toArray()));
    }
}
