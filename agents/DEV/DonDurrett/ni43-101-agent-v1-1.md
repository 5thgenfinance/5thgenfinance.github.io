---
name: NI-43-101-Data-Extraction
version: 1.2
type: mining_data_framework
mode: data_extraction
authors:
  url: https://www.5thgenfinance.com
  methodology: "NI 43-101 Technical Report Standards"
template: "Execute enhanced multi-project extraction for {company name or ticker} using latest-report-by-project methodology with SEDAR cross-referencing"
tools: [ni_43_101_parser, commodity_classifier, equivalent_calculator, data_validator, ni_43_101_section_chunker, ni_43_101_table_extractor, smart_resource_reserve_classifier, content_density_chunker, project_identifier, date_collector, latest_selector, crossref_validator, sedar_website_matcher]
deterministic: true
audit_enabled: true
description: Comprehensive NI 43-101 technical report data extraction framework with commodity-specific equivalent unit conversion, proper reserve/resource distinction, and mandatory data quality validation for mining stock analysis. Now includes intelligent section-based chunking, table-focused extraction, adaptive chunk sizes, and tiered fallback strategies for very large documents.
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

processing_tiers:
  tier_1_priority_sections: ["EXECUTIVE SUMMARY", "MINERAL RESOURCE ESTIMATES", "MINERAL RESERVE ESTIMATES"]
  tier_2_supporting_sections: ["ECONOMIC ANALYSIS", "MINING METHODS", "DATA VERIFICATION"]
  tier_3_background_sections: ["HISTORY", "GEOLOGICAL SETTING", "ACCESSIBILITY"]
  fallback_strategy: "adaptive_chunking"
  extraction_workflow_enhancement:
    methodology_version: "latest_report_by_project_v1.2"
    recency_priority: true
    multi_project_support: true
    sedar_crossref_enabled: true

---

# NI 43-101 Enhanced Data Gathering Framework (v1.1)

## MANDATORY Implementation Notes

Report all resource classification in the same equivalent units.
Produce the expected output format every time.
Provide links to the sources and note the page number(s).

## Overview

This framework provides structured data extraction from NI 43-101 technical reports with proper reserve/resource classification and commodity-appropriate equivalent unit reporting for mining stock analysis. It now includes section-aware chunking, critical table extraction, adaptive chunk sizing based on content density, and a tiered processing pipeline designed for 500+ page reports.

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

## Intelligent Chunking & Smart Extraction

### Section-Based Intelligent Chunking

```python
import re
from typing import List, Dict

# Tool: ni_43_101_section_chunker

def chunk_ni_43_101_by_sections(pdf_path: str, max_chunk_size: int = 50) -> List[Dict]:
    """
    Intelligently chunks NI 43-101 reports by standard sections. Each chunk includes
    section name, content, page range, and type. Splits overlong sections into parts.
    """
    standard_sections = [
        "EXECUTIVE SUMMARY", "INTRODUCTION", "RELIANCE ON OTHER EXPERTS",
        "PROPERTY DESCRIPTION", "ACCESSIBILITY", "HISTORY",
        "GEOLOGICAL SETTING", "EXPLORATION", "DRILLING",
        "SAMPLE PREPARATION", "DATA VERIFICATION",
        "MINERAL PROCESSING", "MINERAL RESOURCE ESTIMATES",
        "MINERAL RESERVE ESTIMATES", "MINING METHODS",
        "RECOVERY METHODS", "PROJECT INFRASTRUCTURE",
        "MARKET STUDIES", "ENVIRONMENTAL STUDIES",
        "CAPITAL AND OPERATING COSTS", "ECONOMIC ANALYSIS"
    ]

    chunks = []
    current_section = None
    current_content = []
    page_count = 0

    # Placeholder: replace with real PDF page iterator and text extractor
    def extract_pages(path):
        raise NotImplementedError("Integrate with pdfplumber/PyPDF2 to iterate pages")

    def extract_text_from_page(page):
        raise NotImplementedError("Integrate with OCR/text extraction as needed")

    for page in extract_pages(pdf_path):
        page_text = extract_text_from_page(page)

        # Detect section headers
        hit_new_section = False
        for section in standard_sections:
            if re.search(rf"^\s*\d+\.?\s*{re.escape(section)}", page_text, re.IGNORECASE | re.MULTILINE):
                if current_section and current_content:
                    chunks.append({
                        "section": current_section,
                        "content": "\n".join(current_content),
                        "page_range": f"{start_page}-{page_count}",
                        "chunk_type": "section"
                    })
                current_section = section
                current_content = [page_text]
                start_page = page_count + 1
                hit_new_section = True
                break

        if not hit_new_section and current_section:
            current_content.append(page_text)

        page_count += 1

        # Split large sections
        if len(current_content) >= max_chunk_size:
            part_content = current_content[:max_chunk_size]
            chunks.append({
                "section": f"{current_section} (Part {len([c for c in chunks if c['section'].startswith(current_section)]) + 1})",
                "content": "\n".join(part_content),
                "page_range": f"{start_page}-{start_page + max_chunk_size - 1}",
                "chunk_type": "section_part"
            })
            current_content = current_content[max_chunk_size:]
            start_page += max_chunk_size

    # Flush last section
    if current_section and current_content:
        chunks.append({
            "section": current_section,
            "content": "\n".join(current_content),
            "page_range": f"{start_page}-{page_count}",
            "chunk_type": "section"
        })

    return chunks
```

