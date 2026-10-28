import { Stack } from 'expo-router';

export default function ProductsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Products' }} />
      <Stack.Screen name="create" options={{ title: 'Create Product' }} />
      <Stack.Screen name="[id]" options={{ title: 'Product Details' }} />
    </Stack>
  );
}
