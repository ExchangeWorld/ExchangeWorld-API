RESTFUL URL:
====================

注意事項:
--------------------
1. 所有request都要帶token，假如是匿名的後端會幫token補上空白，所以匿名的不用擺token
2. 所有原本的url都可以使用，為了通透性
3. 為了所有權限的通透性，關於「只有這個使用者才能存取的物件」，即使後端會以token識別是哪個使用者，但RESTFUL的使用上還是都要加上該物件的描述ID (例如使用者UID)。
4. 因為可描述物件的主軸，幾乎都以使用者及物品為出發點，所以使用者UID跟物品GID變得很重要
5. 注意有沒有「們」

簡易總結
--------------------
- GET
  - ```/api/chatroom/聊天室CID/message```
  - ```/api/user/使用者UID/chatroom```
  - ```/api/goods/物品GID/comment```
  - ```/api/user/使用者UID/comment```
  - ```/api/exchange/交換EID```
  - ```/api/user/使用者UID/exchange```
  - ```/api/user/使用者UID/exchange/交換EID```
  - ```/api/user/使用者UID/follow```
  - ```/api/follow/user/使用者UID```
  - ```/api/goods?QUERY```
  - ```/api/goods/物品GID```
  - ```/api/user/使用者UID/goods```
  - ```/api/user/使用者UID/goods/物品GID```
  - ```/api/goods/物品GID/queue```
  - ```/api/user/使用者UID/queue```
  - ```/api/queue/goods/物品GID```
  - ```/api/queue/user/使用者UID```
  - ```/api/goods/物品GID/star```
  - ```/api/user/使用者UID/star```
  - ```/api/user/使用者UID```
- POST
  - ```/api/chatroom```
  - ```/api/comment```
  - ```/api/exchange```
  - ```/api/follow```
  - ```/api/goods```
  - ```/api/queue```
  - ```/api/star```
  - ```/api/user```
- PUT
  - ```/api/chatroom/聊天室CID/join```
  - ```/api/chatroom/聊天室CID/leave```
  - ```/api/comment/評論CID```
  - ```/api/exchange/交換EID/drop```
  - ```/api/exchange/交換EID/agree```
  - ```/api/goods/物品GID```
  - ```/api/goods/物品GID/rate```
  - ```/api/user/使用者UID```
  - ```/api/user/使用者UID/photo```
- DELETE
 - ```/api/chatroom/聊天室CID```
 - ```/api/comment/評論CID```
 - ```/api/exchange/交換EID```
 - ```/api/follow/使用者GID/to/被追隨的使用者GID```
 - ```/api/goods/物品GID```
 - ```/api/queue/物品GID/to/被排的物品GID```
 - ```/api/star/使用者GID/to/被星星的物品GID```

以動作區分
--------------------

- GET
  - chatroom:
    1. 這個使用者的聊天室資訊
	  - ```/api/user/使用者UID/chatroom```


  - comment:
    1. 這個物品的評論們
      - ```/api/goods/物品GID/comment```
    2. 這個使用者(留言者)的評論們
      - ```/api/user/使用者UID/comment```


  - exchange:
    1. 這個交換
      - ```/api/exchange/交換EID```
    2. 這個使用者的交換們
      - ```/api/user/使用者UID/exchange```
    3. 這個使用者的這個交換 (其實等於 /api/exchange/交換EID )
      - ```/api/user/使用者UID/exchange/交換EID```

  - follow:
    1. 這個使用者 追隨 的 追隨們
      - ```/api/user/使用者UID/follow```
    2. 追隨 這個使用者 的 追隨們
      - ```/api/follow/user/使用者UID```

  - goods:
    1. 搜尋物品們，等於 goods.search
      - ```/api/goods?QUERY```
    2. 這個物品
      - ```/api/goods/物品GID```
    3. 這個使用者的物品們
      - ```/api/user/使用者UID/goods```
    4. 這個使用者的這個物品 (其實等於 /api/goods/物品GID )
      - ```/api/user/使用者UID/goods/物品GID```

  - message:
    1. 這個聊天室的聊天訊息
      - ```/api/chatroom/聊天室CID/message```


  - queue:
    1. 去排 這個物品 的 排們
      - ```/api/goods/物品GID/queue```
    2. 去排 這個使用者 的 物品們 的 排們
      - ```/api/user/使用者UID/queue```
    3. 拿 這個物品 去排 的 排們
      - ```/api/queue/goods/物品GID```
    4. 這個使用者 拿 自己的物品們 去排 的 排們
      - ```/api/queue/user/使用者UID```

  - star:
    1. 打 這個物品 的 星星們
      - ```/api/goods/物品GID/star```
    2. 這個使用者 打 的 星星們
      - ```/api/user/使用者UID/star```

  - user:
    1. 這個使用者
      - ```/api/user/使用者UID```


- POST:
> (但原本 body 裡面需要包括的東西 沒有變)


  - ```/api/chatroom```
  - ```/api/comment```
  - ```/api/exchange```
  - ```/api/follow```
  - ```/api/goods```
  - ```/api/queue```
  - ```/api/star```
  - ```/api/user```


- PUT (編輯)
> (但原本 body 裡面需要包括的東西 沒有變)

  - chatroom:
    1. 拉人進來這個聊天室
	  - ```/api/chatroom/聊天室CID/join```
	2. 離開這個聊天室
	  - ```/api/chatroom/聊天室CID/leave```

  - comment:
    1. 編輯這個評論
      - ```/api/comment/評論CID```

  - exchange:
    1. 捨棄這個交換 (先包留以前討論過的，以PUT的方式)
      - ```/api/exchange/交換EID/drop```
    2. 同意這個交換
      - ```/api/exchange/交換EID/agree```

 - goods:
    1. 編輯這個物品
      - ```/api/goods/物品GID```
    2. 評分這個物品
      - ```/api/goods/物品GID/rate```

  - user:
    1. 編輯這個使用者
      - ```/api/user/使用者UID```
    2. 更新這個使用者的大頭貼
      - ```/api/user/使用者UID/photo```


