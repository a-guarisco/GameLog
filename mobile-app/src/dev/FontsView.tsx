import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { ScrollView } from 'react-native';
import { DevScreenWrapper } from './DevScreenWrapper';

export const FontsView = () => {
  return (
    <DevScreenWrapper>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Box className="flex-1 items-left justify-center px-4">
          <Text className="font-thin">This is the Fonts View! - thin</Text>
          <Text className="font-extralight">This is the Fonts View! - extralight</Text>
          <Text className="font-light">This is the Fonts View! - light</Text>
          <Text className="font-regular">This is the Fonts View! - regular</Text>
          <Text className="font-medium">This is the Fonts View! - medium</Text>
          <Text className="font-semibold">This is the Fonts View! - semibold</Text>
          <Text className="font-bold">This is the Fonts View! - bold</Text>
          <Text className="font-extrabold">This is the Fonts View! - extrabold</Text>
          <Text className="font-bblack">This is the Fonts View! - black</Text>
          <Text className="font-thin">#######################################</Text>
          <Text className="font-thin-italic">This is the Fonts View! - thin italic</Text>
          <Text className="font-extralight-italic">
            This is the Fonts View! - extralight italic
          </Text>
          <Text className="font-light-italic">This is the Fonts View! - light italic</Text>
          <Text className="font-regular-italic">This is the Fonts View! - regular italic</Text>
          <Text className="font-italic">This is the Fonts View! - italic</Text>
          <Text className="font-medium-italic">This is the Fonts View! - medium italic</Text>
          <Text className="font-semibold-italic">This is the Fonts View! - semibold italic</Text>
          <Text className="font-bold-italic">This is the Fonts View! - bold italic</Text>
          <Text className="font-extrabold-italic">This is the Fonts View! - extrabold italic</Text>
          <Text className="font-bblack-italic">This is the Fonts View! - black italic</Text>
          <Text className="font-thin">#######################################</Text>
          <Text className="font-mono">This is the Fonts View! - code</Text>
          <Text className="font-body">This is the Fonts View! - body</Text>
          <Text className="font-heading">This is the Fonts View! - heading</Text>
          <Text className="font-thin">#######################################</Text>
          <Text className="font-body">This is the Fonts View! - body</Text>
          <Text className="font-regular">This is the Fonts View! - regular</Text>
          <Text className="font-normal">This is the Fonts View! - normal</Text>
          <Text className="font-thin">#######################################</Text>
          <Text className="font-body-italic">This is the Fonts View! - body italic</Text>
          <Text className="font-regular-italic">This is the Fonts View! - regular</Text>
          <Text className="font-normal-italic">This is the Fonts View! - normal italic</Text>
          <Text className="font-thin">#######################################</Text>
          <Text className="font-heading">This is the Fonts View! - heading</Text>
          <Text className="font-bold">This is the Fonts View! - bold</Text>
          <Text className="font-thin">#######################################</Text>
          <Text className="font-heading-italic">This is the Fonts View! - heading italic</Text>
          <Text className="font-bold-italic">This is the Fonts View! - bold italic</Text>
        </Box>
      </ScrollView>
    </DevScreenWrapper>
  );
};
