<?php

return [

    /**
     * Base URL to use for all of Ziggy's route/URL generation.
     *
     * Uncomment to override globally - defaults to `url('/')`.
     */
    // 'url' => env('APP_URL'),

    /**
     * Default path to the file created by the `ziggy:generate`
     * command, containing Ziggy’s routes and configuration.
     */
    'path' => 'resources/js/ziggy.js',

    'only' => [],

    'except' => [],

    'groups' => [],

    /**
     * Include a list of each route's middleware in Ziggy's output.
     * Supports `true`, `false`, or an array of middleware names.
     */
    'middleware' => false,

    /**
     * Don't include the JavaScript `route()` helper function
     * in the output of the `@routes` Blade directive.
     */
    'skip-route-function' => false,

    /**
     * Output all URLs with the protocol and domain included.
     */
    'absolute' => true,

];
