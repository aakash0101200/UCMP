import { Colors } from '@/constants/theme';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const Trigger = NativeTabs.Trigger as any;

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <Trigger name="index">
        <Trigger.Label>Home</Trigger.Label>
        <Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </Trigger>

      <Trigger name="explore">
        <Trigger.Label>Explore</Trigger.Label>
        <Trigger.Icon
          src={require('../../assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </Trigger>
    </NativeTabs>
  );
}
