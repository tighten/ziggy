export const win = {
    location: {
        hostname: 'ziggy.dev',
    },
};

export const zig = {
    baseUrl: 'https://ziggy.dev',
    baseProtocol: 'https',
    baseDomain: 'ziggy.dev',
    // @todo #305
    // basePort: null,
    basePort: false,
    defaultParameters: { locale: 'en' },
    namedRoutes: {
        'home': {
            uri: '/',
            methods: ['GET', 'HEAD'],
        },
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
        // @todo #307
        // 'postComments.show': {
        //     uri: 'posts/{post}/comments/{comment}',
        //     methods: ['GET', 'HEAD'],
        //     bindings: {
        //         comment: 'uuid',
        //     },
        // },
        'translatePosts.index': {
            uri: '{locale}/posts',
            methods: ['GET', 'HEAD'],
        },
        'translatePosts.show': {
            uri: '{locale}/posts/{id}',
            methods: ['GET', 'HEAD'],
        },
        'events.venues.index': {
            uri: 'events/{event}/venues',
            methods: ['GET', 'HEAD'],
        },
        'events.venues.show': {
            uri: 'events/{event}/venues/{venue}',
            methods: ['GET', 'HEAD'],
        },
        'translateEvents.venues.show': {
            uri: '{locale}/events/{event}/venues/{venue}',
            methods: ['GET', 'HEAD'],
        },
        'conversations.show': {
            uri: 'subscribers/{subscriber}/conversations/{type}/{conversation_id?}',
            methods: ['GET', 'HEAD'],
        },
        'optional': {
            uri: 'optional/{id}/{slug?}',
            methods: ['GET', 'HEAD'],
        },
        'optionalId': {
            uri: 'optionalId/{type}/{id?}',
            methods: ['GET', 'HEAD'],
        },
        'team.user.show': {
            uri: 'users/{id}',
            methods: ['GET', 'HEAD'],
            domain: '{team}.ziggy.dev',
        },
        'translateTeam.user.show': {
            uri: '{locale}/users/{id}',
            methods: ['GET', 'HEAD'],
            domain: '{team}.ziggy.dev',
        },
        'products.show': {
            uri: '{country?}/{language?}/products/{id}',
            methods: ['GET', 'HEAD'],
        },
    },
};
