import map from 'lodash/map';
import result from 'lodash/result';
import * as constants from '../config/constants.config';
import {removeFalsy} from './transformer.util';
// OUTGOING
export const prepareLogin = (phone, password) => ({
  'phone': phone,
  'password': password
});

export const prepareRegister = (phone, password, name, email, countryCode) => ({
  'name': name,
  'phone': phone,
  'password': password,
  'email': email,
  'country_code': countryCode
});

export const prepareConfirmTransfer = (mobileNo, amount) => ({
  'toPhone': mobileNo,
  'amount': amount
});

export const prepareTransfer = (mobileNo, amount) => ({
  'to_phone': mobileNo,
  'amount': amount
});

// INCOMING
export const transformTransactionHistory = (transactionList, currentUser) => {
  const userPhone = result(currentUser, 'phone', null);
  if (!userPhone) {
    return []; // just to make sure if phone doesnt exist
  }
  return map(transactionList, (eachTransaction) => {
    const transactionFrom = result(eachTransaction, 'from_account.phone', null);
    let transactionHistoryType = constants.TH_CREDIT;
    if (transactionFrom === userPhone) {
      transactionHistoryType = constants.TH_DEBIT;
    }
    return {
      ...eachTransaction,
      transactionHistoryType,
      date: eachTransaction.updatedAt
    };
  });
};

export const transformConfirmTransfer = (transactionInfo) => {
  const {amount = '--', finalAmount = '--', transactionFee = '--', destinationAcc = {}} = transactionInfo;
  const payeeName = result(destinationAcc, 'userprofile.name', '--');
  const payeePhone = result(destinationAcc, 'phone', '--');
  return {
    'payeeName': String(payeeName),
    'payeePhone': String(payeePhone),
    'amount': String(amount),
    'totalAmount': String(finalAmount),
    'fee': String(transactionFee)
  };
};

export const transformTransferResponse = (rawTransferResponse) => {
  const transferResponse = removeFalsy(rawTransferResponse);
  return {
    amount: transferResponse.amount,
    fee: transferResponse.fee,
    totalAmount: transferResponse.finalAmount,
    transactionId: transferResponse.id,
  // payeeName: transferResponse.payeeName, //TODO
  // payeePhone: transferResponse.payeePhone
  };
};


export const transformErrorTransferResponse = (err) => {
  const {transferDetails} = err;
  const transferResponse = removeFalsy(transferDetails);
  return {
    amount: transferResponse.amount,
    fee: transferResponse.fee,
    totalAmount: transferResponse.finalAmount,
    transactionId: transferResponse.id,
  // payeeName: transferResponse.payeeName, //TODO
  // payeePhone: transferResponse.payeePhone
  };
};
