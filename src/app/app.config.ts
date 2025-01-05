import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {AuthHttpInterceptor, authHttpInterceptorFn, provideAuth0} from "@auth0/auth0-angular";
import {environment} from "../environments/environment";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),
    provideAuth0({
      domain: environment.AUTH0_DOMAIN,
      clientId: environment.AUTH0_CLIENT_ID,

      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: environment.AUTH0_AUDIENCE,
        scope: 'read:current_user',
      },

      httpInterceptor: {
        allowedList: [
          {
            uri: `${environment.BACKEND_URL}/api/v1/users/*`,
            tokenOptions: {
              authorizationParams: {
                audience: environment.AUTH0_AUDIENCE,
                scope: 'openid read:current_user',
              },
            },
          },
        ],
      }
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHttpInterceptor,
      multi: true
    }
  ]
};
