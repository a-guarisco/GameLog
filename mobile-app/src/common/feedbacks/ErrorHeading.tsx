import { Text } from '@gamelog/common/gluestack/text';

export const ErrorHeading = ({ message, className }: { message: string; className?: string }) => (
  <Text className={`text-error-600 font-bold ${className}`}>{message}</Text>
);
