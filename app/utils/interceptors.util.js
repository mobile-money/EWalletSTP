import {mockResponses} from '../config/api.config';
import env from '../config/env.config';
import result from 'lodash/result';
import tracker from '../utils/googleAnalytics.util.js';
import {serverStatusHandler, serverErrorDataHandler} from '../utils/errorHandler.util';
import uuidV4 from 'uuid/v4';
import {deviceInfo, currentAppVersion, currentPlatform} from '../utils/device.util';

// Interceptor that sets the defaultPayload
export const addDefaultPayloadInterceptor = () => (config) => {
  const completeExtraPayload = {
    lang: 'en',
    deviceId: deviceInfo.deviceId,
    deviceName: deviceInfo.deviceName,
    appVersion: currentAppVersion,
    OS: currentPlatform,
    FTXID: uuidV4()
  };

  if (config.method === 'get') {
    config.params = {...completeExtraPayload, ...config.params};
  } else {
    config.data = {...completeExtraPayload, ...config.data};
  }
  return config;
};


// Interceptor that checks the status of the response
export const getStatusValidatorInterceptor = (store) => (response) => {
  const {status} = response;
  if (status >= 200 && status < 300) {
    return response;
  }
  tracker.trackEvent('API_FAILED', `ENDPOINT: ${result(response, 'config.endpoint', 'NOT FOUND')}`, {label: `STATUS_CODE: ${status}`});
  const err = serverStatusHandler(response, store) || serverErrorDataHandler(response, store);
  throw err;
};

// Interceptor that sets mock response
export const mockInterceptor = (config) => {
  if (env.MOCKAPI) {
    console.log('SETTING MOCK for endpoint', config.endpoint); // eslint-disable-line no-console
    config.adapter = mockAdapter;
  }
  return config;
};

const mockAdapter = (config) => new Promise((resolve) => {
  const mockData = result(mockResponses, config.endpoint, {});
  const response = {
    data: mockData.response,
    status: 200,
    statusText: 'OK - Mocked request',
    headers: {mock: true},
    config: config,
  };
  setTimeout(() => resolve(response), 5);
});
