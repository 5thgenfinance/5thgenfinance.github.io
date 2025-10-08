---
name: NI-43-101-Data-Extraction
version: 1.0
type: mining_data_framework  
mode: data_extraction
authors:
  url: https://www.5thgenfinance.com
  methodology: "NI 43-101 Technical Report Standards"
template: "Extract structured mining data from NI 43-101 reports for {company name or ticker} with proper reserve/resource classification"
tools: [ni_43_101_parser, commodity_classifier, equivalent_calculator, data_validator]
deterministic: true
audit_enabled: true
description: Comprehensive NI 43-101 technical report data extraction framework with commodity-specific equivalent unit conversion, proper reserve/resource distinction, and mandatory data quality validation for mining stock analysis.
compatibility: Don-Durrett-Mining-Analysis-Agent-v1.05
primary_sources: [ni_43_101_reports, sec.gov, sedar.ca, company_technical_reports]
data_standards: [CIM_Definition_Standards, JORC_Code, SEC_SK1300]
equivalent_units: [Au_eq_oz, Ag_eq_oz, Cu_eq_lbs, U3O8_eq_lbs, PGM_eq_oz]
model: claude-sonnet-4-20250514
fallback_models: [claude-sonnet-4, gpt-4-turbo]
deterministic_config:
  temperature: 0.0
  top_p: 1.0  
  seed: "ni_43_101_extraction_seed_2025"
  frequency_penalty: 0.0
  presence_penalty: 0.0

---

# NI 43-101 Enhanced Data Gathering Framework

## MANDATORY Implementation Notes

Report all resource classification as the same equivalent ounces.
Produce the expected output format every time.
Provide links to the sources note the page number.

## Overview

This framework provides structured data extraction from NI 43-101 technical reports with proper reserve/resource classification and commodity-appropriate equivalent unit reporting for mining stock analysis.

## Primary Data Mining Protocol

### Step 1: Locate Current NI 43-101 Technical Reports

```python
# === NI 43-101 DATA EXTRACTION FRAMEWORK ===
# Target Sources: SEC filings, SEDAR, company technical reports

ni_43_101_search = {
    "primary_sources": ["sec.gov", "sedar.ca", "company_website/technical-reports"],
    "document_types": ["NI 43-101", "Preliminary Economic Assessment (PEA)", 
                      "Pre-Feasibility Study (PFS)", "Feasibility Study (FS)",
                      "Technical Report", "Resource Estimate Update"],
    "max_age_days": 1095  # 3 years maximum
}
```

### Step 2: Determine Primary Commodity and Equivalent Conversion

```python
def determine_primary_commodity(resource_breakdown):
    """
    Returns appropriate equivalent units based on dominant metal
    Priority: Au > Ag > Cu > U3O8 > PGM (Pt/Pd)
    """
    commodities = {
        "gold_dominant": "Au_eq_oz",
        "silver_dominant": "Ag_eq_oz", 
        "copper_dominant": "Cu_eq_lbs",
        "uranium_dominant": "U3O8_eq_lbs",
        "pgm_dominant": "PGM_eq_oz"  # Platinum/Palladium
    }
    
    # Determine dominance by value contribution
    total_value = calculate_total_insitu_value(resource_breakdown)
    primary_commodity = max(total_value, key=total_value.get)
    
    return commodities.get(f"{primary_commodity}_dominant", "Au_eq_oz")
```

## Required Data Return Format

```python
# === STRUCTURED DATA CAPTURE TEMPLATE ===

mining_intelligence_data = {
    # === REPORT METADATA ===
    "report_date": "{YYYY-MM-DD}",  # From NI 43-101 effective date
    "report_authors": ["qualified_person_1", "qualified_person_2"],
    "report_type": "NI_43_101_Technical_Report",
    "confidence_level": "{percentage}%",  # Based on source quality
    
    # === PROJECT IDENTIFICATION ===
    "project_name": "{official_project_name}",
    "project_location": {
        "country": "{country}",
        "state_province": "{state/province}",
        "mining_district": "{district_name}"
    },
    
    # === PROJECT DEVELOPMENT STATUS ===
    "project_stage": "{stage}",  # Options below
    "stage_options": [
        "exploration",           # Pre-resource estimate
        "pre_PEA",              # Resource estimate complete, no PEA
        "post_PEA",             # PEA completed
        "post_PFS",             # Pre-Feasibility Study completed
        "post_FS",              # Feasibility Study completed
        "in_construction",      # Construction phase
        "in_production",        # Operating mine
        "care_maintenance",     # Suspended operations
        "closed_reclaimed"      # Closed mine
    ],
    
    # === RESERVE CLASSIFICATION (CIM Standards) ===
    "reserves": {
        "proven_reserves": {
            "tonnage": "{metric_tonnes}",
            "grade": "{grade_by_metal}",
            "contained_metal": "{equivalent_units}",
            "conversion_factors": "{metal_ratios_used}",
            "source_section": "NI_43_101_Section_{number}"
        },
        "probable_reserves": {
            "tonnage": "{metric_tonnes}",
            "grade": "{grade_by_metal}", 
            "contained_metal": "{equivalent_units}",
            "conversion_factors": "{metal_ratios_used}",
            "source_section": "NI_43_101_Section_{number}"
        }
    },
    
    # === RESOURCE CLASSIFICATION (Distinct from Reserves) ===
    "resources": {
        "measured_resources": {
            "tonnage": "{metric_tonnes}",
            "grade": "{grade_by_metal}",
            "contained_metal": "{equivalent_units}",
            "source_section": "NI_43_101_Section_{number}"
        },
        "indicated_resources": {
            "tonnage": "{metric_tonnes}",
            "grade": "{grade_by_metal}",
            "contained_metal": "{equivalent_units}",
            "source_section": "NI_43_101_Section_{number}"
        },
        "inferred_resources": {
            "tonnage": "{metric_tonnes}",
            "grade": "{grade_by_metal}",
            "contained_metal": "{equivalent_units}",
            "source_section": "NI_43_101_Section_{number}"
        }
    },
    
    # === EQUIVALENT METAL CALCULATIONS ===
    "equivalent_conversions": {
        "primary_commodity": "{Au|Ag|Cu|U3O8|PGM}",
        "equivalent_unit": "{Au_eq_oz|Ag_eq_oz|Cu_eq_lbs|U3O8_eq_lbs|PGM_eq_oz}",
        "conversion_formula": "{detailed_calculation_method}",
        "metal_prices_used": {
            "gold_usd_oz": "{spot_price}",
            "silver_usd_oz": "{spot_price}",
            "copper_usd_lb": "{spot_price}",
            "uranium_usd_lb": "{spot_price}",
            "platinum_usd_oz": "{spot_price}",
            "palladium_usd_oz": "{spot_price}"
        },
        "recovery_rates": {
            "gold_recovery": "{percentage}%",
            "silver_recovery": "{percentage}%",
            "copper_recovery": "{percentage}%",
            "uranium_recovery": "{percentage}%",
            "pgm_recovery": "{percentage}%"
        }
    }
}
```

