import { Box } from '@gamelog/common/gluestack/box';
import { DimensionValue } from 'react-native';

interface VSpaceProps {
  size?: number | DimensionValue;
  className?: string;
  testID?: string;
}

const VSpace = ({ size = 16, className = '', testID }: VSpaceProps) => (
  <Box
    style={size !== undefined ? { height: size } : undefined}
    className={className}
    testID={testID}
  />
);

export default VSpace;
