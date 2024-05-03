import express from "express";
import { signup, login, logout, profile } from "../../services/userService";
import middlewares from "../middlewares";

const router = express.Router();

// POST /auth/signup
router.post("/signup", signup);

// POST /auth/login
router.post("/login", login, middlewares.removePreviousSession);

// GET /auth/logout
router.get("/logout", logout);

// GET /auth/profile
router.get("/profile", profile);

// GET /auth/session
// 현재 메모리에 있는 모든 세션 정보를 확인
router.get("/session", (req, res) => {
  // connect-mongodb-session을 사용할경우(connect-mongodb-session-quickfix, app.ts 확인)
  // => 현재 sesionStore.all이 먹히질않고, 라이브러리 문제(이슈탭에 있음)인데 그 개발자가 업데이트를 안해서 다른 개발자가 임시로 만든거 사용
  if (req.sessionStore?.all) {
    // 옵셔널 체이닝 사용하여 메소드 존재 확인
    req.sessionStore.all((err, sessions) => {
      if (err) {
        console.error("/sessions error: ", err); // 오류 로그 추가
        return res
          .status(500)
          .json({ message: "세션 데이터를 가져오는 중에 오류가 발생했습니다." });
      }
      // console.log("/sessions : ", sessions); // 세션 데이터 로그
      res.status(200).json(sessions);
    });
  } else {
    res.status(500).json({ message: "세션 스토어가 정의되지 않았습니다." });
  }
});

export default router;
