const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseUrl = `https://api.arsha.io/v2/kr/search?lang=kr&ids=`;

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

async function getItemsIds(ids) {
  try {
    const url = `${baseUrl}${ids.join(",")}`;
    const response = await axios.get(url);
    const filePath = path.join(__dirname, "items.json");

    // 응답 데이터를 JSON 형식의 문자열로 변환
    let jsonData = JSON.stringify(response.data, null, 2);
    jsonData = removeFirstAndLastChar(jsonData); // [{...}, {...}] => {..}, {...}

    // 파일 읽기, 문자열 그대로 저장되어있음.
    let fileData;
    try {
      fileData = fs.readFileSync(filePath, "utf8");
    } catch (error) {
      // 파일이 존재하지 않는 경우 빈 문자열로 초기화
      fileData = "";
    }

    // 파일 데이터 수정, 데이터가 없을경우 null 또는 undefined임.
    if (fileData) {
      // 이미 파일에 데이터가 있는 경우 맨 마지막 ] 삭제

      const lastIndex = fileData.lastIndexOf("]");
      if (lastIndex !== -1) {
        fileData = fileData.substring(0, lastIndex);
        // 수정된 데이터를 파일에 적용
        fs.writeFileSync(filePath, fileData); // 처음부터 파일 다시 씀.
      }
    }

    // 파일에 데이터 이어쓰기
    fs.appendFileSync(filePath, (fileData ? "," : "[") + jsonData + "]");
    console.log("items.json 파일에 데이터가 성공적으로 추가되었습니다.");
  } catch (error) {
    console.log(error);
  }
}

// 여러 번 실행하여 데이터를 추가
// getItemsIds([2501, 2502, 2503]);
// getItemsIds([2504, 2505, 2506]);
// getItemsIds([2507, 2508, 2509]);
// getItemsIds([10007, 10006, 10005]);
