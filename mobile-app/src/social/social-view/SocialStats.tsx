import StatBand, { GameStat } from '@gamelog/common/StatBand';

interface SocialStatsProps {
  acceptedCount: number;
  pendingCount: number;
}

export const SocialStats: React.FC<SocialStatsProps> = ({ acceptedCount, pendingCount }) => {
  const stats: GameStat[] = [
    {
      value: acceptedCount.toString(),
      label: 'Friends',
    },
    {
      value: pendingCount.toString(),
      label: 'Pending',
      valueClassName: pendingCount > 0 ? 'text-warning-600' : undefined,
    },
  ];

  return <StatBand stats={stats} />;
};

export default SocialStats;
