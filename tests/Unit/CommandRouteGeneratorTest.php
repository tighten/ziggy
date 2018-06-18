<?php

namespace Tests\Unit;

use Illuminate\Support\Facades\Artisan;
use Tightenco\Tests\TestCase;
use org\bovigo\vfs\vfsStream;
use org\bovigo\vfs\vfsStreamDirectory;
use org\bovigo\vfs\vfsStreamWrapper;

class CommandRouteGeneratorTest extends TestCase
{
    public function setUp()
    {
        parent::setUp();

        vfsStreamWrapper::register();
        vfsStreamWrapper::setRoot(new vfsStreamDirectory('testDir'));
    }

    /** @test */
    function file_is_created_when_ziggy_generate_is_called()
    {
        Artisan::call('ziggy:generate', ['path' => vfsStream::url('testDir/ziggy.js')]);

        $this->assertTrue(vfsStreamWrapper::getRoot()->hasChild('ziggy.js'));
    }

    /** @test */
    function file_is_created_with_the_expected_structure_when_named_routes_exist()
    {
        $router = app('router');

        $router->get('/posts/{post}/comments', function () { return ''; })
            ->name('postComments.index');

        $router->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate', ['path' => vfsStream::url('testDir/ziggy.js')]);

        $this->assertFileEquals('./tests/assets/js/ziggy.js', vfsStream::url('testDir/ziggy.js'));
    }

    /** @test */
    function file_is_created_with_a_custom_url()
    {
        $router = app('router');

        $router->get('/posts/{post}/comments', function () { return ''; })
            ->name('postComments.index');

        $router->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate', ['path' => vfsStream::url('testDir/ziggy.js'), '--url' => 'http://example.org']);

        $this->assertFileEquals('./tests/assets/js/custom-url.js', vfsStream::url('testDir/ziggy.js'));
    }
}
