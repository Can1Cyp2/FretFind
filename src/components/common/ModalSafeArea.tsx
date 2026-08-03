/* Wraps a Modal content so its bottom does not get overlapped by the devices safe area,
   the homscreen icon, back button, status bar on Android, and the home indicator plus camera bar/cutout on iOS.
*/

import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export function ModalSafeArea({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
