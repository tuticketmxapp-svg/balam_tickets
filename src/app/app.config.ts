import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideLottieOptions } from 'ngx-lottie';

import {
  SocialLoginModule,
  SocialAuthServiceConfig,
  GoogleLoginProvider,
  FacebookLoginProvider
} from '@abacritt/angularx-social-login';

import { importProvidersFrom } from '@angular/core';
import { routes } from './app.routes';
import { TokenInterceptor } from './token.interceptor';

export function playerFactory() {
  return import('lottie-web');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
    provideLottieOptions({
      player: playerFactory
    }),

    // ✅ SOCIAL LOGIN
    importProvidersFrom(SocialLoginModule),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('78558400124-vols3utvafm23tmsnlulevaffd9jm576.apps.googleusercontent.com')
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('711860661104318')
          }
        ]
      } as SocialAuthServiceConfig,
    },
    provideHttpClient(
      withInterceptors([TokenInterceptor])
    )
  ]
};
