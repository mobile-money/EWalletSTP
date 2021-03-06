import {Alert} from 'react-native';
import RNRestart from 'react-native-restart';
import VersionNumber from 'react-native-version-number';
import {wrapMethodInFunction, parseServerEValidationErrors} from './transformer.util';
import {language} from '../config/language';
import tracker from './googleAnalytics.util';
import {sendVerificationMessage, verifyDevice, logout} from '../state/actions/index.thunks';

export const jsErrorHandler = (e = {}, isFatal) => {
  console.log(e); // for logging to android logs or ios logs
  if (isFatal) {
    tracker.trackEvent('FATAL_ERROR', `STACK_TRACE: ${e.stack}`);
    Alert.alert(language.APP_ERROR__TITLE, `${language.APP_ERROR__BODY} App Version: ${VersionNumber.appVersion}`, [{
      text: language.APP_ERROR__RESTART,
      onPress: wrapMethodInFunction(RNRestart.Restart)
    }]);
  } else {
    tracker.trackEvent('NON_FATAL_ERROR', e.stack);
  }
};

export const serverStatusHandler = (response = {}, store) => {
  const {status} = response;
  let data = response.data;
  if (!response.data) {
    data = {};
  }
  switch (status) {
  case 401: {
    store.dispatch(logout());
    return {disableToast: false, ...response.data};
  }
  case 404: {
    return {disableToast: false, message: '404 coudnt find what you were looking for', ...data};
  }
  default: return null; // so that the control goes to serverErrorDataHandler
  }
};

export const serverErrorDataHandler = (response = {}, store) => {
  let data = response.data;
  if (!response.data) {
    data = {};
  }
  switch (data.error) {
  case 'E_VALIDATION': {
    return {disableToast: false, ...parseServerEValidationErrors(data)};
  }
  case 'CUSTOM_VALIDATION': {
    return {disableToast: false, ...parseServerEValidationErrors(data)};
  }
  case 'DEVICE_NOT_VERIFIED': {
    store.dispatch(sendVerificationMessage(data.phone, data.countryCode, verifyDevice()));
    return {disableToast: true, ...data};
  }
  case 'DEVICE_NOT_FOUND': {
    return {disableToast: false, ...data};
  }
  default: return {disableToast: false, ...data};
  }
};
