import Router from './Router.js';

export default route = (name, params, absolute, config) => {
    const router = new Router(name, params, absolute, config);
    return name ? router.toString() : router;
}
