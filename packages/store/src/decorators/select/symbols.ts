import { Type, ɵivyEnabled } from '@angular/core';
import { Observable } from 'rxjs';

import { Store } from '../../store';
import { NgxsConfig } from '../../symbols';
import { propGetter } from '../../internal/internals';
import { SelectFactory } from './select-factory';
import { StateToken } from '../../state-token/state-token';
import { ExtractTokenType } from '../../state-token/symbols';
import { throwSelectFactoryNotConnectedError } from '../../configs/messages.config';

const DOLLAR_CHAR_CODE = 36;

export function createSelectObservable<T = any>(
  selector: any,
  store: Store | null
): Observable<T> {
  // If the user is running Ivy.
  if (ɵivyEnabled) {
    // Then let's tree-shake the error message and `SelectFactory` in production.
    if (ngDevMode && !store) {
      throwSelectFactoryNotConnectedError();
    }
    return store!.select(selector);
  } else {
    // Otherwise use the old `SelectFactory` in View Engine.
    if (!SelectFactory.store) {
      throwSelectFactoryNotConnectedError();
    }
    return SelectFactory.store!.select(selector);
  }
}

export function createSelectorFn(
  config: NgxsConfig | null,
  name: string,
  rawSelector?: any,
  paths: string[] = []
): SelectorFn {
  rawSelector = !rawSelector ? removeDollarAtTheEnd(name) : rawSelector;

  if (typeof rawSelector === 'string') {
    const propsArray: string[] = paths.length
      ? [rawSelector, ...paths]
      : rawSelector.split('.');
    // If the user is running Ivy.
    if (ɵivyEnabled) {
      // Then let's tree-shake the error message and `SelectFactory` in production.
      if (ngDevMode && !config) {
        throwSelectFactoryNotConnectedError();
      }
      return propGetter(propsArray, config!);
    } else {
      // Otherwise use the old `SelectFactory` in View Engine.
      return propGetter(propsArray, SelectFactory.config!);
    }
  } else {
    return rawSelector;
  }
}

/**
 * @example If `foo$` => make it just `foo`
 */
export function removeDollarAtTheEnd(name: string): string {
  const lastCharIndex: number = name.length - 1;
  const dollarAtTheEnd: boolean = name.charCodeAt(lastCharIndex) === DOLLAR_CHAR_CODE;
  return dollarAtTheEnd ? name.slice(0, lastCharIndex) : name;
}

export type SelectorFn =
  | ((state: any, ...states: any[]) => any)
  | string
  | Type<any>
  | StateToken<any>;

export type PropertyType<T> = T extends StateToken<any>
  ? Observable<ExtractTokenType<T>>
  : T extends (...args: any[]) => any
  ? Observable<ReturnType<T>>
  : any;
