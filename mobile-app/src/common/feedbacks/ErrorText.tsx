import { Text } from '@gamelog/common/gluestack/text';

export const ErrorText = ({ message, className }: { message: string; className?: string }) => (
  <Text className={`text-error-600 text-sm leading-4 ${className}`}>{message}</Text>
);
