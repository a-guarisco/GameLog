import { render } from '@testing-library/react-native';
import { ModalTitle, ModalOptionText, SectionTitle } from '@gamelog/common/CommonTypography';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

describe('CommonTypography', () => {
  const renderWithProvider = (component: React.ReactElement) =>
    render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

  it('renders ModalTitle correctly', () => {
    const { getByText } = renderWithProvider(<ModalTitle>My Title</ModalTitle>);
    expect(getByText('My Title')).toBeTruthy();
  });

  it('renders ModalOptionText in active and inactive state', () => {
    const { getByText: getActive } = renderWithProvider(
      <ModalOptionText isActive={true}>Active Option</ModalOptionText>
    );
    expect(getActive('Active Option')).toBeTruthy();

    const { getByText: getInactive } = renderWithProvider(
      <ModalOptionText isActive={false}>Inactive Option</ModalOptionText>
    );
    expect(getInactive('Inactive Option')).toBeTruthy();
  });

  it('renders SectionTitle correctly', () => {
    const { getByText } = renderWithProvider(<SectionTitle>My Section</SectionTitle>);
    expect(getByText('My Section')).toBeTruthy();
  });
});
