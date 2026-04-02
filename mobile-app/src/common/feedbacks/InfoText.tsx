import { Text } from '@gamelog/common/gluestack/text';

export const InfoText = ({ message, className }: { message: string; className?: string }) => (
  <Text className={`text-typography-200 text-sm leading-4 ${className}`}>{message}</Text>
);
