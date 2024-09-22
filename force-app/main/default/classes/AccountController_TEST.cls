@IsTest
public class AccountController_TEST {

    @TestSetup
    static void setup() {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < 10; i++) {
            Account acc = new Account(
                    Name = 'Test Account ' + i,
                    Industry = 'Financial Services',
                    Phone = '1234567890',
                    Website = 'www.test' + i + '.com',
                    AnnualRevenue = 1000000 * i
            );
            accounts.add(acc);
        }
        insert accounts;
    }

    @IsTest
    static void testCanEditObject() {
        String objectApiName = 'Account';
        Boolean isEditable = AccountController.canEditObject(objectApiName);
        Assert.areEqual(true, isEditable, 'Account object should be editable');
    }

    @IsTest
    static void testGetFinancialAccounts() {
        List<Account> result = AccountController.getFinancialAccounts('', 'Name', 'ASC');

        Test.startTest();
        result = AccountController.getFinancialAccounts('Test Account 1', 'Name', 'ASC');
        Test.stopTest();

        Assert.areEqual(1, result.size(), 'Expected 1 account to be returned');
        Assert.areEqual('Test Account 1', result[0].Name, 'Expected filtered account');
    }

    @IsTest
    static void testUpdateAccounts() {
        List<Account> accounts = [SELECT Id, Name, Phone FROM Account WHERE Industry = 'Financial Services' LIMIT 1];

        Account accToUpdate = accounts[0];
        accToUpdate.Phone = '0987654321';  // Update phone number

        Test.startTest();
        AccountController.updateAccounts(new List<Account>{accToUpdate});
        Test.stopTest();

        Account updatedAccount = [SELECT Phone FROM Account WHERE Id = :accToUpdate.Id];
        Assert.areEqual('0987654321', updatedAccount.Phone, 'Expected updated phone number');
    }

    @IsTest
    static void testUpdateAccounts_Exception() {
        Account invalidAcc = new Account(Name = null);

        Test.startTest();
        try {
            AccountController.updateAccounts(new List<Account>{
                    invalidAcc
            });
            Assert.isTrue(false, 'Expected AuraHandledException was not thrown');
        } catch (DmlException e) {
            Assert.isTrue(e.getMessage().contains('Update failed'), 'Expected error message was not found');
        }
        Test.stopTest();
    }
}