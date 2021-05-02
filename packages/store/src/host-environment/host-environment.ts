import { Inject, Injectable } from '@angular/core';
import { NG_TEST_MODE } from '../symbols';
import { Callback } from '../internal/internals';

@Injectable({ providedIn: 'root' })
export class HostEnvironment {
  constructor(@Inject(NG_TEST_MODE) public isTestMode: Callback<boolean>) {}
}
