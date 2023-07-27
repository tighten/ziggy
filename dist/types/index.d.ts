import Router from "./Router";
import { Config, RouteName, RouteParams } from "./types";
export * from "./types";
export default function route(): Router<never>;
export default function route<T extends RouteName>(name: T, params?: RouteParams<T> | null, absolute?: boolean, config?: Config): string;
export default function route(name: undefined, params: undefined, absolute: boolean): Router<never>;
export default function route(name: undefined, params: undefined, absolute?: boolean, config?: Config): Router<never>;
