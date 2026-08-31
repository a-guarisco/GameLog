import { useMemo } from 'react';
import type { OwnedGames } from '@gamelog/api-manager/dto';
import buildTotalHoursPieData, { PieData } from './buildTotalHoursPieData';

export const useTotalHoursDoughnut = (
  ownedGames: OwnedGames | null | undefined,
  gameToRepresent: number = 5
) => {
  const pieData: PieData[] = useMemo(() => {
    return buildTotalHoursPieData(ownedGames, gameToRepresent);
  }, [ownedGames, gameToRepresent]);

  const totalMinutes = useMemo(() => pieData.reduce((sum, d) => sum + d.value, 0), [pieData]);

  return {
    pieData,
    totalMinutes,
  };
};
