# 검은사막 거래소 알림 및 강화 기댓값 계산기 만들기 - BackEnd

[**검은사막 거래소 알림 및 강화 기댓값 계산기 만들기 - FrontEnd**](https://github.com/gimsangjun/bdoFront)

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


### 아이템 - `/item`

- **POST** `/item` body: {query : {mainCategory, subCateogory, name, id, sid}, page} 아이템 검색

  ```javascript
  // Request
  body: { query: { mainCategory: 1, subCategory: 0 }, page: 1 }

  // Response
  // items, totalCount, pages, currentPage
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
  	]
  	pages: 420,
  	totalCount: 12572,
  }

  ```

- **POST** `/item/update` body:[items: [{item}]], 아이템 가격 업데이트
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
- **POST**: `/item/id-and-sid`, body: items: [{id, sid}], 특정 아이템만 가져오기(sid는 아이템의 강화 등급)
  ```javascript
  Request Body: {
    items: [
      { id: 12094, sid: 0 },  { id: 11653, sid: 0 },
      { id: 11882, sid: 0 },  { id: 12276, sid: 0 },
      { id: 719897, sid: 0 }, { id: 719898, sid: 0 },
      { id: 719899, sid: 0 }, { id: 719955, sid: 0 },
      { id: 719900, sid: 0 }, { id: 719956, sid: 0 },
      { id: 715016, sid: 0 }, { id: 705509, sid: 0 },
      { id: 705510, sid: 0 }, { id: 705511, sid: 0 },
      { id: 705512, sid: 0 }, { id: 705015, sid: 0 },
      { id: 705517, sid: 0 }, { id: 705518, sid: 0 },
      { id: 705022, sid: 0 }, { id: 705032, sid: 0 },
      { id: 705037, sid: 0 }, { id: 705047, sid: 0 },
      { id: 705052, sid: 0 }
    ]
  }
  ```

### **아이템 즐겨찾기** - `/item/favorite`

---

- **GET** /item/favorite : 가져오기
- **POST** /item/favorite body: {id, sid} : 즐겨 찾기 추가
- **DELETE** /item/favorite?id&sid : 즐겨 찾기 삭제

### **아이템 알림등록** - `/item/alert`

---

- **GET** /item/alert
- **POST** /item/alert body: {itemName, itemId, itemSid, priceThreshold}
   ```javascript
  Request Body: {
    itemName: '엘쉬 장검',
    itemId: 10003,
    itemSid: 8,
    priceThreshold: 2560000
  }
  ```
- **PUT** /item/alert body = {alertId, priceThreshold}
    ```javascript
  Request Body: { alertId: '6666e6c39d7605b11371f523', priceThreshold: '81500000' }
  ```
- **DELETE** /item/alert body = {alertId}

### **강화 정보 가져오기** - `/reinforcement`

---

- **POST**: /reinforcement, body: {type : 아이템 타입}

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


