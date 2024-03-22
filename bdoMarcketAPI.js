const axios = require("axios");
const fs = require("fs");
const path = require("path");

function removeFirstAndLastChar(str) {
  // 문자열의 길이가 2 이상인 경우에만 실행
  if (str.length >= 2) {
    // 맨 앞의 글자와 맨 뒤의 글자를 삭제한 문자열 반환
    return str.slice(1, -1);
  } else {
    // 문자열의 길이가 2 미만인 경우에는 그대로 반환
    return str;
  }
}

// 아이템
async function getItemsIds(ids) {
  try {
    const url = `https://api.arsha.io/v2/kr/search?lang=kr&ids=${ids}`;

    // API 요청 보내기
    const response = await axios.get(url);

    // 받은 JSON 데이터
    const jsonData = JSON.stringify(response.data, null, 2);

    console.log(jsonData);
  } catch (error) {
    console.error(`${url} :데이터를 파일에 쓰는 중 오류가 발생했습니다:`, error);
  }
}
getItemsIds(10003);

// 모든 아이테 정보 -> allItems.json
async function getALLItems() {
  try {
    const url = `https://api.arsha.io/v2/kr/market?lang=kr`;
    const fileName = "allItems.json";

    // API 요청 보내기
    const response = await axios.get(url);

    // 받은 JSON 데이터
    const jsonData = JSON.stringify(response.data, null, 2);

    // 파일 경로 설정
    const filePath = path.join(__dirname, fileName);

    // 데이터를 파일에 쓰기
    fs.writeFileSync(filePath, jsonData);

    console.log(`${url} : 데이터가 파일에 성공적으로 쓰여졌습니다.`);
  } catch (error) {
    console.error(`${url} :데이터를 파일에 쓰는 중 오류가 발생했습니다:`, error);
  }
}
