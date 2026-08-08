import { ScrollView } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Card } from '@gamelog/common/gluestack/card';
import { BackendHealthCheck } from './BackendHealthCheck';
import EndPoints from '@gamelog/api-manager/apiEndsPoints';

export const DevBackendView = () => {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Box className="flex-1 justify-start gap-2.5 px-4 py-4">
        <Box className="mb-1">
          <Text className="text-xl font-bold text-typography-0">Backend & Endpoints</Text>
        </Box>

        {/* Health Check Card */}
        <Card
          variant="elevated"
          className="w-full max-w-[640px] self-center p-3.5 gap-2 bg-background-50 rounded-md"
        >
          <Text className="text-sm font-semibold text-typography-0">Backend Status & Ping</Text>
          <BackendHealthCheck className="w-full" />
        </Card>

        {/* Active Endpoints Card */}
        <Card
          variant="elevated"
          className="w-full max-w-[640px] self-center p-3.5 gap-2 bg-background-50 rounded-md"
        >
          <Text className="text-sm font-semibold text-typography-0">Configured Endpoints</Text>
          <Box className="gap-2.5">
            <Box className="pb-1.5 border-b border-outline-200/30">
              <Text className="text-xs font-bold text-typography-0">GET Health</Text>
              <Text className="text-xs text-typography-100 font-mono">
                {EndPoints.getBackendHealth()}
              </Text>
            </Box>

            <Box className="pb-1.5 border-b border-outline-200/30">
              <Text className="text-xs font-bold text-typography-0">GET Auth Me</Text>
              <Text className="text-xs text-typography-100 font-mono">
                {EndPoints.getAuthOutcome()}
              </Text>
            </Box>

            <Box className="pb-1.5 border-b border-outline-200/30">
              <Text className="text-xs font-bold text-typography-0">POST Register User</Text>
              <Text className="text-xs text-typography-100 font-mono">
                {EndPoints.registerUser()}
              </Text>
            </Box>

            <Box>
              <Text className="text-xs font-bold text-typography-0">GET User Me</Text>
              <Text className="text-xs text-typography-100 font-mono">{EndPoints.getUserMe()}</Text>
            </Box>
          </Box>
        </Card>
      </Box>
    </ScrollView>
  );
};