### Table and Data-Focused Chunking

```python
# Tool: ni_43_101_table_extractor

def extract_priority_tables(section_chunks: List[Dict]) -> List[Dict]:
    """
    Identifies and extracts tables containing resource/reserve and other critical data.
    Integrate with pdfplumber/camelot/tabula for actual table extraction.
    """
    priority_tables = [
        "MINERAL RESOURCE ESTIMATE", "MINERAL RESERVE ESTIMATE",
        "RESOURCE CLASSIFICATION", "RESERVE CLASSIFICATION",
        "DRILLING RESULTS", "ASSAY RESULTS", "METALLURGICAL TEST RESULTS",
        "CAPITAL COST ESTIMATE", "OPERATING COST ESTIMATE",
        "ECONOMIC PARAMETERS", "CASH FLOW PROJECTION"
    ]

    def extract_tables_from_text(text: str):
        # Placeholder: detection via regex/heuristics; replace with actual table extraction
        return []

    def is_critical_mining_table(table) -> bool:
        # Placeholder: add logic to identify columns/headers like Tonnage, Grade, Contained Metal
        return True

    table_chunks = []

    for chunk in section_chunks:
        if any(k in chunk["section"].upper() for k in ["RESOURCE", "RESERVE", "DRILL", "ECONOMIC"]):
            tables = extract_tables_from_text(chunk["content"])  # Replace with real extractor
            for i, table in enumerate(tables):
                if is_critical_mining_table(table):
                    table_chunks.append({
                        "section": chunk["section"],
                        "table_index": i,
                        "table_data": table,
                        "page_range": chunk["page_range"],
                        "chunk_type": "critical_table",
                        "metadata": {
                            "contains_tonnage": True,
                            "contains_grade": True,
                            "contains_resources": True,
                            "table_category": "auto"
                        }
                    })

    return table_chunks
```

### Context-Aware Resource/Reserve Detection

```python
# Tool: smart_resource_reserve_classifier

def classify_resource_data(extracted_text: str, chunk_metadata: Dict) -> Dict:
    """
    Intelligently distinguishes between resources and reserves using context and terminology.
    """
    classification_keywords = {
        "measured_resources": ["measured resource", "measured mineral resource", "measured category"],
        "indicated_resources": ["indicated resource", "indicated mineral resource", "indicated category"],
        "inferred_resources": ["inferred resource", "inferred mineral resource", "inferred category"],
        "proven_reserves": ["proven reserve", "proven mineral reserve"],
        "probable_reserves": ["probable reserve", "probable mineral reserve", "proven and probable"]
    }

    def extract_nearby(patterns: List[str], text: str, extractor_fn):
        for kw in patterns:
            if kw in text.lower():
                return extractor_fn(text)
        return None

    def extract_tonnage(text: str):
        # Regex heuristic for numbers with Mt/tonnes
        m = re.search(r"([0-9][0-9,.]*)\s*(Mt|million tonnes|tonnes)", text, re.IGNORECASE)
        return m.group(0) if m else None

    def extract_grade(text: str):
        # Regex for grade with % or g/t
        m = re.search(r"([0-9]+\.?[0-9]*)\s*(%|g/t|ppm)", text, re.IGNORECASE)
        return m.group(0) if m else None

    def extract_contained(text: str):
        m = re.search(r"([0-9][0-9,.]*)\s*(oz|oz Au|Mlb|M lbs|lb|lbs)", text, re.IGNORECASE)
        return m.group(0) if m else None

    results = {}

    for category, patterns in classification_keywords.items():
        tonnage = extract_nearby(patterns, extracted_text, extract_tonnage)
        grade = extract_nearby(patterns, extracted_text, extract_grade)
        contained = extract_nearby(patterns, extracted_text, extract_contained)

        if tonnage or grade or contained:
            results[category] = {
                "tonnage": tonnage,
                "grade": grade,
                "contained_metal": contained,
                "source_section": chunk_metadata.get("section"),
                "page_reference": chunk_metadata.get("page_range"),
                "confidence_level": "auto"
            }

    return results
```

