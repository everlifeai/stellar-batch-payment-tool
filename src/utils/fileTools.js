import fs from 'fs';
import path from 'path';
import os from 'os';
import csv from 'csvtojson/v2';
import Stellar from 'stellar-sdk';

const outputFilePath = path.join(__dirname, '..', 'assets', 'output.csv');
const allowTrustFilePath = path.join(__dirname, '..', 'assets', 'allowtrust.csv');

/**
 * Create output csv file if not exist
 */
const createFileIfNotExist = async () => { 
    if (!fs.existsSync(outputFilePath)) {
      await fs.writeFile(outputFilePath, `account,success,message${os.EOL}`, (err) => {
          if (err) throw err;
      });
    }
}

/**
 * Create output csv file for allow trust if not exist
 */
const createFileAllowTrustIfNotExist = async () => { 
    if (!fs.existsSync(allowTrustFilePath)) {
      await fs.writeFile(allowTrustFilePath, `account,allowtrust${os.EOL}`, (err) => {
          if (err) throw err;
      });
    }
}

/**
 * Filter empty objects from array with only objects
 * @param {[ { any } ]} objectArray Any array which contains objects
 * @return Array with no empty objects 
 */
const filterEmptyObjects = (objectArray) => objectArray.filter(value => Object.keys(value).length !== 0);

/**
 * Add transaction log to file for account
 * @param {string} account Receiver account for which transaction has been executed
 * @param {boolean} success Transaction success or not
 * @param {string} message Message in case of an error
 */
const appendLog = async (account, success, message) => {
    await fs.appendFile(outputFilePath, `${account},${success},${message}${os.EOL}`, (err) => {
        if (err) throw err;
    });
}

/**
 * Add allow trust log to CSV file
 * @param {string} account Receiver account for which transaction has been executed
 * @param {boolean} success Transaction successful
 */
const appendLogAllowTrust = async (account, success) => {
    await fs.appendFile(allowTrustFilePath, `${account},${success}${os.EOL}`, (err) => {
        if (err) throw err;
    });
}

/**
 * Load csv file and convert to JSON
 */
const loadCsv = async (file) => {
    const csvFilePath = `./src/assets/${file}`; // path from root of project
    return csv().fromFile(csvFilePath);
}

/**
 * Check if all transactions succeeded and write to csv log file
 * @param {[ Stellar.Transaction ]} transactionsLog Success responses from sending payment transactions
 * @param {[ { any }]} filteredAccounts Used to determine how many transactions succeeded
 */
const writeLogsForTransactions = (transactionsLog, filteredAccountsPubKeys) => {
  transactionsLog.map(log => {
      let resultJson = Stellar.xdr.TransactionResult.fromXDR(log.result_xdr, 'base64');

      if(resultJson._attributes.result._switch.name && resultJson._attributes.result._switch.name === 'txSuccess') {
          let txJson = Stellar.xdr.TransactionEnvelope.fromXDR(log.envelope_xdr, 'base64');
          let recipientPubKeyAsBuffer = txJson._attributes.tx._attributes.operations[0]._attributes.body._value._attributes.destination._value;
          let recipientPubKey = Stellar.StrKey.encodeEd25519PublicKey(recipientPubKeyAsBuffer);

          if(filteredAccountsPubKeys.includes(recipientPubKey)) {
              const index = filteredAccountsPubKeys.indexOf(recipientPubKey);
              filteredAccountsPubKeys.splice(index, 1);
              appendLog(recipientPubKey, true, 'Success');
          }
      }
  });

  if(filteredAccountsPubKeys.length === 0) {
      console.log('Program finished successful!');
  } else {
      filteredAccountsPubKeys.map(pubKey => {
          appendLog(pubKey, false, 'Transaction failed');
      });

      console.log('Program finished with errors!');
  }
}

/**
 * Write all succeeded accounts with allow trust to CSV file
 * @param {[ string ]} accounts public keys 
 */
const writeLogsForAllowTrustTransactions = (accounts) => {
    accounts.map(account => {
        appendLogAllowTrust(account, true);
    });
  }

export default {
  createFileIfNotExist,
  createFileAllowTrustIfNotExist,
  filterEmptyObjects,
  appendLog,
  appendLogAllowTrust,
  loadCsv,
  writeLogsForTransactions,
  writeLogsForAllowTrustTransactions
};
