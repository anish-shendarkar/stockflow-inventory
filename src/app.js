import express from "express";
import productRoutes from "./routes/product.routes.js";
import alertRoutes from "./routes/alert.routes.js";

const app = express();

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api", alertRoutes);

export default app;
