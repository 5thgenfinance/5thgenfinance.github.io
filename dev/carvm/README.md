# Annuity Valuation Calculator - STAT CARVM Engine

A web-based annuity valuation calculator that implements the Commissioners Annuity Reserve Valuation Method (CARVM) for statutory reserve calculations. Built as a client-side JAM stack application with JavaScript calculations.

## Features

- **Complete STAT CARVM Implementation**: Calculates statutory reserves using the Greatest Present Value method
- **Multiple Product Types**: Supports Fixed Deferred, Fixed Immediate, Variable Deferred, and Indexed Deferred annuities
- **Scenario Analysis**: Tests multiple interest rate and lapse scenarios to determine the highest reserve requirement
- **Audit Trail**: Provides complete step-by-step calculation documentation for regulatory compliance
- **Regulatory Compliance**: Built to NAIC Standard Valuation Law requirements
- **Export Functionality**: Download results as CSV or print detailed reports
- **Client-Side Only**: No backend required - all calculations performed in the browser

## File Structure

```
├── index.html              # Main HTML structure
├── styles.css              # CSS styling and responsive design
├── mortality-tables.js     # Standard mortality tables and interest rates
├── calculation-engine.js   # Core CARVM calculation engine
├── app.js                  # Main application logic and UI handling
└── README.md               # This documentation file
```

## Getting Started

1. **Download all files** to a local directory
2. **Open index.html** in a modern web browser
3. **Enter policy information** in the form:
   - Product Type (Fixed/Variable/Indexed, Deferred/Immediate)
   - Premium Amount ($1,000 minimum)
   - Issue Age (18-85)
   - Gender (Male/Female/Unisex)
   - Issue Date and Valuation Date
   - Guaranteed Interest Rate
   - Surrender Charge Period
4. **Click "Calculate STAT CARVM Reserve"** to run the valuation
5. **Review results** including scenario analysis and audit trail
6. **Export or print** results as needed

## Technical Implementation

### Calculation Methodology

The engine implements the CARVM methodology by:

1. **Scenario Generation**: Creates multiple test scenarios with different interest rates and lapse assumptions
2. **Cash Flow Projection**: Calculates benefit payments considering mortality, lapse, and surrender charges
3. **Present Value Calculation**: Discounts cash flows using appropriate interest rates
4. **Greatest Present Value Selection**: Selects the highest present value as the CARVM reserve
5. **Regulatory Compliance Check**: Validates results against minimum and maximum thresholds

### Data Sources

- **Mortality Tables**: Simplified version of 2012 Individual Annuity Mortality Table
- **Interest Rates**: Standard regulatory rates including statutory minimum (1.5%) and valuation rate (3.5%)
- **Lapse Rates**: Product-specific lapse assumptions by policy duration
- **Surrender Charges**: Standard surrender charge schedules

### Browser Compatibility

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Regulatory Notes

This calculator is designed for educational and demonstration purposes. While it follows CARVM methodology principles, actual statutory valuations should:

- Use current NAIC-approved mortality tables
- Apply company-specific and jurisdiction-specific assumptions
- Include all applicable regulatory adjustments
- Be reviewed by qualified actuaries
- Comply with all applicable state insurance regulations

## Customization

### Adding New Product Types

1. Update the product type dropdown in `index.html`
2. Add corresponding lapse rates in `mortality-tables.js`
3. Modify calculation logic in `calculation-engine.js` if needed

### Updating Mortality Tables

Replace the mortality rate data in `mortality-tables.js` with current regulatory tables.

### Modifying Interest Rate Scenarios

Update the `INTEREST_RATES` object in `mortality-tables.js` to reflect current regulatory requirements.

## Development Notes

### Code Structure

- **AnnuityValuationEngine**: Core calculation class implementing CARVM methodology
- **AnnuityCalculatorApp**: UI controller handling form interactions and result display
- **Mortality Tables**: Static data for actuarial calculations
- **Utility Functions**: Currency formatting, percentage formatting, and data export

### Error Handling

The application includes comprehensive error handling for:
- Input validation
- Calculation errors
- Data export failures
- Browser compatibility issues

### Performance

All calculations are performed client-side for:
- Data privacy and security
- Offline capability
- Instant results without server dependencies
- Cost-effective deployment

## License

This project is provided as-is for educational purposes. Use in production environments requires proper actuarial review and regulatory compliance verification.

## Support

For technical issues or enhancement requests, please review the code comments and implementation details in each JavaScript file.
