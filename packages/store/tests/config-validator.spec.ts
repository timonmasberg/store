import { ɵglobal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { HostEnvironment } from '../src/host-environment/host-environment';
import { NG_TEST_MODE } from '../src/symbols';
import {
  getIncorrectDevelopmentMessage,
  getIncorrectProductionMessage
} from '../src/configs/messages.config';

describe('ConfigValidator', () => {
  let host: HostEnvironment;

  it('should not warn when Angular is running in test mode', () => {
    // Arrange
    const spy = jest.spyOn(console, 'warn').mockImplementation();

    // Act
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([])]
    });

    host = TestBed.inject(HostEnvironment);

    try {
      // Assert
      expect(host.isTestMode()).toBe(true);
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it('should warn when NGXS is running production mode but Angular is in development', () => {
    // Arrange
    const resetNgDevMode = setNgDevMode(true);
    const spy = jest.spyOn(console, 'warn').mockImplementation();

    // Act
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([], { developmentMode: false })],
      providers: [{ provide: NG_TEST_MODE, useValue: () => false }]
    });

    host = TestBed.inject(HostEnvironment);

    try {
      // Assert
      expect(host.isTestMode()).toBe(false);
      expect(getNgDevMode()).toBe(true);
      expect(spy).toHaveBeenCalledWith(getIncorrectDevelopmentMessage());
    } finally {
      spy.mockRestore();
      resetNgDevMode();
    }
  });

  it('should warn when NGXS is running in development mode but Angular is in production', () => {
    // Arrange
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    const resetNgDevMode = setNgDevMode(false);

    // Act
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([], { developmentMode: true })],
      providers: [{ provide: NG_TEST_MODE, useValue: () => false }]
    });

    host = TestBed.inject(HostEnvironment);

    try {
      // Assert
      expect(getNgDevMode()).toBe(false);
      expect(host.isTestMode()).toBe(false);
      expect(spy).toHaveBeenCalledWith(getIncorrectProductionMessage());
    } finally {
      spy.mockRestore();
      resetNgDevMode();
    }
  });
});

function getNgDevMode(): boolean {
  return ɵglobal.ngDevMode;
}

function setNgDevMode(ngDevMode: boolean): VoidFunction {
  const originalNgDevMode = ɵglobal.ngDevMode;
  ɵglobal.ngDevMode = ngDevMode;
  return () => {
    ɵglobal.ngDevMode = originalNgDevMode;
  };
}
