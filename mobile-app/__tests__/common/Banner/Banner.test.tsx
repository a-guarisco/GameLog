import React from 'react';
import { render } from '@testing-library/react-native';
import Banner from '@gamelog/common/Banner';

jest.mock('@gamelog/components/ui/box', () => {
    const { View } = require('react-native');
    return { Box: (props: any) => <View testID="banner-box" {...props} /> };
});

jest.mock('@gamelog/components/ui/image', () => {
    const { Image: RNImage } = require('react-native');
    return {
        Image: (props: any) => <RNImage testID="banner-image" {...props} />
    };
});

describe('Banner', () => {
    const defaultProps = {
        heightPercentage: 20,
        minHeight: 150,
        fallbackColor: 'bg-gray-800',
    };

    describe('image rendering', () => {
        it('renders image when imageUrl is provided', () => {
            const {getByTestId} = render(
                <Banner {...defaultProps} imageUrl="https://example.com/banner.jpg"/>
            );
            const image = getByTestId('banner-image');
            expect(image).toBeTruthy();
            expect(image.props.source).toEqual({uri: 'https://example.com/banner.jpg'});
        });

        it('does not render image when imageUrl is not provided', () => {
            const {queryByTestId} = render(<Banner {...defaultProps} />);
            expect(queryByTestId('banner-image')).toBeNull();
        });
    });
});
