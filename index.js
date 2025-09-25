import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import helmet from "helmet";
import morgan from "morgan";

// custom modules
import connectDb from "./src/configs/db.js";
import allRoutes from "./app.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ---------- MIDDLEWARE ----------
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(helmet());
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ✅ Only parse JSON if content-type is application/json
app.use((req, res, next) => {
  if (req.headers["content-type"]?.startsWith("application/json")) {
    return express.json()(req, res, next);
  }
  return next();
});

app.use(express.urlencoded({ extended: true }));

// ---------- DB ----------
connectDb();

// ---------- ROUTES ----------
app.use("/api", allRoutes);

app.get("/", (req, res) => {
  res.send("✅ API & Socket.IO server is running smoothly!");
});

// ---------- SOCKET.IO ----------
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("message", (data) => {
    socket.broadcast.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ---------- START SERVER ----------
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode`);
  console.log(`🌐 Listening at http://localhost:${PORT}`);
});
