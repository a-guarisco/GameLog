import { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useOrientation } from '@gamelog/common/useOrientation';
import { rawConfig } from '@gamelog/common/gluestack/gluestack-ui-provider/config';
import { parseRGB } from '@gamelog/common/charts/chartsHelpers';

// Tab definitions with label and icons
export const TAB_CONFIG: Record<
  string,
  { label: string; defaultIcon: string; focusedIcon: string }
> = {
  GameListTab: {
    label: 'Games',
    defaultIcon: 'game-controller',
    focusedIcon: 'game-controller',
  },
  ProfileTab: {
    label: 'Profile',
    defaultIcon: 'person',
    focusedIcon: 'person',
  },
  SocialTab: {
    label: 'Social',
    defaultIcon: 'people',
    focusedIcon: 'people',
  },
  DevTab: {
    label: 'Dev',
    defaultIcon: 'construct',
    focusedIcon: 'construct',
  },
};

/**
 * Adaptive navigation tab bar:
 * - Portrait:  Horizontal bottom bar with icons and text labels.
 * - Landscape: Absolute left rail (vertically centered items), with safe-area
 *              clearance for the camera notch / Dynamic Island.
 */
export const AdaptiveTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const { isLandscape } = useOrientation();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? rawConfig.dark : rawConfig.light;

  const barBg = parseRGB(theme['--color-background-50']);
  const borderColor = parseRGB(theme['--color-outline-100']);
  const activeColor = parseRGB(theme['--color-primary-400']);
  const inactiveColor = parseRGB(theme['--color-typography-400']);

  const handlePress = useCallback(
    (routeName: string, isFocused: boolean) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: routeName,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    },
    [navigation]
  );

  if (isLandscape) {
    const railWidth = insets.left + 74;

    return (
      <View
        style={[
          styles.rail,
          {
            width: railWidth,
            backgroundColor: barBg,
            borderRightColor: borderColor,
            paddingLeft: insets.left,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={styles.railContent}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const config = TAB_CONFIG[route.name] ?? {
              label: route.name,
              defaultIcon: 'ellipse',
              focusedIcon: 'ellipse',
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => handlePress(route.name, focused)}
                style={styles.railItem}
                accessibilityRole="tab"
                accessibilityLabel={config.label}
                accessibilityState={{ selected: focused }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={(focused ? config.focusedIcon : config.defaultIcon) as any}
                  size={22}
                  color={focused ? activeColor : inactiveColor}
                />
                <Text
                  style={[
                    styles.railLabel,
                    {
                      color: focused ? activeColor : inactiveColor,
                      fontWeight: focused ? '700' : '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  // Portrait bottom tab bar
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 4);

  return (
    <View
      style={[
        styles.bottomBar,
        {
          backgroundColor: barBg,
          borderTopColor: borderColor,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const config = TAB_CONFIG[route.name] ?? {
          label: route.name,
          defaultIcon: 'ellipse',
          focusedIcon: 'ellipse',
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => handlePress(route.name, focused)}
            style={styles.bottomItem}
            accessibilityRole="tab"
            accessibilityLabel={config.label}
            accessibilityState={{ selected: focused }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(focused ? config.focusedIcon : config.defaultIcon) as any}
              size={22}
              color={focused ? activeColor : inactiveColor}
            />
            <Text
              style={[
                styles.bottomLabel,
                {
                  color: focused ? activeColor : inactiveColor,
                  fontWeight: focused ? '700' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  /* ── Landscape Rail ── */
  rail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    height: '100%',
    zIndex: 50,
    borderRightWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center', // Vertically centered items
  },
  railContent: {
    width: 74,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  railItem: {
    width: 62,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railLabel: {
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
  },

  /* ── Portrait Bottom Bar ── */
  bottomBar: {
    width: '100%',
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  bottomLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});
