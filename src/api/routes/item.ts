import express, { Request, Response } from "express";
import {
  getItemPricesByName,
  getItemPrice,
  updateItemPriceByName,
  initItemStock,
  ItemsByCategory,
  itemModelUpdateAll,
} from "../../services/itemService";
import middlewares from "../middlewares";
const router = express.Router();

// POST /item body: {name}, 아이템의 정보
router.post("/", async (req: Request, res: Response) => {
  await getItemPricesByName(req, res);
});

// GET /item/stock?id&sid, 아이템 stock 정보(가격 정보)
router.get("/stock", async (req: Request, res: Response) => {
  await getItemPrice(req, res);
});

// TODO: updateItem을 그냥 id,sid로만 업데이트하는걸로 바꿔야할듯.
// POST /item/update body:{name}, 아이템 stock 업데이트
router.post("/update", async (req: Request, res: Response) => {
  await updateItemPriceByName(req, res);
});

// 카테고리 별로, mainCategroy와 subCategory가 0이면 모든 아이템
// GET /item/category?mainCategory&subCategory&page
router.get("/category", async (req: Request, res: Response) => {
  await ItemsByCategory(req, res);
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
