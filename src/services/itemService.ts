import UserModel from "../models/user";
import ItemFavoriteModel from "../models/itemFavority";
import { Request, Response } from "express";
import ItemModel, { IItem } from "../models/item";
import {
  updateItemStock,
  initUpdateItemStock,
  getItemInfo,
  getItemPriceById,
  getItemsByCategory,
} from "../utils/itemAPI";
import ItemStockModel from "../models/itemStock";

// POST: /item, body: {name: "아이템 이름"}에서 아이템 이름을 가지고 DB에 그 아이템을 가져오는 기능
export const getItemByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const item: IItem | null = await ItemModel.findOne({ name });
    if (item) {
      const item_: IItem | null = await getItemInfo(item.id);
      res.status(200).json({ item_ });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ message: "Internal server error" });
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
