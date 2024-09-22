const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

module.exports = {
    ...jestConfig,
    moduleNameMapper: {
        "^lightning/uiRecordApi$":
          "<rootDir>/force-app/test/jest_mocks/lightning/uiRecordApi",
        '^lightning/navigation$':
          '<rootDir>/force-app/test/jest_mocks/lightning/navigation',
        '^lightning/platformShowToastEvent$':
          '<rootDir>/force-app/test/jest_mocks/lightning/platformShowToastEvent',
        '^lightning/refresh$':
          '<rootDir>/force-app/test/jest_mocks/lightning/refresh'
    }
};
