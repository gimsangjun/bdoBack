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

      // 아이템 ID를 추출하고 중복을 제거함. id하나만 넘기면 sid 전체 정보(강화등급)가 넘어옴
      const itemIds = [...new Set(items.map((item) => item.itemId || item.id))];
      const reqUrl = `${ItemAPI.BdoMarketUrl}/item?lang=kr`;

      const response = await axios.post(reqUrl, itemIds);
      const itemDataArray = Array.isArray(response.data)
        ? response.data
        : [response.data];

      for (const itemData of itemDataArray) {
        let item = await ItemModel.findOne({
          id: itemData.id,
          sid: itemData.sid,
        });

        if (!item) {
          // sid가 0인 아이템은 항상 DB에 존재하고, 여기에서 type과 imgUrl와 같은 변하지 않는 아이템들을 똑같이 로드해주기 위함.
          let tempItem = await ItemModel.findOne({
            id: itemData.id,
          });

          if (!tempItem) {
            console.error(
              "아예 DB에 존재하지 않는 아이템입니다. Id: ",
              itemData.id,
            );
            throw new Error("아예 DB에 존재하지 않는 아이템입니다.");
          }

          item = new ItemModel({
            id: itemData.id,
            sid: itemData.sid || 0,
            name: itemData.name || "Unknown",
            mainCategory: tempItem.mainCategory,
            subCategory: tempItem.subCategory,
            price: itemData.basePrice,
            grade: tempItem.grade || "common",
            imgUrl: tempItem.imgUrl || "",
            type: tempItem.type || "",
            details: tempItem.details || "",
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
      // DB초기화는 직접 쿼리문으로 하셈
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
          type: itemData.type || "",
          details: itemData.details || "",
          components: itemData.components || [], // 하위 재료
          updateAt: new Date(),
        });

        // 아이템을 저장합니다.
        await item.save();
      }
      console.log("초기 아이템 로드 완료");
    } catch (error) {
      console.error("Error initializing items from JSON:", error.message);
      throw error; // 오류 발생 시 예외를 다시 발생시킵니다.
    }
  };
}
