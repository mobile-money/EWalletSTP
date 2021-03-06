import React from 'react';
import PropTypes from 'prop-types';
import {WebView, View, Text, ActivityIndicator} from 'react-native';
import styles from './GatewayWeb.component.style';
import RNIcon from '../../assets/fonts/RNIcon';
import Touchable from '../Touchable/Touchable.component';
import isMatch from 'lodash/isMatch';
import noop from 'lodash/noop';
import {language} from '../../config/language';

const htmlStyle = `
<style>
*{
 max-width: 100%;
}
body {
 font-family: sans-serif;
 padding:0;
 margin:0;
}
#iframe-payment-container{
	 border: transparent;
   padding: 0;
   margin:0;
}
</style>
`;

class GatewayWeb extends React.Component {
  static propTypes = {
    webpageHtml: PropTypes.string,
    onAbortPayment: PropTypes.func,
    onPaymentResult: PropTypes.func,
    toggleSpinner: PropTypes.func,
    orderRef: PropTypes.string,
    redirectUrl: PropTypes.string
  }
  state = {
    webViewLoading: false
  }
  onChange = (navState) => {
    const {onPaymentResult = noop} = this.props;
    this.setState({webViewLoading: navState.loading});
    if (this.isPaymentComplete(navState)) {
      onPaymentResult();
    }
  }
  isPaymentComplete = (navState) => {
    const {redirectUrl} = this.props;
    const reachedEnd = isMatch(navState, {loading: false, navigationType: 'formsubmit', url: redirectUrl});
    return reachedEnd;
  }
  render () {
    const {webpageHtml, orderRef, onAbortPayment = noop} = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          {this.state.webViewLoading ? <ActivityIndicator /> : null}
          <Text style={styles.title}>{language.GATEWAY_WEB__TITLE}: {orderRef}</Text>
          <Touchable onPress={onAbortPayment} style={styles.iconContainer}>
            <RNIcon {...styles.icon} name='close, remove, times' />
          </Touchable>
        </View>
        <WebView
          source={{html: htmlStyle + webpageHtml}}
           onNavigationStateChange={this.onChange}
           javaScriptEnabled = {true}
           domStorageEnabled = {true}
          />
      </View>
    );
  }
}

export default GatewayWeb;
