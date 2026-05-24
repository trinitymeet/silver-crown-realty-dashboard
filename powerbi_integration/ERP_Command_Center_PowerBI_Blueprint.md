# ERP Command Center - Power BI Integration Blueprint

This folder contains all the database sheets and theme resources needed to build the **ERP Command Center Dashboard** in Power BI.

---

## 1. Load Data
Import the 4 CSV files into Power BI Desktop:
1.  `powerbi_activities.csv`
2.  `powerbi_bom_items.csv`
3.  `powerbi_transactions.csv`
4.  `powerbi_cashflow_projections.csv`

---

## 2. Crucial Step: Set Regional Formatting Settings
To prevent Power BI from defaulting to Millions/Billions, you must set the regional settings to **English (India)** to automatically display **Lakhs and Crores**:
1.  In Power BI Desktop, navigate to **File** > **Options and settings** > **Options**.
2.  Select **Regional Settings** under the **Current File** section in the left pane.
3.  Set **Locale for import** to **English (India)**.
4.  Save and refresh the datasets.

---

## 3. Relational Schema Data Model Mapping
In the Power BI **Model** view, map the relationships as follows:
*   `powerbi_activities[Activity ID]` (1) &rarr; `powerbi_bom_items[Activity ID]` (Many) [Cross filter: Both]
*   `powerbi_activities[Activity ID]` (1) &rarr; `powerbi_transactions[Activity ID]` (Many) [Cross filter: Single]
*   `powerbi_bom_items[BOM Item ID]` (1) &rarr; `powerbi_transactions[BOM Item ID]` (Many) [Cross filter: Single]
*   `powerbi_cashflow_projections[Month]` (1) &rarr; `powerbi_transactions[Month]` (Many) [Cross filter: Single]

---

## 4. Custom Theme Import
Make your report look futuristic, modern, and nature-inspired (sage green/terracotta palette, rounded container borders, and soft shadows):
1.  Go to the **View** tab in the top ribbon.
2.  Click the dropdown on **Themes** and select **Browse for themes**.
3.  Select the **`Theme_Biophilic_Nature.json`** file in this folder and click Open.

---

## 5. Calculated DAX Measures
Create a new table named `_Measures` and add these DAX formulas:

### A. Value of Work Done (VWD / EV)
```dax
VWD = SUMX(
    powerbi_activities, 
    powerbi_activities[Budget (BAC)] * (powerbi_activities[Physical Progress %] / 100)
)
```

### B. Actual Cost of Work Performed (ACWP)
```dax
ACWP = SUM(powerbi_transactions[Amount])
```

### C. Value-to-Cost Variance (CV)
```dax
Cost_Variance_CV = [VWD] - [ACWP]
```

### D. Cost Performance Index (CPI)
```dax
CPI = DIVIDE([VWD], [ACWP], 1.0)
```

### E. Scheduled Budget (BCWS / PV)
```dax
BCWS = SUMX(
    powerbi_activities,
    powerbi_activities[Budget (BAC)] * (
        LOOKUPVALUE(
            powerbi_cashflow_projections[Planned Flow (Lakhs)], 
            powerbi_cashflow_projections[Month], 
            SELECTEDVALUE(powerbi_cashflow_projections[Month])
        ) / 100
    )
)
```

### F. Certified RA Billing Progress
```dax
RA_Billing = [VWD] * 1.15
```

### G. Cash Flow Security Margin (Certified Billed vs ACWP)
```dax
Cash_Margin = ([RA_Billing] * 0.95) - [ACWP]
```

---

## 6. Formatting Short Lakhs (L) and Crores (Cr)
To format card labels dynamically, select any measure, navigate to the **Measure tools** tab, select Custom formatting, and apply this format expression:
```text
[>=10000000]₹ ##,##,##,##0.00,, "Cr";[>=100000]₹ ##,##,##0.00,, "L";₹ ##,##0.00
```
This forces all metrics to scale cleanly based on lakhs/crores thresholds.
