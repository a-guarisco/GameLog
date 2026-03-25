import {useGetPlayersInfo} from "@gamelog/api-manager/useApi";
import {Linking, Pressable} from "react-native";
import {Spinner} from "@gamelog/components/ui/spinner";
import BannerInfo from "@gamelog/common/BannerInfo";
import {useMemo} from "react";
import {Text} from "@gamelog/components/ui/text";


interface ProfileBannerProps {
    userId: string;
}

export default function ProfileBanner({userId}: ProfileBannerProps) {
    const userIds = useMemo(() => [userId], [userId]);
    const {playersInfo, isLoadingPlayersInfo, errorPlayersInfo} = useGetPlayersInfo(userIds);
    const secondaryText = `🔥 10 streak`;
    const openSteamProfile = () => {
        if (!isLoadingPlayersInfo) {
            Linking.openURL(playersInfo?.response.players[0].profileurl ?? 'https://steamcommunity.com/');
        }
    }

    return (
        isLoadingPlayersInfo ? <Spinner size="large"/> :
            errorPlayersInfo ?
                (
                    <Text className="text-error-500 mb-4 text-center">
                        Failed to load global achievements, please try again later.
                    </Text>
                ) : (
                    <Pressable onPress={openSteamProfile} className="w-full">
                        <BannerInfo
                            title={playersInfo?.response.players[0].personaname ?? 'Unknown User'}
                            secondaryText={secondaryText}
                            iconUrl={playersInfo?.response.players[0]?.avatarfull}
                            backgroundColor="bg-background-200"
                        />
                    </Pressable>
                )
    );
}