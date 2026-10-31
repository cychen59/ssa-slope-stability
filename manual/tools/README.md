# SSA 使用手冊的建置與維護

手冊原稿是 `manual/index.html`（線上版），PDF 由同一份原稿產生。截圖、範例檔與 PDF 都由這個資料夾的腳本自動產生，程式更新後重跑即可。

## 建置

1. 在儲存庫根目錄啟動本機伺服器：`python3 -m http.server 8766 --bind 127.0.0.1`
2. 執行 `manual/tools/build-all.sh`（需要 Node.js、Playwright、Python 3、Pillow、pdfplumber、pypdf、LibreOffice、poppler-utils）。
3. 產出：`manual/img/*.png`、`manual/examples/*`、`manual/SSA-使用手冊.pdf`。

| 腳本 | 內容 |
|---|---|
| `tutorial.js` | 第 0–6 章截圖，範例 tutorial-1-slope.json、tutorial-2-nails.json |
| `wall.js` | 第 7–8 章截圖，tutorial-3-wall.json 與教學案例計算書 |
| `report_pages.py` | 計算書縮圖 |
| `advanced.js` | 第 9–16 章截圖，可用參數只跑部分章節，例如 `node advanced.js ctrl,pile` |
| `optimize.py` | 截圖轉 256 色以縮小檔案 |
| `build-pdf.js` | 產生 PDF（目錄頁碼、書籤、無頁碼的封面） |

## 程式更新時的檢查清單

每次 SSA 程式（`index.html`）有功能更新或改版號，請依下表檢查手冊是否要同步修訂：

| 程式的變動 | 手冊要檢查的章節 |
|---|---|
| 剖面、CSV 匯入、圖上編輯 | 第 1 章、附錄 C |
| 土層參數、單位、孔隙水壓選項 | 第 2、12、16 章 |
| 載重 | 第 3 章 |
| 計算結果的顯示項目 | 第 4 章 |
| 補強構件（土釘、地錨、樁、地工合成材） | 第 5、14 章 |
| 多情境檢核、規範預設值 | 第 6 章、附錄 B |
| 擋土牆 | 第 7 章 |
| 計算書內容與章節 | 第 8 章 |
| 控制點、指定滑動面、反算 | 第 9、10、11 章 |
| 坡外積水、張力裂縫 | 第 13 章 |
| 計算方法、搜尋設定 | 第 15 章 |
| 驗證報告的檢核數、版本紀錄 | 第 16 章 |

改完後：

1. 更新 `manual/index.html` 開頭 `#meta` 的 `data-ssa-version`（必須與程式的 `SSA_VERSION` 相同，`build-pdf.js` 會檢查並提出警告）與 `data-ssa-date`；內容有修訂時把 `data-manual-version` 加一。
2. 重跑 `build-all.sh`，翻閱 PDF 確認截圖與內文的數字一致（各章引用的 Fs 值來自教學案例的實際計算結果）。
