import { createElement } from "lwc";
import AccountsList from "c/accountsList";
import getFinancialAccounts from "@salesforce/apex/AccountController.getFinancialAccounts";
import updateAccounts from "@salesforce/apex/AccountController.updateAccounts";
import canEditObject from "@salesforce/apex/AccountController.canEditObject";
import { ShowToastEventName } from 'lightning/platformShowToastEvent';
import { refreshApex } from "@salesforce/apex";
import { createApexTestWireAdapter } from '@salesforce/wire-service-jest-util';

const mockGetFinancialAccounts = require('./data/financialAccounts.json');

jest.mock('@salesforce/apex/AccountController.getFinancialAccounts', () => {
    const {createApexTestWireAdapter} = require('@salesforce/sfdx-lwc-jest');
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

jest.mock('@salesforce/apex/AccountController.updateAccounts', () => {
    return {
      default: jest.fn(() => Promise.resolve())
    };
  },
  { virtual: true }
);

jest.mock('@salesforce/apex/AccountController.canEditObject',  () => {
    const {createApexTestWireAdapter} = require('@salesforce/sfdx-lwc-jest');
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

jest.mock("@salesforce/apex", () => {
    return { refreshApex: jest.fn(() => Promise.resolve()) };
  },
  { virtual: true }
);

describe("c-accounts-list", () => {
  let element;

  beforeEach(() => {
    element = createElement('c-accounts-list', {
      is: AccountsList
    });

    document.body.appendChild(element);
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("renders data table with financial accounts", async () => {
    getFinancialAccounts.emit(mockGetFinancialAccounts);

    await Promise.resolve();

    const dataTable = element.shadowRoot.querySelector("lightning-datatable");
    const columns = dataTable.columns;
    expect(columns).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'Account Name' }),
      expect.objectContaining({ label: 'Account Owner' }),
      expect.objectContaining({ label: 'Phone' }),
      expect.objectContaining({ label: 'Website' }),
      expect.objectContaining({ label: 'Annual Revenue' })
    ]));
    expect(dataTable).not.toBeNull();
    expect(dataTable.data.length).toBe(mockGetFinancialAccounts.length);
    expect(["Acme Corp","Global Media"]).toContain(dataTable.data[0].Name);
  });

  it("saves account updates and shows success toast", async () => {
    updateAccounts.mockResolvedValue(true);

    const showToastHandler = jest.fn();
    element.addEventListener(ShowToastEventName, showToastHandler);

    await Promise.resolve();

    const dataTable = element.shadowRoot.querySelector("lightning-datatable");
    const saveEvent = new CustomEvent("save", {
      detail: {
        draftValues: [{ Id: "001xx000003NG36BBG", Phone: "9876543211" }]
      }
    });
    dataTable.dispatchEvent(saveEvent);

    await Promise.resolve();

    expect(updateAccounts).toHaveBeenCalledWith({
      updatedAccountList: [{ Id: "001xx000003NG36BBG", Phone: "9876543211" }]
    });

    expect(showToastHandler).toHaveBeenCalled();
    expect(showToastHandler.mock.calls[0][0].detail.message).toBe('Account(s) updated successfully');
    expect(showToastHandler.mock.calls[0][0].detail.title).toBe('Success');

    expect(refreshApex).toHaveBeenCalled();
    expect(refreshApex).toHaveBeenCalledTimes(1);
  });

  it("shows error toast when account update fails", async () => {
    updateAccounts.mockRejectedValue({ body: { message: "Error updating record" } });

    const showToastHandler = jest.fn();
    element.addEventListener(ShowToastEventName, showToastHandler);

    const dataTable = element.shadowRoot.querySelector("lightning-datatable");
    const saveEvent = new CustomEvent("save", {
      detail: {
        draftValues: [{ Id: "001xx000003NG36BBG", Phone: "9876543211" }]
      }
    });
    dataTable.dispatchEvent(saveEvent);

    await Promise.resolve();

    expect(updateAccounts).toHaveBeenCalledWith({
      updatedAccountList: [{ Id: "001xx000003NG36BBG", Phone: "9876543211" }]
    });

    await Promise.resolve();

    expect(showToastHandler).toHaveBeenCalled();
    expect(showToastHandler.mock.calls[0][0].detail.message).toBe('Error updating record');
    expect(showToastHandler.mock.calls[0][0].detail.title).toBe('Error updating or reloading records');
  });
});

it('filters accounts by name when input changes', async () => {
  const USER_INPUT = 'Acme';
  const WIRE_PARAMETER = { filterName: USER_INPUT, sortedBy: "", sortedDirection: "" };

  const element = createElement('c-accounts-list', {
    is: AccountsList
  });
  document.body.appendChild(element);

  const inputMessageEl = element.shadowRoot.querySelector('lightning-input[data-id="filterInput"]');
  inputMessageEl.value = USER_INPUT;
  inputMessageEl.dispatchEvent(new CustomEvent("change"));

  await Promise.resolve();

  expect(getFinancialAccounts.getLastConfig()).toEqual(
    WIRE_PARAMETER
  );
});

it('handles sorting by account name', async () => {
  const SORT_FIELD = 'Owner.Name';
  const SORT_DIRECTION = 'Asc';
  const WIRE_PARAMETER = { filterName: "", sortedBy: SORT_FIELD, sortedDirection: SORT_DIRECTION };
  const element = createElement('c-accounts-list', {
    is: AccountsList
  });

  document.body.appendChild(element);

  const dataTable = element.shadowRoot.querySelector('lightning-datatable');
  const sortEvent = new CustomEvent("sort", {
    detail: {
      fieldName: SORT_FIELD,
      sortDirection: SORT_DIRECTION
    }
  });
  dataTable.dispatchEvent(sortEvent);

  await Promise.resolve();

  expect(getFinancialAccounts.getLastConfig()).toEqual(
    WIRE_PARAMETER
  );
});