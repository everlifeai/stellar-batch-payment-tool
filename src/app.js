// TODO: use payment stream: https://github.com/dolcalmi/stellar-batch-payment/blob/master/lib/helpers/pay-stream.js#L39

import config from './config/config';
import utils from './utils/stellarTools';
import fileTools from './utils/fileTools';
import accountTools from './utils/accountTools';


/**
 * Starting point of batch funder application
 */
async function start() {

    fileTools.createFileIfNotExist();
    const csvData = await fileTools.loadCsv('input.csv');

    let existingAccounts = fileTools.filterEmptyObjects(await accountTools.checkAccountExists(csvData));    
    let filteredAccounts = fileTools.filterEmptyObjects(accountTools.filterAccountsByTrustline(existingAccounts));
    let filteredAccountsPubKeys = filteredAccounts.map(account => account.recipient);

    // filter accounts that have allow trust from issuance account
    const csvAllowTrustData = await fileTools.loadCsv('allowtrust.csv');

    csvAllowTrustData.map(row => {
        const {account, trust} = row;

        if(filteredAccountsPubKeys.includes(account)) {
            const index = filteredAccountsPubKeys.indexOf(account);
            filteredAccountsPubKeys.splice(index, 1);
        }
    });

    console.log(filteredAccountsPubKeys);

    try {
        if(filteredAccountsPubKeys.length > 0) {
            let promises = filteredAccountsPubKeys.map(pubKey => utils.allowTrust(pubKey, true));
            let resolved = await Promise.all(promises);
            console.log(resolved);
    
            // Write down all succeeded AllowTrust accounts
            fileTools.createFileAllowTrustIfNotExist();
            fileTools.writeLogsForAllowTrustTransactions(filteredAccountsPubKeys);
        }

    } catch(err) { /* Allow Trust already exists to account -> ignore error */  console.log(err); }
    

    const transactionsLog = await utils.sendTransactions(filteredAccounts);
    console.log(transactionsLog);
    fileTools.writeLogsForTransactions(transactionsLog, filteredAccountsPubKeys);
}


start();
