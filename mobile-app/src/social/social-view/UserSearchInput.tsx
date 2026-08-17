import React from 'react';
import { GLTextInput } from '@gamelog/common/GLTextInput';

interface UserSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const UserSearchInput: React.FC<UserSearchInputProps> = ({ value, onChangeText }) => (
  <GLTextInput
    placeholder="Search users by username..."
    value={value}
    onChangeText={onChangeText}
    containerClassName="mb-5"
    testID="user-search-input"
  />
);