- DELETE:
> (部份物件 還沒有 純粹 以ID 操作的方法)

  - ```/api/chatroom/聊天室CID```
  - ```/api/comment/評論CID```
  - ```/api/exchange/交換EID```
  - ```/api/follow/使用者GID/to/被追隨的使用者GID```
  - ```/api/goods/物品GID```
  - ```/api/queue/物品GID/to/被排的物品GID```
  - ```/api/star/使用者GID/to/被星星的物品GID```

--------------------------------------------------------------------------------

以物件分
--------------------

###chatroom:
- GET:
  1. 這個使用者的聊天室資訊
    - ```/api/user/使用者UID/chatroom```

- POST:
  - ```/api/chatroom```

- PUT:
  1. 拉人進來這個聊天室
    - ```/api/chatroom/聊天室CID/join```
  2. 離開這個聊天室
    - ```/api/chatroom/聊天室CID/leave```

- DELETE:
  - ```/api/chatroom/聊天室CID```


###comment:
- GET:
  1. 這個物品的評論們
    - ```/api/goods/物品GID/comment```
  2. 這個使用者(留言者)的評論們
    - ```/api/user/使用者UID/comment```

- POST:
  - ```/api/comment```

- PUT:
  - ```/api/comment/評論CID```

- DELETE:
  - ```/api/comment/評論CID```


###exchange:
- GET:
  1. 這個交換
    - ```/api/exchange/交換EID```
  2. 這個使用者的交換們
    - ```/api/user/使用者UID/exchange```
  3. 這個使用者的這個交換
    - ```/api/user/使用者UID/exchange/交換EID```

- POST:
  - ```/api/exchange```

- PUT:
  1. 捨棄這個交換 (先包留以前討論過的，以PUT的方式)
    - ```/api/exchange/交換EID/drop```
  2. 同意這個交換
    - ```/api/exchange/交換EID/agree```

- DELETE:
  - ```/api/exchange/交換EID```


###follow:
- GET:
  1. 這個使用者追隨的追隨們
    - ```/api/user/使用者UID/follow```
  2. 追隨這個使用者的追隨們
    - ```/api/follow/user/使用者UID```

- POST:
  - ```/api/follow```

- PUT:
- DELETE:
  - ```/api/follow/使用者GID/to/被追隨的使用者GID```


###goods:
- GET:
  1. 搜尋物品們，等於 goods.search
    - ```/api/goods?QUERY```
  2. 這個物品
    - ```/api/goods/物品GID```
  3. 這個使用者的物品們
    - ```/api/user/使用者UID/goods```
  4. 這個使用者的這個物品 (其實等於 /api/goods/物品GID )
    - ```/api/user/使用者UID/goods/物品GID```

- POST:
  - ```/api/goods```

- PUT:
  1. 編輯這個物品
    - ```/api/goods/物品GID```
  2. 評分這個物品
    - ```/api/goods/物品GID/rate```

- DELETE:
  - ```/api/goods/物品GID```


###message:
- GET:
  1. 這個聊天室的聊天訊息
    - ```/api/chatroom/聊天室CID/message```

###queue:
- GET:
  1. 去排 這個物品 的 排們
    - ```/api/goods/物品GID/queue```
  2. 去排 這個使用者 的 物品們 的 排們
    - ```/api/user/使用者UID/queue```
  3. 拿 這個物品 去排 的 排們
    - ```/api/queue/goods/物品GID```
  4. 這個使用者 拿 自己的物品們 去排 的 排們
    - ```/api/queue/user/使用者UID```
- POST:
  - ```/api/queue```

- PUT:
- DELETE:
  - ```/api/queue/物品GID/to/被排的物品GID```


###star:
- GET:
  1. 打 這個物品 的 星星們
    - ```/api/goods/物品GID/star```
  2. 這個使用者 打 的 星星們
    - ```/api/user/使用者UID/star```

- POST:
  - ```/api/star```

- PUT:
- DELETE:
  - ```/api/star/使用者GID/to/被星星的物品GID```


###user:
- GET:
  - ```/api/user/使用者UID```

- POST:
  - ```/api/user```

- PUT:
  1. 編輯這個使用者
    - ```/api/user/使用者UID```
  2. 更新這個使用者的大頭貼
    - ```/api/user/使用者UID/photo```

- DELETE:

--------------------------------------------------------------------------------

Chatroom and Message:
====================

前情提要
--------------------

1. WebSocket 的新功能只提供了「訊息的推送」以及「訊息的即時接收」
2. 所以一開始的聊天室 meta 取得，跟一開始點進去聊天室看訊息，「不需要 WebSocket唷！」
3. 也就是 ```/api/user/UID/chatroom``` 跟 ```/api/chatroom/CID/message```
4. 通常是放著不動，有新訊息才會有 WebSocket 利用的價值唷
5. 初始 WebSocket 連結為 ```ws://exwd.csie.org:43002/message?token=TOKEN```

使用方法
--------------------

1. 想要推播訊息，請送給後端：
  ```
  {
    	chatroom_cid: 欲傳的聊天室CID,
    	content: 內容
  }
  ```


2. 當後端推播訊息時，會給前端：
  ```
  {
    	sender_uid: 誰傳的,
    	chatroom_cid: 這個人傳到哪個聊天室
    	content: 傳了什麼內容,
    	created_at: 什麼時候傳的
  }
  ```


將持續更新...
