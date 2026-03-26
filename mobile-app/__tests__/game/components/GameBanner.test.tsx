import React from 'react';
import { render, screen } from '@testing-library/react-native';
import GameBanner from '@gamelog/components/game-view/GameBanner';

jest.mock('@gamelog/api-manager/useApi', () => ({
    useGetGameCapsuleImage: jest.fn(),
    useGetGameHeaderImage: jest.fn(),
}));

jest.mock('@gamelog/common/Banner', () => {
    const { View } = require('react-native');
    return ({ imageUrl, fallbackColor, minHeight, heightPercentage }: any) => (
        <View
            testID="banner"
            accessibilityLabel={`banner-${imageUrl}-${fallbackColor}-${minHeight}-${heightPercentage}`}
        />
    );
});

jest.mock('@gamelog/common/BannerInfo', () => {
    const { View, Text } = require('react-native');
    return ({ title, iconUrl, secondaryText }: any) => (
        <View testID="banner-info">
            <Text testID="banner-title">{title}</Text>
            <Text testID="banner-secondary">{secondaryText}</Text>
            <Text testID="banner-icon">{iconUrl}</Text>
        </View>
    );
});

jest.mock('@gamelog/components/ui/spinner', () => {
    const { View } = require('react-native');
    return {
        Spinner: ({ size }: any) => <View testID="spinner" accessibilityLabel={`spinner-${size}`} />,
    };
});

jest.mock('@gamelog/components/ui/vstack', () => {
    const { View } = require('react-native');
    return {
        VStack: ({ children, className }: any) => (
            <View testID="vstack" className={className}>
                {children}
            </View>
        ),
    };
});

import {
    useGetGameCapsuleImage,
    useGetGameHeaderImage,
} from '@gamelog/api-manager/useApi';

const mockUseGetGameCapsuleImage = useGetGameCapsuleImage as jest.Mock;
const mockUseGetGameHeaderImage = useGetGameHeaderImage as jest.Mock;

const defaultProps = {
    appid: '123456',
    title: 'Test Game',
    streak: 5,
};

describe('GameBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders a spinner when capsule image is loading', () => {
        mockUseGetGameCapsuleImage.mockReturnValue({
            gameCapsuleImage: null,
            isLoadingGameCapsuleImage: true,
        });
        mockUseGetGameHeaderImage.mockReturnValue({
            gameHeaderImage: null,
            isLoadingGameHeaderImage: false,
        });

        render(<GameBanner {...defaultProps} />);

        expect(screen.getByTestId('spinner')).toBeTruthy();
        expect(screen.queryByTestId('banner-info')).toBeNull();
    });

    it('renders a spinner when header image is loading', () => {
        mockUseGetGameCapsuleImage.mockReturnValue({
            gameCapsuleImage: null,
            isLoadingGameCapsuleImage: false,
        });
        mockUseGetGameHeaderImage.mockReturnValue({
            gameHeaderImage: null,
            isLoadingGameHeaderImage: true,
        });

        render(<GameBanner {...defaultProps} />);

        expect(screen.getByTestId('spinner')).toBeTruthy();
        expect(screen.queryByTestId('banner-info')).toBeNull();
    });

    it('renders banner content when images are loaded', () => {
        mockUseGetGameCapsuleImage.mockReturnValue({
            gameCapsuleImage: 'https://example.com/capsule.jpg',
            isLoadingGameCapsuleImage: false,
        });
        mockUseGetGameHeaderImage.mockReturnValue({
            gameHeaderImage: 'https://example.com/header.jpg',
            isLoadingGameHeaderImage: false,
        });

        render(<GameBanner {...defaultProps} />);

        expect(screen.queryByTestId('spinner')).toBeNull();
        expect(screen.getByTestId('banner')).toBeTruthy();
        expect(screen.getByTestId('banner-info')).toBeTruthy();
    });

    it('displays the game title in BannerInfo', () => {
        mockUseGetGameCapsuleImage.mockReturnValue({
            gameCapsuleImage: 'https://example.com/capsule.jpg',
            isLoadingGameCapsuleImage: false,
        });
        mockUseGetGameHeaderImage.mockReturnValue({
            gameHeaderImage: 'https://example.com/header.jpg',
            isLoadingGameHeaderImage: false,
        });

        render(<GameBanner {...defaultProps} />);

        expect(screen.getByTestId('banner-title').props.children).toBe('Test Game');
    });

    it('shows fire emoji and streak count when streak is greater than 0', () => {
        mockUseGetGameCapsuleImage.mockReturnValue({
            gameCapsuleImage: null,
            isLoadingGameCapsuleImage: false,
        });
        mockUseGetGameHeaderImage.mockReturnValue({
            gameHeaderImage: null,
            isLoadingGameHeaderImage: false,
        });

        render(<GameBanner {...defaultProps} streak={7} />);

        expect(screen.getByTestId('banner-secondary').props.children).toBe('🔥 7 streak');
    });

    it('shows plain streak count (no fire emoji) when streak is 0', () => {
        mockUseGetGameCapsuleImage.mockReturnValue({
            gameCapsuleImage: null,
            isLoadingGameCapsuleImage: false,
        });
        mockUseGetGameHeaderImage.mockReturnValue({
            gameHeaderImage: null,
            isLoadingGameHeaderImage: false,
        });

        render(<GameBanner {...defaultProps} streak={0} />);

        expect(screen.getByTestId('banner-secondary').props.children).toBe('0 streak');
    });

    it('passes null image URLs as undefined to Banner and BannerInfo', () => {
        mockUseGetGameCapsuleImage.mockReturnValue({
            gameCapsuleImage: null,
            isLoadingGameCapsuleImage: false,
        });
        mockUseGetGameHeaderImage.mockReturnValue({
            gameHeaderImage: null,
            isLoadingGameHeaderImage: false,
        });

        render(<GameBanner {...defaultProps} />);

        // Banner should receive undefined (not null) when image is null so gluestack image don't cry
        const banner = screen.getByTestId('banner');
        expect(banner.props.accessibilityLabel).toContain('undefined');
    });

    it('passes image URLs to Banner and BannerInfo when available', () => {
        const capsuleUrl = 'https://example.com/capsule.jpg';
        const headerUrl = 'https://example.com/header.jpg';

        mockUseGetGameCapsuleImage.mockReturnValue({
            gameCapsuleImage: capsuleUrl,
            isLoadingGameCapsuleImage: false,
        });
        mockUseGetGameHeaderImage.mockReturnValue({
            gameHeaderImage: headerUrl,
            isLoadingGameHeaderImage: false,
        });

        render(<GameBanner {...defaultProps} />);

        expect(screen.getByTestId('banner-icon').props.children).toBe(capsuleUrl);
    });

    it('calls useGetGameCapsuleImage and useGetGameHeaderImage with the correct appid', () => {
        mockUseGetGameCapsuleImage.mockReturnValue({
            gameCapsuleImage: null,
            isLoadingGameCapsuleImage: false,
        });
        mockUseGetGameHeaderImage.mockReturnValue({
            gameHeaderImage: null,
            isLoadingGameHeaderImage: false,
        });

        render(<GameBanner {...defaultProps} appid="999" />);

        expect(mockUseGetGameCapsuleImage).toHaveBeenCalledWith('999');
        expect(mockUseGetGameHeaderImage).toHaveBeenCalledWith('999');
    });
});
