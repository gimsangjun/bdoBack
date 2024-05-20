import UserModel from "../models/user";
import ItemFavoriteModel from "../models/itemFavority";
import { Request, Response } from "express";
import ItemModel, { IItem } from "../models/item";
import {
  updateItemStock,
  initUpdateItemStock,
  getItemPriceById,
  getItemsByCategory,
  updateAllItemModel,
} from "../utils/itemAPI";
import ItemStockModel, { IItemStock } from "../models/itemStock";

// POST: /item, body: {name: "아이템 이름"}
export const getItemPricesByName = async (req: Request, res: Response) => {
  const { name } = req.body; // 요청에서 아이템 이름 받아옴

  try {
    // 문자열이 일부만 일치하는 경우에도 검색
    let itemStocks: IItemStock[] | null = await ItemStockModel.find({
      name: { $regex: new RegExp(name, "i") }, // 대소문자 구분 없이 검색
    });

    if (!itemStocks || itemStocks.length === 0) {
      const items: IItem[] | null = await ItemModel.find({
        name: { $regex: new RegExp(name, "i") }, // 대소문자 구분 없이 검색
      });

      if (!items || items.length === 0) {
        return res.status(404).send("존재하지 않는 아이템입니다.");
      }

      // 각 아이템에 대해 재고 상태를 업데이트
      await Promise.all(items.map((item) => updateItemStock(item.id)));

      // 업데이트 후 다시 아이템 재고 정보 검색
      itemStocks = await ItemStockModel.find({
        name: { $regex: new RegExp(name, "i") }, // 다시 검색
      });
    }

    return res.status(200).json(itemStocks);
  } catch (error) {
    console.error("Error fetching item prices:", error);
    return res.status(500).send("서버 에러가 발생했습니다.");
  }
};

// GET /item/stock?id&sid,  ItemStock(가격 정보 등)으로 부터 데이터를 가져와서 뿌려주는 역할
export const getItemPrice = async (req: Request, res: Response) => {
  try {
    const { id, sid } = req.query;
    // loadItemPrices 함수를 호출하여 아이템 가격 정보를 가져옴
    const itemPrice = await getItemPriceById(Number(id), Number(sid));
    res.status(200).json({ itemPrice });
  } catch (error) {
    console.error("Error fetching item prices:", error);
    res.status(500).json({ message: "Failed to fetch item prices" });
  }
};

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
// 카테고리 별로, mainCategroy와 subCategory가 0이면 모든 아이템
// GET /item/category?mainCategory&subCategory&page
export const ItemsByCategory = async (req: Request, res: Response) => {
  try {
    const { mainCategory, subCategory, page } = req.query;

    if (Number(mainCategory) == 0 && Number(subCategory) > 0) {
      res.status(400).json({ message: "wrong request" });
    }
    // mainCategroy와 subCategory가 0이면 모든 아이템
    const { items, totalCount } = await getItemsByCategory(
      Number(mainCategory),
      Number(subCategory),
      Number(page)
    );

    res.status(200).json({ items, totalCount });

    // // 즐겨찾기 버튼을 눌렀다면, items중에서 유저가 즐겨찾기만 아이템 가져오기
    // if (Number(isFav) === 1 && username) {
    //   // 사용자의 즐겨찾기 아이템 목록 조회
    //   const favorites = await getFavoriteItemsByUsername(username); // 가정: getFavoriteItemsByUsername는 즐겨찾기 목록을 반환

    //   // 즐겨찾기에 포함된 아이템만 필터링
    //   // id까지 같은얘 중에, price.sid까지 같은 얘를 리턴
    //   const favoriteItems = items.filter((item) =>
    //     // Check if any of the favorite items have the same id and a matching sid in any of the item's price entries.
    //     favorites.some(
    //       (fav) => fav.id === item.id && item.price.some((p: any) => p.sid === fav.sid)
    //     )
    //   );
    //   // 필터링된 아이템으로 totalCount 재조정
    //   res.status(200).json({ items: favoriteItems, totalCount: favoriteItems.length });
    // } else {
    //   // 즐겨찾기 필터링 없이 모든 아이템 반환

    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch item prices" });
  }
};

// 개발용도  : itemModel 전체 업데이트
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
