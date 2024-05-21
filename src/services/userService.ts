import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import UserModel, { IUser } from "../models/user";
import axios, { AxiosError } from "axios";
import config from "../config";

const CLIENT_ID = config.DISCORD_CLIENT_ID;
const CLIENT_SECRET = config.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = config.DISCORD_REDIRECT_URI;
const DISCORD_LOGIN_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=identify+email`;

// 회원가입
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };

    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      res.status(400).json({ message: "해당 username은 이미 사용 중입니다." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해시화

    const newUser: IUser = new UserModel({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    console.error("회원가입 중 오류 발생:", error);
    res.status(500).json({ message: "회원가입 중 오류 발생" });
  }
};

// 로그인
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body as { username: string; password: string };

    // req.session이 존재하는지 확인
    if (!req.session) {
      res.status(500).json({ message: "세션이 없습니다." });
      return;
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
      res.status(401).json({ message: "이메일 또는 비밀번호가 일치하지 않습니다." });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
      return;
    }

    // 서버측에 데이터 저장.
    req.session.username = username;

    // 세션 ID를 클라이언트에게 전달
    // 쿠키에 세션 ID를 저장, 클라이언트(브라우저 자동 적용)에게도 적용됨
    // httpOnly true로 하면 자바스크립트로 접근이 안되서 리액트에서 못가져옴.
    // 세션 미들웨어가 자동으로 쿠키를 설정함.
    // res.cookie("sessionID", req.sessionID, { httpOnly: false });

    console.log("로그인 성공 sessionId: ", req.sessionID);
    // res.status(200).json({ message: "로그인 성공", sessionID: req.sessionID, username });
    next();
  } catch (error) {
    console.error("로그인 중 오류 발생:", error);
    res.status(500).json({ message: "로그인 중 오류 발생" });
  }
};

// GET /auth/discord
export const discordAuth = async (req: Request, res: Response) => {
  try {
    // 사용자를 디스코드 인증 페이지로 리디렉션
    res.redirect(DISCORD_LOGIN_URL);
  } catch (error) {
    console.error("디스코드 Auth 로그인 중 오류 발생:", error);
    res.status(500).json({ message: "디스코드 Auth 로그인 오류" });
  }
};

// GET /auth/discord/redirect
export const discordAuthRedirect = async (req: Request, res: Response) => {
  // 인증 코드 받아옴.
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).json({ message: "인증 코드가 전달되지 않았습니다." });
  }

  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", REDIRECT_URI); // http://localhost:3000/auth/discord/redirect

  try {
    // 엑세스 토큰 가져오기
    const tokenResponse = await axios.post("https://discord.com/api/oauth2/token", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // 액세스 토큰으로 사용자 정보 요청
    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `${tokenResponse.data.token_type} ${tokenResponse.data.access_token}`,
      },
    });
    console.log("Discord User Info: ", userResponse.data);
    const user = {
      id: userResponse.data.id,
      username: userResponse.data.global_name,
      avatar: `https://cdn.discordapp.com/avatars/${userResponse.data.id}/${userResponse.data.avatar}.png`,
    };

    res.json(user);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      // 서버로부터 응답이 있는 경우, 응답의 데이터를 로그하고 클라이언트에 전달
      console.error("디스코드 Auth 로그인 중 오류 발생:", axiosError.response.data);
      res
        .status(500)
        .json({ message: "디스코드 Auth 로그인 오류", error: axiosError.response.data });
    } else if (axiosError.request) {
      // 요청이 이루어졌으나 응답을 받지 못한 경우
      console.error("No response received:", axiosError.request);
      res.status(500).json({ message: "서버로부터 응답이 없습니다." });
    } else {
      // 오류 설정 시 발생한 오류
      console.error("Error setting up request:", axiosError.message);
      res.status(500).json({ message: "요청 설정 중 오류가 발생했습니다." });
    }
  }
};

// 로그아웃
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // 세션에서 사용자 정보 제거
    req.session.destroy((err) => {
      if (err) {
        console.error("세션 제거 중 오류 발생:", err);
        res.status(500).json({ message: "로그아웃 중 오류가 발생했습니다." });
      } else {
        // 쿠키 제거
        res.clearCookie("sessionID");
        res.status(200).json({ message: "로그아웃 성공" });
      }
    });
  } catch (error) {
    console.error("로그아웃 중 오류 발생:", error);
    res.status(500).json({ message: "로그아웃 중 오류가 발생했습니다." });
  }
};

// 로그인한 사용자 정보 확인,
// 사용자가 브라우저를 새로고침(ex : 리액트의 redux store가 초기화)해도 쿠키의 세션ID값을 통해 다시 정보를 불러옴
export const profile = async (req: Request, res: Response) => {
  try {
    // 로그인 하지 않은 사용자 처리
    if (!req.cookies || !req.cookies.sessionID) {
      res.status(401).json({ message: "로그인 하지 않은 사용자" });
      return;
    }

    // 세션에서 세션 ID 가져오기
    const sessionID = req.cookies.sessionID.split(".")[0].substring(2);

    // req.sessionStore.clear();

    // 세션 스토어에서 세션 가져오기
    req.sessionStore.get(sessionID, (err, session) => {
      if (err) {
        console.error("세션 조회 중 오류 발생:", err);
        res.status(500).json({ message: "세션 조회 중 오류가 발생했습니다." });
        return;
      }

      // 세션에서 사용자 정보 가져오기
      const username = session?.username;

      if (!username) {
        res.status(401).json({ message: "세션에 사용자 정보가 없습니다." });
        return;
      }

      // 사용자 정보 반환
      res.status(200).json({ username: username });
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
