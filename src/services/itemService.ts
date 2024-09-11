import { Request, Response } from "express";
import ItemModel from "../models/item";
import ItemAPI from "../utils/itemAPI";

// GET: /item query: id, sid, name, page, limit
export const getItemsByQuery = async (req: Request, res: Response) => {
  try {
    const query: any = {};

    // 제공된 쿼리 파라미터에 따라 동적으로 쿼리 객체를 생성
    if (req.query.id) {
      query.id = Number(req.query.id);
    }
    if (req.query.sid) {
      query.sid = Number(req.query.sid);
    }
    if (req.query.mainCategory) {
      query.mainCategory = Number(req.query.mainCategory);
    }
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: "i" };
    }

    // 페이지네이션을 위한 파라미터 설정
    const page = parseInt(req.query.page as string) || 1; // 페이지 번호 (기본값: 1)
    const limit = parseInt(req.query.limit as string) || 10; // 한 페이지에 표시할 아이템 수 (기본값: 10)
    const skip = (page - 1) * limit; // 건너뛸 아이템 수 계산

    // 아이템 검색 및 페이지네이션 적용
    const items = await ItemModel.find(query).skip(skip).limit(limit);

    // 총 아이템 수 계산 (페이지네이션용)
    const totalItemsCount = await ItemModel.countDocuments(query);

    // 응답 데이터에 페이지 정보 포함
    res.json({
      items,
      totalItemsCount,
      totalPages: Math.ceil(totalItemsCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("아이템 검색 중 오류 발생:", error);
    res.status(500).json({ message: "내부 서버 오류" });
  }
};

// POST: /item/id-and-sid, body: items: [{id , sid}]
export const getItemsByIdAndSid = async (req: Request, res: Response) => {
  const { items } = req.body;

  // items가 배열이 아니거나, 빈 배열인 경우 처리
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Invalid items array" });
  }

  try {
    const conditions = items.map((item) => ({
      id: item.id,
      sid: item.sid,
    }));

    const foundItems = await ItemModel.find({
      $or: conditions,
    });

    res.json({ items: foundItems });
  } catch (error) {
    console.error("Error fetching items by id and sid:", error);
    res.status(500).json({ message: "Error fetching items", error });
  }
};

// POST: /item/update, body: {items}에서  loadItemStock함수를 호출하는 함수
export const updateItemsPrice = async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // items 배열을 body에서 가져옴

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }
    await ItemAPI.updateItem(items);

    // 업데이트된 아이템 정보를 다시 가져옴
    const uniqueItemIdentifiers = items.map((item: any) => ({
      id: item.id,
      sid: item.sid,
    }));

    const updatedItems = await ItemModel.find({
      $or: uniqueItemIdentifiers,
    });

    res.status(200).json({ items: updatedItems });
  } catch (error) {
    // 오류 발생 시 500 에러 반환
    console.error("Error updating item prices:", error);
    res.status(500).json({ message: "Failed to update item prices" });
  }
};

//*****************  아래는 관리자만 접근 가능. *****************
// POST: /item - 새로운 아이템 생성
export const createNewItem = async (req: Request, res: Response) => {
  try {
    // 'id'가 요청 본문에 있는지 확인
    if (!req.body.id) {
      return res.status(400).json({ message: "아이템 ID가 필요합니다." });
    }

    // 'sid'가 제공되지 않은 경우 0으로 설정
    if (!req.body.sid) {
      req.body.sid = 0;
    }

    // 이미 있는 id 와 sid가 같은 아이템이 있는지 확인
    const existingItem = await ItemModel.findOne({
      $and: [{ id: Number(req.body.id) }, { sid: Number(req.body.sid) }],
    });

    if (existingItem) {
      return res
        .status(400)
        .json({ message: "이미 존재하는 ID 또는 SID입니다." });
    }

    // 새로운 아이템 생성
    const newItem = new ItemModel(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error("아이템 생성 중 오류 발생:", error);
    res.status(500).json({ message: "내부 서버 오류." });
  }
};

// PATCH: /item - 기존 아이템 업데이트
export const updateExistingItem = async (req: Request, res: Response) => {
  try {
    const { id, sid, ...fieldsToUpdate } = req.body;

    if (!id || sid === undefined) {
      return res.status(400).json({ message: "아이템 ID와 SID가 필요합니다." });
    }

    const updateQuery = { $set: fieldsToUpdate };

    const updatedItem = await ItemModel.findOneAndUpdate(
      { id: Number(id), sid: Number(sid) },
      updateQuery,
      { new: true },
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "아이템을 찾을 수 없습니다." });
    }

    res.json(updatedItem);
  } catch (error) {
    console.error("아이템 업데이트 중 오류 발생:", error);
    res.status(500).json({ message: "내부 서버 오류." });
  }
};

// DELETE: /item - 아이템 삭제
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { id, sid } = req.body;

    if (!id || sid === undefined) {
      return res.status(400).json({ message: "아이템 ID와 SID가 필요합니다." });
    }

    const deletedItem = await ItemModel.findOneAndDelete({
      id: Number(id),
      sid: Number(sid),
    });

    if (!deletedItem) {
      return res.status(404).json({ message: "아이템을 찾을 수 없습니다." });
    }

    res.json({ message: "아이템이 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error("아이템 삭제 중 오류 발생:", error);
    res.status(500).json({ message: "내부 서버 오류." });
  }
};
