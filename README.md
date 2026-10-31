# SSA 邊坡穩定分析（網頁版）

**中文** | [English](README.en.md) | [日本語](README.ja.md)

在瀏覽器裡繪製邊坡剖面、土層與地下水位，以**動態規劃（DP）**搜尋任意形狀的臨界滑動面，並以**簡易 Janbu 法**、**Spencer 法**或 **Morgenstern–Price 法**計算最小安全係數。免安裝，打開網頁就能用。

**線上使用：<https://cychen59.github.io/ssa-slope-stability/>**

![使用人數](https://abacus.jasoncameron.dev/get/cychen59.github.io/ssa-slope-stability-visitors/shield) ![累計開啟次數](https://abacus.jasoncameron.dev/get/cychen59.github.io/ssa-slope-stability-views/shield)

---

## 功能

- **繪製剖面**：在圖上拖曳、新增、刪除節點，或直接貼上 Excel 座標，編輯地表線、各土層界面與地下水位線。
- **匯入地形 CSV**：支援單線（x, z）與整個剖面（x、地表、各層頂面、地下水位）兩種格式，UTF-8 與 Big5 編碼皆可。
- **土層參數**：每層輸入 γ、γsat、c′、φ′，可將某層設為岩盤（滑動面不可穿越）。單位可切換 kN/m³、tf/m³ 與 kPa、tf/m²。
- **孔隙水壓與坡外積水**：由地下水位線直接換算，u = γw·hw，可選擇水位線傾斜修正（cos²θ）。水位線畫在地表以上的部分視為坡外積水（河道、水庫、坡趾積水），計入水重與斜坡面水壓，完全淹沒的邊坡與浮單位重計算結果一致。
- **分層水壓線與 ru**：每個土層可各自選擇孔隙水壓的來源，包括地下水位線（預設）、在剖面上新增的水壓線（例如受壓含水層的觀測水頭）、孔隙水壓比 ru 或不計水壓。多情境的水位設定會一併套用到水壓線。已以閉合解與 Fredlund and Krahn (1977) ru = 0.25 案例驗證（見網頁原理第十四節）。
- **張力裂縫**：可在坡頂設鉛直張力裂縫，深度依 Rankine 公式 2c′/(γ√Ka) 計算或直接指定，可設定裂縫充水（Pw = ½γw·zc²）。裂縫位置由搜尋決定，多情境檢核可分別設定裂縫是否充水。已以閉合解與 ACADS 考題 1(b) 驗證（見網頁原理第十三節）。
- **地震力**：擬靜態分析，可輸入水平與垂直震度 kH、kV。
- **土釘與地錨**：輸入頭部位置、傾角、長度、間距與抗拉、拉拔、面版或設計錨力，可整排配置。補強力取各項容量最小值，可選主動法或被動法計入，並同時列出有、無補強的安全係數與臨界滑動面。
- **抑止樁、微型樁與地工合成材**：抑止樁為鋼管樁，可選楔形樁（くさび杭）或懸臂樁（抑え杭），依日本地すべり防止技術指針求必要抑止力，並檢核彎曲應力、剪應力、根入長度與地盤降伏（kh、β 依道路橋示方書，懸臂樁用 Chang 公式）。搜尋時每條滑動面依交點重新計算樁的容許荷重，會自動檢討從樁底下方或樁前後滑出的破壞。微型樁同時計入軸力與剪力。地工格網與織物以折減後的容許拉力與兩側拉拔阻抗計算，拉力方向可選水平或沿滑動面。已以楔形滑動閉合解與鋼管杭計算例驗證（見網頁原理第十五節）。
- **地表載重**：均布、梯形分布與線載重，可選擇是否計入地震慣性力，並可同時計算無載重情況對照。可在圖上拖曳載重端點。
- **擋土牆**：以參數（前趾、底面高程、牆高、底寬、頂寬）或頂點座標建立牆體，視為不可穿越、計入重量的結構物，計算包含擋土牆的整體穩定。
- **指定滑動面試算**：畫出或貼上一條滑動面，只計算這一條的安全係數，可用來和其他軟體或手算結果比對。也可以輸入圓心與半徑產生圓弧，重算舊報告或其他軟體的圓弧，計算書會註明圓弧參數。
- **自動搜尋**：以動態規劃搜尋非圓弧臨界滑動面，入口與出口位置由計算自動決定，可限制滑動面為凹形（依最陡坡度分級處理，薄弱夾層也能正確追蹤）、設定最小滑動深度。凹形限制的原理另有[動畫說明](https://cychen59.github.io/ssa-slope-stability/concave-constraint.html)。
- **嚴密法**：可選 Spencer 法或 Morgenstern–Price 法（半正弦 f(x)），同時滿足力與力矩平衡，搜尋後可再局部最佳化滑動面。三種方法的結果並列，已以封閉解、Fredlund and Krahn (1977) 與 ACADS 標準考題驗證（見網頁原理第十節）。
- **滑動面控制點**：輸入傾斜管、TDR 等量到的剪動位置（x、地表下深度、容許 ±Δz），並可限制坡趾出口與崩崖入口範圍，搜尋時強制滑動面通過這些位置，結果列出各點檢核。也可一鍵以控制點建立指定滑動面，接著做反算。
- **反算分析**：以指定滑動面作為實際崩塌面，假設 Fs = 1（或其他目標值），以二分法反求某一土層的 c′ 或 φ′，並列出同樣使 Fs 等於目標值的 c′–φ′ 組合，可一鍵套用到土層。崩塌案例檢討常用。
- **多情境檢核**：在「檢核」頁設定常時、暴雨、地震等情境，各自指定地下水位（剖面水位、上升 Δh、達地表或無水）、震度與要求安全係數，一次算完並列出「情境、Fs、要求值、是否符合」總表。要求安全係數預設採水土保持技術規範第 73 條永久性邊坡（常時 1.5、暴雨 1.2、地震 1.1），也可一鍵改套臨時性或公路邊坡工程設計規範表 4.6-1，或自行修改。
- **計算書輸出**：可下載 Word (.docx) 或列印／另存 PDF，內容包含輸入參數、剖面圖與臨界滑動面、計算結果、切片明細與各情境結果。
- **版本號與驗證報告**：網頁標題、計算書與存檔都標示版本號（目前 v2.9.0）。「說明」頁可執行驗證報告，以當版計算核心在瀏覽器中重算全部 114 項驗證檢核（閉合解、Fredlund and Krahn、ACADS、積水與裂縫、ru、補強構件、鋼管杭計算例等），列出參考值、差異與是否通過，並可下載 Word 或列印 PDF，作為送審的程式驗證文件。版本紀錄也列在「說明」頁。
- **結果**：安全係數 Fs 與修正後 f0·Fs、滑動體面積、出入口座標、切片明細與迭代紀錄，可複製為 CSV。
- **中、英、日文介面**：頁首按「中文／EN／日本語」即可切換，選擇會記在瀏覽器裡。網址加上 `?lang=en` 或 `?lang=ja` 可直接開啟英文或日文介面。
- **存檔與接續**：把整個模型（地形、土層、水位、參數、設定）存成 JSON 檔，下次匯入即可繼續分析。

## 使用方式

1. 開啟 <https://cychen59.github.io/ssa-slope-stability/>，畫面會先載入預設範例並完成計算。
2. 「剖面」頁：編輯地表線、各土層頂面與地下水位線，或匯入 CSV（範例見 [`examples/`](examples/)）。
3. 「土層」頁：輸入各層 γ、γsat、c′、φ′。
4. 「設定」頁：確認搜尋網格（頁面會依模型大小提示建議值）與震度等參數。
5. 按「計算最危險滑動面」。
6. 完成後在「設定」→「模型存取」按「儲存模型（JSON 檔）」保存，下次按「匯入模型…」即可接續。

離線使用：下載本儲存庫的 `index.html`，直接用瀏覽器開啟即可，所有計算都在瀏覽器內完成，不會上傳任何資料。

### CSV 格式

整個剖面（第 1 列可為欄名，欄名含「水」字的欄視為地下水位線，沒有資料的格子留空）：

```csv
x,地表,風化岩頂面,岩盤頂面,地下水位
0,10,6,2,10
20,10,6,,10.2
40,20,14,8,16
55,27,19,,22
80,28,20,12,24
```

單一線段（匯入到目前選取的線）：

```csv
x,z
0,10
20,10
40,20
55,27
80,28
```

## 方法概要

計算核心參考日本建設省土木研究所地すべり研究室「動的計画法を用いた臨界すべり面解析法」（中村・久保田，1987）。

- 簡易 Janbu 法：

  Fs = f0 · ΣAᵢ / ΣBᵢ

  Aᵢ = [c′ᵢbᵢ + {(1+kV)Wᵢ − uᵢbᵢ} tanφ′ᵢ] / nαᵢ

  Bᵢ = (1+kV)Wᵢ tanαᵢ + kH Wᵢ

  nαᵢ = cos²αᵢ (1 + tanαᵢ tanφ′ᵢ / Fs)

- Baker（1980）輔助泛函 G = Σ(Aᵢ − λBᵢ)，在 ΣB > 0 時使 G 最小等同使 Fs 最小，因此能以動態規劃逐段求解：

  Gᵢ₊₁(j) = min over K { Gᵢ(K) + DGᵢ(K, j) }

- 以 λ = Fs 反覆迭代至收斂。修正係數預設採 f0 = (50d/L)^0.03（申・板垣，1983），也可切換為 Janbu 修正曲線。
- 選擇 Spencer 法或 Morgenstern–Price 法時，以一般化極限平衡（GLE）同時解力平衡與力矩平衡，假設切片間剪力 X = λ f(x) E，並以 Newton 法求解 Fs 與 λ。DP 找到的滑動面可再以樣式搜尋局部最佳化。

完整推導、公式與示意圖請見網頁下方「方法原理與公式」。

## 引用

使用本工具的分析結果發表報告或論文時，請引用：

> 陳振宇、藤田正治、堤大三(2014)，「基岩位置及土層特性對降雨逕流與大規模崩塌之影響」，中華水土保持學報，45(4)，pp.243-256。（[全文 PDF](https://www.cswcs.org.tw/AllDataPos/JournalPos/VOL45/NO4/jcswc45(4)243-256_04.pdf)）

> Chen, C. Y., Fujita, M., and Tsutsumi, D. (2014). "The Influence of Bedrock Location and Soil Characteristics on Rainfall-Runoff and Large-Scale Landslides." Journal of Chinese Soil and Water Conservation, 45(4), 243-256. (in Chinese)

```bibtex
@article{chen2014bedrock,
  author  = {Chen, Chen-Yu and Fujita, Masaharu and Tsutsumi, Daizo},
  title   = {The Influence of Bedrock Location and Soil Characteristics on Rainfall-Runoff and Large-Scale Landslides},
  journal = {Journal of Chinese Soil and Water Conservation},
  volume  = {45},
  number  = {4},
  pages   = {243--256},
  year    = {2014},
  note    = {in Chinese},
  url     = {https://www.cswcs.org.tw/AllDataPos/JournalPos/VOL45/NO4/jcswc45(4)243-256_04.pdf}
}
```

## 關於作者

陳振宇。學經歷與研究成果請見[作者介紹頁](https://cychen59.blogspot.com/p/education-2014.html)，使用上的問題或建議歡迎來信 <cychen59@gmail.com>，或在 GitHub 開 Issue。

## 參考文獻

1. 中村浩之、久保田哲也（1987）：動的計画法を用いた臨界すべり面解析法，土木研究所資料第 2425 号，建設省土木研究所砂防部地すべり研究室。
2. Baker, R. (1980): Determination of the critical slip surface in slope stability computations, International Journal for Numerical and Analytical Methods in Geomechanics, Vol. 4, pp. 333-359.
3. Bellman, R. (1957): Dynamic Programming, Princeton University Press.
4. 山上拓男、植田康宏（1986）：Noncircular Slip Surface Analysis of the Stability of Slopes: An Application of Dynamic Programming to the Janbu Method，地すべり，第 22 巻第 4 号。
5. 申潤植、板垣治（1983）：地すべり（その 4），土と基礎，Vol. 31，No. 7，pp. 89-97。
6. Janbu, N. (1973): Slope stability computations, In Embankment-Dam Engineering (Casagrande Volume), Wiley, pp. 47-86.
7. Spencer, E. (1967): A method of analysis of the stability of embankments assuming parallel inter-slice forces, Géotechnique, 17(1), pp. 11-26.
8. Morgenstern, N. R. and Price, V. E. (1965): The analysis of the stability of general slip surfaces, Géotechnique, 15(1), pp. 79-93.
9. Fredlund, D. G. and Krahn, J. (1977): Comparison of slope stability methods of analysis, Canadian Geotechnical Journal, 14(3), pp. 429-439.
10. Giam, P. S. K. and Donald, I. B. (1989): Example problems for testing soil slope stability programs, Civil Engineering Research Report No. 8/1989, Monash University.

## 使用限制

- 二維平面應變、極限平衡分析，不考慮基質吸力。
- 孔隙水壓以水位線（靜水壓）或 ru 計算，不做滲流分析；坡外積水不含波浪與水位驟降時的超額孔隙水壓。
- 簡易 Janbu 法忽略切片間剪力，未修正的 Fs 通常偏保守。
- 補強只計構件拉力，不計抗彎與抗剪。
- 載重只考慮垂直方向，不含傾斜載重與快速加載的超額孔隙水壓。
- 擋土牆只做整體穩定，牆體本身的滑動、傾倒、承載力與結構強度需另行檢核。
- 本工具為分析輔助工具，計算結果僅供參考，實際工程判斷與設計仍應由專業人員依現地調查與相關規範負責。

## 授權

本程式以 [GNU General Public License v3.0](LICENSE) 授權釋出。你可以自由使用、修改與再散布，修改後再散布的版本也必須以 GPL-3.0 開放原始碼。

---

## English

An English version of this README is available in [README.en.md](README.en.md). The web tool itself also has an English interface: press **EN** in the header, or open <https://cychen59.github.io/ssa-slope-stability/?lang=en>.

## 日本語

日本語版の README は [README.ja.md](README.ja.md) をご覧ください。Web ツールもヘッダーの「日本語」ボタン、または <https://cychen59.github.io/ssa-slope-stability/?lang=ja> で日本語表示に切り替えられます。
