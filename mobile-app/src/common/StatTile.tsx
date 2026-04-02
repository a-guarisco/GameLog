import { useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';

interface StatTileProps {
  value: string | number;
  label?: string;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
}

export function StatTile({
  value,
  label,
  className = '',
  valueClassName = '',
  labelClassName = '',
}: StatTileProps) {
  const [tileWidth, setTileWidth] = useState(1);

  const valueFontSize = tileWidth * 0.28;
  const labelFontSize = tileWidth * 0.08;

  const handleLayout = (e: LayoutChangeEvent) => {
    setTileWidth(e.nativeEvent.layout.width);
  };

  return (
    <Box
      onLayout={handleLayout}
      className={`w-full rounded-3xl p-4 ${className}`}
      style={{ aspectRatio: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
    >
      <Text
        className={`font-bold ${valueClassName} text-center`}
        style={{
          fontSize: valueFontSize,
          lineHeight: valueFontSize,
          letterSpacing: -1,
        }}
      >
        {value}
      </Text>

      {label && (
        <Text
          className={`font-medium uppercase opacity-60 mt-1.5 ${labelClassName}`}
          style={{
            fontSize: labelFontSize,
            letterSpacing: 1.5,
            alignSelf: 'center',
            textAlign: 'center',
          }}
        >
          {label}
        </Text>
      )}
    </Box>
  );
}
