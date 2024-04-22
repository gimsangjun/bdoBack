import jsonData from "./allItems.json";
import ItemModel, { IItem } from "./item";

export async function initializeItems() {
  jsonData.forEach(async (itemData: any) => {
    // TODO: 이렇게 하나하나씩 삽입해도
    try {
      const newItem: IItem = new ItemModel({
        id: itemData.id,
        name: itemData.name,
        mainCategory: itemData.mainCategory,
        subCategory: itemData.subCategory,
      });

      await newItem.save();
    } catch (error) {
      console.error(`Error saving item: ${error}`);
    }
  });
  console.log("초기 아이템 삽입완료");
}