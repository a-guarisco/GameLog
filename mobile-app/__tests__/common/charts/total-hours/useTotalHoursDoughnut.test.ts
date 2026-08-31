import { renderHook } from '@testing-library/react-native';
import { useTotalHoursDoughnut } from '@gamelog/common/charts/total-hours/useTotalHoursDoughnut';
import buildTotalHoursPieData from '@gamelog/common/charts/total-hours/buildTotalHoursPieData';

jest.mock('@gamelog/common/charts/total-hours/buildTotalHoursPieData', () => jest.fn());

describe('useTotalHoursDoughnut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates total minutes correctly from pie data', () => {
    (buildTotalHoursPieData as jest.Mock).mockReturnValue([
      { value: 120 },
      { value: 60 },
      { value: 20 },
    ]);

    const ownedGames: any = { response: { games: [{ appid: '1' }] } };
    const { result } = renderHook(() => useTotalHoursDoughnut(ownedGames, 5));

    expect(result.current.pieData.length).toBe(3);
    expect(result.current.totalMinutes).toBe(200);
    expect(buildTotalHoursPieData).toHaveBeenCalledWith(ownedGames, 5);
  });

  it('handles empty pie data', () => {
    (buildTotalHoursPieData as jest.Mock).mockReturnValue([]);

    const { result } = renderHook(() => useTotalHoursDoughnut(null, 5));

    expect(result.current.pieData).toEqual([]);
    expect(result.current.totalMinutes).toBe(0);
  });
});
