import { Text } from '@gamelog/common/gluestack/text';

export const WarningHeading = ({ message, className }: { message: string; className?: string }) => (
  <Text className={`text-warning-600 font-bold ${className}`}>{message}</Text>
);
