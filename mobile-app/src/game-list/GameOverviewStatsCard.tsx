import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { GameHeaderCard } from '@gamelog/common/GameHeaderCard';
import { OwnedGames } from '@gamelog/api-manager/dto';
import {
  formatDate,
  formatMinutesToHours,
  formatMinutesToHoursShort,
} from '@gamelog/utils/formatUtils';
import { GameStatRow } from './GameStatRow';
import { GameStatDivider } from './GameStatDivider';

type GameOverviewStatsCardProps = {
  gameItem: OwnedGames['response']['games'][0];
  onPress?: () => void;
};

const PLATFORMS = [
  { label: 'Windows', key: 'playtime_windows_forever' },
  { label: 'MacOS', key: 'playtime_mac_forever' },
  { label: 'Linux', key: 'playtime_linux_forever' },
  { label: 'Deck', key: 'playtime_deck_forever' },
] as const;

export const GameOverviewStatsCard = ({ gameItem, onPress }: GameOverviewStatsCardProps) => {
  const { name, appid, playtime_forever, rtime_last_played } = gameItem;

  return (
    <GameHeaderCard name={name} appid={appid} onPress={onPress}>
      <GameStatRow
        label="Playtime"
        labelClassName="font-semibold text-typography-100"
        value={formatMinutesToHours(playtime_forever)}
        className="w-full"
      />
      <GameStatDivider />
      <Box className="flex-row flex-wrap">
        {PLATFORMS.map(({ label, key }) => (
          <GameStatRow key={key} label={label} value={formatMinutesToHoursShort(gameItem[key])} />
        ))}
      </Box>
      <GameStatDivider />
      <GameStatRow
        label="Last played"
        labelClassName="font-semibold text-typography-100"
        value={formatDate(rtime_last_played)}
        className="flex-wrap"
      />
      <GameStatDivider />
      <Text className="text-typography-200">ID: {appid}</Text>
    </GameHeaderCard>
  );
};
