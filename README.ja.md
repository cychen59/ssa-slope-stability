# SSA 斜面安定解析（Web 版）

[中文](README.md) | [English](README.en.md) | **日本語**

ブラウザ上で斜面断面、地層、地下水位を描き、**動的計画法（DP）** で任意形状の臨界すべり面を探索して、**簡易 Janbu 法** で最小安全率を計算します。インストール不要で、ページを開くだけで使えます。

**オンラインで使う：<https://cychen59.github.io/ssa-slope-stability/?lang=ja>**

![Users](https://abacus.jasoncameron.dev/get/cychen59.github.io/ssa-slope-stability-visitors/shield) ![Visits](https://abacus.jasoncameron.dev/get/cychen59.github.io/ssa-slope-stability-views/shield)

---

## 主な機能

- **断面の作成**：図上で節点をドラッグ・追加・削除するか、Excel から座標を貼り付けて、地表線、地層境界、地下水位を編集します。
- **CSV による地形の取り込み**：1 本の線（x, z）または断面全体（x、地表、各地層の上面、地下水位）。UTF-8 と Big5 に対応します。
- **土質定数**：地層ごとに γ、γsat、c′、φ′ を入力し、任意の地層を基盤岩（すべり面が通過しない層）に設定できます。単位は kN/m³ と tf/m³、kPa と tf/m² を切り替えられます。
- **間隙水圧**：地下水位から u = γw·hw で直接計算します。傾斜した地下水位の補正（cos²θ）も選べます。
- **地震**：水平震度 kH と鉛直震度 kV による震度法解析。
- **鉄筋挿入工とグラウンドアンカー**：頭部位置、傾角、長さ、間隔、各種耐力（引張、引抜き、頭部・のり面工、設計アンカー力）を入力し、列でまとめて配置できます。補強力は各耐力の最小値とし、主働法または受働法で考慮します。補強の有無による Fs と臨界すべり面を並べて表示します。
- **地表荷重**：等分布、台形、線荷重に対応し、地震慣性力の考慮を荷重ごとに選べます。荷重なしの場合との比較も表示でき、図上で荷重の端点をドラッグできます。
- **擁壁**：パラメータ（つま先、底面標高、壁高、底幅、天端幅）または頂点座標で作成し、重量をもつ不透過の構造物として扱って、擁壁を含む全体安定を計算します。
- **指定すべり面の試算**：すべり面を 1 本描くか貼り付けて、その安全率だけを計算します。他のソフトや手計算との照合に使えます。
- **自動探索**：DP で非円弧の臨界すべり面を探索し、入口と出口の位置も自動で決まります。凹形の制約（勾配の分類で処理し、薄い弱層にも沿えます）と最小すべり深さを設定できます。凹形の制約の仕組みは[アニメーション解説](https://cychen59.github.io/ssa-slope-stability/concave-constraint.html?lang=ja)で見られます。
- **結果**：安全率 Fs と補正後の f0·Fs、すべり土塊の面積、入口と出口の座標、スライス明細、反復記録。いずれも CSV でコピーできます。
- **中国語・英語・日本語の表示**：ヘッダーの「中文／EN／日本語」で切り替えます。選択はブラウザに記憶され、アドレスに `?lang=ja` を付けると日本語表示で開きます。
- **保存と再開**：モデル全体（地形、地層、地下水位、パラメータ、設定）を JSON ファイルに保存し、後で読み込んで作業を続けられます。

## 使い方

1. <https://cychen59.github.io/ssa-slope-stability/?lang=ja> を開きます。既定の例題が読み込まれ、自動で計算されます。
2. **断面** タブで地表線、各地層の上面、地下水位を編集するか、CSV ファイルを取り込みます（[`examples/`](examples/) 参照）。
3. **土質** タブで各地層の γ、γsat、c′、φ′ を入力します。
4. **設定** タブで探索格子（モデルの大きさに応じた目安が表示されます）と震度を確認します。
5. **臨界すべり面を計算** を押します。
6. 作業を残すには、設定 → モデルファイルで **モデルを保存 (JSON)** を押します。次回は **モデルを読み込む…** で続きから作業できます。

オフラインで使う場合は、このリポジトリの `index.html` をダウンロードしてブラウザで開いてください。計算はすべてブラウザ内で行われ、データはどこにも送信されません。

### CSV の形式

断面全体（1 行目は列名でもかまいません。列名に「水」または water を含む列は地下水位として読み込みます。その x で値のない線は空欄にします）：

```csv
x,地表,風化岩上面,基盤岩上面,地下水位
0,10,6,2,10
20,10,6,,10.2
40,20,14,8,16
55,27,19,,22
80,28,20,12,24
```

1 本の線（選択中の線に取り込みます）：

```csv
x,z
0,10
20,10
40,20
55,27
80,28
```

## 手法の概要

計算の中核は、建設省土木研究所地すべり研究室による「動的計画法を用いた臨界すべり面解析法」（中村・久保田、1987）に基づいています。

- 簡易 Janbu 法：

  Fs = f0 · ΣAᵢ / ΣBᵢ

  Aᵢ = [c′ᵢbᵢ + {(1+kV)Wᵢ − uᵢbᵢ} tanφ′ᵢ] / nαᵢ

  Bᵢ = (1+kV)Wᵢ tanαᵢ + kH Wᵢ

  nαᵢ = cos²αᵢ (1 + tanαᵢ tanφ′ᵢ / Fs)

- Baker（1980）の補助汎関数 G = Σ(Aᵢ − λBᵢ)。ΣB > 0 のとき G の最小化は Fs の最小化と同じなので、DP で区間ごとに解けます：

  Gᵢ₊₁(j) = min over K { Gᵢ(K) + DGᵢ(K, j) }

- λ = Fs として収束するまで反復します。補正係数は既定で f0 = (50d/L)^0.03（申・板垣、1983）とし、Janbu の補正曲線も選べます。

導出、計算式、図の詳細は Web ページ下部の「理論と計算式」にあります。

## 引用方法

本ツールで得た結果を報告書や論文で発表する場合は、次の文献を引用してください：

> 陳振宇、藤田正治、堤大三(2014)，「基岩位置及土層特性對降雨逕流與大規模崩塌之影響」，中華水土保持學報，45(4)，pp.243-256。（中国語）([全文 PDF](https://www.cswcs.org.tw/AllDataPos/JournalPos/VOL45/NO4/jcswc45(4)243-256_04.pdf))

> Chen, C. Y., Fujita, M., and Tsutsumi, D. (2014). "The Influence of Bedrock Location and Soil Characteristics on Rainfall-Runoff and Large-Scale Landslides." Journal of Chinese Soil and Water Conservation, 45(4), 243-256. (in Chinese)

BibTeX は [README.en.md](README.en.md#how-to-cite) を参照してください。

## 作者について

陳振宇（Chen-Yu Chen）。経歴と業績は[作者ページ](https://cychen59.blogspot.com/p/education-2014.html)をご覧ください。ご質問やご意見は <cychen59@gmail.com> または GitHub の Issue までお寄せください。

## 参考文献

1. 中村浩之・久保田哲也（1987）：動的計画法を用いた臨界すべり面解析法、土木研究所資料第 2425 号、建設省土木研究所砂防部地すべり研究室。
2. Baker, R. (1980): Determination of the critical slip surface in slope stability computations, International Journal for Numerical and Analytical Methods in Geomechanics, Vol. 4, pp. 333-359.
3. Bellman, R. (1957): Dynamic Programming, Princeton University Press.
4. 山上拓男・植田康宏（1986）：Noncircular Slip Surface Analysis of the Stability of Slopes: An Application of Dynamic Programming to the Janbu Method、地すべり、第 22 巻第 4 号。
5. 申潤植・板垣治（1983）：地すべり（その 4）、土と基礎、Vol. 31、No. 7、pp. 89-97。
6. Janbu, N. (1973): Slope stability computations, In Embankment-Dam Engineering (Casagrande Volume), Wiley, pp. 47-86.

## 適用範囲

- 二次元平面ひずみの極限平衡解析で、サクションは考慮しません。
- 地表の湛水と側方の水圧は含みません。
- 簡易 Janbu 法はスライス間のせん断力を無視するため、補正前の Fs は通常安全側になります。
- 補強材は引張のみを受け持ち、曲げとせん断は無視します。
- 荷重は鉛直のみで、斜め荷重や急速載荷による過剰間隙水圧は含みません。
- 擁壁は全体安定のみを照査します。擁壁の滑動、転倒、支持力、部材強度は別途照査してください。
- 本ツールは解析を補助するもので、結果は参考値です。工学的判断と設計は、現地調査と関連基準に基づき、有資格の技術者の責任で行ってください。

## ライセンス

[GNU General Public License v3.0](LICENSE) で公開しています。自由に使用、改変、再配布できますが、改変版を配布する場合は GPL-3.0 のもとでソースコードを公開する必要があります。
