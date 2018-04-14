<?php

namespace Tightenco\Tests\Unit;

use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Facades\Route;
use Tightenco\Tests\TestCase;
use Tightenco\Ziggy\BladeRouteGenerator;

class BladeRouteGeneratorTest extends TestCase
{
    /** @test */
    function generator_at_least_vaguely_works_and_outputs_something_vaguely_right_ish()
    {
        $generator = app(BladeRouteGenerator::class);

        $this->assertContains("namedRoutes: []", $generator->generate());
    }

    /** @test */
    function generator_outputs_non_domain_named_routes_with_expected_structure()
    {
        // Named. Should end up in JSON
        Route::get('/posts/{post}/comments', function () { return ''; })
            ->name('postComments.index');

        Route::getRoutes()->refreshNameLookups();

        $this->assertEquals([
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
        ], BladeRouteGenerator::getRoutePayload()->toArray());
    }

    /** @test */
    function generator_outputs_domain_as_defined()
    {
        Route::domain('{account}.myapp.com')->group(function () {
            Route::get('/posts/{post}/comments', function () { return ''; })
                ->name('postComments.index');
        });

        Route::getRoutes()->refreshNameLookups();

        $this->assertEquals([
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => '{account}.myapp.com',
            ],
        ], BladeRouteGenerator::getRoutePayload()->toArray());
    }

    /** @test */
    function generator_returns_only_named_routes()
    {
        // Not named. Shouldn't end up in JSON
        Route::get('/', function () { return ''; });

        // Named. Should end up in JSON
        Route::get('/posts', function () { return ''; })
            ->name('posts.index');
        Route::get('/posts/{post}', function () { return ''; })
            ->name('posts.show');
        Route::get('/posts/{post}/comments', function () { return ''; })
            ->name('postComments.index');
        Route::post('/posts', function () { return ''; })
            ->name('posts.store');

        Route::getRoutes()->refreshNameLookups();

        $array = BladeRouteGenerator::getRoutePayload()->toArray();

        $this->assertCount(4, $array);

        $this->assertArrayHasKey('posts.index', $array);
        $this->assertArrayHasKey('posts.show', $array);
        $this->assertArrayHasKey('posts.store', $array);
        $this->assertArrayHasKey('postComments.index', $array);
    }
}
