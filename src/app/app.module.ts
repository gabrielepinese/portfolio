import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from './shared/shared.module';

//Font awesome
import { library, icon } from '@fortawesome/fontawesome-svg-core';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

library.add(faCamera);

const camera = icon({ prefix: 'fas', iconName: 'camera' });

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
