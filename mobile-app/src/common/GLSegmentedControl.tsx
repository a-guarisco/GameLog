import React, { useState, useRef, useEffect } from 'react';
import { Pressable, Animated, View } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';

export interface GLSegmentOption<T extends string = string> {
  id: T;
  label: string;
  component?: React.ReactNode;
  testID?: string;
}

export interface GLSegmentedControlProps<T extends string = string> {
  options: GLSegmentOption<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  className?: string;
  contentContainerClassName?: string;
}

export function GLSegmentedControl<T extends string = string>({
  options,
  activeId,
  onSelect,
  className = '',
  contentContainerClassName = '',
}: GLSegmentedControlProps<T>) {
  const activeOption = options.find((opt) => opt.id === activeId);
  const activeIndex = options.findIndex((opt) => opt.id === activeId);

  const [containerWidth, setContainerWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 12 = 6px left padding + 6px right padding (p-1.5 is 6px)
  const segmentWidth = containerWidth > 0 ? (containerWidth - 12) / options.length : 0;

  useEffect(() => {
    if (segmentWidth > 0) {
      Animated.spring(slideAnim, {
        toValue: activeIndex * segmentWidth,
        useNativeDriver: true,
        bounciness: 0,
        speed: 12,
      }).start();
    }
  }, [activeIndex, segmentWidth, slideAnim]);

  return (
    <Box className="w-full">
      <View
        className={`flex-row p-1.5 rounded-full bg-background-50 dark:bg-background-50 ${className}`}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {segmentWidth > 0 && (
          <Animated.View
            className="absolute top-1.5 bottom-1.5 rounded-full bg-primary-500"
            style={{
              left: 6,
              width: segmentWidth,
              transform: [{ translateX: slideAnim }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          />
        )}
        {options.map((option) => {
          return (
            <Pressable
              key={option.id}
              onPress={() => onSelect(option.id)}
              testID={option.testID}
              className="flex-1 py-2 px-4 items-center justify-center z-10"
            >
              <Text size="sm" className="font-semibold text-typography-0">
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeOption?.component ? (
        <Box className={`mt-4 ${contentContainerClassName}`}>{activeOption.component}</Box>
      ) : null}
    </Box>
  );
}
