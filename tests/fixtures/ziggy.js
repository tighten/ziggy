const Ziggy = {"url":"http:\/\/ziggy.dev","port":null,"defaults":{},"routes":{"postComments.index":{"uri":"posts\/{post}\/comments","methods":["GET","HEAD"]},"slashes":{"uri":"slashes\/{slug}","methods":["GET","HEAD"],"wheres":{"slug":".*"}}}};

if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    Object.assign(Ziggy.routes, window.Ziggy.routes);
}

export { Ziggy };
