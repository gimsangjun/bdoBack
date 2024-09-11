# 검은사막 계산기 만들기 - BackEnd

[**검은사막 계산기 만들기 - FrontEnd**](https://github.com/gimsangjun/bdoFront)

## 백엔드 서버 도메인

- https://www.bdomoa.com

## 배포

- AWS EC2 인스턴스에 백엔드 서버와 데이터베이스를 직접 구축하는 작업을 수행하였음.
- 가비아에서 도메인을 구매하여 또 다른 EC2 인스턴스에 NGINX 서버를 설정해 리버스 프록시 역할하게 하여 HTTPS를 구현해보았음.

## API 문서

### 로그인 - `/auth`

- **GET** `/auth/discord` : 디스코드 로그인
- **GET** `/auth/logout`
- **GET** `/auth/profile`
  - 사용자가 가지고 있는 쿠키값으로 로그인 판별
  ```javascript
  // Response
  {
    "id": "394392090085294093",
    "avatarUrl": "https://cdn.discordapp.com/avatars/394392090085294093/ace4d6e08b3579e5dc0bee581a39f4b1.png",
    "username": "kimsangjun"
  }
  ```

### 아이템 - `/item`

- **GET** `/item`, query: id, sid, name, page, limit : 아이템 검색

  ```javascript
  // Request
  /item?id=10057&sid=16&name=로사르 장검&page=1&limit=10

  // Response
  {
    currentPage : 1,
    items: [
    {
        "_id": "664304508770e3a855ee1941",
        "id": 10057,
        "name": "로사르 장검",
        "sid": 16,
        "minEnhance": 16,
        "maxEnhance": 16,
        "basePrice": 74500000,
        "currentStock": 0,
        "totalTrades": 2801,
        "priceMin": 8000000,
        "priceMax": 80000000,
        "lastSoldPrice": 80000000,
        "lastSoldTime": 1717081588,
        "updateAt": "2024-06-04T02:46:42.493Z",
        "__v": 0,
        "mainCategory": 1,
        "subCategory": 1,
        "grade": "uncommon",
        "imgUrl": "",
        "type": ""
    },
    ...
    ],
    pages: 420,
    totalCount: 12572,
  }
  ```

- **POST** `/item/id-and-sid`, body: items: [{id, sid}] : 특정 아이템만 가져오기 (sid는 아이템의 강화 등급)

  ```javascript
  Request Body: {
    items: [
      { id: 12094, sid: 0 },  { id: 11653, sid: 0 },
      { id: 11882, sid: 0 },  { id: 12276, sid: 0 },
      ...
    ]
  }
  ```

- **POST** `/item/update`, body: [items: [{id, sid}]] : 아이템 가격 업데이트

  ```javascript
  Request Body: {
    items: [
      {
        _id: '664304508770e3a855ee1935',
        id: 10057,
        name: '로사르 장검',
        sid: 8,
        minEnhance: 8,
        maxEnhance: 10,
        basePrice: 3450000,
        currentStock: 1,
        totalTrades: 22730,
        priceMin: 515000,
        priceMax: 5150000,
        lastSoldPrice: 3690000,
        lastSoldTime: 1717359540,
        updateAt: '2024-06-04T02:46:42.482Z',
        __v: 0,
        mainCategory: 1,
        subCategory: 1,
        grade: 'uncommon',
        imgUrl: '',
        type: ''
      },
      ...
    ]
  }
  ```

- **POST** `/item` : 새로운 아이템 생성 (관리자 전용)

- **PATCH** `/item` : 기존 아이템 업데이트 (관리자 전용)

- **DELETE** `/item` : 아이템 삭제 (관리자 전용)

### **강화 정보 가져오기** - `/reinforcement`

---

- **POST** `/reinforcement`, body: {type : 아이템 타입} : 강화 정보 가져오기

  ```javascript
  Request Body: { type: '악세사리' }

  // Response
  {
      "_id": "666d2208d9734dc7d0334d36",
      "type": "악세사리",
      "stages": [
          "장",
          "광",
          "고",
          "유",
          "동"
      ],
      "cronStones": [
          95,
          288,
          865,
          2405,
          11548
      ],
      "reinforcementStart": [
          25,
          10,
          7.5,
          2.5,
          0.5
      ],
      "reinforceIncreasedAmountBeforeSoftCap": [
          2.5,
          1,
          0.75,
          0.25,
          0.05
      ],
      "reinforceIncreasedAmountAfterSoftCap": [
          0.5,
          0.2,
          0.15,
          0.05
      ],
      "stackSoftCap": [
          18,
          40,
          44,
          110,
          999999
      ],
      "recommendStack": [
          30,
          40,
          80,
          110,
          280
      ],
      "maxReinforcementChange": [
          90,
          90,
          90,
          90,
          90
      ],
      "itemsPerTry": [
          {
              "name": "",
              "count": 1,
              "_id": "666d2208d9734dc7d0334d37"
          },
          ...
      ],
      "durabilityLossOnFailure": 0,
      "downgradeProbability": 40,
      "__v": 0
  }
  ```

#### 활용한 API

🔗[BDO Market API](https://documenter.getpostman.com/view/4028519/2s9Y5YRhp4#intro)
