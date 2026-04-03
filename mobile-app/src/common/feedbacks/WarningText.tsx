import { Text } from '@gamelog/common/gluestack/text';

export const WarningText = ({ message, className }: { message: string; className?: string }) => (
  <Text className={`text-warning-700 text-sm leading-4 ${className}`}>{message}</Text>
);
