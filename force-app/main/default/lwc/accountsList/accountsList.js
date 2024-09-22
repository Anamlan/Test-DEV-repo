import { LightningElement, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { NavigationMixin } from "lightning/navigation";

import canEditObject from "@salesforce/apex/AccountController.canEditObject";
import getFinancialAccounts from "@salesforce/apex/AccountController.getFinancialAccounts";
import updateAccounts from "@salesforce/apex/AccountController.updateAccounts";

export default class AccountsList extends NavigationMixin(LightningElement) {

  @track filterName = "";
  @track sortedBy = "";
  @track sortedDirection = "";
  accounts;
  error;
  draftValues = [];
  wiredActivities;

  columns = [
    {
      label: "Account Name",
      fieldName: "Account.Name",
      type: 'button',
      typeAttributes: {
        label: { fieldName: "Name" },
        name: 'openAccount',
        variant: 'base'
      },
      sortable: true,
      editable: this.canEditAccount
    },
    {
      label: "Account Owner",
      fieldName: "Owner.Name",
      type: "text",
      sortable: true,
      editable: this.canEditAccount
    },
    {
      label: "Phone",
      fieldName: "Phone",
      type: "phone",
      editable: this.canEditAccount
    },
    {
      label: "Website",
      fieldName: "Website",
      type: "url",
      editable: this.canEditAccount
    },
    {
      label: "Annual Revenue",
      fieldName: "AnnualRevenue",
      type: "currency",
      editable: this.canEditAccount
    }
  ];

  @wire(canEditObject)
  canEditAccount;

  @wire(getFinancialAccounts, {
    filterName: "$filterName",
    sortedBy: "$sortedBy",
    sortedDirection: "$sortedDirection"
  })
  wiredAccounts(value) {
    this.wiredActivities = value;

    const { error, data } = value;
    if (data) {
      this.accounts = data.map(account => {
        return {
          ...account,
          "Owner.Name": account.Owner.Name//,
        };
      });
    } else if (error) {
      this.error = error;
    }
  }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;
    const accountId = row.Id;
    if (actionName === 'openAccount') {
      this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
          recordId: accountId,
          actionName: 'view'
        }
      });
    }
  }

  handleFilterChange(event) {
    this.filterName = event.target.value;
  }

  handleSort(event) {
    this.sortedBy = event.detail.fieldName;
    this.sortedDirection = event.detail.sortDirection;
  }

  handleSave(event) {
    const updatedFields = event.detail.draftValues;

    updateAccounts({ updatedAccountList: updatedFields })
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Account(s) updated successfully",
            variant: "success"
          })
        );
        refreshApex(this.wiredActivities);
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error updating or reloading records",
            message: error.body.message,
            variant: "error"
          })
        );
      })
      .finally(() => {
        this.draftValues = [];
      });
  }
}