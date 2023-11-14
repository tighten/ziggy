Here are quick install instructions if you want to use Ziggy with Inertija.js, Vue.js and Vite.

## Quick Installation

### Install the Package

Install Ziggy in your Laravel app with Composer:

```bash
composer require tightenco/ziggy
```

### Add routes

Add the `@routes` Blade directive to your main layout (_before_ your application's JavaScript).

Example:

```
<!DOCTYPE html>
<html class="h-full bg-white">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @routes
    @inertiaHead
</head>
<body class="h-full">
@inertia
</body>
</html>
```

### Add alias

Add a ziggy-js alias to your vite.config.js

```
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            'ziggy-js': path.resolve('vendor/tightenco/ziggy/dist/vue.es.js'),
        }
    },
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
            ]
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
```

### Load ZiggyVue

Load ZiggyVue:

```
import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { ZiggyVue } from 'ziggy-js';

createInertiaApp({
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.vue', { eager: true })
        return pages[`./Pages/${name}.vue`];
    },
    setup({ el, App, props, plugin }) {
        const VueApp = createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(ZiggyVue)
            .mount(el)
    },
})
```

That's it. You can access `route` inside your Vue components. Enjoy.

### Troubleshoot

## No matching export in "vendor/tightenco/ziggy/dist/index.m.js" for import "ZiggyVue"

Your alias is wrong in your vite.config.js. Please double check this line:

```
resolve: {
        alias: {
            'ziggy-js': path.resolve('vendor/tightenco/ziggy/dist/vue.es.js'),
        }
    },
```
