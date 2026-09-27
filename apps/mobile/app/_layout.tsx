import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TravelProvider } from '../src/state/TravelContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <TravelProvider><Slot /></TravelProvider>
    </SafeAreaProvider>
  );
}
