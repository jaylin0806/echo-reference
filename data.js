/* eslint-disable */
/*
 * Echo reference content, authored from ASE/EACVI guideline knowledge:
 * - 2015 ASE/EACVI Recommendations for Cardiac Chamber Quantification
 * - 2017 ASE/EACVI Guidelines for the Echocardiographic Assessment of Valvular Regurgitation
 * - 2020 ACC/AHA & 2021 ESC/EACTS Valvular Heart Disease guidelines (aortic/pulmonic stenosis grading)
 * - 2016 ASE/EACVI Guidelines for Evaluation of LV Diastolic Function
 * Cross-check against local institutional protocol before clinical use.
 */
const ECHO_DATA = {
  ef: {
    key: 'ef',
    name: 'EF',
    fullName: 'EF（左心室收縮功能）',
    icon: '🫀',
    shortDesc: "Simpson's biplane／Teichholz／FAC",
    intro: '左心室收縮功能評估，建議優先使用 biplane disk summation；M-mode 法僅適用於心室幾何形狀正常、無局部壁動異常者。',
    params: [
      {
        name: "Simpson's Biplane（Modified Simpson's Rule, Disk Summation）",
        formula: 'EF = (EDV − ESV) / EDV × 100%',
        unit: '%',
        metas: [
          { label: '切面', value: 'A4C + A2C（biplane）' },
          { label: '時相', value: 'ED：QRS 波頂點；ES：最小心室腔' },
        ],
        normalRange: '男性 ≥52%；女性 ≥54%',
        probeNote: '需描繪心內膜邊界（trace endocardial border），避免將乳突肌、腱索納入心腔內；A4C 與 A2C 兩切面長軸長度應一致（誤差 <10%），否則應重新對齊切面。',
        gradingTable: [
          { label: '正常', range: '男 52–72%／女 54–74%', severity: 'normal' },
          { label: '輕度下降', range: '男 41–51%／女 41–53%', severity: 'mild' },
          { label: '中度下降', range: '男 30–40%／女 30–40%', severity: 'moderate' },
          { label: '重度下降', range: '男 <30%／女 <30%', severity: 'severe' },
        ],
        sourceNote: '2015 ASE/EACVI Chamber Quantification Guideline',
        calculator: {
          type: 'formula',
          resultLabel: 'EF',
          resultUnit: '%',
          inputs: [
            { key: 'sex', label: '性別', type: 'select', options: [{ value: 'm', label: '男' }, { value: 'f', label: '女' }] },
            { key: 'edv', label: 'EDV', unit: 'mL', step: '1', placeholder: '110' },
            { key: 'esv', label: 'ESV', unit: 'mL', step: '1', placeholder: '45' },
          ],
          compute: (v) => {
            if (!v.edv || v.esv == null || v.edv <= 0) return null;
            return (v.edv - v.esv) / v.edv * 100;
          },
          classify: (val, v) => {
            const male = v.sex !== 'f';
            const cut = male ? [52, 41, 30] : [54, 41, 30];
            if (val >= cut[0]) return { severity: 'normal', label: '正常' };
            if (val >= cut[1]) return { severity: 'mild', label: '輕度下降' };
            if (val >= cut[2]) return { severity: 'moderate', label: '中度下降' };
            return { severity: 'severe', label: '重度下降' };
          },
        },
      },
      {
        name: 'Teichholz（M-mode）',
        formula: 'EDV = 7×D³ / (2.4 + D)　（D = LV 內徑，ED 與 ES 各算一次）',
        unit: '%',
        metas: [
          { label: '切面', value: 'PLAX，M-mode cursor 經乳突肌尖端' },
          { label: '限制', value: '假設心室為對稱橢圓體' },
        ],
        normalRange: "同 Simpson's biplane 分級",
        probeNote: "僅適用於無區域性室壁運動異常、心室幾何形狀接近正常橢圓體者；有心肌梗塞病史或心室不對稱變形時應改用 Simpson's biplane。",
        gradingTable: [
          { label: '正常', range: '≥55%', severity: 'normal' },
          { label: '輕度下降', range: '45–54%', severity: 'mild' },
          { label: '中度下降', range: '30–44%', severity: 'moderate' },
          { label: '重度下降', range: '<30%', severity: 'severe' },
        ],
        sourceNote: '臨床慣用簡化分級（M-mode 法準確度較 biplane 低，僅供快速評估）',
        calculator: {
          type: 'formula',
          resultLabel: 'EF',
          resultUnit: '%',
          inputs: [
            { key: 'dEd', label: 'LV 內徑（ED）', unit: 'cm', step: '0.1', placeholder: '5.0' },
            { key: 'dEs', label: 'LV 內徑（ES）', unit: 'cm', step: '0.1', placeholder: '3.2' },
          ],
          compute: (v) => {
            if (!v.dEd || !v.dEs) return null;
            const edv = 7 * Math.pow(v.dEd, 3) / (2.4 + v.dEd);
            const esv = 7 * Math.pow(v.dEs, 3) / (2.4 + v.dEs);
            if (edv <= 0) return null;
            return (edv - esv) / edv * 100;
          },
          classify: (val) => {
            if (val >= 55) return { severity: 'normal', label: '正常' };
            if (val >= 45) return { severity: 'mild', label: '輕度下降' };
            if (val >= 30) return { severity: 'moderate', label: '中度下降' };
            return { severity: 'severe', label: '重度下降' };
          },
        },
      },
      {
        name: 'FAC（Fractional Area Change）— 主要用於右心室收縮功能',
        formula: 'RV FAC = (RV EDA − RV ESA) / RV EDA × 100%',
        unit: '%',
        metas: [
          { label: '切面', value: 'RV-focused A4C' },
          { label: '用途', value: '右心室（非左心室）收縮功能' },
        ],
        normalRange: '≥35%',
        probeNote: '描繪 RV 心內膜面積（含 trabeculation 內側），需包含三尖瓣環至心尖；常與 TAPSE 合併判讀右心功能。',
        gradingTable: [
          { label: '正常', range: '≥35%', severity: 'normal' },
          { label: '輕度下降', range: '25–34%', severity: 'mild' },
          { label: '中度下降', range: '18–24%', severity: 'moderate' },
          { label: '重度下降', range: '<18%', severity: 'severe' },
        ],
        sourceNote: '2015 ASE/EACVI Chamber Quantification Guideline（RV 章節）',
        calculator: {
          type: 'formula',
          resultLabel: 'RV FAC',
          resultUnit: '%',
          inputs: [
            { key: 'eda', label: 'RV EDA', unit: 'cm²', step: '0.1', placeholder: '18' },
            { key: 'esa', label: 'RV ESA', unit: 'cm²', step: '0.1', placeholder: '10' },
          ],
          compute: (v) => {
            if (!v.eda || v.esa == null) return null;
            return (v.eda - v.esa) / v.eda * 100;
          },
          classify: (val) => {
            if (val >= 35) return { severity: 'normal', label: '正常' };
            if (val >= 25) return { severity: 'mild', label: '輕度下降' };
            if (val >= 18) return { severity: 'moderate', label: '中度下降' };
            return { severity: 'severe', label: '重度下降' };
          },
        },
      },
    ],
  },

  av: {
    key: 'av',
    name: 'Aortic Valve',
    fullName: '主動脈瓣（Aortic Valve）',
    icon: '🔴',
    shortDesc: 'AVA／Gradient／DVI／AR',
    intro: '主動脈瓣狹窄（AS）以連續方程式計算瓣口面積為主要方法；主動脈瓣閉鎖不全（AR）則以 vena contracta、PHT、RF 等綜合判斷。',
    params: [
      {
        name: 'AVA（連續方程式 Continuity Equation）',
        formula: 'AVA = (CSA_LVOT × VTI_LVOT) / VTI_AV',
        unit: 'cm²',
        metas: [
          { label: 'CSA_LVOT', value: 'π × (D_LVOT / 2)²' },
          { label: '切面', value: 'D：PLAX zoom；VTI：A5C/A3C' },
        ],
        normalRange: '3.0–4.0 cm²',
        probeNote: 'LVOT 直徑於收縮中期、瓣葉基部測量（內緣到內緣）；LVOT VTI 以 PW Doppler 取樣於瓣環前 0.5–1cm 處；AV VTI 以 CW Doppler 取最高速度頻譜（多切面尋找最高 Vmax，常需 apical、right parasternal 等多角度）。',
        gradingTable: [
          { label: '正常', range: '3.0–4.0 cm²', severity: 'normal' },
          { label: '輕度 AS', range: 'AVA >1.5 cm²；Vmax 2.6–2.9 m/s；mean PG <20 mmHg', severity: 'mild' },
          { label: '中度 AS', range: 'AVA 1.0–1.5 cm²；Vmax 3.0–3.9 m/s；mean PG 20–39 mmHg', severity: 'moderate' },
          { label: '重度 AS', range: 'AVA <1.0 cm²（indexed <0.6 cm²/m²）；Vmax ≥4.0 m/s；mean PG ≥40 mmHg', severity: 'severe' },
        ],
        sourceNote: '2020 ACC/AHA VHD Guideline；2021 ESC/EACTS VHD Guideline',
        calculator: {
          type: 'formula',
          resultLabel: 'AVA',
          resultUnit: 'cm²',
          inputs: [
            { key: 'lvotD', label: 'LVOT 直徑', unit: 'cm', step: '0.1', placeholder: '2.0' },
            { key: 'lvotVTI', label: 'LVOT VTI', unit: 'cm', step: '0.1', placeholder: '20' },
            { key: 'avVTI', label: 'AV VTI', unit: 'cm', step: '0.1', placeholder: '80' },
          ],
          compute: (v) => {
            if (!v.lvotD || !v.lvotVTI || !v.avVTI) return null;
            const csa = Math.PI * Math.pow(v.lvotD / 2, 2);
            return (csa * v.lvotVTI) / v.avVTI;
          },
          classify: (val) => {
            if (val >= 3.0) return { severity: 'normal', label: '正常' };
            if (val > 1.5) return { severity: 'mild', label: '輕度 AS' };
            if (val >= 1.0) return { severity: 'moderate', label: '中度 AS' };
            return { severity: 'severe', label: '重度 AS' };
          },
        },
      },
      {
        name: 'DVI（Dimensionless Velocity Index）',
        formula: 'DVI = VTI_LVOT / VTI_AV　（或 Vmax_LVOT / Vmax_AV）',
        unit: '比值',
        metas: [
          { label: '優點', value: '不需測量 LVOT 直徑，避免直徑平方放大誤差' },
        ],
        normalRange: '≈1.0',
        probeNote: '適合 LVOT 直徑測量困難（如鈣化、幾何形狀不規則）時作為輔助指標，與 AVA 連續方程式互相佐證。',
        gradingTable: [
          { label: '正常／無明顯狹窄', range: '>0.50', severity: 'normal' },
          { label: '中度 AS', range: '0.25–0.50', severity: 'moderate' },
          { label: '重度 AS', range: '<0.25', severity: 'severe' },
        ],
        sourceNote: '2020 ACC/AHA VHD Guideline',
        calculator: {
          type: 'formula',
          resultLabel: 'DVI',
          resultUnit: '',
          inputs: [
            { key: 'lvotVTI', label: 'LVOT VTI', unit: 'cm', step: '0.1', placeholder: '20' },
            { key: 'avVTI', label: 'AV VTI', unit: 'cm', step: '0.1', placeholder: '80' },
          ],
          compute: (v) => {
            if (!v.lvotVTI || !v.avVTI) return null;
            return v.lvotVTI / v.avVTI;
          },
          classify: (val) => {
            if (val > 0.5) return { severity: 'normal', label: '正常／無明顯狹窄' };
            if (val >= 0.25) return { severity: 'moderate', label: '中度 AS' };
            return { severity: 'severe', label: '重度 AS' };
          },
        },
      },
      {
        name: 'AR（主動脈瓣閉鎖不全）嚴重度',
        formula: 'Vena Contracta／PHT／Regurgitant Fraction (RF)',
        unit: 'cm／ms／%',
        metas: [
          { label: '切面', value: 'PLAX（VC）、CW Doppler（PHT）' },
        ],
        normalRange: '無明顯逆流',
        probeNote: 'PHT 越短代表主動脈與左心室壓力越快平衡，提示逆流量大、左心室順應性差或舒張壓快速上升；嚴重 AR 常合併降主動脈全舒張期逆流（holodiastolic flow reversal）。',
        gradingTable: [
          { label: '輕度', range: 'VC <0.3cm；PHT >500ms；RF <30%', severity: 'mild' },
          { label: '中度', range: 'VC 0.3–0.6cm；PHT 200–500ms；RF 30–49%', severity: 'moderate' },
          { label: '重度', range: 'VC >0.6cm；PHT <200ms；RF ≥50%', severity: 'severe' },
        ],
        sourceNote: '2017 ASE/EACVI Valvular Regurgitation Guideline',
        calculator: {
          type: 'multi',
          criteria: [
            {
              key: 'vc', label: 'Vena Contracta', unit: 'cm', step: '0.05', placeholder: '0.4',
              classify: (v) => v < 0.3 ? { severity: 'mild', label: '輕度' } : v <= 0.6 ? { severity: 'moderate', label: '中度' } : { severity: 'severe', label: '重度' },
            },
            {
              key: 'pht', label: 'PHT', unit: 'ms', step: '10', placeholder: '300',
              classify: (v) => v > 500 ? { severity: 'mild', label: '輕度' } : v >= 200 ? { severity: 'moderate', label: '中度' } : { severity: 'severe', label: '重度' },
            },
            {
              key: 'rf', label: 'Regurgitant Fraction', unit: '%', step: '1', placeholder: '35',
              classify: (v) => v < 30 ? { severity: 'mild', label: '輕度' } : v < 50 ? { severity: 'moderate', label: '中度' } : { severity: 'severe', label: '重度' },
            },
          ],
        },
      },
    ],
  },

  mv: {
    key: 'mv',
    name: 'Mitral Valve',
    fullName: '二尖瓣（Mitral Valve）',
    icon: '🔵',
    shortDesc: 'MVA／Gradient／MR',
    intro: '二尖瓣狹窄（MS）以 PHT 法或直接 planimetry 測量瓣口面積；二尖瓣閉鎖不全（MR）以 vena contracta、EROA、RVol 綜合分級。',
    params: [
      {
        name: 'MV Area（Pressure Half-Time 法）',
        formula: 'MVA = 220 / PHT',
        unit: 'cm²',
        metas: [
          { label: '切面', value: 'A4C，CW Doppler 通過二尖瓣口' },
          { label: 'PHT', value: 'E 波峰速降至峰速 70.7% 所需時間' },
        ],
        normalRange: '4.0–6.0 cm²',
        probeNote: '心房顫動、AR 合併存在時 PHT 法準確度下降，建議與 planimetry 互相對照；測量時避免心律不整週期取樣誤差，建議多個心跳週期平均。',
        gradingTable: [
          { label: '正常', range: '4.0–6.0 cm²', severity: 'normal' },
          { label: '輕度 MS', range: 'MVA >1.5 cm²', severity: 'mild' },
          { label: '中度 MS', range: 'MVA 1.0–1.5 cm²', severity: 'moderate' },
          { label: '重度 MS', range: 'MVA <1.0 cm²', severity: 'severe' },
        ],
        sourceNote: '2009/2017 ASE Native Valve Stenosis Guideline',
        calculator: {
          type: 'formula',
          resultLabel: 'MVA',
          resultUnit: 'cm²',
          inputs: [
            { key: 'pht', label: 'PHT', unit: 'ms', step: '10', placeholder: '220' },
          ],
          compute: (v) => v.pht ? 220 / v.pht : null,
          classify: (val) => {
            if (val >= 4.0) return { severity: 'normal', label: '正常' };
            if (val > 1.5) return { severity: 'mild', label: '輕度 MS' };
            if (val >= 1.0) return { severity: 'moderate', label: '中度 MS' };
            return { severity: 'severe', label: '重度 MS' };
          },
        },
      },
      {
        name: 'MV Area（Planimetry，直接描繪）',
        formula: '直接於瓣口最窄處描繪面積',
        unit: 'cm²',
        metas: [
          { label: '切面', value: 'PSAX，瓣葉尖端水平' },
        ],
        normalRange: '4.0–6.0 cm²',
        probeNote: '需找到瓣葉尖端最窄開口平面（非瓣環平面），逐格搜尋避免高估面積；嚴重鈣化、瓣葉變形時測量困難度增加，建議搭配 3D echo 校正。',
        gradingTable: [
          { label: '輕度 MS', range: '>1.5 cm²', severity: 'mild' },
          { label: '中度 MS', range: '1.0–1.5 cm²', severity: 'moderate' },
          { label: '重度 MS', range: '<1.0 cm²', severity: 'severe' },
        ],
        sourceNote: '2009/2017 ASE Native Valve Stenosis Guideline',
        calculator: {
          type: 'formula',
          resultLabel: 'MVA',
          resultUnit: 'cm²',
          inputs: [
            { key: 'area', label: '量測面積', unit: 'cm²', step: '0.1', placeholder: '1.2' },
          ],
          compute: (v) => v.area != null ? v.area : null,
          classify: (val) => {
            if (val >= 4.0) return { severity: 'normal', label: '正常' };
            if (val > 1.5) return { severity: 'mild', label: '輕度 MS' };
            if (val >= 1.0) return { severity: 'moderate', label: '中度 MS' };
            return { severity: 'severe', label: '重度 MS' };
          },
        },
      },
      {
        name: 'MR（二尖瓣閉鎖不全）嚴重度',
        formula: 'Vena Contracta／EROA／Regurgitant Volume',
        unit: 'cm／cm²／mL',
        metas: [
          { label: 'EROA', value: 'PISA 法計算 Effective Regurgitant Orifice Area' },
        ],
        normalRange: '無明顯逆流',
        probeNote: 'PISA 半徑測量於 Nyquist limit 調至約 40cm/s 之等速面；偏心性噴流（eccentric jet）易低估嚴重度，須合併肺靜脈血流頻譜（收縮期逆流提示重度 MR）判讀。',
        gradingTable: [
          { label: '輕度', range: 'VC <0.3cm；EROA <0.20cm²；RVol <30mL', severity: 'mild' },
          { label: '中度', range: 'VC 0.3–0.69cm；EROA 0.20–0.39cm²；RVol 30–59mL', severity: 'moderate' },
          { label: '重度', range: 'VC ≥0.7cm；EROA ≥0.40cm²；RVol ≥60mL', severity: 'severe' },
        ],
        sourceNote: '2017 ASE/EACVI Valvular Regurgitation Guideline',
        calculator: {
          type: 'multi',
          criteria: [
            {
              key: 'vc', label: 'Vena Contracta', unit: 'cm', step: '0.05', placeholder: '0.5',
              classify: (v) => v < 0.3 ? { severity: 'mild', label: '輕度' } : v < 0.7 ? { severity: 'moderate', label: '中度' } : { severity: 'severe', label: '重度' },
            },
            {
              key: 'eroa', label: 'EROA', unit: 'cm²', step: '0.01', placeholder: '0.3',
              classify: (v) => v < 0.20 ? { severity: 'mild', label: '輕度' } : v < 0.40 ? { severity: 'moderate', label: '中度' } : { severity: 'severe', label: '重度' },
            },
            {
              key: 'rvol', label: 'Regurgitant Volume', unit: 'mL', step: '1', placeholder: '45',
              classify: (v) => v < 30 ? { severity: 'mild', label: '輕度' } : v < 60 ? { severity: 'moderate', label: '中度' } : { severity: 'severe', label: '重度' },
            },
          ],
        },
      },
    ],
  },

  pv: {
    key: 'pv',
    name: 'Pulmonary Valve',
    fullName: '肺動脈瓣（Pulmonary Valve）',
    icon: '🟢',
    shortDesc: 'Peak Velocity／Gradient／PR',
    intro: '肺動脈瓣狹窄（PS）以 CW Doppler 峰速/壓力差分級；肺動脈瓣閉鎖不全（PR）以 PHT 與噴流寬度評估，常為較輕微逆流但需注意右心容積負荷。',
    params: [
      {
        name: 'Peak Velocity／Peak Gradient',
        formula: 'PG = 4 × Vmax²（簡化柏努利方程式）',
        unit: 'm/s／mmHg',
        metas: [
          { label: '切面', value: 'PSAX RVOT level 或 subcostal' },
        ],
        normalRange: 'Vmax <1.0 m/s（正常無明顯狹窄）',
        probeNote: '需多角度尋找最高速度頻譜，避免與 VSD 或其他高速噴流訊號混淆；先天性 PS 常合併瓣膜圓頂狀（doming）變化，可作為輔助判斷。',
        gradingTable: [
          { label: '輕度 PS', range: 'Vmax <3 m/s；PG <36 mmHg', severity: 'mild' },
          { label: '中度 PS', range: 'Vmax 3–4 m/s；PG 36–64 mmHg', severity: 'moderate' },
          { label: '重度 PS', range: 'Vmax >4 m/s；PG >64 mmHg', severity: 'severe' },
        ],
        sourceNote: '2020 ACC/AHA VHD Guideline（先天性/後天性肺動脈瓣狹窄）',
        calculator: {
          type: 'formula',
          resultLabel: 'PG（peak gradient）',
          resultUnit: 'mmHg',
          inputs: [
            { key: 'vmax', label: 'Vmax', unit: 'm/s', step: '0.1', placeholder: '3.2' },
          ],
          compute: (v) => v.vmax != null ? 4 * v.vmax * v.vmax : null,
          classify: (val, v) => {
            if (v.vmax < 1.0) return { severity: 'normal', label: '正常' };
            if (val < 36) return { severity: 'mild', label: '輕度 PS' };
            if (val <= 64) return { severity: 'moderate', label: '中度 PS' };
            return { severity: 'severe', label: '重度 PS' };
          },
        },
      },
      {
        name: 'PR（肺動脈瓣閉鎖不全）嚴重度',
        formula: 'Pressure Half-Time／Jet Width／血流型態',
        unit: 'ms／比值',
        metas: [
          { label: '輔助徵象', value: '肺動脈分支舒張期血流逆流' },
        ],
        normalRange: '無明顯逆流（生理性 trace PR 常見）',
        probeNote: 'PHT 越短代表肺動脈與右心室壓力越快平衡，常見於重度 PR 合併右心室順應性下降；嚴重 PR 時逆流頻譜常呈現快速下降（steep deceleration）且舒張末期接近零流速。',
        gradingTable: [
          { label: '輕度', range: 'PHT >100ms；噴流窄（<RVOT寬度1/3）', severity: 'mild' },
          { label: '中度', range: '介於輕重度之間', severity: 'moderate' },
          { label: '重度', range: 'PHT <100ms；噴流寬廣；肺動脈分支舒張期逆流', severity: 'severe' },
        ],
        sourceNote: '2017 ASE/EACVI Valvular Regurgitation Guideline',
        calculator: {
          type: 'multi',
          criteria: [
            {
              key: 'pht', label: 'PHT', unit: 'ms', step: '10', placeholder: '150',
              classify: (v) => v > 100 ? { severity: 'mild', label: '輕度' } : { severity: 'severe', label: '重度' },
            },
          ],
        },
      },
    ],
  },

  tv: {
    key: 'tv',
    name: 'Tricuspid Valve',
    fullName: '三尖瓣（Tricuspid Valve）＋ 右心功能',
    icon: '🟡',
    shortDesc: 'TR／RVSP／TAPSE',
    intro: '三尖瓣閉鎖不全（TR）嚴重度分級，並利用 TR 噴流估算肺動脈收縮壓（RVSP）；TAPSE 作為快速評估右心室收縮功能的輔助指標。',
    params: [
      {
        name: 'TR（三尖瓣閉鎖不全）嚴重度',
        formula: 'Vena Contracta／PISA／肝靜脈血流',
        unit: 'cm',
        metas: [
          { label: '切面', value: 'A4C、RV inflow' },
        ],
        normalRange: '無明顯逆流（生理性 trace TR 常見）',
        probeNote: '重度 TR 常合併肝靜脈收縮期血流逆流（systolic flow reversal），且 TR 噴流速度可能因右房右室壓力快速平衡而偏低（不可單以 Vmax 判斷嚴重度）。',
        gradingTable: [
          { label: '輕度', range: 'VC <0.3cm', severity: 'mild' },
          { label: '中度', range: 'VC 0.3–0.69cm', severity: 'moderate' },
          { label: '重度', range: 'VC ≥0.7cm；肝靜脈收縮期逆流', severity: 'severe' },
        ],
        sourceNote: '2017 ASE/EACVI Valvular Regurgitation Guideline',
        calculator: {
          type: 'multi',
          criteria: [
            {
              key: 'vc', label: 'Vena Contracta', unit: 'cm', step: '0.05', placeholder: '0.5',
              classify: (v) => v < 0.3 ? { severity: 'mild', label: '輕度' } : v < 0.7 ? { severity: 'moderate', label: '中度' } : { severity: 'severe', label: '重度' },
            },
          ],
        },
      },
      {
        name: 'RVSP（肺動脈收縮壓估算）',
        formula: 'RVSP = 4 × (TR Vmax)² + RAP',
        unit: 'mmHg',
        metas: [
          { label: 'RAP 估算', value: 'IVC 直徑 + 吸氣塌陷率（subcostal）' },
        ],
        normalRange: '<35–40 mmHg（RAP 以 3mmHg 估算時）',
        probeNote: 'IVC <2.1cm 且吸氣塌陷 >50% → RAP ≈3mmHg；IVC >2.1cm 且塌陷 <50% → RAP ≈15mmHg；介於兩者之間 → RAP ≈8mmHg。需 TR 噴流頻譜訊號完整、無截斷（cutoff）才可靠。',
        gradingTable: [
          { label: '正常', range: 'RVSP <35 mmHg', severity: 'normal' },
          { label: '輕度升高', range: 'RVSP 36–50 mmHg', severity: 'mild' },
          { label: '中度升高', range: 'RVSP 51–70 mmHg', severity: 'moderate' },
          { label: '重度升高', range: 'RVSP >70 mmHg', severity: 'severe' },
        ],
        sourceNote: '2015 ASE/EACVI Chamber Quantification Guideline（肺動脈壓估算章節）',
        calculator: {
          type: 'formula',
          resultLabel: 'RVSP',
          resultUnit: 'mmHg',
          inputs: [
            { key: 'trVmax', label: 'TR Vmax', unit: 'm/s', step: '0.1', placeholder: '3.0' },
            { key: 'rap', label: 'RAP（估算）', unit: 'mmHg', step: '1', placeholder: '8' },
          ],
          compute: (v) => (v.trVmax != null && v.rap != null) ? 4 * v.trVmax * v.trVmax + v.rap : null,
          classify: (val) => {
            if (val < 35) return { severity: 'normal', label: '正常' };
            if (val <= 50) return { severity: 'mild', label: '輕度升高' };
            if (val <= 70) return { severity: 'moderate', label: '中度升高' };
            return { severity: 'severe', label: '重度升高' };
          },
        },
      },
      {
        name: 'TAPSE（右心室收縮功能）',
        formula: 'M-mode 測量三尖瓣環外側位移幅度',
        unit: 'mm',
        metas: [
          { label: '切面', value: 'A4C，M-mode cursor 對齊三尖瓣環外側' },
        ],
        normalRange: '≥17 mm',
        probeNote: '快速、重複性高的右心功能篩檢指標，但屬於角度依賴（angle-dependent）且只反映縱向運動，無法偵測局部右心室功能異常；建議與 RV FAC 合併判讀。',
        gradingTable: [
          { label: '正常', range: '≥17 mm', severity: 'normal' },
          { label: '右心室收縮功能下降', range: '<17 mm', severity: 'moderate' },
        ],
        sourceNote: '2015 ASE/EACVI Chamber Quantification Guideline（RV 章節）',
        calculator: {
          type: 'formula',
          resultLabel: 'TAPSE',
          resultUnit: 'mm',
          inputs: [
            { key: 'tapse', label: 'TAPSE', unit: 'mm', step: '0.5', placeholder: '18' },
          ],
          compute: (v) => v.tapse != null ? v.tapse : null,
          classify: (val) => val >= 17 ? { severity: 'normal', label: '正常' } : { severity: 'moderate', label: '右心室收縮功能下降' },
        },
      },
    ],
  },

  diastolic: {
    key: 'diastolic',
    name: 'Diastolic Function',
    fullName: '舒張功能（Diastolic Function）',
    icon: '🟣',
    shortDesc: "E/A／E/e'／LAVI／分級演算法",
    intro: "舒張功能評估需綜合 4 項指標（annular e' 速度、平均 E/e'、TR Vmax、LAVI）判斷是否異常與分級，單一指標不足以下診斷。",
    params: [
      {
        name: 'E/A Ratio',
        formula: 'E/A = Mitral E 波峰速 / A 波峰速',
        unit: '比值',
        metas: [
          { label: '切面', value: 'A4C，PW Doppler 取樣於瓣葉尖端' },
          { label: '限制', value: '心房顫動時 A 波消失，無法使用' },
        ],
        normalRange: '0.8–2.0（隨年齡增加而下降，需年齡校正判讀）',
        probeNote: "E/A <0.8 合併 E 波減速時間延長，通常提示 Grade I（impaired relaxation）；E/A 0.8–2.0 但 E/e' 升高需懷疑 pseudonormal（Grade II）；E/A >2.0 合併減速時間縮短，提示 restrictive pattern（Grade III）。",
        gradingTable: [
          { label: '正常／Grade I 可能', range: '0.8–2.0', severity: 'normal' },
          { label: 'Grade I（鬆弛障礙）', range: '<0.8', severity: 'mild' },
          { label: 'Grade III（限制型）', range: '>2.0', severity: 'severe' },
        ],
        sourceNote: '2016 ASE/EACVI Diastolic Function Guideline',
        calculator: {
          type: 'formula',
          resultLabel: 'E/A',
          resultUnit: '',
          inputs: [
            { key: 'eVel', label: 'E 波峰速', unit: 'm/s', step: '0.1', placeholder: '0.7' },
            { key: 'aVel', label: 'A 波峰速', unit: 'm/s', step: '0.1', placeholder: '0.8' },
          ],
          compute: (v) => (v.eVel != null && v.aVel) ? v.eVel / v.aVel : null,
          classify: (val) => {
            if (val < 0.8) return { severity: 'mild', label: 'Grade I（鬆弛障礙）' };
            if (val <= 2.0) return { severity: 'normal', label: '正常／Grade I 可能' };
            return { severity: 'severe', label: 'Grade III（限制型）' };
          },
        },
      },
      {
        name: "E/e' Ratio",
        formula: "平均 E/e' = E 波峰速 / [(e'_septal + e'_lateral)/2]",
        unit: '比值',
        metas: [
          { label: '切面', value: 'A4C，Tissue Doppler 取樣於瓣環中隔側與側壁側' },
        ],
        normalRange: "septal e' ≥7 cm/s；lateral e' ≥10 cm/s；平均 E/e' <8",
        probeNote: "單一 e' 速度（中隔或側壁）易受局部心肌病變影響，建議取兩處平均值；E/e' 8–14 為灰色地帶，須合併 LAVI 與 TR Vmax 判讀。",
        gradingTable: [
          { label: '正常', range: "平均 E/e' <8", severity: 'normal' },
          { label: '不確定（灰色地帶）', range: "平均 E/e' 8–14", severity: 'mild' },
          { label: '左心室充填壓升高', range: "平均 E/e' >14", severity: 'severe' },
        ],
        sourceNote: '2016 ASE/EACVI Diastolic Function Guideline',
        calculator: {
          type: 'formula',
          resultLabel: "平均 E/e'",
          resultUnit: '',
          inputs: [
            { key: 'eVel', label: 'E 波峰速', unit: 'cm/s', step: '1', placeholder: '70' },
            { key: 'septalE', label: "Septal e'", unit: 'cm/s', step: '0.5', placeholder: '6' },
            { key: 'lateralE', label: "Lateral e'", unit: 'cm/s', step: '0.5', placeholder: '9' },
          ],
          compute: (v) => {
            if (v.eVel == null || v.septalE == null || v.lateralE == null) return null;
            const avgE = (v.septalE + v.lateralE) / 2;
            if (avgE <= 0) return null;
            return v.eVel / avgE;
          },
          classify: (val) => {
            if (val < 8) return { severity: 'normal', label: '正常' };
            if (val <= 14) return { severity: 'mild', label: '不確定（灰色地帶）' };
            return { severity: 'severe', label: '左心室充填壓升高' };
          },
        },
      },
      {
        name: 'LAVI（左心房容積指數）',
        formula: 'LAVI = LA Volume（biplane disk summation）/ BSA',
        unit: 'mL/m²',
        metas: [
          { label: '切面', value: 'A4C + A2C，收縮末期測量' },
        ],
        normalRange: '≤34 mL/m²',
        probeNote: '需排除二尖瓣疾病、心房顫動等會直接造成左心房擴大的情況，否則 LAVI 不能單純歸因於舒張功能異常；測量時避免將肺靜脈、左心耳納入心房腔內。',
        gradingTable: [
          { label: '正常', range: '≤34 mL/m²', severity: 'normal' },
          { label: '左心房擴大', range: '>34 mL/m²', severity: 'moderate' },
        ],
        sourceNote: '2015 ASE/EACVI Chamber Quantification Guideline',
        calculator: {
          type: 'formula',
          resultLabel: 'LAVI',
          resultUnit: 'mL/m²',
          inputs: [
            { key: 'laVol', label: 'LA Volume', unit: 'mL', step: '1', placeholder: '55' },
            { key: 'bsa', label: 'BSA', unit: 'm²', step: '0.01', placeholder: '1.7' },
          ],
          compute: (v) => (v.laVol != null && v.bsa) ? v.laVol / v.bsa : null,
          classify: (val) => val <= 34 ? { severity: 'normal', label: '正常' } : { severity: 'moderate', label: '左心房擴大' },
        },
      },
      {
        name: '舒張功能異常分級演算法（4 項指標）',
        formula: "計分：e' 異常、平均E/e'>14、TR Vmax>2.8m/s、LAVI>34mL/m²",
        unit: '分級',
        metas: [
          { label: '用途', value: '心室收縮功能正常族群（EF 正常）' },
        ],
        normalRange: '0–1 項異常 → 舒張功能正常',
        probeNote: "4 項中若 ≥50% 指標無法判讀，整體判讀為「不確定」；EF 已下降族群建議直接依 E/A、E/e'、LAVI、TR Vmax 分級舒張功能不良嚴重度，演算法略有不同（此處列出之為 EF 正常族群篩檢流程）。",
        gradingTable: [
          { label: '舒張功能正常', range: '0–1 項指標異常', severity: 'normal' },
          { label: '不確定', range: '恰好 2 項指標異常', severity: 'mild' },
          { label: '舒張功能異常', range: '≥3 項指標異常（即 LV 充填壓升高）', severity: 'severe' },
        ],
        sourceNote: '2016 ASE/EACVI Diastolic Function Guideline',
        calculator: {
          type: 'checklist',
          items: [
            { key: 'eprime', label: "e' 異常（septal e' <7 或 lateral e' <10 cm/s）" },
            { key: 'eoverE', label: "平均 E/e' > 14" },
            { key: 'trvmax', label: 'TR Vmax > 2.8 m/s' },
            { key: 'lavi', label: 'LAVI > 34 mL/m²' },
          ],
          classify: (count) => {
            if (count <= 1) return { severity: 'normal', label: '舒張功能正常' };
            if (count === 2) return { severity: 'mild', label: '不確定' };
            return { severity: 'severe', label: '舒張功能異常' };
          },
        },
      },
    ],
  },
};
