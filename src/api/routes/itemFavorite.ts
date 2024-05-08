import {
  addItemFavorites,
  getUserFavorites,
  putItemFavorites,
  deleteItemFavorites,
} from "./../../services/itemFavService";
import express, { Request, Response } from "express";
import middlewares from "../middlewares";
const router = express.Router();

// GET /item/favorite, 유저의 favorite 정보
router.get("/favorite", middlewares.isAuth, async (req: Request, res: Response) => {
  try {
    await getUserFavorites(req, res);
  } catch (error) {
    console.error("아이템 찜 추가 오류 발생:", error);
    res.status(500).json({ message: "아이템 찜 추가 오류 발생" });
  }
});

// POST /item/favorite body: {itemid, sid, priceThreshold}, favorite 추가
router.post("/favorite", middlewares.isAuth, async (req: Request, res: Response) => {
  try {
    await addItemFavorites(req, res);
  } catch (error) {
    console.error("아이템 찜 추가 오류 발생:", error);
    res.status(500).json({ message: "아이템 찜 추가 오류 발생" });
  }
});

// PUT 장바구니 수정 body {priceThreshold와 alertEnabled}
router.put("/favorite/:id", middlewares.isAuth, async (req: Request, res: Response) => {
  try {
    await putItemFavorites(req, res);
  } catch (error) {
    console.error("아이템 찜 추가 오류 발생:", error);
    res.status(500).json({ message: "아이템 찜 추가 오류 발생" });
  }
});

// DELETE 장바구니 삭제
router.delete("/favorite/:id", middlewares.isAuth, async (req: Request, res: Response) => {
  try {
    await deleteItemFavorites(req, res);
  } catch (error) {
    console.error("아이템 찜 추가 오류 발생:", error);
    res.status(500).json({ message: "아이템 찜 추가 오류 발생" });
  }
});

export default router;