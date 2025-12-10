import { store } from '@/components/api/Store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ReaderProvider } from '@epubjs-react-native/core';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaystackProvider } from 'react-native-paystack-webview';
import 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { GetRoute } from '../../components/Funcslice';
import { Provider } from 'react-redux';
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const route=useSelector(GetRoute)
  return (

    

    // <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      
      <Stack>
        <Stack.Screen name="(tabs)" options={{title:"Home", headerShown: false }} />
        <Stack.Screen name="(ReaderDetails)" options={{ title:route,headerShown: true }} />
        <Stack.Screen name="(Users)/[id]" options={{ title:route,headerShown: true }} />
        <Stack.Screen name="(AllBooksDetails)/[id]" options={{ title:route,headerShown: true }} />
        <Stack.Screen name="Reader/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="(Reg)/Sign" options={{ headerShown: false }} />
        <Stack.Screen name="(Reg)/Login" options={{title:"Login", headerShown: false }} />
        <Stack.Screen name="(Reg)/otp" options={{title:"ResetPassword", headerShown: true }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <StatusBar style="inverted" />
      </Stack>
    // </ThemeProvider>
  );
}
