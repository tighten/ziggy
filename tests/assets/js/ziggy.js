    var namedRoutes = JSON.parse('{"postComments.index":{"uri":"posts\/{post}\/comments","methods":["GET","HEAD"],"domain":null}}'),
        baseUrl = 'http://localhostmyapp.com/',
        baseProtocol = 'http',
        baseDomain = 'localhostmyapp.com',
        basePort = false;

    export {
        namedRoutes,
        baseUrl,
        baseProtocol,
        baseDomain,
        basePort
    }
