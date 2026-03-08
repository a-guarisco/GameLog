import styled from 'styled-components/native';

interface STextProps {
  bold?: boolean;
  light?: boolean;
  variant?: 'bold' | 'light' | 'main';
  size?: 's' | 'm' | 'l';
}

export const TextGL = styled.Text<STextProps>`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme, variant = 'main' }) => theme.fonts[variant]};
  font-size: ${({ size = 'm' }) => {
    const sizeMap = { s: '12px', m: '16px', l: '24px' };
    return sizeMap[size];
  }};
`;
