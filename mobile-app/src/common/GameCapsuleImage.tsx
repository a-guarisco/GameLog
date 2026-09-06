import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Easing,
  View,
  StyleProp,
  ViewStyle,
  ImageResizeMode,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import { HEX_COLORS } from '@gamelog/theme/hexColors';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { rawConfig } from '@gamelog/common/gluestack/gluestack-ui-provider/config';
import { parseRGB } from '@gamelog/common/charts/chartsHelpers';

export interface GameCapsuleImageProps {
  appId?: string | number;
  uri?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  resizeMode?: ImageResizeMode;
  testID?: string;
}

export const GameCapsuleImage: React.FC<GameCapsuleImageProps> = ({
  appId,
  uri,
  width = 88,
  height = 52,
  borderRadius = 6,
  style,
  resizeMode = 'cover',
  testID,
}) => {
  const imageUri = uri ?? (appId ? steamAssetUrls.getGameCapsuleImage(appId) : undefined);
  const [isLoading, setIsLoading] = useState<boolean>(!!imageUri);
  const [hasError, setHasError] = useState<boolean>(false);

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? rawConfig.dark : rawConfig.light;
  const iconColor = parseRGB(theme['--color-typography-400']);
  const iconSize = Math.max(16, Math.min(28, Math.round(height * 0.46)));

  useEffect(() => {
    setIsLoading(!!imageUri);
    setHasError(false);
    opacityAnim.setValue(0);
  }, [imageUri, opacityAnim]);

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isLoading && !hasError) {
      loop = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
    } else {
      shimmerAnim.setValue(-1);
    }

    return () => {
      if (loop) {
        loop.stop();
      }
      shimmerAnim.setValue(-1);
    };
  }, [isLoading, hasError, shimmerAnim]);

  const handleLoad = () => {
    setIsLoading(false);
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const resolvedTestID = testID ?? (appId ? `game-capsule-${appId}` : undefined);
  const showFallbackIcon = !isLoading && (hasError || !imageUri);

  return (
    <View
      testID={resolvedTestID}
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: HEX_COLORS.muted.divider.hex,
          overflow: 'hidden',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {/* Fallback Game Controller Icon on missing image or error */}
      {showFallbackIcon && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { alignItems: 'center', justifyContent: 'center' },
          ]}
          testID={resolvedTestID ? `${resolvedTestID}-fallback-icon` : 'game-capsule-fallback-icon'}
        >
          <Ionicons name="game-controller" size={iconSize} color={iconColor} />
        </View>
      )}

      {/* Animated Capsule Image */}
      {!!imageUri && !hasError && (
        <Animated.Image
          source={{ uri: imageUri }}
          style={[
            StyleSheet.absoluteFillObject,
            {
              width: '100%',
              height: '100%',
              opacity: opacityAnim,
            },
          ]}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
          testID={resolvedTestID ? `${resolvedTestID}-img` : undefined}
        />
      )}

      {/* Shimmer Skeleton during loading */}
      {isLoading && !hasError && (
        <View
          pointerEvents="none"
          testID={resolvedTestID ? `${resolvedTestID}-shimmer` : 'game-capsule-shimmer'}
          style={StyleSheet.absoluteFillObject}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                transform: [
                  {
                    translateX: shimmerAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [-width * 2, width * 2],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.25)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        </View>
      )}
    </View>
  );
};

export default GameCapsuleImage;
