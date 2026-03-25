import { useEffect, useState } from "react";
import { PieChart } from "react-native-gifted-charts";
import apiManager from "@gamelog/api-manager/apiManager";
import { OwnedGames } from "@gamelog/api-manager/dto";
import { Spinner } from "@gamelog/components/ui/spinner";
import { Card } from "@gamelog/components/ui/card";
import { Box } from "@gamelog/components/ui/box";
import { brand } from "@gamelog/theme/theme";
import { rawConfig } from "@gamelog/components/ui/gluestack-ui-provider/config";
import { useColorScheme } from "react-native";

interface PieData {
  value: number;
  color: string;
  gradientCenterColor: string;
  text: string;
}

const OS_COLORS: Record<string, { color: string; gradientCenterColor: string }> = {
  Windows: {
    color: `rgb(${brand.info["700"]})`,
    gradientCenterColor: `rgb(${brand.info["500"]})`,
  },
  Mac: {
    color: `rgb(${brand.info["400"]})`,
    gradientCenterColor: `rgb(${brand.info["200"]})`,
  },
  Linux: {
    color: `rgb(${brand.info["900"]})`,
    gradientCenterColor: `rgb(${brand.info["700"]})`,
  },
  "Steam Deck": {
    color: `rgb(${brand.info["200"]})`,
    gradientCenterColor: `rgb(${brand.info["100"]})`,
  },
};

const buildPieData = (games: OwnedGames["response"]["games"]): PieData[] => {
  const totals = games.reduce(
  (acc, game) => {
    acc.Windows += game.playtime_windows_forever ?? 0;
    acc.Mac += game.playtime_mac_forever ?? 0;
    acc.Linux += game.playtime_linux_forever ?? 0;
    acc["Steam Deck"] += game.playtime_deck_forever ?? 0;
    return acc;
  },
  { Windows: 0, Mac: 0, Linux: 0, "Steam Deck": 0 }
);

  return (Object.entries(totals) as [string, number][])
    .filter(([, minutes]) => minutes > 0)
    .map(([platform, minutes]) => ({
      value: Math.trunc(minutes / 60),
      text: `${platform}: ${Math.trunc(minutes / 60)}h`,
      ...OS_COLORS[platform],
    }));
};

const OsShareChart = () => {
  const [pieData, setPieData] = useState<PieData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId] = useState("76561198077919169");
  const isDark = useColorScheme() === "dark";
  const theme = isDark ? rawConfig.dark : rawConfig.light;

  useEffect(() => {
    apiManager
      .getOwnedGames(userId, true)
      .then((response: OwnedGames) => {
        setPieData(buildPieData(response.response.games));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching recent played games:", error);
      });
  }, [userId]);

  return (
    <Box style={{ width: "95%", alignItems: "center", overflow: "hidden" }}>
      <Card
        style={{ backgroundColor: `rgb(${theme["--color-background-100"]})` }}
        className="w-full rounded-lg items-center py-4"
      >
        {isLoading ? (
          <Spinner />
        ) : (
          <PieChart
            data={pieData}
            donut
            showGradient
            showTooltip
            showValuesAsTooltipText
            sectionAutoFocus
            radius={110}
            innerRadius={70}
            innerCircleColor={`rgb(${theme["--color-background-100"]})`}
            isAnimated
            animationDuration={500}
            showText
            textSize={12}
            textColor={`rgb(${theme["--color-typography-200"]})`}
            showValuesAsLabels={false}
            showTextBackground={false}
          />
        )}
      </Card>
    </Box>
  );
};

export default OsShareChart;