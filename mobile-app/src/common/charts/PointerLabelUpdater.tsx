import { useEffect } from 'react';
import { View } from 'react-native';

export const PointerLabelUpdater = ({
  item,
  onUpdate,
}: {
  item: any;
  onUpdate: (item: any) => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdate(item);
    }, 0);
    return () => {
      clearTimeout(timer);
      setTimeout(() => onUpdate(null), 0);
    };
  }, [item?.dataPointText, onUpdate]);
  return <View style={{ width: 0, height: 0 }} />;
};
