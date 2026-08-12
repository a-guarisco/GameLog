import { TextInput } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';

interface UserSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const UserSearchInput: React.FC<UserSearchInputProps> = ({ value, onChangeText }) => (
  <Box className="mb-5">
    <TextInput
      placeholder="Search users by username..."
      placeholderTextColor="#9ca3af"
      value={value}
      onChangeText={onChangeText}
      className="bg-background-200 rounded-lg px-4 py-3 text-white"
      testID="user-search-input"
    />
  </Box>
);
