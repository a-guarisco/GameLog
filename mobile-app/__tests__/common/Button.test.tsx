import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import {
  Button,
  ButtonText,
  ButtonSpinner,
  ReportCtaButton,
  ModalConfirmButton,
  ModalCancelButton,
  SocialActionButton,
} from '@gamelog/common/button';

describe('Button component & variants', () => {
  it('renders direct text child without needing explicit ButtonText', () => {
    render(<Button testID="test-btn">Direct Text</Button>);
    expect(screen.getByText('Direct Text')).toBeTruthy();
  });

  it('renders compound Button with ButtonText', () => {
    render(
      <Button testID="compound-btn">
        <ButtonText>Compound Text</ButtonText>
      </Button>
    );
    expect(screen.getByText('Compound Text')).toBeTruthy();
  });

  it('handles onPress when pressed', () => {
    const onPress = jest.fn();
    render(
      <Button testID="press-btn" onPress={onPress}>
        Click Me
      </Button>
    );

    fireEvent.press(screen.getByTestId('press-btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when isDisabled', () => {
    const onPress = jest.fn();
    render(
      <Button testID="disabled-btn" isDisabled onPress={onPress}>
        Disabled
      </Button>
    );

    fireEvent.press(screen.getByTestId('disabled-btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('supports variant and action combinations (ghost, outline, solid, isOnCard)', () => {
    const { rerender } = render(
      <Button testID="variant-btn" variant="outline" action="primary" isOnCard>
        Outline On Card
      </Button>
    );
    expect(screen.getByText('Outline On Card')).toBeTruthy();

    rerender(
      <Button testID="variant-btn" variant="ghost" action="secondary">
        Ghost Secondary
      </Button>
    );
    expect(screen.getByText('Ghost Secondary')).toBeTruthy();

    rerender(
      <Button testID="variant-btn" variant="solid" action="negative">
        Solid Negative
      </Button>
    );
    expect(screen.getByText('Solid Negative')).toBeTruthy();
  });

  it('renders ButtonSpinner alongside text', () => {
    render(
      <Button testID="loading-btn">
        <ButtonSpinner testID="btn-spinner" />
        <ButtonText>Loading</ButtonText>
      </Button>
    );
    expect(screen.getByText('Loading')).toBeTruthy();
  });
});

describe('Specialized CTA Button wrappers', () => {
  it('ReportCtaButton renders and calls onPress', () => {
    const onPress = jest.fn();
    render(<ReportCtaButton onPress={onPress} label="Generate Report" />);

    const btn = screen.getByTestId('generate-report-btn');
    expect(btn).toBeTruthy();
    fireEvent.press(btn);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ModalConfirmButton and ModalCancelButton work properly', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    render(
      <>
        <ModalCancelButton onPress={onCancel} />
        <ModalConfirmButton onPress={onConfirm} variant="destructive" />
      </>
    );

    fireEvent.press(screen.getByTestId('modal-cancel-btn'));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByTestId('modal-confirm-btn'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('SocialActionButton handles add, accept, and refuse actions', () => {
    const onAdd = jest.fn();
    const onAccept = jest.fn();
    const onRefuse = jest.fn();

    const { rerender } = render(
      <SocialActionButton actionType="add" onPress={onAdd} testID="social-add" />
    );
    expect(screen.getByText('Add Friend')).toBeTruthy();
    fireEvent.press(screen.getByTestId('social-add'));
    expect(onAdd).toHaveBeenCalledTimes(1);

    rerender(<SocialActionButton actionType="accept" onPress={onAccept} testID="social-accept" />);
    expect(screen.getByText('Accept')).toBeTruthy();
    fireEvent.press(screen.getByTestId('social-accept'));
    expect(onAccept).toHaveBeenCalledTimes(1);

    rerender(<SocialActionButton actionType="refuse" onPress={onRefuse} testID="social-refuse" />);
    expect(screen.getByText('Refuse')).toBeTruthy();
    fireEvent.press(screen.getByTestId('social-refuse'));
    expect(onRefuse).toHaveBeenCalledTimes(1);
  });
});