### Adaptive Chunking Based on Content Density

```python
# Tool: content_density_chunker

def adaptive_chunk_by_density(section_text: str, section_type: str) -> List[str]:
    """
    Adjusts chunk size based on information density.
    """
    high = ["table", "numerical", "resource", "reserve"]
    medium = ["methodology", "procedure", "technical"]

    if any(t in section_type.lower() for t in high):
        return create_chunks(section_text, max_pages=15)
    if any(t in section_type.lower() for t in medium):
        return create_chunks(section_text, max_pages=25)
    return create_chunks(section_text, max_pages=40)

# Placeholder utility

def create_chunks(text: str, max_pages: int) -> List[str]:
    # Replace with a function that segments by page count or token length
    return [text]
```

### Tiered Processing & Fallback

```python
# Enhanced Processing Workflow

workflow_enhancement = """
Tier 1: Always process Executive Summary, Section 14 (Mineral Resource Estimates), Section 15 (Mineral Reserve Estimates), and critical tables.
Tier 2: Process Economic Analysis (NPV/IRR), Mining Methods, and Data Verification if capacity allows.
Tier 3: Process contextual sections last.

Fallbacks:
- If document >500 pages: process Tier 1 first, then Tier 2.
- If extraction fails in a section: switch to table-only extraction for that section.
- If table extraction fails: flag for manual review, return partial data with clear gaps.
- Always log failed sections and page ranges for audit.
"""
```

## Required Data Return Format

```python
# === STRUCTURED DATA CAPTURE TEMPLATE ===

mining_intelligence_data = {
    "report_date": "{YYYY-MM-DD}",
    "report_authors": ["qualified_person_1", "qualified_person_2"],
    "report_type": "NI_43_101_Technical_Report",
    "confidence_level": "{percentage}%",
    "project_name": "{official_project_name}",
    "project_location": {"country": "{country}", "state_province": "{state/province}", "mining_district": "{district_name}"},
    "project_stage": "{stage}",
    "reserves": {"proven_reserves": {"tonnage": "{metric_tonnes}", "grade": "{grade_by_metal}", "contained_metal": "{equivalent_units}", "conversion_factors": "{metal_ratios_used}", "source_section": "NI_43_101_Section_{number}"},
                  "probable_reserves": {"tonnage": "{metric_tonnes}", "grade": "{grade_by_metal}", "contained_metal": "{equivalent_units}", "conversion_factors": "{metal_ratios_used}", "source_section": "NI_43_101_Section_{number}"}},
    "resources": {"measured_resources": {"tonnage": "{metric_tonnes}", "grade": "{grade_by_metal}", "contained_metal": "{equivalent_units}", "source_section": "NI_43_101_Section_{number}"},
                   "indicated_resources": {"tonnage": "{metric_tonnes}", "grade": "{grade_by_metal}", "contained_metal": "{equivalent_units}", "source_section": "NI_43_101_Section_{number}"},
                   "inferred_resources": {"tonnage": "{metric_tonnes}", "grade": "{grade_by_metal}", "contained_metal": "{equivalent_units}", "source_section": "NI_43_101_Section_{number}"}},
    "equivalent_conversions": {"primary_commodity": "{Au|Ag|Cu|U3O8|PGM}", "equivalent_unit": "{Au_eq_oz|Ag_eq_oz|Cu_eq_lbs|U3O8_eq_lbs|PGM_eq_oz}",
                                "conversion_formula": "{detailed_calculation_method}",
                                "metal_prices_used": {"gold_usd_oz": "{spot_price}", "silver_usd_oz": "{spot_price}", "copper_usd_lb": "{spot_price}", "uranium_usd_lb": "{spot_price}", "platinum_usd_oz": "{spot_price}", "palladium_usd_oz": "{spot_price}"},
                                "recovery_rates": {"gold_recovery": "{percentage}%", "silver_recovery": "{percentage}%", "copper_recovery": "{percentage}%", "uranium_recovery": "{percentage}%", "pgm_recovery": "{percentage}%"}}
}
```

