import {
  addItemFavorites,
  getUserFavorites,
  deleteItemFavorites,
} from "./../../services/itemFavService";
import express, { Request, Response } from "express";
import middlewares from "../middlewares";
const router = express.Router();

// GET /item/favorite, 유저의 favorite 정보
router.get("/", middlewares.isAuth, async (req: Request, res: Response) => {
  await getUserFavorites(req, res);
});

// POST /item/favorite body: {id, sid}, favorite 추가
router.post("/", middlewares.isAuth, async (req: Request, res: Response) => {
  await addItemFavorites(req, res);
});

// DELETE /item/favorite?id&sid 즐겨찾기 삭제
router.delete("/", middlewares.isAuth, async (req: Request, res: Response) => {
  await deleteItemFavorites(req, res);
});

export default router;
