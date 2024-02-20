/* This file is generated by Ziggy. */
import routeFn, { type Config } from 'ziggy-js'
declare module 'ziggy-js' {
  interface RouteList {
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
declare global {
  var route: typeof routeFn
}
export declare const Ziggy: Config;
