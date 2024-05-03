import { NgModule } from '@angular/core';
import { EpubPlayerComponent } from './sunbird-epub-player.component';
import { EpubViewerComponent } from './epub-viewer/epub-viewer.component';
import { PLAYER_CONFIG, SunbirdPlayerSdkModule  } from '@project-sunbird/sunbird-player-sdk-v9';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';




@NgModule({
  declarations: [EpubPlayerComponent, EpubViewerComponent],
  imports: [
    CommonModule,
    SunbirdPlayerSdkModule,
    HttpClientModule
  ],
  providers:[{ provide: PLAYER_CONFIG, useValue: { contentCompatibilityLevel: 5 } }],
  exports: [EpubPlayerComponent]
})
export class SunbirdEpubPlayerModule { }
