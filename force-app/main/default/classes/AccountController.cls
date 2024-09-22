public with sharing class AccountController {
    @AuraEnabled
    public static Boolean canEditObject(String objectApiName) {
        return Schema.getGlobalDescribe().get(objectApiName).getDescribe().isUpdateable();
    }

    @AuraEnabled(cacheable=true)
    public static List<Account> getFinancialAccounts(String filterName, String sortedBy, String sortedDirection) {
        String query = 'SELECT Id, Name, Phone, Website, AnnualRevenue, Owner.Name FROM Account WHERE Industry = \'Financial Services\'';
        if (String.isNotBlank(filterName)) {
            query += ' AND Name LIKE \'%' + filterName + '%\'';
        }

        if (String.isNotBlank(sortedBy) && String.isNotBlank(sortedDirection)) {
            query += ' ORDER BY '+ sortedBy +' '+ sortedDirection;
        } else {
            query += ' ORDER BY Name ASC';
        }

        return Database.query(query);
    }

    @AuraEnabled
    public static void updateAccounts(List<Account> updatedAccountList) {
        try {
            update updatedAccountList;
        } catch (DmlException e) {
            throw new DmlException('Update failed: ' + e.getMessage());
        } catch (Exception e) {
            throw new AuraHandledException('Error updating accounts: ' + e.getMessage());
        }
    }
}