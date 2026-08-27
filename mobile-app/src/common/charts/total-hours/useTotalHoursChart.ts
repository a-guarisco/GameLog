import { useMemo } from 'react';
import type { OwnedGames } from '@gamelog/api-manager/dto';
import buildTotalHoursBarData from './buildTotalHoursBarData';
import { brand } from '@gamelog/theme/theme';
import { parseRGB } from '../chartsHelpers';

const PRIMARY_400 = parseRGB(brand.primary['400']);

export const useTotalHoursChart = (ownedGames: OwnedGames | null | undefined) => {
  const barData = useMemo(() => {
    const raw = buildTotalHoursBarData(ownedGames);
    return raw.map((item) => ({ ...item, frontColor: PRIMARY_400 }));
  }, [ownedGames]);

  return {
    barData,
  };
};
