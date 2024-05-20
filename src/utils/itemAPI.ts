import { Response } from "express";
// BdoMarket과 API요청을 하는 얘들만
import config from "../config";
import axios from "axios";
import ItemModel, { IItem } from "../models/item";
import ItemStockModel, { IItemStock } from "../models/itemStock";
import UserModel, { IUser } from "../models/user";
import ItemFavoriteModel, { IItemFavorite } from "../models/itemFavority";
import fs from "fs/promises";
import path from "path";

const BdoMarketUrl = config.BdoMarketURL;

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
    // console.log("아이템 가격 업데이트 : ", id);
    const reqUrl = `${BdoMarketUrl}/item?lang=kr&id=${id}`;
    const response = await axios.get(reqUrl);

    const itemModel = await ItemModel.findOne({ id });
    if (!itemModel) throw new Error("존재하지 않는 아이템 업데이트 시도");
    console.log("아이템 가격 업데이트 : ", itemModel);

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
          mainCategory: itemModel.mainCategory,
          subCategory: itemModel.mainCategory,
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

    let items: any[] = [];
    let totalCount: number = 0;
    let query: any = {};
    // 이런식으로 if문을 효율적으로 줄일수 있다.
    if (mainCategory !== 0) query["mainCategory"] = mainCategory;
    if (subCategory !== 0) query["subCategory"] = subCategory;
    console.log("getItemsByCategory - query :", query);

    // TODO 초기에 ItemStock에 데이터가 없으니까
    // const result: string[] | undefined = await initUpdateItemStock(query);
    // if (!result || result.length === 0) {
    //   console.log("얘는 업데이트 종료!", mainCategory, subCategory, page);
    // }

    items = await ItemStockModel.find(query).skip(skip).limit(pageSize);

    totalCount = await ItemStockModel.countDocuments();

    // console.log(items);
    return { items, totalCount };
  } catch (error) {
    throw error;
  }
};

// 개발용도 , 새 아이템 추가시 ItemModel 전부 업데이트
export const updateAllItemModel = async () => {
  // TODO: ../model/allItems.json 파일을 긁어와서 ItemModel에 전부 넣어줘
  try {
    // JSON 파일의 경로를 설정
    const filePath = path.join(__dirname, "../models/allItems.json");

    // 파일 읽기
    const jsonData = await fs.readFile(filePath, "utf-8");
    const items = JSON.parse(jsonData);

    // 기존 모든 아이템 삭제
    await ItemModel.deleteMany({});

    // 새로운 아이템 데이터 삽입
    await ItemModel.insertMany(items);

    console.log("Item models have been successfully updated from JSON file.");
  } catch (error) {
    console.error("Failed to update item models from JSON file:", error);
  }
  // 아래는 아르샤 API
  // try {
  //   // API에서 아이템 데이터 가져오기
  //   const response = await axios.get(`${BdoMarketUrl}/market`);
  //   const items = response.data;

  //   // MongoDB의 ItemModel 데이터 전체 교체 로직
  //   // 기존 모든 아이템 삭제
  //   await ItemModel.deleteMany({});
  //   console.log("기존아이템 삭제");

  //   // 새로운 아이템 데이터 삽입
  //   await ItemModel.insertMany(items);

  //   console.log("Item models have been successfully updated.");
  // } catch (error) {
  //   console.error("Failed to update item models:", error);
  // }
};

// 개발용도 초기 itemStock DB를 구성하기 위한 함수
export const initUpdateItemStock = async (query: any) => {
  try {
    // ItemModel에서 모든 아이템의 name을 가져옴
    const allItems = await ItemModel.find(query);

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
