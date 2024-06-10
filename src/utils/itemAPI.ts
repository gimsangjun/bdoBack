import config from "../config";
import axios from "axios";
import ItemModel, { IItem } from "../models/item";
import ItemStockModel from "../models/itemStock";
import fs from "fs/promises";
import path from "path";

export default class ItemAPI {
  static BdoMarketUrl = config.BdoMarketURL;

  /**
   * ItemStock을 저장 및 업데이트
   * tem의 price(ItemStock에 저장되어있음)를 업데이트
   * @param items Item[] or priceAlert[]
   */
  static updateItemStock = async (items: any[]) => {
    try {
      // items의 id를 모두 꺼내서 하나의 배열로 만듬.
      //여기서 겹치는 id가 있을수 있으므로 Set으로 중복 제거
      // items의 priceAlert의 경우 item.id대신 item.itemId임
      // itemId 순서 중요함. 뒤에있을경우 item.id 우선쉰위가 id가 있는지 확인 -> _id 이렇게 가버려서 , itemId가 뒤에있으면 정상적으로 동작안함.
      const itemIds = [...new Set(items.map((item) => item.itemId || item.id))];

      const reqUrl = `${ItemAPI.BdoMarketUrl}/item?kr/item?lang=kr`;
      const response = await axios.post(reqUrl, itemIds);

      // 단수일 경우에도 처리해주기 위함.
      const data = Array.isArray(response.data)
        ? response.data
        : [response.data];

      for (const itemDatas of data) {
        // 단수일 경우에도 처리해주기 위함.
        const itemDataArray = Array.isArray(itemDatas)
          ? itemDatas
          : [itemDatas];
        for (const itemData of itemDataArray) {
          // itemStock이 없을 경우 만들어서 업데이트 해줌.
          let itemStock = await ItemStockModel.findOne({
            id: itemData.id,
            sid: itemData.sid,
          });

          if (!itemStock) {
            // 존재하지 않는 경우 새로운 ItemStock 생성
            const itemModel = await ItemModel.findOne({ id: itemData.id });

            itemStock = new ItemStockModel({
              id: itemData.id,
              sid: itemData.sid,
              name: itemModel.name,
              mainCategory: itemData.mainCategory,
              subCategory: itemData.subCategory,
              grade: itemModel.grade,
              imgUrl: itemModel.imgUrl,
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
          } else {
            // 기존 ItemStock 업데이트
            itemStock.basePrice = itemData.basePrice;
            itemStock.currentStock = itemData.currentStock;
            itemStock.totalTrades = itemData.totalTrades;
            itemStock.priceMin = itemData.priceMin;
            itemStock.priceMax = itemData.priceMax;
            itemStock.lastSoldPrice = itemData.lastSoldPrice;
            itemStock.lastSoldTime = itemData.lastSoldTime;
            itemStock.updateAt = new Date();
          }

          await itemStock.save();
        }
      }
    } catch (error) {
      console.error(
        "ItemAPI.updateItemStock - Error updating item info:",
        error.response ? error.response.data : error.message,
        error.stack,
      );
      throw error;
    }
  };

  // 이렇게 하면, itemPrice == 0 인경우에만 itemStock 업데이트하면됨.
  // 개발용도 , 새 아이템 추가시 ItemModel 전부 업데이트 + itemModel 전체 업데이트 + itemModel의 데이터를 기본 가격만 없이 itemStockModel에 모두 업데이트
  static updateAllItemModel = async () => {
    // 아르샤 API에서 가져올려고 했는데, 영어로만 리턴와서 임시로 json에 데이터 추가해서 처리.
    try {
      const filePath = path.join(__dirname, "../models/allItems.json");
      const jsonData = await fs.readFile(filePath, "utf-8");
      const items = JSON.parse(jsonData);

      // 기존 모든 아이템 삭제
      await ItemModel.deleteMany({});

      // 새로운 아이템 데이터 삽입
      await ItemModel.insertMany(items);
      console.log("아이템 모델 완료.");

      // ItemModel의 모든 데이터를 ItemStockModel에 삽입
      for (const item of items) {
        // ItemStockModel에서 동일한 이름의 아이템 검색
        const existingItem = await ItemStockModel.findOne({ name: item.name });
        if (!existingItem) {
          // 존재하지 않는 경우 새로 삽입
          const newItem = new ItemStockModel({
            ...item,
            sid: 0, // 기본 값 설정
            minEnhance: 0,
            maxEnhance: 0,
            imgUrl: item.imgUrl,
            grade: item.grade,
            basePrice: 0,
            currentStock: 0,
            totalTrades: 0,
            priceMin: 0,
            priceMax: 0,
            lastSoldPrice: 0,
            lastSoldTime: Date.now(),
            updateAt: Date.now(),
          });
          await newItem.save();
        }
      }
      console.log("Item models have been successfully updated from JSON file.");
    } catch (error) {
      console.error(
        "ItemAPI.updateAllItemModel - Error updating AllItem :",
        error.response ? error.response.data : error.message,
        error.stack,
      );
      throw error;
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

  //개발용도 :  items에 있는 grade와 imgUrl를 itemsStock에 업데이트
  static updateItemStocksWithGradesAndImages = async () => {
    try {
      const allItems = await ItemModel.find({});

      let bulkOps = [];

      for (const item of allItems) {
        const { name, grade, imgUrl } = item;

        bulkOps.push({
          updateMany: {
            filter: { name: name },
            update: { $set: { grade: grade, imgUrl: imgUrl } },
          },
        });
      }

      if (bulkOps.length > 0) {
        const result = await ItemStockModel.bulkWrite(bulkOps);
        console.log(`Updated ${result.modifiedCount} item stocks.`);
      }
    } catch (error) {
      console.error(
        "ItemAPI.updateItemStocksWithGradesAndImages Error updating item stocks:",
        error.response ? error.response.data : error.message,
        error.stack,
      );
      throw error;
    }
  };

  // 개발용도
  static test = async () => {
    try {
      const itemsToUpdate = [
        "단검",
        "타리스만",
        "장식매듭",
        "노리개",
        "각궁",
        "수리검",
        "표창",
        "완갑",
        "고검",
        "라곤",
        "비츠아리",
        "금계",
        "크라툼",
        "마레카",
        "샤드",
        "도장",
        "비녀칼",
        "중력핵",
      ];

      const regex = new RegExp(`고드아이드 (${itemsToUpdate.join("|")})`);

      const items = await ItemModel.find({
        name: { $regex: regex, $options: "i" },
      });

      for (const item of items) {
        const paddedId = item.id.toString().padStart(8, "0");
        const newImgUrl = `https://cdn.bdolytics.com/img/new_icon/06_pc_equipitem/00_common/08_subweapon/${paddedId}.webp`;

        await ItemModel.updateOne(
          { _id: item._id },
          { $set: { imgUrl: newImgUrl } },
        );
      }

      console.log("아이템 이미지 URL 업데이트 완료.");
    } catch (error) {
      console.error("아이템 이미지 URL 업데이트 중 오류 발생:", error);
    }
  };
}
