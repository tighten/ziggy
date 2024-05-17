<?php

use Illuminate\Support\Facades\Route;

// Tests demonstrating/verifying the behavior of Laravel's route() helper.

test('optional params inside path', function () {
    Route::get('{country?}/test/{language?}/products/{id}', fn () => '')->name('products.show');

    expect(route('products.show', ['country' => 'ca', 'language' => 'fr', 'id' => 1]))
        ->toBe('http://ziggy.dev/ca/test/fr/products/1');
    // Optional param in the middle of a path
    expect(route('products.show', ['country' => 'ca', 'id' => 1]))
        ->toBe('http://ziggy.dev/ca/test//products/1');
    // Optional param at the beginning of a path
    expect(route('products.show', ['language' => 'fr', 'id' => 1]))
        ->toBe('http://ziggy.dev/test/fr/products/1');
    // Both
    expect(route('products.show', ['id' => 1]))
        ->toBe('http://ziggy.dev/test//products/1');
});
