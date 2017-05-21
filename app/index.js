/* global GLOBAL */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React from 'react';
import {AppRegistry} from 'react-native';
import {wrapObjectInFunction} from './utils/transformer.util';
import {Provider} from 'react-redux';
import {initStore} from './state/store';
import {setCurrent} from './config/language';
import result from 'lodash/result';
import App from './App.container';
import {setJSExceptionHandler} from 'react-native-exception-handler';
import errorHandler from './utils/errorHandler.util';

setJSExceptionHandler(errorHandler);

const store = initStore();
store.subscribe(() => {
  const currentLanguage = result(store.getState(), 'currentLanguage.label', 'English');
  setCurrent(currentLanguage); // THIS MIGHT BE A BOTTLENEXT //TODO
});
// ===========================================
// ===========================================
// CONFIG FOR MAKING NETWORK REQUEST SHOW UP
// ON DEBUGGER
// ===========================================
GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;
GLOBAL.FormData = GLOBAL.originalFormData || GLOBAL.FormData;
// ===========================================
const EwalletSTP = () => (
  <Provider store={store}>
    <App/>
  </Provider>
);
//
export default EwalletSTP;
AppRegistry.registerComponent('EwalletSTP', wrapObjectInFunction(EwalletSTP));
