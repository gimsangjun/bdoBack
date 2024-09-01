import fs from "fs/promises";
import path from "path";
import config from "../config";
import axios from "axios";
import ItemModel from "../models/item";

export default class ItemAPI {
  static BdoMarketUrl = config.BdoMarketURL;

  static updateItem = async (items) => {
    try {
      // 단일 아이템일 경우 배열로 변환
      if (!Array.isArray(items)) {
        items = [items];
      }

      // 아이템 ID를 추출하고 중복을 제거합니다.
      const itemIds = [...new Set(items.map((item) => item.itemId || item.id))];
      const reqUrl = `${ItemAPI.BdoMarketUrl}/item?kr/item?lang=kr`;

      const response = await axios.post(reqUrl, itemIds);
      const itemDataArray = Array.isArray(response.data)
        ? response.data
        : [response.data];

      for (const itemData of itemDataArray) {
        let item = await ItemModel.findOne({
          id: itemData.id,
        });

        if (!item) {
          item = new ItemModel({
            id: itemData.id,
            sid: itemData.sid || 0,
            name: itemData.name || "Unknown",
            mainCategory: itemData.mainCategory,
            subCategory: itemData.subCategory,
            price: itemData.basePrice,
            grade: itemData.grade || "common",
            imgUrl: itemData.imgUrl || "",
            details: itemData.details || "",
            updateAt: new Date(),
          });
        } else {
          item.price = itemData.basePrice;
          item.updateAt = new Date();
        }

        await item.save();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios error:",
          error.response ? error.response.data : error.message,
        );
      } else {
        console.error("Error updating item info:", error.message);
      }
      throw error;
    }
  };

  // src/models/itemsData.json을 읽어서 itemsModel로 저장
  static initItem = async () => {
    try {
      const filePath = path.join(__dirname, "../models/itemsData.json");
      const data = await fs.readFile(filePath, "utf8");
      const items = JSON.parse(data);

      for (const itemData of items) {
        const item = new ItemModel({
          id: itemData.id,
          sid: itemData.sid || 0, // 아이템 강화등급이 있을경우
          name: itemData.name,
          mainCategory: itemData.mainCategory,
          subCategory: itemData.subCategory,
          price: itemData.price || 0,
          grade: itemData.grade || "common",
          imgUrl: itemData.imgUrl || "",
          details: itemData.details || "",
          components: itemData.components || [], // 하위 재료
          updateAt: new Date(),
        });

        // 아이템을 저장합니다.
        await item.save();
      }
    } catch (error) {
      console.error("Error initializing items from JSON:", error.message);
      throw error; // 오류 발생 시 예외를 다시 발생시킵니다.
    }
  };
}
