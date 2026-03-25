import { render, screen } from '@testing-library/react-native';
import ExternalLabelBox from '@gamelog/common/charts/ExternalLabelBox';

jest.mock('@gamelog/components/ui/box/index', () => {
  const { View } = jest.requireActual('react-native');
  return { Box: ({ children }: any) => <View>{children}</View> };
});

jest.mock('@gamelog/components/ui/text/index', () => {
  const { Text } = jest.requireActual('react-native');
  return { Text: ({ children, numberOfLines, ...props }: any) => <Text>{children}</Text> };
});

const mockTheme = {
  '--color-background-300': '200,200,200',
  '--color-typography-400': '100,100,100',
  '--color-typography-200': '150,150,150',
};

const baseGraphData = [
  {
    value: 10,
    label: 'Windows',
    color: 'blue',
    lamdaFormatLabel: (v: string) => `${v} hrs`,
  },
  {
    value: 5,
    label: 'Mac',
    color: 'gray',
    lamdaFormatLabel: (v: string) => `${v} hrs`,
  },
];

describe('ExternalLabelBox', () => {
  it('renders a label and formatted value for each graph data item', () => {
    render(<ExternalLabelBox graphData={baseGraphData} theme={mockTheme} />);

    expect(screen.getByText('Windows')).toBeTruthy();
    expect(screen.getByText('10 hrs')).toBeTruthy();
    expect(screen.getByText('Mac')).toBeTruthy();
    expect(screen.getByText('5 hrs')).toBeTruthy();
  });

  it('renders nothing extra when graphData is empty', () => {
    render(<ExternalLabelBox graphData={[]} theme={mockTheme} />);
    expect(screen.queryByText('Windows')).toBeNull();
  });

  it('calls lamdaFormatLabel with the string value of each item', () => {
    const formatLabel = jest.fn((v: string) => `formatted: ${v}`);
    const data = [{ value: 42, label: 'Linux', color: 'green', lamdaFormatLabel: formatLabel }];

    render(<ExternalLabelBox graphData={data} theme={mockTheme} />);

    expect(formatLabel).toHaveBeenCalledWith('42');
    expect(screen.getByText('formatted: 42')).toBeTruthy();
  });
});
