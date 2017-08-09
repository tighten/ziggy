<?php

return [
    /*
     * show routes info
     * ['host', 'methods', 'uri', 'action', 'name']
     */
    'expose' => ['uri', 'name'],

    /*
     * ignore routes with certain action name by pattern
     */
    'ignore_by_action' => '',

    /*
     * ignore routes with certain uri by pattern
     */
    'ignore_by_uri' => '',

    /*
     * ignore routes without names
     */
    'ignore_routes_without_names' => true,
];
