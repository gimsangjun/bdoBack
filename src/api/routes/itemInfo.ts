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
    // TODO: 이미 있는 id,sid가 있는 아이템은 추가 불가.
    // 'id'가 요청 본문에 있는지 확인
    if (!req.body.id) {
      return res.status(400).json({ message: "아이템 ID가 필요합니다" });
    }

    // 'sid'가 제공되지 않은 경우 0으로 설정
    if (!req.body.sid) {
      req.body.sid = 0;
    }

    const newItem = new ItemStockModel(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error("아이템 생성 중 오류 발생:", error);
    res.status(500).json({ message: "내부 서버 오류" });
  }
});

// PATCH: /admin/item - 기존 아이템 업데이트
router.patch("/item", async (req: Request, res: Response) => {
  try {
    // TODO: 이미 있는 id,sid가 있는 아이템은 업데이트 불가
    const { id, sid } = req.body;

    if (!id || sid === undefined) {
      return res.status(400).json({ message: "아이템 ID와 SID가 필요합니다" });
    }

    const updatedItem = await ItemStockModel.findOneAndUpdate(
      { id: Number(id), sid: Number(sid) },
      req.body,
      { new: true },
    );
    if (!updatedItem)
      return res.status(404).json({ message: "아이템을 찾을 수 없습니다" });

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
