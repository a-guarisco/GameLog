import React, { forwardRef } from 'react';
import { TextInput as RNTextInput, type ComponentProps } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Input, InputField, InputSlot, InputIcon } from '@gamelog/common/gluestack/input';

export interface GLTextInputProps extends ComponentProps<typeof InputField> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  containerClassName?: string;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
  onRightIconPress?: () => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
}

export const GLTextInput = forwardRef<RNTextInput, GLTextInputProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      containerClassName = '',
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      onRightIconPress,
      isDisabled = false,
      isInvalid = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = isInvalid || Boolean(errorMessage);

    return (
      <Box className={`w-full ${containerClassName}`}>
        {label ? (
          <Text className="mb-2 font-medium text-typography-800 dark:text-typography-200">
            {label}
          </Text>
        ) : null}
        <Input
          isDisabled={isDisabled}
          isInvalid={hasError}
          className="h-12 rounded-xl border border-outline-100 bg-background-50 dark:bg-background-50 focus:border-primary-500"
        >
          {LeftIcon ? (
            <InputSlot className="pl-3">
              <InputIcon as={LeftIcon} className="text-typography-400" />
            </InputSlot>
          ) : null}
          <InputField
            ref={ref}
            className={`text-typography-900 dark:text-typography-50 px-3 ${className}`}
            placeholderTextColor="#9ca3af"
            {...props}
          />
          {RightIcon ? (
            <InputSlot className="pr-3" onPress={onRightIconPress}>
              <InputIcon as={RightIcon} className="text-typography-400" />
            </InputSlot>
          ) : null}
        </Input>
        {errorMessage ? (
          <Text size="xs" className="mt-1 text-error-500">
            {errorMessage}
          </Text>
        ) : helperText ? (
          <Text size="xs" className="mt-1 text-typography-400">
            {helperText}
          </Text>
        ) : null}
      </Box>
    );
  }
);

GLTextInput.displayName = 'GLTextInput';
