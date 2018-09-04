import fileTools from '../utils/fileTools';
import utils from '../utils/stellarTools';

/**
 * Helper for sending allow trust transactions for not trusted accounts
 * @param {[ string ]} filteredAccsPubKeysNotTrusted 
 */
const sendAllowTrust = async (filteredAccsPubKeysNotTrusted) => {
  try {
    if(filteredAccsPubKeysNotTrusted.length > 0) {
        let promises = filteredAccsPubKeysNotTrusted.map(pubKey => utils.allowTrust(pubKey, true));
        let resolved = await Promise.all(promises);
  
        // Save all succeeded AllowTrust for accounts
        fileTools.writeLogsForAllowTrustTransactions(filteredAccsPubKeysNotTrusted);
    }
  
    return true;
  } catch(err) { 
    throw err;
    return false;
  }
}

export default {
  sendAllowTrust
}

