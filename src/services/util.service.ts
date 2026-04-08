export class UtilService {
  public static uniqueId(length = 32) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public static getTimeSpentText(pdfPlayerStartTime: number) {
    const duration = new Date().getTime() - pdfPlayerStartTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Number(((duration % 60000) / 1000).toFixed(0));
    return (minutes + ':' + (seconds < 10 ? '0' : '') + seconds);
  }
}
