import { forwardRef, ElementType } from 'react';
import { TextInput as RNTextInput, type TextInputProps } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Input, InputField, InputSlot, InputIcon } from '@gamelog/common/gluestack/input';

export interface GLTextInputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  containerClassName?: string;
  leftIcon?: ElementType;
  rightIcon?: ElementType;
  onRightIconPress?: () => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
  className?: string;
}

const FieldLabel = ({ label }: { label?: string }) => {
  if (!label) return null;
  return <Text className="mb-2 font-medium text-typography-100">{label}</Text>;
};

const FieldMessage = ({ error, helper }: { error?: string; helper?: string }) => {
  if (error) {
    return (
      <Text size="xs" className="mt-1 text-error-500">
        {error}
      </Text>
    );
  }
  if (helper) {
    return (
      <Text size="xs" className="mt-1 text-typography-400">
        {helper}
      </Text>
    );
  }
  return null;
};

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
        <FieldLabel label={label} />
        <Input
          isDisabled={isDisabled}
          isInvalid={hasError}
          className="h-12 rounded-xl border border-outline-100 bg-background-50 focus:border-primary-500"
        >
          {LeftIcon ? (
            <InputSlot className="pl-3">
              <InputIcon as={LeftIcon} className="text-typography-400" />
            </InputSlot>
          ) : null}
          <InputField
            ref={ref as any}
            className={`text-typography-0 px-3 ${className}`}
            placeholderTextColor="#9ca3af"
            {...props}
          />
          {RightIcon ? (
            <InputSlot
              className="pr-3"
              onPress={onRightIconPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <InputIcon as={RightIcon} className="text-typography-400" />
            </InputSlot>
          ) : null}
        </Input>
        <FieldMessage error={errorMessage} helper={helperText} />
      </Box>
    );
  }
);

GLTextInput.displayName = 'GLTextInput';
