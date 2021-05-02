import { Injectable, isDevMode } from '@angular/core';

import {
  getIncorrectProductionMessage,
  getIncorrectDevelopmentMessage
} from '../configs/messages.config';
import { NgxsConfig } from '../symbols';
import { HostEnvironment } from '../host-environment/host-environment';

@Injectable({ providedIn: 'root' })
export class ConfigValidator {
  constructor(private _host: HostEnvironment, private _config: NgxsConfig) {}

  verifyDevMode(): void {
    if (this._host.isTestMode()) {
      return;
    }

    if (typeof ngDevMode !== 'undefined') {
      // Caretaker note: these conditions are placed here and not moved to separate
      // methods or functions because they'll be tree-shaken away. Basically Terser will encounter
      // the following expression:
      // if (true) {
      //   if (false && this._config.developmentMode) { ... }
      //   else if (!false && this._config.developmentMode) { ... }
      // }
      // The `getIncorrectDevelopmentMessage()` will be tree-shaken away.
      if (ngDevMode && !this._config.developmentMode) {
        console.warn(getIncorrectDevelopmentMessage());
      } else if (!ngDevMode && this._config.developmentMode) {
        console.warn(getIncorrectProductionMessage());
      }
    } else {
      const ngDevMode = isDevMode();
      // If `ngDevMode` is undefined then it means we're using the View Engine compiler.
      if (ngDevMode && !this._config.developmentMode) {
        console.warn(getIncorrectDevelopmentMessage());
      } else if (!ngDevMode && this._config.developmentMode) {
        console.warn(getIncorrectProductionMessage());
      }
    }
  }
}
