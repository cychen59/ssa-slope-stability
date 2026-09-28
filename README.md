# SSA 邊坡穩定分析（網頁版）

在瀏覽器裡繪製邊坡剖面、土層與地下水位，以**動態規劃（DP）**搜尋任意形狀的臨界滑動面，並以**簡易 Janbu 法**計算最小安全係數。免安裝，打開網頁就能用。

**線上使用：<https://cychen59.github.io/ssa-slope-stability/>**

---

## 功能

- **繪製剖面**：在圖上拖曳、新增、刪除節點，或直接貼上 Excel 座標，編輯地表線、各土層界面與地下水位線。
- **匯入地形 CSV**：支援單線（x, z）與整個剖面（x、地表、各層頂面、地下水位）兩種格式，UTF-8 與 Big5 編碼皆可。
- **土層參數**：每層輸入 γ、γsat、c′、φ′，可將某層設為岩盤（滑動面不可穿越）。單位可切換 kN/m³、tf/m³ 與 kPa、tf/m²。
- **孔隙水壓**：由地下水位線直接換算，u = γw·hw，可選擇水位線傾斜修正（cos²θ）。
- **地震力**：擬靜態分析，可輸入水平與垂直震度 kH、kV。
- **自動搜尋**：以動態規劃搜尋非圓弧臨界滑動面，入口與出口位置由計算自動決定，可限制滑動面為凹形、設定最小滑動深度。
- **結果**：安全係數 Fs 與修正後 f0·Fs、滑動體面積、出入口座標、切片明細與迭代紀錄，可複製為 CSV。
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

完整推導、公式與示意圖請見網頁下方「方法原理與公式」。

## 引用

使用本工具的分析結果發表報告或論文時，請引用：

> Chen, C. Y., Ikkanda, S., Fujita, M., and Tsutsumi, D. (2013): A study on mechanism of large-scale landslides and the prediction, Proceeding of 12th International Symposium on River Sedimentation, pp.109-118.

```bibtex
@inproceedings{chen2013landslide,
  author    = {Chen, C. Y. and Ikkanda, S. and Fujita, M. and Tsutsumi, D.},
  title     = {A study on mechanism of large-scale landslides and the prediction},
  booktitle = {Proceedings of the 12th International Symposium on River Sedimentation},
  pages     = {109--118},
  year      = {2013}
}
```

## 參考文獻

1. 中村浩之、久保田哲也（1987）：動的計画法を用いた臨界すべり面解析法，土木研究所資料第 2425 号，建設省土木研究所砂防部地すべり研究室。
2. Baker, R. (1980): Determination of the critical slip surface in slope stability computations, International Journal for Numerical and Analytical Methods in Geomechanics, Vol. 4, pp. 333-359.
3. Bellman, R. (1957): Dynamic Programming, Princeton University Press.
4. 山上拓男、植田康宏（1986）：Noncircular Slip Surface Analysis of the Stability of Slopes: An Application of Dynamic Programming to the Janbu Method，地すべり，第 22 巻第 4 号。
5. 申潤植、板垣治（1983）：地すべり（その 4），土と基礎，Vol. 31，No. 7，pp. 89-97。
6. Janbu, N. (1973): Slope stability computations, In Embankment-Dam Engineering (Casagrande Volume), Wiley, pp. 47-86.

## 使用限制

- 二維平面應變、極限平衡分析，不考慮基質吸力。
- 水位高於地表時的積水載重與側向水壓未納入。
- 簡易 Janbu 法忽略切片間剪力，未修正的 Fs 通常偏保守。
- 本工具為分析輔助工具，計算結果僅供參考，實際工程判斷與設計仍應由專業人員依現地調查與相關規範負責。

## 授權

本程式以 [GNU General Public License v3.0](LICENSE) 授權釋出。你可以自由使用、修改與再散布，修改後再散布的版本也必須以 GPL-3.0 開放原始碼。

---

## English summary

**SSA Slope Stability Analysis (web edition)** is a browser-based tool for 2D limit-equilibrium slope stability analysis. Users draw the slope profile, soil layer boundaries and groundwater table (or import them from CSV), enter unit weights and shear strength parameters, and the tool searches for the critical non-circular slip surface using dynamic programming (Baker, 1980) combined with the simplified Janbu method. Pore pressure is computed directly from the groundwater table. Pseudo-static seismic coefficients are supported. Models can be saved to and restored from JSON files. Everything runs locally in the browser.

Live: <https://cychen59.github.io/ssa-slope-stability/> · License: GPL-3.0 · Please cite Chen et al. (2013) above.
