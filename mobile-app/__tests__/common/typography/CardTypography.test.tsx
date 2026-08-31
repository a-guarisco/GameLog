import { render } from '@testing-library/react-native';
import {
  CardTitleText,
  DateRangeText,
  SeeMoreText,
  StatValueText,
  StatLabelText,
} from '../../../src/common/typography/CardTypography';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

describe('CardTypography', () => {
  const renderWithProvider = (component: React.ReactElement) =>
    render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

  it('renders CardTitleText correctly', () => {
    const { getByText } = renderWithProvider(<CardTitleText>Hello</CardTitleText>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders DateRangeText correctly', () => {
    const { getByText } = renderWithProvider(<DateRangeText>Date</DateRangeText>);
    expect(getByText('Date')).toBeTruthy();
  });

  it('renders SeeMoreText correctly', () => {
    const { getByText } = renderWithProvider(<SeeMoreText>See More</SeeMoreText>);
    expect(getByText('See More')).toBeTruthy();
  });

  it('renders StatValueText correctly', () => {
    const { getByText } = renderWithProvider(<StatValueText>42</StatValueText>);
    expect(getByText('42')).toBeTruthy();
  });

  it('renders StatLabelText correctly', () => {
    const { getByText } = renderWithProvider(<StatLabelText>Label</StatLabelText>);
    expect(getByText('Label')).toBeTruthy();
  });
});
