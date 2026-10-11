import { assertType, expectTypeOf } from 'vitest';
import { Config, route } from 'ziggy-js';
import { Ziggy } from '../fixtures/ziggy.js';

expectTypeOf(Ziggy).toEqualTypeOf<Config>();

assertType(route('comments.show', { post: 1, comment: { uuid: 'abc' } }, true, Ziggy));
