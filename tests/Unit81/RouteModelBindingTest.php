<?php

namespace Tests\Unit81;

use Illuminate\Contracts\Routing\UrlRoutable;
use Tests\TestCase;
use Tightenco\Ziggy\Ziggy;

class RouteModelBindingTest extends TestCase
{
    /** @test */
    public function can_handle_enums_in_route_model_bindings()
    {
        app('router')->get('sections/{section}', function (Section $section) {
            return '';
        })->name('sections');
        app('router')->getRoutes()->refreshNameLookups();

        $this->assertSame([
            'uri' => 'sections/{section}',
            'methods' => ['GET', 'HEAD'],
            'bindings' => [
                'section' => 'section',
            ],
        ], (new Ziggy)->toArray()['routes']['sections']);
    }

    /** @test */
    public function uses_default_route_key_name_for_enums_without_cases()
    {
        app('router')->get('types/{type}', function (Type $type) {
            return '';
        })->name('types');
        app('router')->getRoutes()->refreshNameLookups();

        $this->assertSame([
            'uri' => 'types/{type}',
            'methods' => ['GET', 'HEAD'],
            'bindings' => [
                'type' => 'id',
            ],
        ], (new Ziggy)->toArray()['routes']['types']);
    }
}

enum Section: string implements UrlRoutable
{
    case First = 'first';
    case Second = 'second';
    case Third = 'third';

    public function getRouteKey(): string
    {
        return $this->value;
    }

    public function getRouteKeyName(): string
    {
        return 'section';
    }

    public function resolveRouteBinding($value, $field = null): ?self
    {
        return self::tryFrom($value);
    }

    public function resolveChildRouteBinding($childType, $value, $field)
    {
        return null;
    }
}

enum Type implements UrlRoutable
{
    public function getRouteKey()
    {
    }

    public function getRouteKeyName()
    {
    }

    public function resolveRouteBinding($value, $field = null)
    {
    }

    public function resolveChildRouteBinding($childType, $value, $field)
    {
    }
}
