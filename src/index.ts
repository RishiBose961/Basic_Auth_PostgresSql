import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import cors from "cors";
const app: Application = express();
const PORT = process.env.PORT || 5000;

import authRoutes from "./routes/auth.route.js"

// * Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  return res.send("It's working 🙌");
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
