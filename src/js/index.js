import Router from './Router';
function route(name, params, absolute, config) {
    const router = new Router(name, params, absolute, config);
    return name ? router.toString() : router;
}
export { route };
// https://github.com/tsconfig/bases/blob/main/bases/recommended.json
