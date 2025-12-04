# CRVM Reserve Calculator

Commissioners Reserve Valuation Method calculator using 2017 CSO Mortality Tables.

## Features

- ✅ Actual 2017 CSO mortality tables (4 gender/smoker combinations)
- ✅ Complete CRVM reserve calculations per VM-20
- ✅ Deficiency reserve checks (NAIC Model 830)
- ✅ Year-by-year reserve projections
- ✅ Detailed calculation audit trail
- ✅ Responsive design with dark mode support

## Live Demo

Visit the calculator at: https://&lt;your-username&gt;.github.io/crvm-calculator/

## Technical Details

- **Framework**: Vanilla JavaScript (no dependencies)
- **Mortality Data**: 2017 CSO Unisex tables from SOA
- **Compliance**: VM-20, NAIC Model 830, ASOP 56
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

## Installation

1. Clone this repository
2. Place 2017 CSO mortality JSON files in the `mortality/` folder
3. Open `index.html` in a web browser or deploy to GitHub Pages

## Mortality Data Files Required

Place these 4 files in the `mortality/` directory:
- `2017_CSO_Unisex_Male_NonSmoker.json`
- `2017_CSO_Unisex_Male_Smoker.json`
- `2017_CSO_Unisex_Female_NonSmoker.json`
- `2017_CSO_Unisex_Female_Smoker.json`

Download from Society of Actuaries (SOA) tables t3291-t3294.

## Usage

1. Enter policy information (age, gender, smoker status, term, face amount)
2. Select issue date and valuation date
3. Set interest rate (default: 3.5% per VM-20)
4. Click "Calculate Reserve"
5. View results with detailed audit trail
6. Review year-by-year reserve projection

## Data Sources

Mortality tables sourced from Society of Actuaries (SOA):
- 2017 CSO tables (t3291-t3294)
- Select & Ultimate rates (Duration 1-5 Select, 6+ Ultimate)

## Regulatory Compliance

This calculator implements:
- **VM-20**: Valuation Manual Section 20 reserve methodology
- **NAIC Model 830**: Deficiency reserve requirements
- **ASOP 56**: Modeling audit trail and documentation

## Architecture

### Single-File Application
- No external dependencies or frameworks
- Embedded CSS for styling
- Embedded JavaScript for calculations
- Loads mortality data from local JSON files

### Calculation Engine
- Duration calculation with proper anniversary logic
- Attained age computation (Issue Age + Duration)
- Select (1-5) vs Ultimate (6+) mortality table selection
- Present Value of Benefits calculation
- Present Value of Annuity Due calculation
- CRVM reserve formula with deficiency check

### Audit Trail
The calculator provides 7-step audit trail:
1. Duration Calculation
2. Attained Age Calculation
3. Mortality Rate Selection
4. Present Value of Benefits
5. Present Value of Annuity Due
6. CRVM Reserve Calculation
7. Deficiency Reserve Check

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Initial load: < 2 seconds (includes mortality data loading)
- Single calculation: < 300ms
- Year-by-year (40 years): < 400ms

## Limitations

- Educational/demonstration tool
- Not certified for production statutory reporting
- Consult qualified actuaries for actual reserve calculations
- Sample data used if mortality files not found

## Testing

Comprehensive test suite documented in:
- `CRVM-Test-Case-Matrix.md` (52 test cases)
- `CRVM-Comprehensive-Test-Plan.md`
- `CRVM-Test-Data-Specifications.md`

Test coverage:
- 24 Unit tests
- 5 Integration tests
- 7 End-to-end tests
- 4 Performance tests
- 4 Data validation tests
- 8 Edge case tests

## Version History

### v1.0 - December 4, 2025
- Initial production release
- Actual 2017 CSO mortality data integration
- Complete CRVM calculation engine
- Deficiency reserve implementation
- Year-by-year projections
- Comprehensive audit trail
- Responsive UI with dark mode

## License

This is an educational/demonstration tool. Not for production use without proper actuarial review and validation.

## Contributing

Issues and pull requests welcome. Please include test cases for any changes.

## Authors

- **QA-Shirley (QTCS)** - Quality Assurance & Testing
- **DevPro Enterprise IT Team** - Development & Implementation
- **Business Analyst** - Requirements & Specifications

## Acknowledgments

- Society of Actuaries for 2017 CSO mortality tables
- NAIC for regulatory guidance (VM-20, Model 830)
- American Academy of Actuaries for ASOP 56

## Support

For questions or issues:
1. Check DEPLOYMENT.md for troubleshooting
2. Review browser console for errors
3. Verify mortality data files are present
4. Create an issue in the repository

## Disclaimer

This calculator is provided for educational and demonstration purposes. It should not be used for actual statutory reserve reporting without validation by qualified actuaries and regulatory approval.