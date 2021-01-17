<?php

return [

    /**
     * Base URL to use for all of Ziggy's route/URL generation.
     *
     * Enable to override globally - defaults to `url('/')`.
     */
    // 'url' => env('APP_URL'),

    /**
     * Default path to the file created by the `ziggy:generate`
     * command, containing Ziggy’s routes and configuration.
     */
    'path' => 'resources/js/ziggy.js',

    /**
     * Define groups of route name patterns to pass to Ziggy
     * to include or exclude custom groups of routes.
     */
    'groups' => [],

    /**
     * Globally include or exclude route names matching the given patterns.
     *
     * Enable one (or neither) of these options, NOT both.
     */
    // 'only' => [],
    // 'except' => [],

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
