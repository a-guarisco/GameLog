import React, { useState } from 'react';
import { Modal, TextInput } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { LoadingBox, ErrorBox, InfoBox } from '@gamelog/common/feedbacks';
import HeaderGameImage from '@gamelog/game/HeaderGameImage';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import ApiManager from '@gamelog/api-manager/apiManager';
import { useGetFriendList, useSearchUsers } from '@gamelog/api-manager/useApi';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import { UserCard } from './UserCard';
import { FriendRecommendationsView } from './FriendRecommendationsView';

const BANNER_APPID = '730';

const SocialView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<UserSearchResult | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const {
    friendList,
    isLoadingFriendList,
    errorFriendList,
    errorMessageFriendList,
    refetchFriendList,
  } = useGetFriendList();

  const { searchResults, isLoadingSearch, errorSearch, errorMessageSearch, refetchSearch } =
    useSearchUsers(searchQuery);

  const handleAddFriend = async (userId: string) => {
    setIsActionLoading(true);
    setActionFeedback(null);
    try {
      await ApiManager.addFriend(userId);
      setActionFeedback('Friend request sent successfully!');
      refetchSearch();
      refetchFriendList();
    } catch (err: any) {
      setActionFeedback(err.message || 'Failed to send friend request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAcceptFriend = async (friendshipId: string) => {
    setIsActionLoading(true);
    setActionFeedback(null);
    try {
      await ApiManager.respondToFriend(friendshipId, 'ACCEPTED');
      setActionFeedback('Friend request accepted!');
      refetchFriendList();
      refetchSearch();
    } catch (err: any) {
      setActionFeedback(err.message || 'Failed to accept friend request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRefuseFriend = async (friendshipId: string) => {
    setIsActionLoading(true);
    setActionFeedback(null);
    try {
      await ApiManager.respondToFriend(friendshipId, 'REJECTED');
      setActionFeedback('Friend request refused.');
      refetchFriendList();
      refetchSearch();
    } catch (err: any) {
      setActionFeedback(err.message || 'Failed to refuse friend request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const pendingRequests = friendList.filter(
    (item) => item.friendship?.friendship_status === 'pending_incoming'
  );
  const acceptedFriends = friendList.filter(
    (item) => item.friendship?.friendship_status === 'accepted'
  );

  return (
    <Box className="flex-1 relative bg-background-0">
      <HeaderGameImage appid={BANNER_APPID} />
      <ScrollablePage>
        {/* Banner Title Card */}
        <Box className="bg-background-100 shadow-xl p-5 w-full items-center">
          <Text size="3xl" className="font-bold uppercase text-center mb-1">
            Social Hub
          </Text>
          <Text size="sm" className="text-typography-400 text-center">
            Connect with friends, manage requests, and compare game recommendations
          </Text>
        </Box>

        <Box className="w-80% bg-background-100 shadow-xl pt-6">
          {/* Tab Switcher */}
          <Box className="mb-5 px-4">
            <HStack className="bg-background-200 p-1.5 rounded-lg">
              <Button
                className={`flex-1 rounded-md ${
                  activeTab === 'friends' ? 'bg-primary-600' : 'bg-transparent'
                }`}
                onPress={() => setActiveTab('friends')}
                testID="friends-tab-btn"
              >
                <ButtonText
                  size="xs"
                  className={`font-bold uppercase ${
                    activeTab === 'friends' ? 'text-white' : 'text-typography-400'
                  }`}
                >
                  Friends ({acceptedFriends.length + pendingRequests.length})
                </ButtonText>
              </Button>
              <Button
                className={`flex-1 rounded-md ${
                  activeTab === 'search' ? 'bg-primary-600' : 'bg-transparent'
                }`}
                onPress={() => setActiveTab('search')}
                testID="search-tab-btn"
              >
                <ButtonText
                  size="xs"
                  className={`font-bold uppercase ${
                    activeTab === 'search' ? 'text-white' : 'text-typography-400'
                  }`}
                >
                  Find Users
                </ButtonText>
              </Button>
            </HStack>

            {actionFeedback && (
              <Box className="relative overflow-hidden rounded-lg mt-3 bg-background-200 shadow-md px-3 py-2">
                <Text size="xs" className="text-primary-400 text-center font-medium">
                  {actionFeedback}
                </Text>
              </Box>
            )}
          </Box>

          {/* Friends & Requests Tab */}
          {activeTab === 'friends' && (
            <VStack className="mb-4 px-4">
              {isLoadingFriendList ? (
                <LoadingBox message="Loading friends..." className="py-10" />
              ) : errorFriendList ? (
                <ErrorBox
                  errorMessage={errorMessageFriendList || 'Failed to load friend list.'}
                  className="py-6"
                />
              ) : (
                <>
                  {/* Pending Incoming Requests */}
                  {pendingRequests.length > 0 && (
                    <Box className="mb-5">
                      <Text size="sm" className="font-bold uppercase text-warning-700 mb-2">
                        Pending Friend Requests ({pendingRequests.length})
                      </Text>
                      {pendingRequests.map((item) => (
                        <UserCard
                          key={item.user.id}
                          item={item}
                          onAcceptFriend={handleAcceptFriend}
                          onRefuseFriend={handleRefuseFriend}
                          isActionLoading={isActionLoading}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Accepted Friends */}
                  <Box className="mb-5">
                    <Text size="sm" className="font-bold uppercase text-typography-400 mb-2">
                      Friends ({acceptedFriends.length})
                    </Text>
                    {acceptedFriends.length === 0 ? (
                      <InfoBox
                        message="You don't have any friends added yet. Use the 'Find Users' tab to search and add friends!"
                        className="py-6"
                      />
                    ) : (
                      acceptedFriends.map((item) => (
                        <UserCard
                          key={item.user.id}
                          item={item}
                          onSelectRecommendations={(user) => setSelectedFriend(user)}
                          isActionLoading={isActionLoading}
                        />
                      ))
                    )}
                  </Box>
                </>
              )}
            </VStack>
          )}

          {/* Search Users Tab */}
          {activeTab === 'search' && (
            <VStack className="mb-4 px-4">
              <Box className="mb-5">
                <TextInput
                  placeholder="Search users by username..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="bg-background-200 rounded-lg px-4 py-3 text-white"
                  testID="user-search-input"
                />
              </Box>

              {!searchQuery.trim() ? (
                <InfoBox
                  message="Type a username in the search bar above to find other gamers."
                  className="py-6"
                />
              ) : isLoadingSearch ? (
                <LoadingBox message="Searching users..." className="py-10" />
              ) : errorSearch ? (
                <ErrorBox
                  errorMessage={errorMessageSearch || 'Error searching users.'}
                  className="py-6"
                />
              ) : searchResults.length === 0 ? (
                <InfoBox message={`No users found matching "${searchQuery}".`} className="py-6" />
              ) : (
                <VStack className="mb-4">
                  <Text size="sm" className="font-bold uppercase text-typography-400 mb-2">
                    Search Results ({searchResults.length})
                  </Text>
                  {searchResults.map((item) => (
                    <UserCard
                      key={item.user.id}
                      item={item}
                      onAddFriend={handleAddFriend}
                      onAcceptFriend={handleAcceptFriend}
                      onRefuseFriend={handleRefuseFriend}
                      onSelectRecommendations={(user) => setSelectedFriend(user)}
                      isActionLoading={isActionLoading}
                    />
                  ))}
                </VStack>
              )}
            </VStack>
          )}
        </Box>
      </ScrollablePage>

      {/* Recommendations Modal */}
      {selectedFriend && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedFriend}
          onRequestClose={() => setSelectedFriend(null)}
        >
          <Box className="flex-1 justify-center items-center bg-black/70 p-4">
            <Box className="w-full max-w-lg">
              <FriendRecommendationsView
                friendItem={selectedFriend}
                onClose={() => setSelectedFriend(null)}
              />
            </Box>
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default SocialView;