## Data Validation & Quality Checks

```python
# === MANDATORY DATA QUALITY VALIDATIONS ===

validation_checklist = {
    "report_currency": "✓/✗ - Report less than 3 years old",
    "qualified_person": "✓/✗ - Authored by P.Geo/P.Eng",
    "resource_categories": "✓/✗ - Clear M&I vs Reserve distinction",
    "equivalent_calculation": "✓/✗ - Transparent conversion methodology", 
    "grade_reconciliation": "✓/✗ - Grades consistent across report sections",
    "source_attribution": "✓/✗ - All data linked to specific NI 43-101 sections"
}
```

## Equivalent Unit Priority Matrix

```python
def select_equivalent_unit(metal_contributions):
    """
    Determines reporting unit based on value contribution
    """
    priority_matrix = {
        1: "Au_eq_oz",     # Gold >50% of total value
        2: "Ag_eq_oz",     # Silver >50% of total value  
        3: "Cu_eq_lbs",    # Copper >50% of total value
        4: "U3O8_eq_lbs",  # Uranium >50% of total value
        5: "PGM_eq_oz"     # Platinum/Palladium >50% of total value
    }
    
    # Calculate value contribution by metal
    total_value = sum(metal_contributions.values())
    dominant_metal = max(metal_contributions, key=metal_contributions.get)
    dominance_percentage = metal_contributions[dominant_metal] / total_value
    
    if dominance_percentage >= 0.5:
        return priority_matrix[get_metal_priority(dominant_metal)]
    else:
        # Multi-metal deposit - use highest value metal as equivalent
        return priority_matrix[1]  # Default to Au_eq for polymetallic
```

## Expected Output Format

```markdown
**NI 43-101 Intelligence Summary:**
- **Report Date**: {report_date} ({age_in_days} days old) ✓/✗
- **Project**: {project_name} ({project_stage})
- **Location**: {state}, {country}
- **Primary Commodity**: {dominant_metal} ({equivalent_unit})

**Reserve/Resource Breakdown:**
- **Proven Reserves**: {proven_reserves} {equivalent_unit}
- **Probable Reserves**: {probable_reserves} {equivalent_unit}  
- **Measured Resources**: {measured_resources} {equivalent_unit}
- **Indicated Resources**: {indicated_resources} {equivalent_unit}
- **Inferred Resources**: {inferred_resources} {equivalent_unit}

**Data Quality**: {validation_score}/6 validations passed
```

## Implementation Notes

### Reserve vs Resource Distinction
- **Reserves**: Economic portion of measured/indicated resources with feasibility study
- **Resources**: In-situ mineralization with reasonable prospects for extraction
- **Critical**: Measured & Indicated resources are NOT the same as Proven & Probable reserves

### Commodity-Specific Considerations
- **Gold Projects**: Report in Au_eq_oz with silver/copper credits
- **Silver Projects**: Report in Ag_eq_oz with gold/lead/zinc credits  
- **Copper Projects**: Report in Cu_eq_lbs with gold/silver/molybdenum credits
- **Uranium Projects**: Report in U3O8_eq_lbs 
- **PGM Projects**: Report in PGM_eq_oz (Pt+Pd combined)

### Quality Assurance
- Verify all data against original NI 43-101 section references
- Cross-check equivalent calculations with stated metal prices and recoveries
- Validate project stage against latest corporate presentations
- Confirm report currency (must be <3 years old for reliability)

---

**Framework Version**: 1.0  
**Last Updated**: September 18, 2025  
**Compatibility**: Don Durrett Mining Stock Analysis Agent v1.05