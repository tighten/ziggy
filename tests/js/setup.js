global.window = {
    location: {
        hostname: 'ziggy.dev',
    },
};

global.Ziggy = {
    baseUrl: 'https://ziggy.dev',
    namedRoutes: {
        'posts.index': {
            uri: 'posts',
            methods: ['GET', 'HEAD'],
        },
        'posts.show': {
            uri: 'posts/{post}',
            methods: ['GET', 'HEAD'],
        },
        'posts.update': {
            uri: 'posts/{post}',
            methods: ['PUT'],
        },
        'events.venues.index': {
            uri: 'events/{event}/venues',
            methods: ['GET', 'HEAD'],
        },
        'events.venues.show': {
            uri: 'events/{event}/venues/{venue}',
            methods: ['GET', 'HEAD'],
        },
        'optional': {
            uri: 'optional/{id}/{slug?}',
            methods: ['GET', 'HEAD'],
        },
    },
};
