import fileTools from '../utils/fileTools';

/**
 * Check if program executed succesful based on remaining pub keys
 * @param {[ string ]} filteredAccountsPubKeys 
 */
const checkProgramExecution = (filteredAccountsPubKeys) => {
  if(filteredAccountsPubKeys.length === 0) {
    console.log('Program finished successful!');
  } else {
      filteredAccountsPubKeys.map(pubKey => {
          fileTools.appendLog(pubKey, false, 'Transaction failed');
      });

      console.log('Program finished with errors!');
  }
}

export default {
  checkProgramExecution
}