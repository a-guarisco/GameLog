import { Box } from '@gamelog/components/ui/box/index';
import { Text } from '@gamelog/components/ui/text/index';

interface GraphData {
  value: number;
  label: string;
  color: string;
  lamdaFormatLabel: (text: string) => string;
}

const ExternalLabelBox = ({ graphData, theme }: { graphData: GraphData[]; theme: any }) => {
  return (
    <Box>
      <Box
        style={{
          width: '90%',
          height: 1,
          backgroundColor: `rgb(${theme['--color-background-300']})`,
          marginVertical: 12,
        }}
      />
      <Box
        style={{
          width: '90%',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {graphData.map((item) => (
          <Box
            key={item.label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              width: '47%',
            }}
          >
            <Box
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: item.color,
                flexShrink: 0,
              }}
            />
            <Box style={{ flex: 1 }}>
              <Text
                style={{
                  color: `rgb(${theme['--color-typography-400']})`,
                  fontSize: 11,
                  fontWeight: '600',
                }}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              <Text
                style={{
                  color: `rgb(${theme['--color-typography-200']})`,
                  fontSize: 10,
                }}
              >
                {item.lamdaFormatLabel(item.value.toString())}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ExternalLabelBox;
