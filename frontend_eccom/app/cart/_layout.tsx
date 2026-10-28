import { Stack } from 'expo-router';

export default function CartLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Cart' }} />
    </Stack>
  );
}
