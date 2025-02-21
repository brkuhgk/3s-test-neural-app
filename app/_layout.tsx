import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#1a1a2e' },
      }}
      initialRouteName="index" // Add this line to make home the initial route
    >
      <Stack.Screen 
        name="home" 
        options={{
          // Prevent going back to index from home
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="index"
        options={{
          // Prevent going back to home once test starts
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="resultsUI"
        options={{
          // Allow going back from results
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}