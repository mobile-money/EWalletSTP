import result from 'lodash/result';
import map from 'lodash/map';
import {MainRoutes} from '../routes/index.routes';
import * as constants from '../config/constants.config';
import moment from 'moment';
// GENERAL utility methods
export const wrapObjectInFunction = (obj) => () => obj;

export const wrapMethodInFunction = (method, ...args) => () => method(...args);

export const getCurrentRouteName  = (navigationState) => {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  if (route.routes) {
    return getCurrentRouteName(route);
  }
  return route.routeName;
};

export const filterObjectProperties = (sourceObject = {}, keys = []) => {
  const filtered = {};
  keys.forEach((eachKey) => {
    filtered[eachKey] = sourceObject[eachKey];
  });
  return filtered;
};

export const formatFieldAmount = (value) => {
  const replaceRegex = /(\d)(?=(\d{3})+(?!\d))/g;
  return (!value && parseInt(value) !== 0) ? '' :
        Number(value).toFixed(0).replace(replaceRegex, '$1,');
};

export const currencyFormatter = (unformatted) => {
  const formatted = formatFieldAmount(unformatted);
  return formatted === 'NaN' ? unformatted : formatted;
};

export const getErrorMessage = (error, ifNotPresentMessage) => {
  const parsedMessage = result(error, 'message', ifNotPresentMessage);
  return parsedMessage;
};

export const getCurrentRouteTitle = (nav) => {
  const currentRouteName = result(nav, 'navigation.state.routeName');
  const routeConfig = MainRoutes[currentRouteName];
  return result(routeConfig, 'screenTitle', currentRouteName);
};

export const formatTransactionHistoryListItem = (transactionHistoryItem) => {
  const getTransactionItemType = (transactionItem) => {
    switch (transactionItem.transactionHistoryType) {
    case constants.TH_CREDIT: return 'CREDIT';
    case constants.TH_DEBIT: return 'DEBIT';
    default: return 'ALL';
    }
  };
  return {
    metadata: transactionHistoryItem.metadata,
    amount: currencyFormatter(transactionHistoryItem.amount),
    type: getTransactionItemType(transactionHistoryItem),
    id: transactionHistoryItem.id,
    date: moment(transactionHistoryItem.date).format('Do MMM, h:mm a') // June 6th 2017, 8:14:05 am
  };
};

export const removeFalsy = (object) => {
  const duplicate = {...object};
  const keys = Object.keys(duplicate);
  keys.forEach((eachKey) => {
    if (!duplicate[eachKey] && !([false, 0].includes(duplicate[eachKey]))) {
      delete duplicate[eachKey];
    }
  });
  return duplicate;
};

export const parseServerEValidationErrors = (error) => {
  const {summary, invalidAttributes} = error;
  const getErrorSummaryPerKey = (arrayoferrors) => map(arrayoferrors, 'message').join(',');
  const errordetails =  map(invalidAttributes, (v, k) => [k, getErrorSummaryPerKey(v)].join(':'));
  return {error: 'E_VALIDATION', message: [summary, ...errordetails].join('\n')};
};
