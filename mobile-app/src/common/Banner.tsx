import React, { useRef, useEffect, useState } from 'react';
import { useWindowDimensions, PanResponder, Animated, LayoutChangeEvent } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Image } from '@gamelog/common/gluestack/image';
import { LinearGradient } from 'expo-linear-gradient';

interface BannerProps {
  heightPercentage?: number;
  minHeight?: number;
  className?: string;
  imageUrl?: string;
  height?: number;
  scrollable?: boolean;
  alignTop?: boolean;
}

export default function Banner({
  heightPercentage = 18,
  minHeight = 140,
  className,
  imageUrl,
  height,
  scrollable = false,
  alignTop = false,
}: BannerProps) {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const calculatedHeight = height ?? Math.max((screenHeight * heightPercentage) / 100, minHeight);
  const [containerWidth, setContainerWidth] = useState(screenWidth);

  useEffect(() => {
    setContainerWidth(screenWidth);
  }, [screenWidth]);

  const activeWidth = containerWidth || screenWidth;
  // Steam header image ratio (460 x 215)
  const naturalImageHeight = Math.round(activeWidth * (215 / 460));
  const minScaledHeight = scrollable ? Math.max(naturalImageHeight, Math.round(calculatedHeight * 1.35)) : naturalImageHeight;
  const imageScaledHeight = Math.max(minScaledHeight, calculatedHeight);
  const maxScroll = Math.max(0, imageScaledHeight - calculatedHeight);
  const initialOffset = alignTop ? 0 : -Math.round(maxScroll / 2);

  const translateY = useRef(new Animated.Value(initialOffset)).current;
  const currentY = useRef(initialOffset);
  const startY = useRef(initialOffset);
  const maxScrollRef = useRef(maxScroll);
  maxScrollRef.current = maxScroll;
  const scrollableRef = useRef(scrollable);
  scrollableRef.current = scrollable;

  useEffect(() => {
    const defaultY = alignTop ? 0 : -Math.round(maxScroll / 2);
    currentY.current = defaultY;
    translateY.setValue(defaultY);
  }, [maxScroll, translateY, alignTop]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        scrollableRef.current && maxScrollRef.current > 0 && Math.abs(gestureState.dy) > 2,
      onMoveShouldSetPanResponderCapture: (_, gestureState) =>
        scrollableRef.current && maxScrollRef.current > 0 && Math.abs(gestureState.dy) > 2,
      onPanResponderGrant: () => {
        translateY.stopAnimation((val) => {
          currentY.current = val;
          startY.current = val;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        const nextY = startY.current + gestureState.dy;
        const clampedY = Math.min(0, Math.max(-maxScrollRef.current, nextY));
        translateY.setValue(clampedY);
      },
      onPanResponderRelease: (_, gestureState) => {
        const nextY = startY.current + gestureState.dy;
        const clampedY = Math.min(0, Math.max(-maxScrollRef.current, nextY));
        currentY.current = clampedY;
        translateY.setValue(clampedY);
      },
      onPanResponderTerminate: () => {
        translateY.stopAnimation((val) => {
          currentY.current = val;
        });
      },
    })
  ).current;

  return (
    <Box
      className={`w-full overflow-hidden relative bg-background-200 ${className ?? ''}`}
      style={{ height: calculatedHeight }}
      onLayout={(e: LayoutChangeEvent) => {
        const { width } = e.nativeEvent.layout;
        if (width > 0 && Math.abs(width - containerWidth) > 1) {
          setContainerWidth(width);
        }
      }}
      {...(scrollable ? panResponder.panHandlers : {})}
    >
      {imageUrl && (
        <>
          {scrollable || alignTop ? (
            <Animated.View
              style={{
                width: '100%',
                height: imageScaledHeight,
                transform: [{ translateY }],
              }}
            >
              <Image
                className="w-full h-full"
                source={{ uri: imageUrl }}
                alt="banner image"
                resizeMode="cover"
                style={{ width: '100%', height: imageScaledHeight }}
              />
            </Animated.View>
          ) : (
            <Image
              className="w-full h-full"
              source={{ uri: imageUrl }}
              alt="banner image"
              resizeMode="cover"
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)']}
            className="absolute bottom-0 left-0 right-0 h-1/2"
            pointerEvents="none"
          />
        </>
      )}
    </Box>
  );
}
