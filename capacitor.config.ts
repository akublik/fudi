
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fudichef.app',
  appName: 'Fudi Chef',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
