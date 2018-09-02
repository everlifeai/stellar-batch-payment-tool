import fileTools from './fileTools';
import utils from './stellarTools';
import config from '../config/config';

/**
 * Function determines if the account can accept EVER tokens
 * Requirement 1: Account has to exist
 * Requirement 2: Account has a trustline to EVER asset
 * @param {[ { recipient:string, amount:string } ]} csvData 
 * @return filtered array with recipients that are eligible receive EVER tokens
 */
const checkAccountExists = (csvData) => {
  
  let existingAccounts = csvData.map((row) => {
    return utils.validateRecipientExistsForRow(row);
  });

  return Promise.all(existingAccounts);
}

/**
 * Filter accounts if they have trustline to custom asset
 * @param {[ { recipient:string, amount:string, account: Stellar.Account } ]} existingAccounts 
 */
const filterAccountsByTrustline = (existingAccounts) => {
  
  let filteredAccounts = existingAccounts.map((row) => {
      const {recipient, amount, account} = row;

      if(!account.balances.some((balance) => balance.asset_code === config.asset.code)) {
        fileTools.appendLog(recipient, false, `No trustline to ${config.asset.code}`);
        return {};
      }

      return row;
  });

  return filteredAccounts;
}

export default {
  checkAccountExists,
  filterAccountsByTrustline
}