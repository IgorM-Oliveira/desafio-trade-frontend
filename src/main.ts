import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { tokenInterceptor } from './shared/token.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),                          // ← sem hash
    provideHttpClient(withInterceptors([tokenInterceptor]), withFetch()),
    provideNoopAnimations(),
  ],
}).catch(err => console.error(err));
