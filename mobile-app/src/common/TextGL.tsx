import styled from 'styled-components/native';
import { lightTheme } from '../theme/theme';

type FontVariant = keyof typeof lightTheme.fonts;
interface STextProps {
  bold?: boolean;
  light?: boolean;
  variant?: FontVariant;
  size?: 's' | 'm' | 'l';
}

export const TextGL = styled.Text<STextProps>`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme, variant = 'regular' }) => theme.fonts[variant].fontFamily};
  font-weight: ${({ theme, variant = 'regular' }) => theme.fonts[variant].fontWeight};
  font-size: ${({ size = 'm' }) => {
    const sizeMap = { s: '12px', m: '16px', l: '24px' };
    return sizeMap[size];
  }};
`;
