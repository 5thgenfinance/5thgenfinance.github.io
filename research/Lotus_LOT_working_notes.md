# Lotus Resources (ASX: LOT | OTCQX: LTSRF) - Working Notes

Analysis date: 2026-10-08 | Method: Don Durrett 2.2 (10-factor + SOTP) | All figures USD (AUD at 0.69) | Report version: v4
Durrett constants: P&P 0.9, M&I 0.65, Inferred 0.3 | Discount 8% mid-year (jurisdiction) | Cost pad 1.3x AISC

## 1. Snapshot
- Price US$0.15 (A$0.22); basic shares 546.8M; market cap ~US$82M
- Hold (speculative). Durrett score 4.9/10. Data Quality Score 7.20/10
- SOTP per fully diluted share: $0.35 ($85) | $0.59 ($100) | $1.00 ($150)
- Analyst consensus A$0.28 (~US$0.19), 4 analysts, Simply Wall St (secondary)
- Earlier versions (superseded): $0.89/$1.53/$3.95 -> $0.51/$0.78/$2.03 -> $0.51/$0.77/$1.90 -> now

## 2. Projects
| Project | Where | Own. | Status |
|---|---|---|---|
| Kayelekera | Malawi | 85% (Govt 15%) | Producing, ramping; paused Jun 10, resumed Aug; 332.1 klb in FY26 |
| Letlhakane | Botswana | 100% | Scoping study Mar 2025; PFS/MRE update targeted H2 CY2026 |
| Livingstonia | Malawi | 85% | Inferred 4.8 Mlb only; not valued |

## 3. Resources (Mlb U3O8, contained, 100% basis)
| Project | P&P | M&I total | M&I ex-res | Inferred | Plausible | Attrib. |
|---|---|---|---|---|---|---|
| Kayelekera | 23.0 | 37.4 | 14.4 | 8.9 | 32.73 | 27.82 (85%) |
| Letlhakane | 0 | 56.8 | 56.8 | 56.9 | 53.99 | 53.99 |
| Livingstonia | 0 | 0 | 0 | 4.8 | 1.44 | 1.22 (85%) |

Step-by-step:
- Kayelekera: 23.0 x 0.9 + 14.4 x 0.65 + 8.9 x 0.3 = 20.70 + 9.36 + 2.67 = 32.73
- Letlhakane: 56.8 x 0.65 + 56.9 x 0.3 = 36.92 + 17.07 = 53.99
- Recoverable (used in NAV): Kayelekera 20.70 + (9.36 + 2.67) x 86.7% = 31.13, x85% = 26.46; Letlhakane 53.99 x 64% (45 Mlb feed -> 29 Mlb produced) = 34.79
- Checks: M&I 37.4 = measured 1.6 + RoM stockpile 2.6 + indicated 33.2; inferred 8.9 = 7.4 + 1.5 low-grade stockpile; reserve 23.0 = proved 1.2 + RoM 2.6 + probable 19.2
- Flag: Kayelekera reserve and resource date from 2022 (older than 3 years) and are not depleted for 332 klb produced

## 4. Valuation inputs
| Item | Kayelekera | Letlhakane |
|---|---|---|
| Attrib. recoverable Mlb | 26.46 | 34.79 |
| Rate (Mlb/yr, attrib.) | 2.04 (2.4 x 85%) | 3.0 |
| Life (yrs) | 13.0 | 11.6 |
| Start (yrs) | 1.0 (assumed) | 5.5 (assumed) |
| AISC $/lb | 45 (company target) | 41.1 (scoping cash cost proxy) |
| 1.3x AISC | 58.5 | 53.43 |
| Stage factor | 0.80 | 0.40 |
| Capex | $28.3M to complete (restart 2.0 + grid 9.7 + TSF 16.6) | $488.5M ($465M + $23.5M) at 4.5 yrs |

- Overhead: US$8.7M/yr (A$12.57M FY2025 SG&A, secondary), PV ~US$74M
- Letlhakane funding (assumption): 40% equity at $0.30, 60% debt (cost = discount rate, value-neutral); pre-FID US$15M equity at $0.15 (~100M shares). Not built if NAV < capex (floored at zero)
- Kayelekera actual unit cost is far above the $45 AISC: June-quarter opex A$24.6M for 155.9 klb

## 5. SOTP (US$M)
| | $85 | $100 | $150 |
|---|---|---|---|
| Kayelekera NAV | 328.5 | 514.4 | 1,134.2 |
| Letlhakane NAV | 190.2 | 280.6 | 581.8 |
| Less Kayelekera capex PV | (27.2) | (27.2) | (27.2) |
| Less Letlhakane capex PV | (345.5) | (345.5) | (345.5) |
| Floor (not built) | 155.3 | 65.0 | 0.0 |
| Plus equity proceeds PV (if built) | 0.0 | 0.0 | 138.2 |
| Less overhead PV | (74.3) | (74.3) | (74.3) |
| Less debt, notes, settlement | (38.3) | (38.3) | (38.3) |
| Plus cash (pro-forma Sep 30, est.) | 65.9 | 65.9 | 65.9 |
| Equity value (notes added back if converted) | 278.6 | 464.6 | 1,458.8 |
| FD shares (M) | 786.7 | 787.1 | 1,465.3 |
| Per FD share | $0.35 | $0.59 | $1.00 |

