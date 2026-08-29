import SectionCard from '@gamelog/common/SectionCard';
import StatBand from '@gamelog/common/StatBand';
import ProgressTrack from '@gamelog/common/ProgressTrack';
import { VStack } from '@gamelog/common/gluestack/vstack';

interface AchievementsProgressBarProps {
  gameName: string;
  unlockedCount: number;
  totalCount: number;
  completionPercent: number;
}

const AchievementsProgressBar = ({
  gameName,
  unlockedCount,
  totalCount,
  completionPercent,
}: AchievementsProgressBarProps) => {
  const lockedCount = Math.max(0, totalCount - unlockedCount);
  const stats = [
    { label: 'UNLOCKED', value: `${unlockedCount}` },
    { label: 'LOCKED', value: `${lockedCount}` },
    { label: 'COMPLETED', value: `${completionPercent}%` },
  ];

  return (
    <SectionCard label={`Achievements for ${gameName}`} testID="achievements-progress-card">
      <VStack space="md" className="w-full pt-1">
        <StatBand stats={stats} isOnCard />
        <ProgressTrack percent={completionPercent} testID="achievements-progress-track" />
      </VStack>
    </SectionCard>
  );
};

export default AchievementsProgressBar;

