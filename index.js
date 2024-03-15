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

    // 파일 읽기
    const filePath = path.join(__dirname, "items.json");
    //
    let fileData = fs.readFileSync(filePath, "utf8"); // [...]

    // 맨 마지막 ] 삭제
    let lastIndex = fileData.lastIndexOf("]");
    if (lastIndex !== -1) {
      fileData = fileData.substring(0, lastIndex);
      // 수정된 데이터를 파일에 적용
      fs.writeFileSync(filePath, fileData);
    }

    // 응답 데이터를 JSON 형식의 문자열로 변환
    let jsonData = JSON.stringify(response.data, null, 2);
    jsonData = removeFirstAndLastChar(jsonData); // [{...}, {...}] => {..}, {...}
    console.log(jsonData);

    // 파일에 데이터 이어쓰기
    fs.appendFile(filePath, "," + jsonData + "]", (err) => {
      if (err) throw err;
      console.log("items.json 파일에 데이터가 성공적으로 추가되었습니다.");
    });
  } catch (error) {
    console.log(error);
  }
}

// 여러 번 실행하여 데이터를 추가
getItemsIds([10007, 10006, 10005]);
// getItemsIds([10007, 10006, 10005]);
