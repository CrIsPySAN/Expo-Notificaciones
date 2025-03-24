import React, { useState, useEffect, useRef } from "react";
import { Text, View, Button, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useSession } from "../../utils/ctx";
import api from "../../utils/api";

// 1) Configuración para que las notificaciones en foreground
//    aparezcan como banner (o alerta) en Android/iOS.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// 2) Función para pedir permisos y obtener el token de notificaciones.
async function registerForPushNotificationsAsync() {
  // En Android, crea un canal de notificaciones con prioridad alta.
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      // sound: "default", // Puedes habilitar sonido por defecto
    });
  }

  if (Device.isDevice) {
    // Verifica permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("¡No se otorgaron permisos para notificaciones push!");
      return;
    }

    // Obtén el Project ID (si usas EAS)
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    try {
      const pushTokenString = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("Expo Push Token:", pushTokenString);
      return pushTokenString;
    } catch (e) {
      alert(`Error obteniendo token push: ${e}`);
      return;
    }
  } else {
    alert("Debes usar un dispositivo físico para notificaciones push");
  }
}

export default function PushScreen() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(null);

  // Referencias a los listeners
  const notificationListener = useRef();
  const responseListener = useRef();

  // Para verificar si hay sesión (token JWT)
  const { session } = useSession();

  useEffect(() => {
    // Al montar, pide permisos y obtén el token
    registerForPushNotificationsAsync().then((token) => {
      if (token) setExpoPushToken(token);
    });

    // Listener para notificaciones recibidas en foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notif) => {
        setNotification(notif);
      });

    // Listener para respuestas (usuario tocó la notificación)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notificación presionada:", response);
      });

    // Limpieza de listeners al desmontar
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Envía el push token a tu API para disparar la notificación
  async function sendPushNotificationFromAPI() {
    if (!session) {
      alert("Debes iniciar sesión antes de enviar notificaciones push");
      return;
    }
    if (!expoPushToken) {
      alert("No se ha obtenido el Expo Push Token aún");
      return;
    }

    try {
      // Llama a tu endpoint /send-notification con el token y un mensaje
      const response = await api.post("/send-notification", {
        expoPushToken,
        message: "¡Notificación Push desde la API con canal default!",
        priority: "high",
      });

      console.log("Respuesta del servidor:", response.data);
      alert(response.data?.message || "Notificación enviada correctamente");
    } catch (error) {
      console.error("Error al enviar la notificación:", error);
      alert("Error al enviar la notificación");
    }
  }

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "space-around" }}>
      <Text>Tu Expo Push Token: {expoPushToken}</Text>

      {/* Muestra la última notificación recibida (en foreground) */}
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text>Título: {notification?.request?.content?.title || ""}</Text>
        <Text>Cuerpo: {notification?.request?.content?.body || ""}</Text>
        <Text>
          Data: {notification ? JSON.stringify(notification.request.content.data) : ""}
        </Text>
      </View>

      {/* Botón para disparar la notificación push desde el servidor */}
      <Button
        title="Enviar Notificación desde la API"
        onPress={sendPushNotificationFromAPI}
      />
    </View>
  );
}
