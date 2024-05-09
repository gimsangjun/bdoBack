import { Response } from "express";
// BdoMarket과 API요청을 하는 얘들만
import config from "../config";
import axios from "axios";
import ItemModel, { IItem } from "../models/item";
import ItemStockModel, { IItemStock } from "../models/itemStock";
import UserModel, { IUser } from "../models/user";
import ItemFavoriteModel, { IItemFavorite } from "../models/itemFavority";

const BdoMarketUrl = config.BdoMarketURL;

export const getItemInfo = async (id: number) => {
  try {
    const item: IItem | null = await ItemModel.findOne({ id });
    return item;
  } catch (error) {
    throw error;
  }
};

export const getItemPriceById = async (id: number, sid: number) => {
  try {
    const itemPrice = await ItemStockModel.findOne({ id, sid });

    // 아이템 가격 정보가 없으면, updateItemStock 함수를 호출하여 업데이트
    if (!itemPrice) {
      const item: IItem | null = await ItemModel.findOne({ id });
      if (!item) {
        // 존재하지 않는 아이템
        throw new Error("Item not found");
      } else {
        await updateItemStock(id);
        // 다시 아이템 가격 정보를 가져옴
        const updatedItemPrices = await ItemStockModel.find({ id, sid });
        console.log("updatedItemPrices :", updatedItemPrices);
        return updatedItemPrices;
      }
    } else {
      return itemPrice;
    }
  } catch (error) {
    throw error;
  }
};

// Item의 price(ItemStock에 저장되어있음)를 업데이트
// ItemStock을 저장 및 업데이트
export const updateItemStock = async (id: number) => {
  try {
    console.log("아이템 가격 업데이트 : ", id);
    const reqUrl = `${BdoMarketUrl}/item?lang=kr&id=${id}`;
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
    const savedItemStocks = await ItemStockModel.find({ id });
    const itemStockIds = savedItemStocks.map((itemStock) => itemStock._id);

    const item = await ItemModel.findOne({ id });

    if (item) {
      item.price = itemStockIds;
      await item.save();
    }
  } catch (error) {
    console.error("Error loading item info:", error);
  }
};

// 카테고리 별로, mainCategroy와 subCategory가 0이면 모든 아이템
export const getItemsByCategory = async (
  mainCategory: number,
  subCategory: number,
  page: number
) => {
  try {
    const pageSize = 30; // 한 페이지에 표시될 아이템 수
    const skip = (page - 1) * pageSize; // 건너뛸 아이템 수 계산

    ///////////////////////////
    // TODO: 개발용 stock데이터 없는 얘들업데이트, 나중에 기초적인 stock(가격)데이터 다 쌓이면 지우기
    let updateItems: IItem[] | null = [];
    const updateQuery: any = { mainCategory };
    if (subCategory !== 0) updateQuery["subCategory"] = subCategory;

    updateItems = await ItemModel.find(updateQuery)
      .populate("price") // 자동으로 ObjectID로 이루어진 price를 실제 값으로 가져옴.
      .skip(page * pageSize)
      .limit(pageSize);

    // 최대 10번만 돌게
    let count = 0;
    for (const item of updateItems) {
      if (count >= 10) break;
      if (item.price.length === 0) {
        await updateItemStock(item.id);
        count += 1;
      }
    }
    ///////////////////////////

    let items: any[] = [];
    let totalCount: number = 0;
    const query: any = { mainCategory };
    // 이런식으로 if문을 효율적으로 줄일수 있다.
    if (subCategory !== 0) query["subCategory"] = subCategory;

    items = await ItemModel.find(query)
      .populate("price") // 자동으로 ObjectID로 이루어진 price를 실제 값으로 가져옴.
      .skip(page * pageSize)
      .limit(pageSize);

    totalCount = await ItemModel.countDocuments(query);

    console.log(items);
    return { items, totalCount };
  } catch (error) {
    throw error;
  }
};

// 개발용도 초기 itemStock DB를 구성하기 위한 함수
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
