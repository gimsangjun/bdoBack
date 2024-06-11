import express, { Request, Response } from "express";
import {
  getItemsByQuery,
  getItemsByIdAndSid,
  updateItemsPrice,
} from "../../services/itemService";
const router = express.Router();

// POST: /item, body: {query: "여러가지 쿼리들", page: 없으면 기본값 1}
router.post("/", async (req: Request, res: Response) => {
  await getItemsByQuery(req, res);
});

// POST: /item/id-and-sid, body: {id : [], sid : []}
router.post("/id-and-sid", async (req: Request, res: Response) => {
  await getItemsByIdAndSid(req, res);
});

// POST /item/update body:{items}, 아이템 stock 업데이트
router.post("/update", async (req: Request, res: Response) => {
  await updateItemsPrice(req, res);
});

export default router;
