import { View, Text } from 'react-native';

export const commonGLMocks = {
  ViewGL: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  TextGL: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
};
