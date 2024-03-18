const axios = require("axios");

const baseUrl = `https://api.arsha.io/v2/kr/search?lang=kr&ids=`;

async function findFirstItemId(startId, endId) {
  let low = startId;
  let high = endId;
  let foundId = null; // 찾은 ID를 저장하기 위한 변수

  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    console.log("while low, high, mid: ", low, high, mid);

    try {
      const url = `${baseUrl}${mid}`;
      const response = await axios.get(url);
      console.log("mid: ", mid);
      console.log("response.data : ", response.data);

      // 해당 아이템이 존재하는 경우, 조건문 필요없음.
      //  이미 응답받았다는건 있따는소리.
      // 해당 아이디를 찾은 경우 foundId에 저장하고 범위를 좁혀나감
      foundId = mid;
      high = mid - 1;
    } catch (error) {
      // 에러가 발생하면 범위를 좁혀나가기 위해 high 값을 감소시킴
      low = mid + 1;
      console.log("catch low, high, mid: ", low, high, mid);
    }
  }

  // 찾은 ID 반환
  return foundId;
}

async function getFirstItemId() {
  try {
    // 시작 아이디를 1로 설정하고, 마지막 아이디를 찾음
    const startId = 1;
    const endId = 10007; // 마지막 id로 10007 설정
    const firstItemId = await findFirstItemId(startId, endId);

    console.log(`첫 번째 아이템 id는 ${firstItemId}입니다.`);
  } catch (error) {
    console.log("에러입니다 : ", error);
  }
}

// 아이템 정보 가져오기 시작
getFirstItemId();
