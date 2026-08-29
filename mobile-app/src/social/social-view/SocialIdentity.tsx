import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { PageTitle } from '@gamelog/common/typography/CommonTypography';

interface SocialIdentityProps {
  className?: string;
}

export const SocialIdentity: React.FC<SocialIdentityProps> = ({ className = '' }) => {
  return (
    <Box className={`w-full px-4 pt-2 pb-1 ${className}`}>
      <PageTitle size="2xl" className="text-left font-bold uppercase tracking-wide">
        Social Hub
      </PageTitle>
      <Text size="sm" className="text-typography-400 mt-1">
        Connect with friends, manage requests, and discover recommendations
      </Text>
    </Box>
  );
};

export default SocialIdentity;
