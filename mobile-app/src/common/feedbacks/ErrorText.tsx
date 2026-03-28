import { Text } from '@gamelog/components/ui/text';

export const ErrorText = ({ message, className }: { message: string; className?: string }) => (
  <Text className={`text-error-700 text-sm leading-4 ${className}`}>{message}</Text>
);