## ENHANCED EXTRACTION METHODOLOGY: Latest Report by Project

Add this section to your `ni43-101-agent-v1-1.md` after the current methodology:

```yaml
# Enhanced Multi-Project Latest Report Sequencing Logic

advanced_extraction_workflow:
  description: "Sequential methodology to identify projects and extract latest reports per project with SEDAR cross-referencing"
  priority: "RECENCY over ACCESSIBILITY - always use most recent data found"
  
  step_1_project_discovery:
    process: "scan_all_search_results_for_project_identification"
    extraction_patterns:
      - project_names: ["mine", "project", "deposit", "property", "operation"]
      - location_identifiers: ["Morocco", "Canada", "Peru", "Chile", "Mexico", "Argentina", "Australia", "Nevada", "Ontario", "BC"]
      - stage_indicators: ["production", "development", "exploration", "feasibility", "construction", "care and maintenance"]
      - commodity_patterns: ["gold", "silver", "copper", "zinc", "lead", "iron", "lithium", "nickel", "uranium"]
    
    output_format:
      project_registry: |
        {
          "project_name": {
            "location": "jurisdiction/country", 
            "stage": "production|development|exploration",
            "primary_commodities": ["Au", "Ag", "Cu"],
            "secondary_commodities": ["Pb", "Zn"],
            "ownership": "100%|JV_percentage",
            "status": "active|inactive|divested"
          }
        }

  step_2_report_timeline_mapping:
    process: "collect_all_dates_by_project_and_report_type"
    search_strategy:
      - scan_press_releases: "search for 'NI 43-101', 'technical report', 'feasibility study', 'resource estimate'"
      - check_company_website: "investors/technical-reports section cross-reference"
      - sedar_filing_dates: "match press release dates to SEDAR filings"
      - pdf_accessibility: "test direct PDF access vs blocked status"
    
    timeline_structure: |
      {
        "project_name": {
          "technical_reports": [
            {"date": "YYYY-MM-DD", "source": "SEDAR|company_website|press_release", "accessibility": "accessible|blocked|requires_download", "url": "direct_link"},
            {"date": "YYYY-MM-DD", "source": "SEDAR|company_website|press_release", "accessibility": "accessible|blocked|requires_download", "url": "direct_link"}
          ],
          "resource_estimates": [...],
          "feasibility_studies": [...],
          "pfs_studies": [...]
        }
      }

  step_3_latest_selection_logic:
    selection_criteria:
      priority_order: "most_recent_date_first"
      accessibility_override: "NEVER choose older accessible over newer blocked"
      source_preference: "PDF > Press_Release > SEDAR_Filing > Web_Search"
      date_parsing: "handle multiple formats (YYYY-MM-DD, Month DD YYYY, DD/MM/YYYY)"
    
    selection_algorithm: |
      for each project:
        for each report_type:
          sort_dates_chronologically(reverse=True)  # newest first
          selected_report = dates_list[0]  # always take most recent
          if selected_report.accessibility == "blocked":
            attempt_company_website_crossreference()
            attempt_press_release_data_extraction()
          store_selection(project, report_type, selected_report)

  step_4_sedar_company_website_crossref:
    process: "match_sedar_filings_to_company_website_pdfs"
    methodology:
      sedar_identification: |
        1. Extract SEDAR filing date and report title from press releases
        2. Search company website for matching PDF filename/date
        3. Cross-reference: "filed on SEDAR and available on our website"
        4. Validate file metadata (creation date, file size, QP names)
      
      company_website_search: |
        search_patterns:
          - "/investors/technical-reports"
          - "/presentations-fact-sheets" 
          - "/reserves-resources"
          - "/wp-content/uploads/YYYY/"
        filename_patterns:
          - "{project_name}_NI43101_{YYYY}.pdf"
          - "{project_name}_{report_type}_{date}.pdf"
          - "NI-43-101-{project_name}-{YYYY}.pdf"
      
      validation_checks: |
        - file_date_consistency: PDF creation date matches SEDAR filing
        - qp_signature_match: Qualified Person names consistent
        - report_content_summary: Executive summary matches press release
        - effective_date_validation: Report effective date matches announcements

  step_5_data_extraction_with_fallbacks:
    extraction_sequence: |
      for each selected_latest_report:
        attempt_1: direct_pdf_extraction(company_website_url)
        if attempt_1.failed:
          attempt_2: sedar_manual_download_reference(filing_date, report_title)
        if attempt_2.failed:
          attempt_3: press_release_data_extraction(announcement_date)
        if attempt_3.failed:
          attempt_4: investor_presentation_summary(nearest_date)
        
        store_extraction_result(attempt_successful, data_extracted, source_method)
    
    data_completeness_targets:
      resource_estimates: "tonnage, grade, contained_metal, categories (M&I vs Inferred)"
      reserve_estimates: "tonnage, grade, contained_metal, categories (P&P)"
      economic_analysis: "NPV, IRR, payback, capex, opex, LOM, production_rate"
      technical_parameters: "processing_method, recovery_rates, infrastructure"
      qualified_persons: "QP_names, registration_numbers, independence_status"

  step_6_validation_and_quality_control:
    recency_validation: |
      for each project:
        confirm_latest_resource_date()
        confirm_latest_feasibility_date()  
        confirm_latest_technical_report_date()
        flag_if_data_older_than_24_months()
    
    cross_reference_validation: |
      - sedar_vs_website: compare file dates and QP signatures
      - press_release_vs_report: validate announced numbers match extracted data
      - historical_consistency: check for major changes vs previous estimates
      - peer_comparison: benchmark against similar stage projects
    
    quality_scoring: |
      recency_score: days_since_latest_report / 365
      completeness_score: fields_populated / total_required_fields  
      source_diversity_score: unique_sources_used / total_sources_attempted
      accessibility_score: direct_pdf_access_success_rate
      
      overall_quality: (recency_score * 0.4) + (completeness_score * 0.3) + 
                      (source_diversity_score * 0.2) + (accessibility_score * 0.1)

# IMPLEMENTATION TOOLS AND FUNCTIONS

extraction_tools:
  project_identifier: |
    - extract_project_names(search_results)
    - classify_project_stage(content_text) 
    - identify_commodities(content_text)
    - determine_ownership(content_text)
  
  date_collector: |
    - parse_all_date_formats(text_content)
    - extract_report_dates_by_project(project_name, search_results)
    - categorize_report_type(report_title, content)
    - assess_accessibility_status(pdf_url)
  
  latest_selector: |
    - sort_dates_chronologically(date_list)
    - select_most_recent_per_category(report_timeline)
    - override_accessibility_for_recency(selection_criteria)
  
  crossref_validator: |
    - match_sedar_to_website(sedar_date, company_domain)
    - validate_file_metadata(pdf_url)
    - confirm_qp_signatures(report_content)
    - check_content_consistency(multiple_sources)
  
  data_extractor: |
    - extract_with_fallbacks(pdf_url, press_release, sedar_ref)
    - parse_resource_tables(report_content)
    - extract_economic_parameters(feasibility_content)
    - identify_qualified_persons(report_signatures)

# ERROR HANDLING AND EDGE CASES

error_handling:
  project_identification_failures:
    - single_project_companies: "treat entire company as one project"
    - joint_ventures: "identify ownership percentage and operator"
    - divested_assets: "mark as inactive, use latest data available"
    - merged_projects: "identify consolidation date and combined reporting"
  
  date_extraction_failures:
    - ambiguous_dates: "cross-reference multiple sources for confirmation"
    - missing_dates: "use press release date as proxy"
    - conflicting_dates: "prioritize SEDAR filing date over press release date"
    - amended_reports: "use amendment date, note original vs amended"
  
  accessibility_failures:
    - blocked_pdfs: "attempt company website crossreference before fallback"
    - sedar_navigation_issues: "provide manual download instructions"
    - missing_reports: "flag data gaps and note limitations"
    - outdated_links: "search for relocated files on company website"

# EXAMPLE EXECUTION TRACE

example_aya_execution_trace: |
  STEP 1 - Project Discovery:
  ✓ Identified: Zgounder (Production, Morocco, Primary: Ag)
  ✓ Identified: Boumadine (Development, Morocco, Primary: Au-Ag, Secondary: Pb-Zn-Cu)
  
  STEP 2 - Timeline Mapping:
  Zgounder:
    - resource_estimates: [("2021-05-XX", "company_website", "blocked"), ("2021-12-13", "press_release", "accessible")]
    - feasibility_studies: [("2023-12-31", "press_release", "accessible")]  
    - technical_reports: [("2022-06-16", "SEDAR", "requires_download")]
  Boumadine:
    - technical_reports: [("2024-05-30", "SEDAR", "requires_download"), ("2025-03-30", "SEDAR", "requires_download")]
    - resource_estimates: [("2025-02-24", "press_release", "accessible")]
  
  STEP 3 - Latest Selection:
  ✓ Zgounder Resource: 2021-12-13 (selected over 2021-05-XX due to recency priority)
  ✓ Zgounder Feasibility: 2023-12-31 (most recent)
  ✓ Boumadine Technical: 2025-03-30 (most recent) 
  ✓ Boumadine Resource: 2025-02-24 (most recent)
  
  STEP 4 - SEDAR Crossreference:
  ✓ Found Zgounder 2022 report on company website: /wp-content/uploads/2022/01/Aya-Zgounder-Silver-Project_2022-Updated-MRE-Tech-Report_FINAL.pdf
  ⚠ Boumadine 2025 report: SEDAR filing referenced, company website search required
  
  STEP 5 - Data Extraction:
  ✓ Zgounder Dec-2021 Resource: 96.1M oz M&I Ag (from press release)
  ✓ Zgounder 2023 Feasibility: NPV $373M, IRR 48% (from press release)
  ⚠ Boumadine 2025: Requires manual SEDAR download or company website search
  
  STEP 6 - Validation:
  ✓ Recency Score: High (using most recent dates found)
  ✓ Completeness: 85% (missing some Boumadine details)
  ✓ Source Diversity: Good (press releases + website cross-ref)
  ⚠ Accessibility: Medium (some reports require manual download)
  
  OVERALL QUALITY SCORE: 82/100 (HIGH CONFIDENCE)
```

