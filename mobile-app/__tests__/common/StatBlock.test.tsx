import { render } from '@testing-library/react-native';
import StatBlock from '../../src/common/StatBlock';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

describe('StatBlock', () => {
  const renderWithProvider = (component: React.ReactElement) =>
    render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

  it('renders value and label correctly', () => {
    const { getByText } = renderWithProvider(<StatBlock value="10h" label="PLAYTIME" />);

    expect(getByText('10h')).toBeTruthy();
    expect(getByText('PLAYTIME')).toBeTruthy();
  });
});
