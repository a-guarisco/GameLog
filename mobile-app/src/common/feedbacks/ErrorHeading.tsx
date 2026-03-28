import { Text } from '@gamelog/components/ui/text';

export const ErrorHeading = ({ message, className }: { message: string; className?: string }) => (
  <Text className={`text-error-600 font-bold ${className}`}>{message}</Text>
);
