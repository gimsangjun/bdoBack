import {
  addItemFavorites,
  getUserFavorites,
  putItemFavorites,
  deleteItemFavorites,
} from "./../../services/itemFavService";
import express, { Request, Response } from "express";
import {
  getItemByName,
  getItemPriceByName,
  updateItemPriceByName,
  getItemStockByPage,
} from "../../services/itemService";
import middlewares from "../middlewares";

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

// POST /item/stock body: {name}, 아이템 stock 정보(가격 정보)
router.post("/stock", async (req: Request, res: Response) => {
  try {
    await getItemPriceByName(req, res);
  } catch (error) {
    console.error("아이템 정보 가져오는 중 오류 발생:", error);
    res.status(500).json({ message: "아이템 정보 가져오는 중 오류 발생" });
  }
});

// POST /item/page body: {page} 30개씩 pagination해서 보내주기
router.post("/page", async (req: Request, res: Response) => {
  try {
    await getItemStockByPage(req, res);
  } catch (error) {
    console.error("아이템 페이지 정보 가져오는 중 오류 발생:", error);
    res.status(500).json({ message: "아이템 페이지 정보 가져오는 중 오류 발생" });
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

// GET /favorite, 유저의 favorite 정보
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
