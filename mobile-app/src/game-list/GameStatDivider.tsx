import { Box } from '@gamelog/common/gluestack/box';

export const GameStatDivider = ({ className }: { className?: string }) => (
  <Box className={`h-[1px] bg-outline-50 my-0.5 ${className || ''}`} />
);
