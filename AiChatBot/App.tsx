import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function App() {
  const [query, setQuery] = useState("");

  return (
    <View style={styles.container}>
      <Text>AiChatBot after 1 years</Text>
      <TextInput
        placeholder="prompt"
        value={query}
        onChangeText={setQuery}
        style={{
          padding: 10,
          borderColor: "gray",
          borderWidth: 1,
          width: 200,
          margin: 10,
          borderRadius: 5,
        }}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",

    justifyContent: "center",
  },
});
