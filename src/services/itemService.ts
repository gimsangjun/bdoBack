import UserModel from "../models/user";
import ItemFavoriteModel from "../models/itemFavority";
import { Request, Response } from "express";
import ItemModel, { IItem } from "../models/item";
import { updateItemStock, initUpdateItemStock } from "../utils/itemAPI";
import ItemStockModel from "../models/itemStock";

// POST: /item, body: {name: "아이템 이름"}에서 아이템 이름을 가지고 DB에 그 아이템을 가져오는 기능
export const getItemByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const item: IItem | null = await ItemModel.findOne({ name });

    if (item) {
      // item.price의 정보가 비어 있다면 loadItemStock 함수를 실행하여 가격 정보 가져오기
      if (!item.price || item.price.length === 0) {
        await updateItemStock(item.id); // 아이템 stock(가격정보 ) 업데이트
        // 다시 아이템 정보를 가져와서 업데이트된 정보를 반환
        const updatedItem: IItem | null = await ItemModel.findOne({ name });
        res.status(200).json({ item: updatedItem });
      } else {
        res.status(200).json({ item });
      }
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ItemStock(가격 정보 등)으로 부터 데이터를 가져와서 뿌려주는 역할
export const getItemPriceByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    // loadItemPrices 함수를 호출하여 아이템 가격 정보를 가져옴
    const itemPrices = await ItemStockModel.find({ name });

    // 아이템 가격 정보가 없으면, updateItemStock 함수를 호출하여 업데이트
    if (!itemPrices || itemPrices.length === 0) {
      const item: IItem | null = await ItemModel.findOne({ name });
      if (!item) {
        res.status(404).json({ message: "Item not found" });
      } else {
        await updateItemStock(item.id); // 아이템 가격 업데이트
        // 다시 아이템 가격 정보를 가져옴
        const updatedItemPrices = await ItemStockModel.find({ name });
        console.log("updatedItemPrices :", updatedItemPrices);
        res.status(200).json({ itemPrices: updatedItemPrices });
      }
    } else {
      // 가져온 아이템 가격 정보를 응답으로 반환
      res.status(200).json({ itemPrices });
    }
  } catch (error) {
    console.error("Error fetching item prices:", error);
    res.status(500).json({ message: "Failed to fetch item prices" });
  }
};

// TODO: 일단은 개발, 테스트 용도
// POST: /item/update, body: {name: "아이템 이름"}에서  loadItemStock함수를 호출하는 함수
export const updateItemPriceByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    // 아이템 정보를 DB에서 찾음
    const item: IItem | null = await ItemModel.findOne({ name });

    if (item) {
      // 아이템 정보가 있다면 loadItemStock 함수를 호출하여 가격 정보 업데이트
      await updateItemStock(item.id); // 아이템 stock(가격정보 ) 업데이트

      // 업데이트된 아이템 정보를 다시 가져와서 반환
      const updatedItem = await ItemStockModel.find({ name });
      res.status(200).json({ items: updatedItem });
    } else {
      // 아이템 정보가 없다면 404 에러 반환
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    // 오류 발생 시 500 에러 반환
    console.error("Error updating item prices:", error);
    res.status(500).json({ message: "Failed to update item prices" });
  }
};

// TODO: Pagenation? 기술에 대해서 정리하기
// TODO: 카테고리 별로도 데이터를 가져올수 있어야됨.
// ItemStockModel에서 page별로 30개씩 데이터를 가져와서 뿌려주는 함수
export const getItemStockByPage = async (req: Request, res: Response) => {
  try {
    // TODO: validaton Page가 1이상인지 확인.
    const { page } = req.body;
    const pageSize = 30; // 한 페이지에 표시될 아이템 수

    const skip = (page - 1) * pageSize; // 건너뛸 아이템 수 계산

    // TODO: 아직 ItemStockModel에 데이터를 업데이트를 안해서 일단은 그냥 ItemModel에서 가져오기.
    // 해당 페이지의 아이템 데이터 가져오기
    const itemStocks = await ItemStockModel.find({})
      .skip(skip) // 건너뛸 아이템 수 적용
      .limit(pageSize); // 페이지 크기만큼 데이터 제한

    // TODO: 나중에 카테고리 별로도 데이터를 가져올 때, 특정조건문을 달아서 Count를 해야할듯.
    // 총 데이터 수 조회
    const totalCount = await ItemStockModel.countDocuments();

    // 가져온 아이템 데이터를 응답으로 반환
    return res.status(200).json({ itemStocks, totalCount });
  } catch (error) {
    console.error("Error fetching item stocks by page:", error);
    return res.status(500).json({ message: "Failed to fetch item stocks by page" });
  }
};

// GET /item/init, 초기 아이템 stock DB 10개씩 업데이트. 개발용도
export const initItemStock = async (req: Request, res: Response) => {
  try {
    const result = await initUpdateItemStock();
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Error init item stocks:", error);
    return res.status(500).json({ message: "Failed to init item stocks" });
  }
};
