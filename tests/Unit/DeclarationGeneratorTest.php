<?php

namespace Tests\Unit;

use Illuminate\Database\Eloquent\Model;
use Tests\TestCase;
use Tightenco\Ziggy\Ziggy;

class DeclarationGeneratorTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $router = app('router');

        $router->get('folders/{foldername}', $this->noop())->name('files');
        $router->get('settings/{setting}', function (Setting $setting) {})->name('settings');

        $router->getRoutes()->refreshNameLookups();
    }

    /** @test */
    public function can_emit_export_for_non_ambient_context()
    {
        $ts = (new Ziggy)->filter('files')->typescriptDeclarationGenerator();
        $this->assertStringContainsString("export {}", $ts->generateDeclarations());
    }

    /** @test */
    public function can_declare_unbound_parameter()
    {
        $ts = (new Ziggy)->filter('files')->typescriptDeclarationGenerator();
        $this->assertStringContainsString("'files': [{ name: 'foldername' }]", $ts->generateDeclarations());
    }

    /** @test */
    public function can_declare_bound_parameter()
    {
        $ts = (new Ziggy)->filter('settings')->typescriptDeclarationGenerator();
        $this->assertStringContainsString("'settings': [{ name: 'setting', binding: 'key' }]", $ts->generateDeclarations());
    }

}

class Setting extends Model {
    public function getRouteKeyName() {
        return 'key';
    }
}
