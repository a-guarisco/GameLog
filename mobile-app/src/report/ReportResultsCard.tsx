import { useState } from 'react';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import SectionCard from '@gamelog/common/SectionCard';
import { InfoBox } from '@gamelog/common/feedbacks';
import { DateRangeText } from '@gamelog/common/typography/CardTypography';
import { formatMinutesToHoursShort, formatThousands } from '@gamelog/utils/formatUtils';
import ExpandToggle from '@gamelog/common/ExpandToggle';
import { GLSegmentedControl } from '@gamelog/common/GLSegmentedControl';
import ReportGameList from './ReportGameList';

interface ReportResultsCardProps {
  report: any; // Ideally import DailyReport
  summary: any;
  sortedGameReports: any[];
  gameNames: Record<string, string>;
  sortOrder: 'playtime' | 'streak' | 'alpha';
  setSortOrder: (order: 'playtime' | 'streak' | 'alpha') => void;
  handleGamePress: (appId: string, playTime: number) => void;
}

const ReportResultsCard = ({
  report,
  summary,
  sortedGameReports,
  gameNames,
  sortOrder,
  setSortOrder,
  handleGamePress,
}: ReportResultsCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!report) return null;

  return (
    <SectionCard testID="report-results-card" label="Report">
      <VStack space="sm">
        {!report.game_reports || report.game_reports.length === 0 ? (
          <InfoBox message="No games played in this period." className="mt-2" />
        ) : summary ? (
          <VStack space="sm">
            <DateRangeText className="text-center mb-1">
              {summary.rangeText}
            </DateRangeText>
            
            <HStack space="sm" className="justify-between">
              <VStack className="flex-1 items-center">
                <Text size="xs" className="text-typography-300 font-medium uppercase tracking-widest text-center">
                  Playtime
                </Text>
                <Text size="xl" className="font-bold text-typography-0 mt-0.5 text-center">
                  {formatMinutesToHoursShort(summary.totalPlaytime)}
                </Text>
              </VStack>
              <VStack className="flex-1 items-center">
                <Text size="xs" className="text-typography-300 font-medium uppercase tracking-widest text-center">
                  Games
                </Text>
                <Text size="xl" className="font-bold text-typography-0 mt-0.5 text-center">
                  {formatThousands(summary.totalGames)}
                </Text>
              </VStack>
              <VStack className="flex-1 items-center">
                <Text size="xs" className="text-typography-300 font-medium uppercase tracking-widest text-center">
                  Max / Day
                </Text>
                <Text size="xl" className="font-bold text-typography-0 mt-0.5 text-center">
                  {formatMinutesToHoursShort(summary.maxPlaytimePerDay)}
                </Text>
              </VStack>
            </HStack>

            <VStack className="items-center mt-1">
              <Text size="xs" className="text-typography-300 font-medium uppercase tracking-widest text-center">
                Top Game
              </Text>
              <Text size="lg" className="font-bold text-typography-0 mt-0.5 text-center" numberOfLines={1}>
                {summary.topGameName}
              </Text>
            </VStack>

            <ExpandToggle
              isExpanded={showDetails}
              onToggle={() => setShowDetails(!showDetails)}
              labelCollapsed="Show game breakdown"
              labelExpanded="Hide game breakdown"
              className="self-start mt-0.5"
            />

            {showDetails && (
              <VStack space="sm" className="mt-2">
                <GLSegmentedControl
                  isOnCard
                  options={[
                    { id: 'playtime', label: 'Playtime' },
                    { id: 'streak', label: 'Streak' },
                    { id: 'alpha', label: 'A-Z' },
                  ]}
                  activeId={sortOrder}
                  onSelect={(id) => setSortOrder(id as any)}
                  className="mb-2"
                />
                <ReportGameList
                  sortedGameReports={sortedGameReports}
                  gameNames={gameNames}
                  handleGamePress={handleGamePress}
                />
              </VStack>
            )}
          </VStack>
        ) : null}
      </VStack>
    </SectionCard>
  );
};

export default ReportResultsCard;
