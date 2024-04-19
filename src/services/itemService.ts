import { Request, Response } from "express";
import ItemModel, { IItem } from "../models/item";
import { loadItemStock, loadItemPrices } from "../utils/itemAPI";

// POST: /item, body: {name: "아이템 이름"}에서 아이템 이름을 가지고 DB에 그 아이템을 가져오는 기능
export const getItemByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const item: IItem | null = await ItemModel.findOne({ name });

    if (item) {
      // item.price의 정보가 비어 있다면 loadItemStock 함수를 실행하여 가격 정보 가져오기
      if (!item.price || item.price.length === 0) {
        await loadItemStock(item.id);
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

export const getItemPriceByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    // loadItemPrices 함수를 호출하여 아이템 가격 정보를 가져옴
    const itemPrices = await loadItemPrices(name);

    // 가져온 아이템 가격 정보를 응답으로 반환
    res.status(200).json({ itemPrices });
  } catch (error) {
    console.error("Error fetching item prices:", error);
    res.status(500).json({ message: "Failed to fetch item prices" });
  }
};
