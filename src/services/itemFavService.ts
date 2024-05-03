import UserModel from "../models/user";
import ItemFavoriteModel from "../models/itemFavority";
import { Request, Response } from "express";
import ItemModel, { IItem } from "../models/item";
import { updateItemStock } from "../utils/itemAPI";
import ItemStockModel from "../models/itemStock";

// 사용자 찜목록 리턴
export const getUserFavorites = async (req: Request, res: Response) => {
  const username = req.session.username;
  try {
    // 사용자 정보를 가져올 때 populate() 메서드를 사용하여 favorites 필드를 참조하여 실제 아이템 정보를 가져옵니다.
    // populate에는 DB에 저장되는 이름 그대로 스키마이름 그대로
    const user = await UserModel.findOne({ username }).populate("itemFavorites");

    if (!user) {
      throw new Error("User not found");
    }
    res.status(200).json({ username: user.username, favorites: user.itemFavorites });
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    res.status(500).json({ message: "찜목록 불러오기 에러" });
  }
};

// / 사용자 찜목록에 아이템 추가
export const addItemFavorites = async (req: Request, res: Response) => {
  const { itemId, sid, priceThreshold } = req.body;
  const username = req.session.username;
  try {
    // 사용자 정보 가져오기
    const user = await UserModel.findOne({ username });

    // 아이템 정보 가져오기
    let item = await ItemStockModel.findOne({ id: itemId, sid });

    if (!item) {
      // 만약, 내 DB에 등록된 stock정보가 없으면
      await updateItemStock(itemId);
      item = await ItemStockModel.findOne({ id: itemId, sid });
    }

    if (!user || !item) {
      throw new Error("User or item not found");
    }

    // 찜한 아이템에 대한 PriceAlert 생성
    const priceAlert = {
      priceThreshold: priceThreshold,
      alertEnabled: true,
    };

    // FavoriteModel 생성
    const newFavorite = new ItemFavoriteModel({
      user: user.username,
      name: item.name,
      id: item.id,
      sid: item.sid,
      priceAlert: priceAlert,
    });

    // user.itemFavorites 중복 체크
    const existingFavorite = await ItemFavoriteModel.findOne({
      user: user.username,
      id: item.id,
      sid: item.sid,
    });
    if (existingFavorite) {
      throw new Error("Item already exists in user's favorites");
    }

    // 사용자의 찜목록에 아이템 추가
    console.log("newFavorite:", newFavorite._id);
    user.itemFavorites.push(newFavorite._id);

    // 변경 사항 저장
    await newFavorite.save();
    await user.save();
    const { itemFavorites } = user;

    res.status(200).json({ user: { username, itemFavorites } });
  } catch (error) {
    // 아래의 erorr는 문제 없이 잘 출력됨.
    console.error("Error adding item to favorites:", error);
    // 아래와 같이 하면 Property 'meesage' does not exist on type '{}'. 에러가 뜸.
    // 이는 error 객체가 어떤 타입의 속성을 가지고 있는지 명시적으로 알려주지 않았기 때문에 발생하는 문제
    // res.status(500).json({ message: error });
    // TypeScript에서 instanceof를 사용함으로써 TypeScript 컴파일러는 해당 객체가 특정 클래스의 인스턴스인지 여부를 확인할수 있음.
    const errorMessage = error instanceof Error ? error.message : "에러 발생";
    res.status(500).json({ message: errorMessage });
  }
};

// 사용자 찜목록 수정
// 사용자 찜목록 수정
export const putItemFavorites = async (req: Request, res: Response) => {
  const { priceThreshold, alertEnabled } = req.body;
  const favoriteId = req.params.id;
  const username = req.session.username;

  try {
    // 사용자 정보 가져오기
    const user = await UserModel.findOne({ username });

    // ItemFavoriteModel에서 favoriteId를 활용하여 해당 아이템을 찾음
    const favorite = await ItemFavoriteModel.findById(favoriteId);

    if (!user) {
      throw new Error("putItemFavorites: not found user Erorr");
    }

    // 찾은 아이템이 없거나 해당 아이템의 유저가 현재 접근한 유저와 다른 경우 에러 처리
    if (!favorite || favorite.user !== user.username) {
      throw new Error("Favorite item not found or unauthorized access");
    }

    // priceAlert가 null이 아닌 경우에만 값 설정
    if (favorite.priceAlert) {
      favorite.priceAlert.priceThreshold = priceThreshold;
      favorite.priceAlert.alertEnabled = alertEnabled;
    }

    // 변경 사항 저장
    await favorite.save();

    // 변경된 사용자 정보 반환
    // ObjectId만 넘어오는데, 진짜 데이터를 가져오게 => populatea 사용
    await user.populate("itemFavorites");
    const { itemFavorites } = user;
    res.status(200).json({ user: { username, itemFavorites } });
  } catch (error) {
    console.error("Error updating item in favorites:", error);
    const errorMessage = error instanceof Error ? error.message : "에러 발생";
    res.status(500).json({ message: errorMessage });
  }
};

/// 사용자 찜목록 삭제
export const deleteItemFavorites = async (req: Request, res: Response) => {
  const favoriteId = req.params.id;

  const username = req.session.username;
  try {
    // 사용자 정보 가져오기
    const user = await UserModel.findOne({ username });

    if (!user) {
      throw new Error("deleteItemFavorites: not found user Erorr");
    }

    // ItemFavoriteModel에서 favoriteId를 활용하여 해당 아이템을 찾음
    const favorite = await ItemFavoriteModel.findById(favoriteId);

    // 다른 DB처럼 연동이 안되기 때문에 , user와 favorite 둘다 삭제해줘야됨.

    // 찾은 아이템이 없거나 해당 아이템의 유저가 현재 접근한 유저와 다른 경우 에러 처리
    if (!favorite || favorite.user !== user.username) {
      throw new Error("Favorite item not found or unauthorized access");
    }

    // 사용자의 찜목록에서 해당 아이템 제거
    const index = user.itemFavorites.indexOf(favorite._id);
    if (index !== -1) {
      user.itemFavorites.splice(index, 1);
    }

    // 변경 사항 저장
    await user.save();

    // 해당 찜 삭제
    await ItemFavoriteModel.findOneAndDelete({ _id: favoriteId });

    // ObjectId만 넘어오는데, 진짜 데이터를 가져오게 => populatea 사용
    await user.populate("itemFavorites");
    const { itemFavorites } = user;

    res.status(200).json({ user: { username, itemFavorites } });
  } catch (error) {
    console.error("Error deleting item from favorites:", error);
    const errorMessage = error instanceof Error ? error.message : "에러 발생";
    res.status(500).json({ message: errorMessage });
  }
};
