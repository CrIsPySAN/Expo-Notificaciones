// app/(tabs)/index.jsx
import { useState, useEffect, useRef } from "react";
import { Text, View, Button } from "react-native";
import * as Notifications from "expo-notifications";
import { useSession } from "../../utils/ctx";
import { router } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function LocalNotificationsScreen() {
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Importamos signOut del contexto
  const { signOut } = useSession();

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notif) => {
        setNotification(notif);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notificación presionada:", response);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  async function scheduleLocalNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Notificación Local 🎉",
        body: "Esta es una notificación local programada.",
        data: { info: "Local data" },
      },
      trigger: { seconds: 5 },
    });
  }

  // Función para cerrar sesión
  const handleLogout = () => {
    signOut();             // Limpia el token de SecureStore
    router.replace("sign-in"); // Redirige a la pantalla de login
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Notificación recibida: {notification?.request?.content?.body}</Text>

      {/* Botón para programar notificación local */}
      <Button
        title="Programar notificación local (5 seg)"
        onPress={scheduleLocalNotification}
      />

      {/* Botón para cerrar sesión */}
      <Button
        title="Cerrar Sesión"
        onPress={handleLogout}
        color="#FF3B30" // Ejemplo de color rojo
      />
    </View>
  );
}
