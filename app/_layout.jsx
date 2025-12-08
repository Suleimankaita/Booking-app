import Stack from "./Stack/Stack"
import { Provider } from 'react-redux';
import { store } from '@/components/api/Store';
import { ReaderProvider } from '@epubjs-react-native/core';
import { PaystackProvider } from 'react-native-paystack-webview';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {

  return (
    <Provider store={store}>
    <ReaderProvider>
    
    <PaystackProvider  debug={false} defaultChannels={['card','bank_transfer','mobile_money','bank','eft','ussd']}
      currency='NGN' publicKey="pk_live_9144bdf3abd12781f355056b32b05f8ebf169ed9" >
        <Stack/>
      </PaystackProvider>
    </ReaderProvider>
    </Provider>
  )
}
