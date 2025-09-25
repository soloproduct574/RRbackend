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

// ✅ Allowed origins list
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://r-rfrontend.vercel.app",
];

// ---------- MIDDLEWARE ----------
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn("❌ CORS blocked for origin:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev")); // logging
}

connectDb();

// ---------- ROUTES ----------
app.use("/api", allRoutes);

app.get("/", (req, res) => {
  res.send("✅ API & Socket.IO server is running smoothly!");
});

// ---------- SOCKET.IO ----------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
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
