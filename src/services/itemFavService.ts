import UserModel from "../models/user";
import ItemFavoriteModel from "../models/itemFavority";
import { Request, Response } from "express";
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

    res.status(200).json({ itemFavorites: user.itemFavorites });
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    res.status(500).json({ message: "찜목록 불러오기 에러" });
  }
};

// 사용자 즐겨찾기 카테고라만
// TODO 어려운거 같음. 나중에.
export const getUserFavoritesByCategory = async (req: Request, res: Response) => {
  // const { mainCategory, subCategory, page } = req.query;
  //   if (Number(mainCategory) == 0 && Number(subCategory) > 0) {
  //     res.status(400).json({ message: "wrong request" });
  //   }
  //   // mainCategroy와 subCategory가 0이면 모든 아이템
  //   const { items, totalCount } = await getFavItemsByCategory(
  //     Number(mainCategory),
  //     Number(subCategory),
  //     Number(page)
  //   );
  // res.status(200).json({ items, totalCount });
};

// 사용자 찜목록에 아이템 추가
export const addItemFavorites = async (req: Request, res: Response) => {
  const { id, sid } = req.body;
  const username = req.session.username;
  try {
    // 아이템 정보 가져오기
    let item = await ItemStockModel.findOne({ id, sid });

    if (!item) {
      throw new Error("User or item not found");
    }

    // user.itemFavorites 중복 체크
    const existingFavorite = await ItemFavoriteModel.findOne({
      username,
      id: item.id,
      sid: item.sid,
    });
    if (existingFavorite) {
      throw new Error("Item already exists in user's favorites");
    }

    // FavoriteModel 생성
    // TODO: mainCategory, subCategory제대로 들어가는지 확인.
    const newItemFavorite = new ItemFavoriteModel({
      username: username,
      name: item.name,
      id: item.id,
      sid: item.sid,
      mainCategory: item.mainCategory,
      subCategory: item.subCategory,
    });

    // 변경 사항 저장
    const result = await newItemFavorite.save();
    // console.log("즐겨찾기 추가 ", result);
    const user = await UserModel.findOneAndUpdate(
      {},
      { $push: { itemFavorites: newItemFavorite._id } },
      { new: true }
    );

    console.log("즐겨찾기 추가 완료 :", user);

    res.status(200).json("즐겨찾기 추가 성공");
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

// 사용자 찜목록 삭제
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
    console.log("즐겨찾기 삭제 id sid :", id, sid);

    res.status(200).json("즐겨찾기 삭제 성공");
  } catch (error) {
    console.error("Error deleting item from favorites:", error);
    const errorMessage = error instanceof Error ? error.message : "에러 발생";
    res.status(500).json({ message: errorMessage });
  }
};
