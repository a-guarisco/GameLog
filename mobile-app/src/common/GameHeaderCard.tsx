import { ReactNode } from 'react';
import { Text } from '@gamelog/common/gluestack/text';
import { Box } from '@gamelog/common/gluestack/box';
import { Image } from '@gamelog/common/gluestack/image';
import { Card } from '@gamelog/common/gluestack/card';
import { Pressable } from 'react-native';
import apiEndsPoints from '@gamelog/api-manager/apiEndsPoints';

interface GameHeaderCardProps {
  name: string;
  appid: string;
  onPress?: () => void;
  children?: ReactNode;
}

export const GameHeaderCard = ({ name, appid, onPress, children }: GameHeaderCardProps) => {
  const imageUrl = apiEndsPoints.GET_GAME_HEADER_IMAGE(appid);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${name}`}
    >
      <Card
        variant="outline"
        className="m-1 p-2 bg-background-100 border-outline-100 rounded-none overflow-hidden shadow-lg"
      >
        <Text className="font-bold mb-2 text-typography-0" numberOfLines={1}>
          {name}
        </Text>
        <Box className="bg-background-50 rounded-md items-center justify-center overflow-hidden">
          <Image
            source={imageUrl}
            alt={`${name} header`}
            className="w-full h-32"
            resizeMode="contain"
          />
        </Box>
        {children}
      </Card>
    </Pressable>
  );
};
