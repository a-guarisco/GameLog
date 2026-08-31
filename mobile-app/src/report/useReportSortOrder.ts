import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SortOrder = 'playtime' | 'streak' | 'alpha';
const SORT_ORDER_KEY = '@report_sort_order';

export function useReportSortOrder(defaultOrder: SortOrder = 'playtime') {
  const [sortOrder, setSortOrderState] = useState<SortOrder>(defaultOrder);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSortOrder = async () => {
      try {
        const savedOrder = await AsyncStorage.getItem(SORT_ORDER_KEY);
        if (savedOrder && ['playtime', 'streak', 'alpha'].includes(savedOrder)) {
          setSortOrderState(savedOrder as SortOrder);
        }
      } catch (error) {
        console.error('Failed to load sort order', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSortOrder();
  }, []);

  const setSortOrder = async (newOrder: SortOrder) => {
    setSortOrderState(newOrder);
    try {
      await AsyncStorage.setItem(SORT_ORDER_KEY, newOrder);
    } catch (error) {
      console.error('Failed to save sort order', error);
    }
  };

  return { sortOrder, setSortOrder, isLoaded };
}
