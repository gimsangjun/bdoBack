import express, { Request, Response } from "express";
import {
  initItemStock,
  itemModelUpdateAll,
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

// 개발용도  : itemModel 전체 업데이트
// GET : /item/update-all
// router.get("/update-all", async (req: Request, res: Response) => {
//   await itemModelUpdateAll(req, res);
// });

// 개발용도 : GET /item/init, 초기 아이템 stock DB 10개씩 업데이트.
router.get("/init", async (req: Request, res: Response) => {
  await initItemStock(req, res);
});

export default router;
