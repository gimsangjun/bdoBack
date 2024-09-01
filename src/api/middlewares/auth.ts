import config from "../../config";
import { Request, Response, NextFunction } from "express";

// 접속한 사용자가 role이 admin인지 확인하는 미들웨어
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 세션 정보에서 사용자 데이터와 역할(role)을 확인
    if (req.session.user && req.session.user.role === "admin") {
      // 역할이 'admin'이면 다음 미들웨어로 진행
      next();
    } else {
      // 역할이 'admin'이 아니면 권한이 없다는 메시지와 함께 403 Forbidden 응답
      return res
        .status(403)
        .json({ message: "접근 권한이 없습니다. 관리자만 접근 가능합니다." });
    }
  } catch (error) {
    console.error("관리자 권한 확인 중 오류 발생:", error);
    res
      .status(500)
      .json({ message: "관리자 권한 확인 중 서버 오류가 발생했습니다." });
  }
};

// 세션이 있는지 확인하는 미들웨어
export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 세션 ID가 있는지 확인
    // 세션 쿠키 값에서 's:' 제거, 서명된 sessionID라 맨앞에 s:가 붙음.
    const sessionID = req.cookies.sessionID.split(".")[0].substring(2);

    if (!sessionID) {
      // 세션 ID가 없는 경우, 로그인이 필요함을 알림
      return res
        .status(401)
        .json({ message: "세션ID가 존재하지 않습니다. 로그인이 필요합니다." });
    }

    // 세션이 존재하는지 확인
    req.sessionStore.get(sessionID, (err, session) => {
      if (err) {
        console.error("세션 조회 중 오류 발생:", err);
        return res
          .status(500)
          .json({ message: "세션 조회 중 오류가 발생했습니다." });
      }

      // 세션이 존재하지 않는 경우, 로그인이 필요함을 알림
      if (!session) {
        return res.status(401).json({
          message: "세션 스토어에 세션이 없습니다. 로그인이 필요합니다.",
        });
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

/**
 * 중복로그인 문제를 해결하기 위해 DB에
 * 저장된 세션을 제거하는 기능을 만들었는데 작동을안함.
 * 라이브러리 문제였음.
 * 노션 세션 - 중복로그인 문제(connect-mongodb-session)
 * 링크 - https://whimsical-dugout-2c6.notion.site/connect-mongodb-session-722a61231dd74f23a903e79b9dcbafd0?pvs=4
 */

// 중복 로그인 방지 : 로그인 시 이전 세션을 삭제하는 미들웨어
export function removePreviousSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // 현재 사용자 이름 가져오기
  const { username } = req.session.user;

  // req.sessionStore가 정의되어 있는지 확인
  if (!req.sessionStore) {
    console.error("세션 저장소를 찾을 수 없습니다.");
    return res.status(500).send("세션 저장소를 찾을 수 없습니다.");
  }

  // req.sessionStore가 정의되어 있다고 TypeScript에 알려주기 위해 as any를 사용
  const sessionStore: any = req.sessionStore;

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
  // 프론트엔드 홈으로 이동.
  res.redirect(config.FrontEndURL);
}
