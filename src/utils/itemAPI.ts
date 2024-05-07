import { Response } from "express";
// BdoMarket과 API요청을 하는 얘들만
import config from "../config";
import axios from "axios";
import ItemModel, { IItem } from "../models/item";
import ItemStockModel, { IItemStock } from "../models/itemStock";
import UserModel, { IUser } from "../models/user";
import ItemFavoriteModel, { IItemFavorite } from "../models/itemFavority";

const BdoMarketUrl = config.BdoMarketURL;

// Item의 price(ItemStock에 저장되어있음)를 업데이트
// ItemStock을 저장 및 업데이트
// TODO: 나중에 시간마다 업데이트 해줘야됨.
export const updateItemStock = async (itemId: number) => {
  try {
    console.log("아이템 가격 업데이트 : ", itemId);
    const reqUrl = `${BdoMarketUrl}/item?lang=kr&id=${itemId}`;
    const response = await axios.get(reqUrl);

    // TODO: response Data가 단수로 넘어와도, list로 감싸기
    const data = Array.isArray(response.data) ? response.data : [response.data];
    // 이미 ItemStock에 동일한 데이터가 있으면, price만 업데이트
    for (const itemData of data) {
      const existingItemStock = await ItemStockModel.findOne({
        id: itemData.id,
        sid: itemData.sid,
      });
      if (existingItemStock) {
        console.log("이미 존재하는 itemStock: ", itemData.name);
        // TODO: updateAt을 살펴봐서 업데이트한지 몇분 안지났으면 하지않음.
        // 이미 존재하는 경우, price만 업데이트
        existingItemStock.basePrice = itemData.basePrice;
        existingItemStock.currentStock = itemData.currentStock;
        existingItemStock.totalTrades = itemData.totalTrades;
        existingItemStock.priceMin = itemData.priceMin;
        existingItemStock.priceMax = itemData.priceMax;
        existingItemStock.lastSoldPrice = itemData.lastSoldPrice;
        existingItemStock.lastSoldTime = itemData.lastSoldTime;
        existingItemStock.updateAt = new Date();

        await existingItemStock.save();
      } else {
        console.log("존재하지 않은 itemStock: ", itemData.name);
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
          updateAt: new Date(),
        });

        await newItemStock.save();
      }
    }

    // Item 모델의 price에 ItemStockModel(가격 정보)를 추가해줌.
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

// 초기 itemStock DB를 구성하기 위한 함수
export const initUpdateItemStock = async () => {
  try {
    // ItemModel에서 모든 아이템의 name을 가져옴
    const allItems = await ItemModel.find({});

    let count = 0; // 업데이트된 아이템 수를 세는 변수

    const result = [];

    // 각 아이템의 name을 순회하면서 ItemStockModel에 해당하는 아이템 stock 정보가 없으면 updateItemStock 함수를 호출하여 데이터를 넣음
    for (const item of allItems) {
      const existingItemStock = await ItemStockModel.findOne({ name: item.name });
      if (!existingItemStock) {
        if (count >= 10) {
          // 이미 10개의 아이템이 업데이트되었으면 더 이상 호출하지 않음
          break;
        }
        await updateItemStock(item.id);
        result.push(item.name);
        count++; // 아이템이 업데이트될 때마다 count 증가
      }
    }
    return result;
  } catch (error) {
    console.error("Error initializing item stocks:", error);
  }
};

export const getItemPrice = async (name: String) => {};
