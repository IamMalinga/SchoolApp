import { useColorScheme as _useColorScheme } from 'react-native';

export default function useColorScheme() {
  const colorScheme = _useColorScheme();
  return colorScheme ?? 'light';
}
