import { PlayerConfig } from '../interfaces/sunbird-epub-player.interface';
import { UtilService } from './util.service';
import { $t } from '@project-sunbird/telemetry-sdk';

export class TelemetryService {
  private contentSessionId: string;
  private playSessionId: string;
  private telemetryObject: any;
  private context: any;
  public config: any;
  public channel: string = '';
  public pdata: string = '';
  public sid: string = '';
  public uid: string = '';
  public rollup: string = '';

  constructor() {
    this.contentSessionId = UtilService.uniqueId();
    this.playSessionId = UtilService.uniqueId();
  }

  public initialize({ context, config, metadata }: PlayerConfig) {
    this.context = context;
    this.config = config;
    this.playSessionId = UtilService.uniqueId();
    this.channel = this.context.channel;
    this.pdata = this.context.pdata;
    this.sid = this.context.sid;
    this.uid = this.context.uid;
    this.rollup = this.context.rollup;

    if (!$t.isInitialized) {
      const telemetryConfig: any = {
        pdata: context.pdata,
        env: 'contentplayer',
        channel: context.channel,
        did: context.did,
        authtoken: context.authToken || '',
        uid: context.uid || '',
        sid: context.sid,
        batchsize: 20,
        mode: context.mode,
        host: context.host || '',
        endpoint: context.endpoint || '/data/v3/telemetry',
        tags: context.tags,
        cdata: [
          { id: this.contentSessionId, type: 'ContentSession' },
          { id: this.playSessionId, type: 'PlaySession' },
          { id: '2.0', type: 'PlayerVersion' }
        ],
      };
      if (context.dispatcher) {
        telemetryConfig.dispatcher = context.dispatcher;
      }
      $t.initialize(telemetryConfig);
    }

    this.telemetryObject = {
      id: metadata.identifier,
      type: 'Content',
      ver: metadata.pkgVersion + '' || '1.0',
      rollup: context.objectRollup || {}
    };
  }

  public start(duration: number) {
    $t.start(
      $t.config,
      this.telemetryObject.id,
      this.telemetryObject.ver,
      {
        type: 'content',
        mode: 'play',
        pageid: '',
        duration: Number((duration / 1e3).toFixed(2))
      },
      this.getEventOptions()
    );
  }

  public interact(id: string, currentPage: number) {
    $t.interact({
      type: 'TOUCH',
      subtype: '',
      id,
      pageid: currentPage + ''
    }, this.getEventOptions());
  }

  public impression(currentPage: number) {
    $t.impression({
      type: 'workflow',
      subtype: '',
      pageid: currentPage + '',
      uri: ''
    }, this.getEventOptions());
  }

  public end(duration: number, percentage: number, curentPage: number, endpageseen: boolean) {
    const durationSec = Number((duration / 1e3).toFixed(2));
    $t.end({
      type: 'content',
      mode: 'play',
      pageid: 'sunbird-player-Endpage',
      summary: [
        { progress: percentage },
        { totallength: (percentage === 100 ? curentPage : 1) },
        { visitedlength: curentPage },
        { visitedcontentend: (percentage === 100) },
        { totalseekedlength: 0 },
        { endpageseen }
      ],
      duration: durationSec
    }, this.getEventOptions());
  }

  public error(errorCode: string, errorType: string, pageid: number, stacktrace: Error) {
    $t.error({
      err: errorCode,
      errtype: errorType,
      stacktrace: stacktrace.toString(),
      pageid: pageid || ''
    }, this.getEventOptions());
  }

  private getEventOptions() {
    return ({
      object: this.telemetryObject,
      context: {
        channel: this.channel,
        pdata: this.pdata,
        env: 'contentplayer',
        sid: this.sid,
        uid: this.uid,
        cdata: [
          { id: this.contentSessionId, type: 'ContentSession' },
          { id: this.playSessionId, type: 'PlaySession' },
          { id: '2.0', type: 'PlayerVersion' }
        ],
        rollup: this.rollup || {}
      }
    });
  }
}
