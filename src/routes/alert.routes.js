import express from "express";
import { getLowStockAlerts } from "../controllers/alert.controller.js";

const router = express.Router();

router.get(
    "/companies/:companyId/alerts/low-stock",
    getLowStockAlerts
);

export default router;
