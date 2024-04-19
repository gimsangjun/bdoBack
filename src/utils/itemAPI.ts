import config from "../config";
import axios from "axios";
import ItemModel, { IItem } from "../models/item";
import ItemStockModel, { IItemStock } from "../models/itemStock";

const BdoMarketUrl = config.BdoMarketURL;

// Item의 price(ItemStock에 저장되어있음)를 업데이트
// ItemStock을 저장 및 업데이트
// TODO: 나중에 시간마다 업데이트 해줘야됨.
export const loadItemStock = async (itemId: number) => {
  try {
    const reqUrl = `${BdoMarketUrl}/item?lang=kr&id=${itemId}`;
    const response = await axios.get(reqUrl);

    // 이미 ItemStock에 동일한 데이터가 있으면, price만 업데이트
    for (const itemData of response.data) {
      console.log(itemData);
      const existingItemStock = await ItemStockModel.findOne({
        id: itemData.id,
        sid: itemData.sid,
      });
      if (existingItemStock) {
        console.log("이미 존재하는 itemStock!");
        // 이미 존재하는 경우, price만 업데이트
        existingItemStock.basePrice = itemData.basePrice;
        existingItemStock.currentStock = itemData.currentStock;
        existingItemStock.totalTrades = itemData.totalTrades;
        existingItemStock.priceMin = itemData.priceMin;
        existingItemStock.priceMax = itemData.priceMax;
        existingItemStock.lastSoldPrice = itemData.lastSoldPrice;
        existingItemStock.lastSoldTime = itemData.lastSoldTime;

        await existingItemStock.save();
      } else {
        console.log("존재하지 않은 itemStock!");
        // 존재하지 않는 경우, 새로운 ItemStock 생성 및 저장
        const newItemStock = new ItemStockModel({
          id: itemData.id,
          name: itemData.name,
          sid: itemData.sid,
          minEnhance: itemData.minEnhance,
          maxEnhance: itemData.maxEnhance,
          basePrice: itemData.basePrice,
          currentStock: itemData.currentStock,
          totalTrades: itemData.totalTrades,
          priceMin: itemData.priceMin,
          priceMax: itemData.priceMax,
          lastSoldPrice: itemData.lastSoldPrice,
          lastSoldTime: itemData.lastSoldTime,
        });

        await newItemStock.save();
      }
    }

    // Item 모델 업데이트
    const savedItemStocks = await ItemStockModel.find({ id: itemId });
    const itemStockIds = savedItemStocks.map((itemStock) => itemStock._id);

    const item = await ItemModel.findOne({ id: itemId });

    if (item) {
      item.price = itemStockIds;
      await item.save();
    }
  } catch (error) {
    console.error("Error loading item info:", error);
  }
};

// ItemStock(가격 정보 등)으로 부터 데이터를 가져와서 뿌려주는 역할
export const loadItemPrices = async (name: string) => {
  try {
    // 아이템 이름으로 ItemStockModel에서 아이템을 찾음
    const itemStocks = await ItemStockModel.find({ name });
    return itemStocks;
  } catch (error) {
    console.error("Error loading item prices:", error);
    throw new Error("Failed to load item prices");
  }
};
