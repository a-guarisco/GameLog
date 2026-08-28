import { Text } from '@gamelog/common/gluestack/text';

export const PageTitle = ({ children, className = '', size = 'xl', ...props }: any) => {
  return (
    <Text
      size={size}
      className={`font-bold tracking-wide text-typography-0 ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
};
