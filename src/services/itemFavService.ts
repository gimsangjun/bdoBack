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
    console.log("getUserFavorites", user);

    res.status(200).json({ username: user.username, itemFavorites: user.itemFavorites });
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    res.status(500).json({ message: "찜목록 불러오기 에러" });
  }
};

// / 사용자 찜목록에 아이템 추가
export const addItemFavorites = async (req: Request, res: Response) => {
  const { id, sid } = req.body;
  const username = req.session.username;
  try {
    // 사용자 정보 가져오기
    const user = await UserModel.findOne({ username });

    // 아이템 정보 가져오기
    let item = await ItemStockModel.findOne({ id, sid });

    if (!item) {
      // 만약, 내 DB에 등록된 stock정보가 없으면
      await updateItemStock(id);
      item = await ItemStockModel.findOne({ id, sid });
    }

    if (!user || !item) {
      throw new Error("User or item not found");
    }

    // user.itemFavorites 중복 체크
    const existingFavorite = await ItemFavoriteModel.findOne({
      username: user.username,
      id: item.id,
      sid: item.sid,
    });
    if (existingFavorite) {
      throw new Error("Item already exists in user's favorites");
    }

    // FavoriteModel 생성
    const newFavorite = new ItemFavoriteModel({
      username: user.username,
      name: item.name,
      id: item.id,
      sid: item.sid,
    });

    // 사용자의 찜목록에 아이템 추가
    console.log("newFavorite:", newFavorite._id);
    user.itemFavorites.push(newFavorite._id);

    // 변경 사항 저장
    await newFavorite.save();
    await user.save();

    // const user = await UserModel.findOne({ username }).populate("itemFavorites");
    //TODO: user.itemFavorites에 ObjectID가 담겨져 있어서 곧바로 쓸수 없어서 아래와 같이 썼는데 더 효율적인 방법이 없을까?
    console.log("즐겨찾기 추가 id sid:", id, sid);
    const user_ = await UserModel.findOne({ username }).populate("itemFavorites");

    res.status(200).json({ username, itemFavorites: user_?.itemFavorites });
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

/// 사용자 찜목록 삭제
export const deleteItemFavorites = async (req: Request, res: Response) => {
  const { id, sid } = req.query;

  const username = req.session.username;
  try {
    // 사용자 정보 가져오기
    const user = await UserModel.findOne({ username });

    if (!user) {
      throw new Error("deleteItemFavorites: not found user Erorr");
    }

    // ItemFavoriteModel에서 favoriteId를 활용하여 해당 아이템을 찾음
    const favorite = await ItemFavoriteModel.findOne({ username, id, sid });

    // 다른 DB처럼 연동이 안되기 때문에 , user와 favorite 둘다 삭제해줘야됨.
    // 찾은 아이템이 없거나 해당 아이템의 유저가 현재 접근한 유저와 다른 경우 에러 처리
    if (!favorite || favorite.username !== user.username) {
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
    await ItemFavoriteModel.findOneAndDelete({ _id: favorite._id });

    // ObjectId만 넘어오는데, 진짜 데이터를 가져오게 => populatea 사용
    await user.populate("itemFavorites");
    const { itemFavorites } = user;
    console.log("즐겨찾기 삭제 id sid :", id, sid);

    res.status(200).json({ user: { username, itemFavorites } });
  } catch (error) {
    console.error("Error deleting item from favorites:", error);
    const errorMessage = error instanceof Error ? error.message : "에러 발생";
    res.status(500).json({ message: errorMessage });
  }
};
