import { Request, Response, NextFunction } from "express";

// 세션이 있는지 확인하는 미들웨어
export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 세션 ID가 있는지 확인
    // 세션 쿠키 값에서 's:' 제거, 서명된 sessionID라 맨앞에 s:가 붙음.
    const sessionID = req.cookies.sessionID.split(".")[0].substring(2);

    if (!sessionID) {
      // 세션 ID가 없는 경우, 로그인이 필요함을 알림
      return res.status(401).json({ message: "세션ID가 존재하지 않습니다. 로그인이 필요합니다." });
    }

    // 세션이 존재하는지 확인
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
      req.session.username = session.username;

      console.log("isAuth: ", session);

      // 다음 미들웨어로 진행
      next();
    });
  } catch (error) {
    console.error("세션 확인 중 오류 발생:", error);
    res.status(500).json({ message: "세션 확인 중 오류가 발생했습니다." });
  }
};

// 중복 로그인 방지 : 로그인 시 이전 세션을 삭제하는 미들웨어
export function removePreviousSession(req: Request, res: Response, next: NextFunction) {
  // 현재 사용자 이름 가져오기
  const { username } = req.session;

  // req.sessionStore가 정의되어 있는지 확인
  if (!req.sessionStore) {
    console.error("세션 저장소를 찾을 수 없습니다.");
    return res.status(500).send("세션 저장소를 찾을 수 없습니다.");
  }

  // req.sessionStore가 정의되어 있다고 TypeScript에 알려주기 위해 as any를 사용
  const sessionStore: any = req.sessionStore;

  console.log("req.sessionID : ", req.sessionStore.all);

  // 이전 세션을 삭제하기 위해 모든 세션을 순회
  sessionStore.all((err: any, sessions: any) => {
    if (err) {
      console.error("이전 세션 조회 실패:", err);
      return res.status(500).send("이전 세션 조회 실패");
    }

    console.log("새로 만들어진 sessionID : ", req.sessionID);
    // 이전 세션 확인 및 삭제
    for (const sessionData of sessions) {
      const sessionID: any = sessionData._id;
      console.log("session ID 순회 중 : ", sessionID);
      const sessionUsername = sessionData.session.username;

      if (sessionUsername === username && sessionID !== req.sessionID) {
        // 현재 세션과 사용자 이름이 같고, 현재 세션과 다른 세션인 경우 삭제
        sessionStore.destroy(sessionID, (err: any) => {
          if (err) {
            console.error("이전 세션 삭제 실패:", err);
          } else {
            console.log("이전 세션 삭제 완료:", sessionID);
          }
        });
      }
    }
  });
  res.status(200).json({ message: "로그인 성공", sessionID: req.sessionID, username });
}
