import { bootstrapApplication, type BootstrapContext } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { tokenInterceptor } from './shared/token.interceptor';

export default function bootstrap(context: BootstrapContext) {
  return bootstrapApplication(
    AppComponent,
    {
      providers: [
        provideServerRendering(),
        provideRouter(routes),                       // ← sem hash
        provideHttpClient(withInterceptors([tokenInterceptor]), withFetch()),
        provideNoopAnimations(),
      ],
    },
    context,
  );
}
