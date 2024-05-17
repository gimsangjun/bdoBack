import express, { Request, Response } from "express";
import {
  getItemPricesByName,
  getItemPrice,
  updateItemPriceByName,
  initItemStock,
  ItemsByCategory,
} from "../../services/itemService";
import middlewares from "../middlewares";
const router = express.Router();

// POST /item body: {name}, 아이템의 정보
router.post("/", async (req: Request, res: Response) => {
  try {
    await getItemPricesByName(req, res);
  } catch (error) {
    console.error("아이템 정보 가져오는 중 오류 발생:", error);
    res.status(500).json({ message: "아이템 정보 가져오는 중 오류 발생" });
  }
});

// GET /item/stock?id&sid, 아이템 stock 정보(가격 정보)
router.get("/stock", async (req: Request, res: Response) => {
  try {
    await getItemPrice(req, res);
  } catch (error) {
    console.error("아이템 정보 가져오는 중 오류 발생:", error);
    res.status(500).json({ message: "아이템 정보 가져오는 중 오류 발생" });
  }
});

// POST /item/update body:{name}, 아이템 stock 업데이트
router.post("/update", async (req: Request, res: Response) => {
  try {
    await updateItemPriceByName(req, res);
  } catch (error) {
    console.error("아이템 정보 가져오는 중 오류 발생:", error);
    res.status(500).json({ message: "아이템 정보 가져오는 중 오류 발생" });
  }
});

// 카테고리 별로, mainCategroy와 subCategory가 0이면 모든 아이템
// GET /item/category?mainCategory&subCategory&page
router.get("/category", async (req: Request, res: Response) => {
  try {
    await ItemsByCategory(req, res);
  } catch (error) {
    console.error("아이템 정보 가져오는 중 오류 발생:", error);
    res.status(500).json({ message: "아이템 정보 가져오는 중 오류 발생" });
  }
});

// 개발용도 : GET /item/init, 초기 아이템 stock DB 10개씩 업데이트.
router.get("/init", async (req: Request, res: Response) => {
  try {
    await initItemStock(req, res);
  } catch (error) {
    console.error("아이템 정보 가져오는 중 오류 발생:", error);
    res.status(500).json({ message: "아이템 정보 가져오는 중 오류 발생" });
  }
});

export default router;
