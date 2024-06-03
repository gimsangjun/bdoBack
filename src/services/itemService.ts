import UserModel from "../models/user";
import ItemFavoriteModel from "../models/itemFavority";
import { Request, Response } from "express";
import ItemModel, { IItem } from "../models/item";
import {
  updateItemStock,
  initUpdateItemStock,
  updateAllItemModel,
} from "../utils/itemAPI";
import ItemStockModel, { IItemStock } from "../models/itemStock";

/**
 *
 * 종류별로 있던 쿼리 하나로 통합.
 * 노션 - 동적 쿼리 작성
 * 링크 - https://whimsical-dugout-2c6.notion.site/2f994ca60008460284f8f7272b82bb50
 *
 */
// POST: /item, body: {query: "여러가지 쿼리들", page: }
export const getItemsByQuery = async (req: Request, res: Response) => {
  const {
    query: { mainCategory, subCategory, name, id, sid },
    page,
  } = req.body;

  const itemsPerPage = 30;
  const skip = (page - 1) * itemsPerPage; // 건너뛸 아이템 수

  // MongoDB 쿼리를 위한 조건 객체를 동적으로 생성
  let conditions: any = {};
  // mainCategory와 subCategory가 0이면 conditions에 들어가지 않아서 전체 아이템 검색가능
  if (mainCategory) conditions["mainCategory"] = mainCategory;
  if (subCategory) conditions["subCategory"] = subCategory;
  if (id) conditions["id"] = id;
  if (sid) conditions["sid"] = sid;
  if (name) conditions["name"] = { $regex: new RegExp(name, "i") }; // 대소문자 구분 없이 부분 일치 검색

  try {
    const totalItems = await ItemStockModel.countDocuments(conditions);
    const items = await ItemStockModel.find(conditions)
      .skip(skip)
      .limit(itemsPerPage);

    res.json({
      items: items,
      totalCount: totalItems,
      pages: Math.ceil(totalItems / itemsPerPage),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching items by query:", error);
    res.status(500).json({ message: "Error fetching items", error });
  }
};

// POST: /item/id-and-sid, body: items: [{id , sid}]
export const getItemsByIdAndSid = async (req: Request, res: Response) => {
  const { items } = req.body;

  // items가 배열이 아니거나, 빈 배열인 경우 처리
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Invalid items array" });
  }

  try {
    const conditions = items.map((item) => ({
      id: item.id,
      sid: item.sid,
    }));

    const foundItems = await ItemStockModel.find({
      $or: conditions,
    });

    res.json({ items: foundItems });
  } catch (error) {
    console.error("Error fetching items by id and sid:", error);
    res.status(500).json({ message: "Error fetching items", error });
  }
};

// POST: /item/update, body: {items}에서  loadItemStock함수를 호출하는 함수
export const updateItemsPrice = async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // items 배열을 body에서 가져옴

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    // 아이템 이름 중복 제거
    const uniqueItemNames = [...new Set(items.map((item: any) => item.name))];

    // 중복 제거된 아이템 이름에 대해 updateItemStock 호출
    const updatePromises = uniqueItemNames.map(async (name: string) => {
      const item: IItem | null = await ItemModel.findOne({ name });

      if (item) {
        await updateItemStock(item.id); // 아이템 stock(가격 정보) 업데이트
      }
    });

    // 모든 업데이트 작업이 완료될 때까지 기다림
    await Promise.all(updatePromises);

    // 업데이트된 아이템 정보를 다시 가져옴
    const updatedItems = await ItemStockModel.find({
      name: { $in: uniqueItemNames },
    });

    res.status(200).json({ items: updatedItems });
  } catch (error) {
    // 오류 발생 시 500 에러 반환
    console.error("Error updating item prices:", error);
    res.status(500).json({ message: "Failed to update item prices" });
  }
};

// 개발용도  : itemModel 전체 업데이트 + itemModel의 데이터를 기본 가격만 없이 itemStockModel에 모두 업데이트
// GET : /item/update-all
export const itemModelUpdateAll = async (req: Request, res: Response) => {
  try {
    await updateAllItemModel();
    return res.status(200).json({ message: "finished" });
  } catch (error) {
    console.error("Error itemModelUpdateALl:", error);
    return res.status(500).json({ message: "Failed to itemModelUpdateALl" });
  }
};

// 개발용도 GET /item/init, 초기 아이템 stock DB 10개씩 업데이트.
export const initItemStock = async (req: Request, res: Response) => {
  try {
    const result = await initUpdateItemStock({});
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Error init item stocks:", error);
    return res.status(500).json({ message: "Failed to init item stocks" });
  }
};
