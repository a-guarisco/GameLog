import { Modal } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import { FriendRecommendationsView } from './FriendRecommendationsView';

interface RecommendationsModalProps {
  friendItem: UserSearchResult | null;
  onClose: () => void;
}

export const RecommendationsModal: React.FC<RecommendationsModalProps> = ({
  friendItem,
  onClose,
}) => {
  if (!friendItem) return null;

  return (
    <Modal animationType="slide" transparent visible onRequestClose={onClose}>
      <Box className="flex-1 justify-center items-center bg-black/70 p-4">
        <Box className="w-full max-w-lg">
          <FriendRecommendationsView friendItem={friendItem} onClose={onClose} />
        </Box>
      </Box>
    </Modal>
  );
};
