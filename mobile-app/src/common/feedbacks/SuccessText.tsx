import { Text } from '@gamelog/common/gluestack/text';

export const SuccessText = ({ message, className }: { message: string; className?: string }) => (
  <Text className={`text-success-600 text-sm leading-4 ${className}`}>{message}</Text>
);
