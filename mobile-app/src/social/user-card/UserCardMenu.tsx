import React, { useState, useRef } from 'react';
import { Animated, Dimensions, Easing, Modal, Platform, Pressable, View } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import Ionicons from '@react-native-vector-icons/ionicons';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';
import { HEX_COLORS } from '@gamelog/theme/hexColors';

export interface UserCardMenuItem {
  label: string;
  icon: string;
  onPress: () => void;
  isDestructive?: boolean;
  testID?: string;
}

export interface UserCardMenuProps {
  items: UserCardMenuItem[];
  isDisabled?: boolean;
  testID?: string;
}

export const UserCardMenu: React.FC<UserCardMenuProps> = ({
  items,
  isDisabled = false,
  testID = 'user-card-menu-btn',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number }>({
    top: 0,
    right: 16,
  });
  const triggerRef = useRef<View>(null);
  const animValue = useRef(new Animated.Value(0)).current;

  if (!items || items.length === 0) {
    return null;
  }

  const startEnterAnimation = () => {
    animValue.setValue(0);
    Animated.timing(animValue, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.ease),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handleClose = (callback?: () => void) => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 100,
      easing: Easing.in(Easing.ease),
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setIsOpen(false);
      callback?.();
    });
  };

  const handleOpen = () => {
    if (isDisabled) return;
    const { width: screenWidth } = Dimensions.get('window');

    if (triggerRef.current) {
      let measured = false;
      triggerRef.current.measureInWindow((x, y, width, height) => {
        measured = true;
        const rightOffset = Math.max(12, screenWidth - (x + width));
        const topOffset = y + height + 8;

        setMenuPosition({
          top: topOffset,
          right: rightOffset,
        });
        setIsOpen(true);
        startEnterAnimation();
      });
      if (!measured) {
        setMenuPosition({
          top: 100,
          right: 16,
        });
        setIsOpen(true);
        startEnterAnimation();
      }
    } else {
      setMenuPosition({
        top: 100,
        right: 16,
      });
      setIsOpen(true);
      startEnterAnimation();
    }
  };

  const handleItemPress = (item: UserCardMenuItem) => {
    item.onPress();
    handleClose();
  };

  const animatedStyle = {
    opacity: animValue,
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1],
        }),
      },
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-6, 0],
        }),
      },
    ],
  };

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          onPress={handleOpen}
          disabled={isDisabled}
          testID={testID}
          hitSlop={8}
          className="w-8 h-8 rounded-lg items-center justify-center border border-outline-100 bg-background-100 active:opacity-70"
        >
          <Ionicons name="ellipsis-horizontal" size={16} color={HEX_COLORS.muted.icon.hex} />
        </Pressable>
      </View>

      <Modal
        visible={isOpen}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={() => handleClose()}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onPress={() => handleClose()}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: menuPosition.top,
                right: menuPosition.right,
              },
              animatedStyle,
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Box className="bg-background-50 border border-outline-100 rounded-xl py-1 shadow-2xl min-w-[160px] z-50 overflow-hidden">
              <VStack space="xs">
                {items.map((item, index) => {
                  const iconColor = item.isDestructive
                    ? HEX_COLORS.social.action.destructive.hex
                    : HEX_COLORS.social.action.add.hex;

                  return (
                    <Pressable
                      key={index}
                      onPress={() => handleItemPress(item)}
                      testID={item.testID}
                      className="flex-row items-center gap-2.5 px-3.5 py-2.5 active:bg-background-100"
                    >
                      <Ionicons name={item.icon as any} size={15} color={iconColor} />
                      <Text
                        size="xs"
                        className={`font-semibold ${
                          item.isDestructive ? 'text-error-500' : 'text-typography-100'
                        }`}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </VStack>
            </Box>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

export default UserCardMenu;