## Usage Instructions

1. **Add this entire section to your `ni43-101-agent-v1-1.md` file after the existing methodology**

2. **Update the existing `template` field to reference the new workflow:**
```yaml
template: "Execute enhanced multi-project extraction for {company name or ticker} using latest-report-by-project methodology with SEDAR cross-referencing"
```

3. **Add to the `tools` array:**
```yaml
tools: [ni_43_101_parser, commodity_classifier, equivalent_calculator, data_validator, ni_43_101_section_chunker, ni_43_101_table_extractor, smart_resource_reserve_classifier, content_density_chunker, project_identifier, date_collector, latest_selector, crossref_validator, sedar_website_matcher]
```

This methodology ensures your agent will:
- **Always identify multiple projects** before extracting data
- **Prioritize recency over accessibility** (fixing the May vs December 2021 issue)
- **Cross-reference SEDAR filings with company websites** for easier PDF access
- **Use systematic fallback strategies** when direct access fails
- **Validate data quality and completeness** per project

The logic sequence prevents the extraction errors we identified in the AYA example and ensures comprehensive coverage of all company projects with their most recent technical data.

## Data Validation & Quality Checks

```python
validation_checklist = {
    "report_currency": "✓/✗ - Report less than 3 years old",
    "qualified_person": "✓/✗ - Authored by P.Geo/P.Eng",
    "resource_categories": "✓/✗ - Clear M&I vs Reserve distinction",
    "equivalent_calculation": "✓/✗ - Transparent conversion methodology",
    "grade_reconciliation": "✓/✗ - Grades consistent across report sections",
    "source_attribution": "✓/✗ - All data linked to specific NI 43-101 sections",
    "section_coverage": "✓/✗ - Critical sections processed (14/15/22)",
    "table_extraction_success": "✓/✗ - Key tables extracted",
    "data_continuity": "✓/✗ - No loss at chunk boundaries",
    "cross_reference_integrity": "✓/✗ - References maintained across chunks",
    "fallback_triggers": "✓/✗ - Fallbacks used appropriately"
}
```

---

Framework Version: 1.1
Last Updated: October 2, 2025
Compatibility: Don Durrett Mining Stock Analysis Agent v1.05
