import { Request, Response, NextFunction } from "express";

// 세션이 있는지 확인하는 미들웨어
export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 세션 ID가 있는지 확인
    const sessionID = req.cookies.sessionID;

    if (!sessionID) {
      // 세션 ID가 없는 경우, 로그인이 필요함을 알림
      return res.status(401).json({ message: "세션ID가 존재하지 않습니다. 로그인이 필요합니다." });
    }

    // 세션이 존재하는지 확인
    // TODO : 나중에 메모리 말고, DB에 직접 저장
    req.sessionStore.get(sessionID, (err, session) => {
      if (err) {
        console.error("세션 조회 중 오류 발생:", err);
        return res.status(500).json({ message: "세션 조회 중 오류가 발생했습니다." });
      }

      // 세션이 존재하지 않는 경우, 로그인이 필요함을 알림
      if (!session) {
        return res
          .status(401)
          .json({ message: "세션 스토어에 세션이 없습니다. 로그인이 필요합니다." });
      }

      // 세션이 존재하는 경우, req.session에 정보 담기.
      req.session.user = session.user;

      // 다음 미들웨어로 진행
      next();
    });
  } catch (error) {
    console.error("세션 확인 중 오류 발생:", error);
    res.status(500).json({ message: "세션 확인 중 오류가 발생했습니다." });
  }
};
