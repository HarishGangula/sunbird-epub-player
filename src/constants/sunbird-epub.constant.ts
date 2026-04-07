export enum epubPlayerConstants {
  LOADING = 'LOADING',
  START = 'START',
  END = 'END',
  EPUBLOADED = 'epubLoaded',
  PAGECHANGE = 'pageChange',
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
  ERROR = 'error',
  UNABLE_TO_FETCH_URL_ONLINE = 'Internet is avialable but unable to fetch the url',
  NAVIGATE_TO_PAGE = 'NAVIGATE_TO_PAGE',
  INVALID_PAGE_ERROR = 'INVALID_PAGE_ERROR'
}

export enum telemetryType {
  INTERACT = 'INTERACT',
  IMPRESSION = 'IMPRESSION'
}

export const errorCode = {
  internetConnectivity: 'internetConnectivity',
  contentCompatibility: 'contentCompatibility',
  contentLoadFails: 'contentLoadFails'
};

export const errorMessage = {
  internetConnectivity: 'Internet connectivity lost',
  contentLoadFails: 'Content load failed'
};
