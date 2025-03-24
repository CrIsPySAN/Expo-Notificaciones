// app/sign-in.jsx
import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useSession } from "../utils/ctx";
import { router } from "expo-router";

export default function SignIn() {
  const { signIn, session, isLoading } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isLoading && session) {
      // Si hay sesión, vamos a (tabs)
      router.replace("(tabs)");
    }
  }, [isLoading, session]);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Ingresa usuario y contraseña");
      return;
    }
    const success = await signIn(username, password);
    if (!success) {
      alert("Credenciales inválidas");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Cargando sesión...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicio de Sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16 },
  title: { fontSize: 20, marginBottom: 16, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 4,
  },
});
