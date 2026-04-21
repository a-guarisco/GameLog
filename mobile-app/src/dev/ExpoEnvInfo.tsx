import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { InfoBox } from '@gamelog/common/feedbacks';

const getStableHash = (value: string | undefined): string => {
  if (!value) {
    return 'missing';
  }

  let hash1 = 0xdeadbeef ^ value.length;
  let hash2 = 0x41c6ce57 ^ value.length;

  for (let index = 0; index < value.length; index += 1) {
    const characterCode = value.charCodeAt(index);
    hash1 = Math.imul(hash1 ^ characterCode, 2654435761);
    hash2 = Math.imul(hash2 ^ characterCode, 1597334677);
  }

  hash1 =
    Math.imul(hash1 ^ (hash1 >>> 16), 2246822507) ^ Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
  hash2 =
    Math.imul(hash2 ^ (hash2 >>> 16), 2246822507) ^ Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);

  return `hash:${((hash2 >>> 0).toString(16) + (hash1 >>> 0).toString(16)).padStart(16, '0')}`;
};

const envInfoRows = [
  {
    label: 'EXPO_PUBLIC_API_PROVIDER',
    value: process.env.EXPO_PUBLIC_API_PROVIDER ?? 'steam',
  },
  {
    label: 'EXPO_PUBLIC_BACKEND_BASE_URL',
    value: process.env.EXPO_PUBLIC_BACKEND_BASE_URL ?? 'missing',
  },
  {
    label: 'EXPO_PUBLIC_STEAM_API_KEY',
    value: getStableHash(process.env.EXPO_PUBLIC_STEAM_API_KEY),
  },
];

export const ExpoEnvInfo = () => (
  <Box className="gap-2">
    <Box className="gap-2 bg-background-0 px-4 py-3">
      {envInfoRows.map((row) => (
        <Box key={row.label} className="gap-1">
          <Text className="text-sm font-semibold text-typography-50">{row.label}</Text>
          <Text className="text-sm text-typography-300">{row.value}</Text>
        </Box>
      ))}
    </Box>
  </Box>
);
