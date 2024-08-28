import express, { Request, Response } from "express";
import ItemStockModel from "../../models/itemStock";

// 관리자가 아이템 정보를 쉽게 수정할수 있게.
const router = express.Router();

// TODO: 관리자계정만 접근할수있게

// GET: /admin/item - 아이템 검색
// 쿼리가능 : id,name, page,limit
router.get("/item", async (req: Request, res: Response) => {
  try {
    const query: any = {};

    // 제공된 쿼리 파라미터에 따라 동적으로 쿼리 객체를 생성
    if (req.query.id) {
      query.id = Number(req.query.id);
    }
    if (req.query.sid) {
      query.sid = Number(req.query.sid);
    }
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: "i" };
    }

    // 페이지네이션을 위한 파라미터 설정
    const page = parseInt(req.query.page as string) || 1; // 페이지 번호 (기본값: 1)
    const limit = parseInt(req.query.limit as string) || 10; // 한 페이지에 표시할 아이템 수 (기본값: 10)
    const skip = (page - 1) * limit; // 건너뛸 아이템 수 계산

    // 아이템 검색 및 페이지네이션 적용
    const items = await ItemStockModel.find(query).skip(skip).limit(limit);

    // 총 아이템 수 계산 (페이지네이션용)
    const totalItems = await ItemStockModel.countDocuments(query);

    // 응답 데이터에 페이지 정보 포함
    res.json({
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("아이템 검색 중 오류 발생:", error);
    res.status(500).json({ message: "내부 서버 오류" });
  }
});

// POST: /admin/item - 새로운 아이템 생성
router.post("/item", async (req: Request, res: Response) => {
  try {
    // 'id'가 요청 본문에 있는지 확인
    if (!req.body.id) {
      return res.status(400).json({ message: "아이템 ID가 필요합니다" });
    }

    // 'sid'가 제공되지 않은 경우 0으로 설정
    if (!req.body.sid) {
      req.body.sid = 0;
    }

    // 이미 있는 id 와 sid가 똑같은 아이템이 있는 지 확인.
    const existingItem = await ItemStockModel.findOne({
      $and: [{ id: Number(req.body.id) }, { sid: Number(req.body.sid) }],
    });

    if (existingItem) {
      return res
        .status(400)
        .json({ message: "이미 존재하는 ID 또는 SID입니다" });
    }

    // 새로운 아이템 생성
    const newItem = new ItemStockModel(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.log(error);
    console.error("아이템 생성 중 오류 발생:", error);
    res.status(500).json({ message: "내부 서버 오류" });
  }
});

// PATCH: /admin/item - 기존 아이템 업데이트
router.patch("/item", async (req: Request, res: Response) => {
  try {
    const { id, sid, ...fieldsToUpdate } = req.body;

    if (!id || sid === undefined) {
      return res.status(400).json({ message: "아이템 ID와 SID가 필요합니다" });
    }

    // 업데이트할 필드 설정
    const setFields = {};
    const unsetFields = {};

    // 업데이트할 필드를 setFields에 추가
    for (const key in fieldsToUpdate) {
      if (fieldsToUpdate.hasOwnProperty(key)) {
        setFields[key] = fieldsToUpdate[key];
      }
    }

    // 데이터베이스에 있는 기존 아이템 가져오기
    const existingItem = await ItemStockModel.findOne({
      id: Number(id),
      sid: Number(sid),
    });

    if (!existingItem) {
      return res.status(404).json({ message: "아이템을 찾을 수 없습니다" });
    }

    // 현재 아이템에 존재하는 필드들
    const existingFields = Object.keys(existingItem.toObject());

    // 스키마에 정의된 필드들
    const schemaFields = Object.keys(ItemStockModel.schema.obj);

    // 스키마에 정의되지 않은 필드 중 데이터베이스에 존재하고 요청 본문에 없는 필드를 unsetFields에 추가
    for (const key of existingFields) {
      if (!schemaFields.includes(key) && !fieldsToUpdate.hasOwnProperty(key)) {
        unsetFields[key] = 1;
      }
    }

    // 업데이트 쿼리 설정
    const updateQuery: any = {};
    if (Object.keys(setFields).length > 0) {
      updateQuery.$set = setFields;
    }
    if (Object.keys(unsetFields).length > 0) {
      updateQuery.$unset = unsetFields;
    }

    // 아이템 업데이트
    const updatedItem = await ItemStockModel.findOneAndUpdate(
      { id: Number(id), sid: Number(sid) },
      updateQuery,
      { new: true },
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "아이템을 찾을 수 없습니다" });
    }

    res.json(updatedItem);
  } catch (error) {
    console.error("아이템 업데이트 중 오류 발생:", error);
    res.status(500).json({ message: "내부 서버 오류" });
  }
});

// DELETE: /admin/item - 아이템 삭제
router.delete("/item", async (req: Request, res: Response) => {
  try {
    const { id, sid } = req.body;

    if (!id || sid === undefined) {
      return res.status(400).json({ message: "아이템 ID와 SID가 필요합니다" });
    }

    const deletedItem = await ItemStockModel.findOneAndDelete({
      id: Number(id),
      sid: Number(sid),
    });
    if (!deletedItem)
      return res.status(404).json({ message: "아이템을 찾을 수 없습니다" });

    res.json({ message: "아이템이 성공적으로 삭제되었습니다" });
  } catch (error) {
    console.error("아이템 삭제 중 오류 발생:", error);
    res.status(500).json({ message: "내부 서버 오류" });
  }
});

export default router;
