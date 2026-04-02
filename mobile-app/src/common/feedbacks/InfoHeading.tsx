import { Text } from '@gamelog/common/gluestack/text';

export const InfoHeading = ({ message, className }: { message: string; className?: string }) => (
  <Text className={`text-info-600 font-bold ${className}`}>{message}</Text>
);
