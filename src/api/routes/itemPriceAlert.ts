import express, { Request, Response } from "express";
import middlewares from "../middlewares";
import {
  addItemPriceAlert,
  deleteItemPriceAlert,
  getItemPriceAlerts,
  updateItemPriceAlert,
} from "../../services/itemPriceAlertService";

const router = express.Router();

//GET /item/alert
router.get("/", middlewares.isAuth, async (req: Request, res: Response) => {
  await getItemPriceAlerts(req, res);
});

//POST /item/alert
router.post("/", middlewares.isAuth, async (req: Request, res: Response) => {
  await addItemPriceAlert(req, res);
});

//PUT /item/alert body = {alertId}
router.put("/", middlewares.isAuth, async (req: Request, res: Response) => {
  await updateItemPriceAlert(req, res);
});

//DELETE /item/alert body = {alertId}
router.delete("/", middlewares.isAuth, async (req: Request, res: Response) => {
  await deleteItemPriceAlert(req, res);
});

export default router;