Sensitivities at $100: base $0.59 | 50% output $0.35 | AISC $60 $0.28 | start yr 3 $0.50 | no overhead $0.68 | 5% discount $0.70
Letlhakane equity issue price (value/share at $150 built): $0.15 -> $0.69 | $0.30 -> $1.00 | $0.50 -> $1.20 | all debt -> $1.59
Rule of thumb: at $85 uranium and $60/lb AISC the model is near the market price, so the market is pricing high Kayelekera costs.

## 6. Fully diluted share count (verified)
- Pre-offer shares 273.39M (record date Jul 27; Jun 30 was 273,218,323)
- Institutional 155.5M (Jul 31) + retail 117.9M (Aug 20) -> basic 546.8M
- Performance rights 1.585M; options 173,914 at A$3.45 (out of the money, excluded); other series not verified
- Warrants 66.29M at A$0.85, expire Sep 9, 2031 (treasury method)
- A$35M zero-coupon notes: 138.3M shares at A$0.253; reset toward the A$0.11 floor (~318M shares) not modeled; floor from a secondary source

## 7. Capital raises and dilution (dated)
| Date | Event | Size | Price | Shares |
|---|---|---|---|---|
| 2025-09-04 | Placement | A$65.2M | A$0.19 | 343.3M (pre-consolidation) |
| 2026-02-05/06 | Placement (post 10-for-1 consolidation) | A$76.2M | A$2.15 | 35.4M |
| 2026-07-31 / 08-20 | 1-for-1 entitlement offer | A$60.1M | A$0.22 | 273.4M (+100%) |
| 2026-09-07 | A$35M convertible notes (EGM Sep 2) | A$35M | conv A$0.253 | 138.3M if converted |
| 2026-09-09 | Warrants to CVI | nil | A$0.85 | 66.3M |
| Pending | Mercuria US$30M inventory prepayment | US$30M | n/a | none (debt-like) |

- Cash A$30.2M at Jun 30; quarterly outflows A$46M (operating 26.0, investing 20.3); 1.21 quarters of funding at Jun 30
- Pro-forma cash assumes the offer and notes less 4% costs, less A$26M Jul-Sep operating burn; restricted cash US$10M excluded
- Probabilities (judgment): raise of US$25M or more within 18 months about 70%; forced raise about 35%

## 8. Durrett 10 factors (total 49/10 = 4.9)
- Properties / Ownership: 7/10 (Good) - Kayelekera 85% producing plus 100% of Letlhakane (113.7 Mlb)
- People / Management: 4/10 (Weak) - Data retracted then restated; no independent directors; CCO left Sep 2026
- Share Structure: 2/10 (Weak) - 546.8M basic after 1-for-1 offer; A$35M reset notes; 66.3M warrants
- Location: 4/10 (Weak) - Malawi/Botswana; export via Zambia/Namibia awaiting final permit
- Projected Growth: 7/10 (Good) - ~0.1 Mlb/yr run-rate to 2.4 Mlb/yr plus ~3 Mlb/yr Letlhakane potential
- Good Buzz / Chart: 2/10 (Weak) - Down ~92% in 12 months; 52-wk low
- Cost / Financing: 4/10 (Weak) - FY26 recovery 47% vs 86.7% target; opex far above AISC target
- Cash / Debt: 4/10 (Weak) - A$30.2M at Jun 30 (1.21 quarters); relies on offer, notes, Mercuria
- Low Valuation Estimate: 8/10 (Strong) - EV ~US$55M vs ~80 Mlb attributable plausible lb
- Upside Potential: 7/10 (Good) - SOTP at $100 ~4x price, depends on ramp-up

## 9. Red flags
- Ramp-up: FY26 recovery 47% vs 86.7% target (44% Mar qtr, 52% Jun qtr); Aug-Sep output about 100 klb; acid plant 50-60% of design
- Product quality: Orano accepted 159.5 of 332.1 klb; 172.8 klb off-spec; CY26 delivery settlement exposure up to US$7M
- Dilution: 1-for-1 offer, reset notes, 66.3M warrants; Letlhakane capex unfunded
- Management: March-quarter data retracted and restated; no independent directors; CCO and Co. Sec. left Sep 2026
- Location: Malawi govt 15%; Namibian export permit pending; Dar es Salaam route cancelled
- Chart: down about 92% in 12 months, at 52-week low

## 10. Verify / to-do
- [ ] Sep-quarter report (late Oct): actual cash, burn, production, recoveries
- [ ] First export shipment (about 144 klb) and converter credit (Oct-Nov)
- [ ] AGM Nov 20, 2026
- [ ] Letlhakane PFS / MRE update (H2 CY2026): funding structure, AISC
- [ ] Notes reset mechanics; warrant terms; other option series
- [ ] FY2026 corporate overhead (we use FY2025 SG&A, likely low)
- [ ] Kayelekera depleted resource and reserve update (2022 data)
- [ ] RAG JSON: no Lotus entry found; merged 2026-01-30 -> offer updated JSON (with Western Uranium)

## 11. Sources (short)
Lotus June 2026 quarterly + 5B (Jul 30); Dec 2025 half-year report (resource/reserve tables); Letlhakane MRE Dec 2024 and scoping study Mar 2025; Appendix 3B Jul 23 and Appendix 2A (shares, rights, options); Appendix 3G Sep 9 (warrants); Appendix 3B Sep 7 (notes); Mining Weekly Jul 27 and mining.com.au Aug 17 (offer results); Sharecafe Oct 8 (Mercuria, production); Simply Wall St and JuniorMetrics (secondary: issue history, price, analysts); KoalaGains (FY25 SG&A, secondary); Trading Economics (U3O8 $89.85).

*Research/education only; not financial advice.*
