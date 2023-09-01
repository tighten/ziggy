/* Do not modify this file, it is generated automatically. */
export {};

declare module 'ziggy-js' {
  interface RouteLookup {
    "posts.index": [],
    "postComments.show": [
        {
            "name": "post"
        },
        {
            "name": "comment",
            "binding": "uuid"
        }
    ],
    "postComments.store": [
        {
            "name": "post"
        }
    ]
}
}
