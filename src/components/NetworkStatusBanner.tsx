import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const NetworkStatusBanner = () => {
  const { t } = useTranslation();
  const { isConnected } = useNetworkStatus();

  if (isConnected) return null;

  return (
    <View className="bg-yellow-500 px-4 py-2 flex-row items-center justify-center">
      <WifiOff size={16} color="#ffffff" />
      <Text className="text-white font-medium ml-2">
        {t('common.offline')}
      </Text>
    </View>
  );
};
