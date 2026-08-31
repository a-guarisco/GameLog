import { useState, useRef, useEffect } from 'react';
import { Pressable, Animated, View } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';

export interface GLSegmentOption<T extends string = string> {
  id: T;
  label: string;
  testID?: string;
}

export interface GLSegmentedControlProps<T extends string = string> {
  options: GLSegmentOption<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  className?: string;
  isOnCard?: boolean;
}

export const GLSegmentedControl = <T extends string = string>({
  options,
  activeId,
  onSelect,
  className = '',
  isOnCard = false,
}: GLSegmentedControlProps<T>) => {
  const activeIndex = options.findIndex((opt) => opt.id === activeId);

  const [containerWidth, setContainerWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const containerPadding = isOnCard ? 4 : 6;
  const segmentWidth =
    containerWidth > 0 ? (containerWidth - containerPadding * 2) / options.length : 0;

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

  // --- Layout Variables ---
  const containerVariantClasses = isOnCard
    ? 'p-1 bg-background-100 dark:bg-background-100'
    : 'p-1.5 bg-background-50 dark:bg-background-50';

  const pressableVariantClasses = isOnCard ? 'pt-1.5 pb-0.5 px-2' : 'py-2 px-4';
  const textSize = isOnCard ? 'xs' : 'sm';

  const activeIndicatorStyle = {
    top: containerPadding,
    bottom: containerPadding,
    left: containerPadding,
    width: segmentWidth,
    transform: [{ translateX: slideAnim }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: isOnCard ? 1 : 2 },
    shadowOpacity: isOnCard ? 0.2 : 0.25,
    shadowRadius: isOnCard ? 2 : 3.84,
    elevation: isOnCard ? 2 : 5,
  };

  return (
    <Box className="w-full">
      <View
        className={`flex-row ${containerVariantClasses} rounded-full ${className}`}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {segmentWidth > 0 && (
          <Animated.View
            className="absolute rounded-full bg-primary-500"
            style={activeIndicatorStyle}
          />
        )}
        {options.map((option) => {
          return (
            <Pressable
              key={option.id}
              onPress={() => onSelect(option.id)}
              testID={option.testID}
              className={`flex-1 ${pressableVariantClasses} items-center justify-center z-10`}
            >
              <Text size={textSize} className="font-semibold text-typography-0">
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Box>
  );
};
