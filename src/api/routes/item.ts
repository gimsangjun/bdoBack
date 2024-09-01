import express, { Request, Response } from "express";
import {
  getItemsByQuery,
  getItemsByIdAndSid,
  updateItemsPrice,
  createNewItem,
  updateExistingItem,
  deleteItem,
} from "../../services/itemService";
import { isAdmin } from "../middlewares/auth";
const router = express.Router();

// GET: /item, query: id, sid, name, page, limit
router.get("/", async (req: Request, res: Response) => {
  await getItemsByQuery(req, res);
});

// POST: /item/id-and-sid, body: items: [{id , sid}]
router.post("/id-and-sid", async (req: Request, res: Response) => {
  await getItemsByIdAndSid(req, res);
});

// POST /item/update, body: {items}, 아이템 stock(가격) 업데이트
router.post("/update", async (req: Request, res: Response) => {
  await updateItemsPrice(req, res);
});

// 관리자만 접근 가능한 엔드포인트

// POST: /item - 새로운 아이템 생성
router.post("/", isAdmin, async (req: Request, res: Response) => {
  await createNewItem(req, res);
});

// PATCH: /item - 기존 아이템 업데이트
router.patch("/", isAdmin, async (req: Request, res: Response) => {
  await updateExistingItem(req, res);
});

// DELETE: /item - 아이템 삭제
router.delete("/", isAdmin, async (req: Request, res: Response) => {
  await deleteItem(req, res);
});

export default router;
