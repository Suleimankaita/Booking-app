import { store } from '@/components/api/Store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ReaderProvider } from '@epubjs-react-native/core';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaystackProvider } from 'react-native-paystack-webview';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (

     <PaystackProvider  debug={false} defaultChannels={['card','bank_transfer','mobile_money','bank','eft','ussd']}
      currency='NGN' publicKey="pk_live_9144bdf3abd12781f355056b32b05f8ebf169ed9" 
      >
    <Provider store={store}>
    <ReaderProvider>

    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="Reader/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </ReaderProvider>
    </Provider>
</PaystackProvider>
  );
}
