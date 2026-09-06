import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';

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

export const ExpoEnvInfo = () => {
  const envObj = process.env || {};
  const publicKeys = Object.keys(envObj).filter((key) => key.startsWith('EXPO_PUBLIC_'));

  const defaultKeys = ['EXPO_PUBLIC_BACKEND_BASE_URL'];
  const allKeys = Array.from(new Set([...defaultKeys, ...publicKeys])).sort();

  return (
    <Box className="gap-3">
      {allKeys.map((key) => {
        const rawValue = envObj[key];
        const isSensitive =
          key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD');
        const displayValue = isSensitive
          ? getStableHash(rawValue)
          : (rawValue ?? 'missing / undefined');

        return (
          <Box key={key} className="gap-0.5 pb-2 border-b border-outline-200/30 last:border-b-0">
            <Text className="text-xs font-bold text-typography-0">{key}</Text>
            <Text className="text-xs text-typography-100 font-mono">{displayValue}</Text>
          </Box>
        );
      })}
    </Box>
  );
};
