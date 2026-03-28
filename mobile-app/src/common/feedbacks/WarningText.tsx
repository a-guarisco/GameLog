import { Text } from '@gamelog/components/ui/text';

export const WarningText = ({ message, className }: { message: string; className?: string }) => (
  <Text className={`text-warning-700 text-sm leading-4 ${className}`}>{message}</Text>
);
