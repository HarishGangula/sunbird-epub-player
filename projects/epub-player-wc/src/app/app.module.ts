import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { PLAYER_CONFIG, SunbirdPlayerSdkModule } from '@project-sunbird/sunbird-player-sdk-v9';
import { EpubViewerComponent } from '../../../sunbird-epub-player/src/lib/epub-viewer/epub-viewer.component';
import { EpubPlayerComponent } from '../../../sunbird-epub-player/src/lib/sunbird-epub-player.component';

@NgModule({
    declarations: [
        EpubPlayerComponent,
        EpubViewerComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        SunbirdPlayerSdkModule,
        HttpClientModule
    ],
    providers: [{ provide: PLAYER_CONFIG, useValue: { contentCompatibilityLevel: 5 } }]
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) { }
  ngDoBootstrap() {
    const customElement = createCustomElement(EpubPlayerComponent, { injector: this.injector });
    customElements.define('sunbird-epub-player', customElement);
  }
}
