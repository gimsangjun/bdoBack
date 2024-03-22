const { Pool } = require("pg");

// PostgreSQL 연결 정보
const pool = new Pool({
  user: "tkwk327",
  host: "localhost",
  database: "bdo_stock",
  password: "",
  port: 5432, // PostgreSQL 포트번호
  // TODO : 어떤 최대 연결수, 아래 props에 대해 더 자세히알아봐야할듯
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000, // 유휴 연결 타임아웃 (30초)
  connectionTimeoutMillis: 2000, // 연결 타임아웃 (2초)
});

// 데이터 삽입 함수
async function insertData() {
  const client = await pool.connect();
  try {
    // 데이터 삽입 쿼리
    const query = `
      INSERT INTO items (id, name)
      VALUES ($1, $2);
    `;

    // 데이터 삽입에 사용할 값들
    const values = [10005, "아스웰 장검"];

    // 쿼리 실행
    await client.query(query, values);

    console.log("데이터가 성공적으로 삽입되었습니다.");
  } catch (error) {
    console.error("데이터 삽입 중 오류 발생:", error);
  } finally {
    // client.release(); // TODO: 풀에 반환하여 재사용 가능한 상태로 만드는 메서드 -> 당장 필요없는듯.
    client.end();
  }
}

// 데이터 삽입 함수 호출
insertData();
