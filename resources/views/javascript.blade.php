<script type="text/javascript">
    var Ziggy = {
        namedRoutes: {!! $namedRoutes   !!},
        baseUrl: '{{ $baseUrl }}',
        baseProtocol: '{{ $baseProtocol }}',
        baseDomain: '{{ $baseDomain }}',
        basePort: {{ $basePort }},
        defaultParameters: {{ $defaultParameters  }}
    };

    {!!  $routeFunction   !!}
</script>