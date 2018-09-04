import config from './config/config';
import utils from './utils/stellarTools';
import fileTools from './utils/fileTools';
import accountTools from './utils/accountTools';
import stellarHelper from './helpers/stellar.helper';
import toolHelper from './helpers/tool.helper';


/**
 * Starting point of batch funder application
 */
async function start() {

    fileTools.createFileIfNotExist('account,success,message', 'output.csv');
    fileTools.createFileIfNotExist('account', 'allowtrust.csv');

    const csvData = await fileTools.loadCsv('input.csv');

    // Check if account:
    // 1. eexists
    // 2. has a trustline to EVER asset
    // 3. has allowed trust from issuance account
    let existingAccounts = fileTools.filterEmptyObjects(await accountTools.checkAccountExists(csvData));    
    let filteredAccounts = fileTools.filterEmptyObjects(accountTools.filterAccountsByTrustline(existingAccounts));
    let filteredAccountsPubKeys = filteredAccounts.map(accountObj => (accountObj.recipient));
    let originalPubKeys = [...filteredAccountsPubKeys];
    let filteredAccsPubKeysNotTrusted = await fileTools.filterAlreadyTrustedAccounts(filteredAccountsPubKeys);

    // Send allow trust to accounts which are not trusted yet and send EVER tokens
    const allowTrustSuccess = await stellarHelper.sendAllowTrust(filteredAccsPubKeysNotTrusted);

    if(allowTrustSuccess) {
        const transactionsLog = await utils.sendTransactions(filteredAccounts);
        fileTools.writeLogsForTransactions(transactionsLog, originalPubKeys);
    }

    toolHelper.checkProgramExecution(filteredAccountsPubKeys);
}

start();
