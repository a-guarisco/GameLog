import { useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useColorScheme } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useOrientation } from '@gamelog/common/useOrientation';
import { rawConfig } from '@gamelog/common/gluestack/gluestack-ui-provider/config';

export interface TabConfig {
  key: string;
  label: string;
  icon: string;
  iconFocused: string;
}

interface LandscapeTabLayoutProps {
  tabs: TabConfig[];
  activeKey: string;
  onTabPress: (key: string) => void;
  children: React.ReactNode;
}

/**
 * Root navigation shell that adapts to orientation:
 * - Portrait  → bottom tab bar (handled by React Navigation's built-in tab bar)
 * - Landscape → left vertical rail + content area side by side
 *
 * In landscape the component renders its own shell; in portrait it renders
 * nothing extra so React Navigation's bottom tab bar takes over normally.
 */
const LandscapeTabLayout = ({
  tabs,
  activeKey,
  onTabPress,
  children,
}: LandscapeTabLayoutProps) => {
  const { isLandscape } = useOrientation();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? rawConfig.dark : rawConfig.light;

  const bg = `rgb(${theme['--color-background-0']})`;
  const railBg = `rgb(${theme['--color-background-50']})`;
  const borderColor = `rgb(${theme['--color-outline-100']})`;
  const activeColor = `rgb(${theme['--color-primary-400']})`;
  const inactiveColor = `rgb(${theme['--color-typography-400']})`;

  const handlePress = useCallback(
    (key: string) => {
      onTabPress(key);
    },
    [onTabPress]
  );

  if (!isLandscape) {
    // Portrait: just render the content; React Navigation handles the bottom bar.
    return <>{children}</>;
  }

  // Landscape: render left rail + content
  return (
    <View style={[styles.landscapeRoot, { backgroundColor: bg }]}>
      {/* Left navigation rail */}
      <SafeAreaView style={[styles.rail, { backgroundColor: railBg, borderRightColor: borderColor }]}>
        {tabs.map((tab) => {
          const focused = tab.key === activeKey;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handlePress(tab.key)}
              style={[
                styles.railItem,
                focused && { backgroundColor: `rgb(${theme['--color-primary-500']})1A` },
              ]}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: focused }}
            >
              <Ionicons
                name={(focused ? tab.iconFocused : tab.icon) as any}
                size={24}
                color={focused ? activeColor : inactiveColor}
              />
            </TouchableOpacity>
          );
        })}
      </SafeAreaView>

      {/* Content area */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  landscapeRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  rail: {
    width: 64,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 4,
  },
  railItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
});

export default LandscapeTabLayout;
