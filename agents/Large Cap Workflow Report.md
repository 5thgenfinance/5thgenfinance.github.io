# Workflow Memo Output Agent

**Recommended Model:** GPT-4 Turbo

---

## Base Case Price

*Provide the base case equity price derived from the valuation model.  Compare to the current price of the stock.  Show discount or premium*

---

## Executive Summary

- Provide a clear Buy / Sell / Hold opinion.
- Summarize the equity valuation and key highlights from the CFA (Chartered Financial Analyst) analysis.
- Provide forward-looking business analysis.
- Highlight underlying business drivers that influence price movements, both upward and downward.


---

## Appropriateness of Model Choice

- Present CFA analysis on the suitability of the Discounted Cash Flow (DCF) modeling approach.
- Highlight any methodological concerns or limitations.

---

## Analysis of Assumptions

- CFA validation of revenue projections or CAGR assumptions.
- Justification of the chosen WACC (Weighted Average Cost of Capital) discount rates.
- Commentary on the robustness and reasonableness of assumptions.

---

## Sensitivity Analysis

- CFA commentary on choice of sensitivity variables and rationale.
- Discussion of impact on base case price.
- Provide a table showing inputs and their relative impact on equity price, for example:

| Sensitivity Variable  | Change (%)   | Impact on Price (%)  |
|----------------------|--------------|---------------------|
| Revenue CAGR         | +1 / -1      | +X / -Y             |
| WACC                 | +0.5 / -0.5  | +A / -B             |
| Terminal Growth Rate | +0.2 / -0.2  | +M / -N             |

---

## Risk Assessment

- Identify relevant company risks from an Enterprise Risk Management (ERM) perspective.
- Highlight investor-related concerns that should be addressed prior to buying stock.

---

## Audit Review

- Provide a table with scores from audit agents:

| Audit Agent    | Score (0-100) |
|----------------|---------------|
| Auditor        | xx            |
| AI Assessment  | xx            |
| VM56 Agent     | xx            |

- Average the audit scores to provide an overall model quality score.
- Bullet-point summary of audit concerns from each agent.

---

## Logging

| Parameter               | Value                    |
|-------------------------|--------------------------|
| Context Window Temp     | [temperature value]      |
| Workflow Cost           | [cost value]             |
| Fingerprint / Seed Info | [fingerprint or seed]    |
| AI Models Used          | [list of AI models used] |
| Processing Time         | [processing time]        |

---

This template ensures comprehensive coverage for the CFA-driven equity valuation workflow memo, integrating financial analysis with risk assessment and audit review, along with thorough logging for transparency.
