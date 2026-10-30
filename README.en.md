# SSA Slope Stability Analysis (web edition)

[中文](README.md) | **English** | [日本語](README.ja.md)

Draw a slope profile, soil layers and the groundwater table in your browser. SSA searches for a critical slip surface of arbitrary shape by **dynamic programming (DP)** and computes the minimum factor of safety with the **simplified Janbu**, **Spencer** or **Morgenstern–Price** method. Nothing to install; just open the page.

**Use it online: <https://cychen59.github.io/ssa-slope-stability/?lang=en>**

![Users](https://abacus.jasoncameron.dev/get/cychen59.github.io/ssa-slope-stability-visitors/shield) ![Visits](https://abacus.jasoncameron.dev/get/cychen59.github.io/ssa-slope-stability-views/shield)

---

## Features

- **Profile drawing**: drag, add or delete vertices on the drawing, or paste coordinates from Excel, to edit the ground surface, layer boundaries and water table.
- **CSV terrain import**: a single line (x, z) or a whole profile (x, ground, layer tops, water table), in UTF-8 or Big5 encoding.
- **Soil properties**: γ, γsat, c′ and φ′ for each layer; any layer can be set as bedrock (impenetrable to slip surfaces). Units can be switched between kN/m³ and tf/m³, and between kPa and tf/m².
- **Pore water pressure**: computed directly from the water table, u = γw·hw, with an optional inclined water table correction (cos²θ).
- **Earthquake**: pseudo-static analysis with horizontal and vertical seismic coefficients kH and kV.
- **Soil nails and ground anchors**: head position, inclination, length, spacing and capacities (tension, pullout, facing or design anchor load); members can be placed in rows. The reinforcement force is the smallest capacity, applied by the active or passive method, and Fs and the critical surface with and without reinforcement are shown side by side.
- **Surface loads**: uniform, trapezoidal and line loads, each with or without seismic inertia, with an optional comparison against the case without loads. Load ends can be dragged on the drawing.
- **Retaining walls**: defined by parameters (toe, base elevation, height, base width, top width) or by vertices, and treated as impenetrable structures with weight, giving the global stability including the wall.
- **Specified slip surface check**: draw or paste one slip surface and compute only its factor of safety, for comparison with other software or hand calculations.
- **Automatic search**: DP search for non-circular critical slip surfaces, with entry and exit points found automatically. Options include a concavity constraint (handled with slope classes so thin weak layers are still followed) and a minimum slip depth. An [animated explanation](https://cychen59.github.io/ssa-slope-stability/concave-constraint.html?lang=en) shows how the concavity constraint works.
- **Rigorous methods**: Spencer or Morgenstern–Price (half-sine f(x)), satisfying both force and moment equilibrium, with optional local optimisation of the searched surface. Results of all three methods are listed, and the methods are verified against closed-form solutions, Fredlund and Krahn (1977) and the ACADS benchmark problems (Section 10 of the theory on the web page).
- **Back analysis**: treat the specified slip surface as an observed failure surface, assume Fs = 1 (or another target) and back-calculate c′ or φ′ of one layer by bisection. The c′–φ′ pairs giving the same Fs are listed and can be applied to the layer with one click.
- **Multi-case check**: on the Check tab, define cases such as normal, heavy rain and earthquake, each with its own water table (profile, raised by Δh, at ground or dry), seismic coefficients and required factor of safety, and compute them all at once into a “case, Fs, required, OK/NG” summary. Required values are entered by the user according to the applicable code; none are built in.
- **Calculation report**: download a Word (.docx) file or print / save as PDF, with input data, the cross-section and critical slip surface, results, slice details and the results of each case.
- **Results**: Fs and corrected f0·Fs, sliding mass area, entry and exit coordinates, slice details and iteration log, all copyable as CSV.
- **Chinese, English and Japanese interface**: press “中文 / EN / 日本語” in the header. The choice is remembered by your browser, and adding `?lang=en` or `?lang=ja` to the address opens that interface directly.
- **Save and resume**: save the whole model (terrain, layers, water table, parameters, settings) as a JSON file and import it later to continue.

## How to use

1. Open <https://cychen59.github.io/ssa-slope-stability/?lang=en>. The default example loads and is computed automatically.
2. **Profile** tab: edit the ground line, layer tops and water table, or import a CSV file (see [`examples/`](examples/)).
3. **Soils** tab: enter γ, γsat, c′ and φ′ for each layer.
4. **Settings** tab: check the search grid (the page suggests values for your model size) and seismic coefficients.
5. Press **Find critical slip surface**.
6. To keep your work, go to Settings → Model file and press **Save model (JSON)**. Next time, use **Import model…** to continue.

Offline use: download `index.html` from this repository and open it in a browser. All computation runs in the browser and no data is uploaded.

### CSV format

Whole profile (the first row may hold column names; a column whose name contains “water” is read as the water table; leave cells empty where a line has no value):

```csv
x,ground,weathered rock top,bedrock top,water table
0,10,6,2,10
20,10,6,,10.2
40,20,14,8,16
55,27,19,,22
80,28,20,12,24
```

Single line (imported into the line currently selected):

```csv
x,z
0,10
20,10
40,20
55,27
80,28
```

## Method in brief

The computational core follows the critical slip surface analysis by dynamic programming of the Landslide Division, Public Works Research Institute, Ministry of Construction, Japan (Nakamura and Kubota, 1987).

- Simplified Janbu method:

  Fs = f0 · ΣAᵢ / ΣBᵢ

  Aᵢ = [c′ᵢbᵢ + {(1+kV)Wᵢ − uᵢbᵢ} tanφ′ᵢ] / nαᵢ

  Bᵢ = (1+kV)Wᵢ tanαᵢ + kH Wᵢ

  nαᵢ = cos²αᵢ (1 + tanαᵢ tanφ′ᵢ / Fs)

- Baker’s (1980) auxiliary functional G = Σ(Aᵢ − λBᵢ). When ΣB > 0, minimizing G is equivalent to minimizing Fs, so the problem can be solved segment by segment with DP:

  Gᵢ₊₁(j) = min over K { Gᵢ(K) + DGᵢ(K, j) }

- λ = Fs is iterated until convergence. The correction factor defaults to f0 = (50d/L)^0.03 (Shin and Itagaki, 1983); the Janbu correction curve is also available.
- With Spencer or Morgenstern–Price, force and moment equilibrium are solved together in the general limit equilibrium (GLE) form, assuming interslice shear X = λ f(x) E; Fs and λ are found by Newton’s method. The DP surface can then be locally optimised by a pattern search.

The full derivation, equations and figures are in “Theory and equations” at the bottom of the web page.

## How to cite

If you publish results obtained with this tool in a report or paper, please cite:

> Chen, C. Y., Fujita, M., and Tsutsumi, D. (2014). "The Influence of Bedrock Location and Soil Characteristics on Rainfall-Runoff and Large-Scale Landslides." Journal of Chinese Soil and Water Conservation, 45(4), 243-256. (in Chinese) ([full text PDF](https://www.cswcs.org.tw/AllDataPos/JournalPos/VOL45/NO4/jcswc45(4)243-256_04.pdf))

> 陳振宇、藤田正治、堤大三(2014)，「基岩位置及土層特性對降雨逕流與大規模崩塌之影響」，中華水土保持學報，45(4)，pp.243-256。

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

## About the author

Chen-Yu Chen. See the [author page](https://cychen59.blogspot.com/p/education-2014.html) for background and publications. Questions and suggestions are welcome at <cychen59@gmail.com> or as a GitHub issue.

## References

1. Nakamura, H. and Kubota, T. (1987): Critical slip surface analysis by dynamic programming, PWRI Technical Memorandum No. 2425, Landslide Division, Public Works Research Institute, Ministry of Construction, Japan. (in Japanese)
2. Baker, R. (1980): Determination of the critical slip surface in slope stability computations, International Journal for Numerical and Analytical Methods in Geomechanics, Vol. 4, pp. 333-359.
3. Bellman, R. (1957): Dynamic Programming, Princeton University Press.
4. Yamagami, T. and Ueta, Y. (1986): Noncircular Slip Surface Analysis of the Stability of Slopes: An Application of Dynamic Programming to the Janbu Method, Journal of the Japan Landslide Society, 22(4).
5. Shin, J. and Itagaki, O. (1983): Landslides (Part 4), Tsuchi-to-Kiso, Vol. 31, No. 7, pp. 89-97. (in Japanese)
6. Janbu, N. (1973): Slope stability computations, In Embankment-Dam Engineering (Casagrande Volume), Wiley, pp. 47-86.
7. Spencer, E. (1967): A method of analysis of the stability of embankments assuming parallel inter-slice forces, Géotechnique, 17(1), pp. 11-26.
8. Morgenstern, N. R. and Price, V. E. (1965): The analysis of the stability of general slip surfaces, Géotechnique, 15(1), pp. 79-93.
9. Fredlund, D. G. and Krahn, J. (1977): Comparison of slope stability methods of analysis, Canadian Geotechnical Journal, 14(3), pp. 429-439.
10. Giam, P. S. K. and Donald, I. B. (1989): Example problems for testing soil slope stability programs, Civil Engineering Research Report No. 8/1989, Monash University.

## Limitations

- 2D plane strain limit equilibrium analysis; matric suction is not considered.
- Ponded water above the ground and lateral water pressure are not included.
- The simplified Janbu method ignores interslice shear, so the uncorrected Fs is usually conservative.
- Reinforcement carries tension only; bending and shear are ignored.
- Loads are vertical only, without inclined loads or excess pore pressure from rapid loading.
- Retaining walls are checked for global stability only; sliding, overturning, bearing capacity and structural strength of the wall must be checked separately.
- This tool assists analysis and its results are for reference only. Engineering judgement and design remain the responsibility of qualified professionals based on site investigation and the relevant codes.

## License

Released under the [GNU General Public License v3.0](LICENSE). You may use, modify and redistribute it freely; modified versions you distribute must also be open source under GPL-3.0.
