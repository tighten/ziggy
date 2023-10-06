const Ziggy = {"url":"http:\/\/ziggy.dev\/foo\/bar","port":null,"defaults":{"locale":"en"},"routes":{"postComments.index":{"uri":"posts\/{post}\/comments","methods":["GET","HEAD"],"parameters":["post"]}}};

if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    Object.assign(Ziggy.routes, window.Ziggy.routes);
}

export { Ziggy };
