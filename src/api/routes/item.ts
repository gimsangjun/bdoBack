import { getItemByName, getItemPriceByName } from "../../services/itemService";
import express, { Request, Response } from "express";

const router = express.Router();

// POST /item body: {name}, 아이템의 정보
router.post("/", async (req: Request, res: Response) => {
  try {
    await getItemByName(req, res);
  } catch (error) {
    console.error("아이템 정보 가져오는 중 오류 발생:", error);
    res.status(500).json({ message: "아이템 정보 가져오는 중 오류 발생" });
  }
});

// POST /item/stock body: {name}, 아이템 stock 정보
router.post("/stock", async (req: Request, res: Response) => {
  try {
    await getItemPriceByName(req, res);
  } catch (error) {
    console.error("아이템 정보 가져오는 중 오류 발생:", error);
    res.status(500).json({ message: "아이템 정보 가져오는 중 오류 발생" });
  }
});

export default router;
