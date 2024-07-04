import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import supabase from "./src/lib/supabase";

export default function App() {
  const [query, setQuery] = useState("");

  const runPrompt = async () => {
    const { data, error } = await supabase.functions.invoke("prompt", {
      body: { query },
    });
    if (error) {
      console.error(error);
    }
    console.log(data);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="prompt"
        value={query}
        onChangeText={setQuery}
        style={{
          padding: 10,
          borderColor: "gray",
          borderWidth: 1,
          margin: 10,
          borderRadius: 5,
        }}
      />
      <Button title="Run" onPress={runPrompt} />
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
