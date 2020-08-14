<?php

namespace Tests\Unit;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Tightenco\Ziggy\Ziggy;
use Tests\TestCase;
use Tightenco\Ziggy\BladeRouteGenerator;

class RouteModelBindingTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $router = app('router');

        $router->get('users/{user}', function (User $user) {
            return '';
        })->name('users');

        $router->get('blog/{category}/{post:slug}', function (PostCategory $category, Post $post) {
            return '';
        })->name('categories.posts.show');

        // if ($this->laravelVersion(7)) {
        //     $router->get('/posts/{post}/comments/{comment:uuid}', $this->noop())->name('postComments.show');
        // }

        $router->getRoutes()->refreshNameLookups();
    }

    /** @test */
    public function can_retrieve_implicit_route_model_bindings()
    {
        $this->assertSame([
            'users' => [
                'uri' => 'users/{user}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
                'bindings' => [
                    'user' => 'uuid',
                ],
            ],
            'categories.posts.show' => [
                'uri' => 'blog/{category}/{post}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
                'bindings' => [
                    'category' => 'id',
                    'post' => 'slug',
                ],
            ],
        ], (new Ziggy)->toArray()['namedRoutes']);
    }
}

class User extends Model
{
    public function getRouteKeyName()
    {
        return 'uuid';
    }
}

class PostCategory extends Model
{
    //
}

class Post extends Model
{
    //
}
