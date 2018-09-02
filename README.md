# Batch Payment Tool for Stellar

## To Do
- Code cleanup
- Make code more modular and reusable (80% OK)
- Config validation functionality before the actual tool runs to make sure we are using the correct accounts
- Check if all functions contain correct naming and comments (95% OK)

## Installation
Execute in terminal inside the root of the project:
`npm install`

## Start & Usage
Again in terminal at root:
`npm start`

## Background

We will need a batch payment tool which can distribute EVER to set of accounts. One use for this tool will be to distribute the EVER bonuses after completion of token sale. Another use will be to distribute bounty tokens.

## Specification

Create a command line tool for executing a batch of payment transactions listed in a CSV file. The file provided can be expected to contain the following fields:

### Input

`RECIPIENT`: Receiving account
`CREATE`: `TRUE` -  if the account doesn't exist it should be created and funded with the minimum balance  / `FALSE` - if the account doesn't exist treat this as a failure.
`AMOUNT`: Ever amount

### Output

Output should be another CSV file with the exact information as provided in the input file, but, with the following additional fields:

`STATUS`: `OK`, `FAILED`
`ERROR`: Error message if `STATUS` = `FAILED`.

### Command line arguments

Input and output files should be defined by command line arguments.

Additional command line parameter should be a config file where the following information should be available:

- Horizon URL to use.
- Source account for EVER payments.
- Source account for initial XLM funding of created account.

### Sensitive parameters

Private keys (for EVER-account and XLM-funding account) should not be stored in configuration files or sent as command line arguments (these could be logged, and are often visible in process listings). One solution could be to ask the user for the required keys using a prompt.

*It might also be interesting to look at what would be required to use a hardware wallet instead of secret keys.*

## Implementation notes

- Implement as a node.js package.
- Payment should be made in batches to reduce the number of transactions required. Investigate the best way to achieve this in regard to error handling etc.
- Maybe <https://github.com/npm/read> can be used to read sensitive information from stdin?

