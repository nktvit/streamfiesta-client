import { ApplicationConfig } from '@angular/core';
import { IMAGE_CONFIG } from '@angular/common';
import {provideRouter, withHashLocation, withRouterConfig} from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation(), withRouterConfig({onSameUrlNavigation: 'reload'})),
    provideHttpClient(),
    provideAnimationsAsync(),
    { provide: IMAGE_CONFIG, useValue: { disableImageLazyLoadWarning: true, disableImageSizeWarning: true } },
  ]
};
