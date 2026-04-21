import { Text } from '@gamelog/common/gluestack/text';

export const SuccessHeading = ({ message, className }: { message: string; className?: string }) => (
  <Text className={`text-success-600 font-bold ${className}`}>{message}</Text>
);
