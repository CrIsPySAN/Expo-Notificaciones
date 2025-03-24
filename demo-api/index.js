require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
// O si usas Node < 18, instala node-fetch:
// const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || "supersecreto";

// Datos falsos de usuario (para login de ejemplo)
const USER_FAKE = {
  name: "Juan",
  lastName: "Perez",
  username: "juan",
  password: "pass123",
  email: "juan@email.com",
};

// Ruta pública
app.get("/", (req, res) => {
  res.json({ message: "Demo APP NGROK" });
});

// Endpoint de login
app.post("/auth", (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);

  // Validación contra datos falsos
  if (username !== USER_FAKE.username || password !== USER_FAKE.password) {
    return res.status(401).json({ message: "Credenciales incorrectas" });
  }

  // Generar token JWT
  const token = jwt.sign({ username: USER_FAKE.username }, SECRET_KEY, {
    expiresIn: "1h",
  });

  const dataResponse = {
    name: USER_FAKE.name,
    lastName: USER_FAKE.lastName,
    user: USER_FAKE.username,
    email: username + "@gmail.com",
    token,
  };

  return res.json({ message: "Inicio de sesión exitoso", data: dataResponse });
});

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "Token requerido" });
  }

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }
    req.user = decoded;
    next();
  });
};

// Ruta protegida de ejemplo
app.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Acceso autorizado", user: req.user });
});

// Ruta para enviar notificación push
app.post("/send-notification", verifyToken, async (req, res) => {
  try {
    const { expoPushToken, message } = req.body;
    if (!expoPushToken) {
      return res.status(400).json({ message: "Falta el expoPushToken" });
    }

    // Construimos el payload con prioridad alta (Android)
    const notificationPayload = {
      to: expoPushToken,
      title: "Notificación desde la API",
      body: message || "Mensaje de ejemplo",
      data: { extraData: "Algun valor extra" },
      sound: "default",
      priority: "high",
      channelId: "default", // IMPORTANTE para Android
    };

    // Enviamos la notificación a los servidores de Expo
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notificationPayload),
    });

    const data = await response.json();
    console.log("Respuesta de Expo:", data); // Debug

    if (response.ok) {
      return res.json({
        message: "Notificación enviada correctamente",
        data,
        notificationPayload,
      });
    } else {
      console.error("Error al enviar notificación:", data);
      return res
        .status(500)
        .json({ message: "Error al enviar notificación", data });
    }
  } catch (error) {
    console.error("Error interno:", error);
    return res
      .status(500)
      .json({ message: "Error interno al enviar la notificación" });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
