import { mnemonics, MINUTE_MS } from '../test.utils';
describe('Vaults UI Test Cases', () => {
  context('Test commands', () => {
    const AGORIC_NET = Cypress.env('AGORIC_NET') || 'local';
    const customWalletPhrase = Cypress.env('MNEMONIC_PHRASE');

    it('should setup the wallet', () => {
      cy.task('info', `AGORIC_NET: ${AGORIC_NET}`);
      if (customWalletPhrase) {
        cy.setupWallet({
          secretWords: customWalletPhrase,
        });
      } else if (AGORIC_NET === 'local') {
        cy.setupWallet({
          secretWords: mnemonics.user1,
          walletName: 'user1',
        });
      } else if (AGORIC_NET === 'xnet') {
        cy.task('info', 'Connecting with wallet...');
        cy.setupWallet({
          secretWords: Cypress.env('USER1_MNEMONIC'),
          walletName: 'user1',
        });
      } else {
        cy.setupWallet({
          createNewWallet: true,
          walletName: 'my created wallet',
          selectedChains: ['Agoric'],
        });

        cy.getWalletAddress('Agoric').then(address => {
          // provision BLD
          cy.provisionFromFaucet(address, 'delegate');
          // provision IST
          cy.provisionFromFaucet(address, 'client');
        });
      }
    });

    it('should connect with the wallet', () => {
      cy.connectWithWallet({ isVaultsTests: true });
    });

    it('should create a new vault and approve the transaction successfully', () => {
      if (AGORIC_NET !== 'xnet') {
        cy.contains('button', /ATOM/).click();
      }

      cy.contains('ATOM to lock up *')
        .next()
        .within(() => {
          cy.get('input[type="number"]').click();
          cy.get('input[type="number"]').clear();
          cy.get('input[type="number"]').type(10);
        });

      cy.contains('button', 'Create Vault').click();

      cy.confirmTransaction().then(taskCompleted => {
        expect(taskCompleted).to.be.true;
        cy.contains(
          'p',
          'You can manage your vaults from the "My Vaults" view.',
          { timeout: MINUTE_MS },
        ).should('exist');
        cy.contains('Manage my Vaults').click();
      });
    });

    it('should open the new vault', () => {
      cy.get('span')
        .contains(/My Vaults.*\(\d+\)/)
        .children()
        .first()
        .spread(element => {
          // Get the total number of vaults present
          const vaultCountRegex = element.innerHTML.match(/\((\d+)\)/);
          const vaultCount = Number(vaultCountRegex[1]);

          cy.findAllByText(/#\d+/)
            .should('have.length', vaultCount)
            .spread((...vaults) => {
              expect(
                vaults.filter(vaultNo => !/^#\d+$/.test(vaultNo.innerHTML)),
              ).to.be.empty;
              // Get the vault with the latest ID number and click on it
              const vaultIds = vaults.map(v => Number(v.innerHTML.slice(1)));
              const latestId = Math.max(...vaultIds);
              cy.findByText(`#${latestId}`).click();
            });
        });
    });

    it('should adjust the collateral by performing a withdrawl and approve the transaction successfully', () => {
      cy.contains('div', 'Adjust Collateral')
        .next('.grid-cols-2')
        .within(() => {
          cy.contains('button', /^(Deposit|Withdraw|No Action)$/).click();
          cy.contains('button', 'Withdraw').click();
          cy.contains('.input-label', 'Amount')
            .next('.input-wrapper')
            .within(() => {
              cy.get('input[type="number"]').click();
              cy.get('input[type="number"]').type(1);
            });
        });

      cy.contains('button', 'Adjust Vault').click();
      cy.confirmTransaction().then(taskCompleted => {
        expect(taskCompleted).to.be.true;
        cy.contains('p', "Your vault's balances have been updated.", {
          timeout: MINUTE_MS,
        }).should('exist');
        cy.contains('Adjust more').click();
      });
    });

    it('should adjust the collateral by depositing ATOM and approve the transaction successfully', () => {
      cy.contains('div', 'Adjust Collateral')
        .next('.grid-cols-2')
        .within(() => {
          cy.contains('button', /^(Deposit|Withdraw|No Action)$/).click();
          cy.contains('button', 'Deposit').click();

          cy.contains('.input-label', 'Amount')
            .next('.input-wrapper')
            .within(() => {
              cy.get('input[type="number"]').click();
              cy.get('input[type="number"]').type(1);
            });
        });

      cy.contains('button', 'Adjust Vault').click();
      cy.confirmTransaction().then(taskCompleted => {
        expect(taskCompleted).to.be.true;
        cy.contains('p', "Your vault's balances have been updated.", {
          timeout: MINUTE_MS,
        }).should('exist');
        cy.contains('Adjust more').click();
      });
    });

    it('should adjust the debt by minting more IST and approve the transaction successfully', () => {
      cy.contains('div', 'Adjust Debt')
        .next('.grid-cols-2')
        .within(() => {
          cy.contains('button', /^(Repay|Mint More|No Action)$/).click();
          cy.contains('button', 'Mint More').click();
          cy.contains('.input-label', 'Amount')
            .next('.input-wrapper')
            .within(() => {
              cy.get('input[type="number"]').click();
              cy.get('input[type="number"]').type(1);
            });
        });

      cy.contains('button', 'Adjust Vault').click();
      cy.confirmTransaction().then(taskCompleted => {
        expect(taskCompleted).to.be.true;
        cy.contains('p', "Your vault's balances have been updated.", {
          timeout: MINUTE_MS,
        }).should('exist');
        cy.contains('Adjust more').click();
      });
    });

    it('should adjust the debt by repaying and approve the transaction successfully', () => {
      cy.contains('div', 'Adjust Debt')
        .next('.grid-cols-2')
        .within(() => {
          cy.contains('button', /^(Repay|Mint More|No Action)$/).click();
          cy.contains('button', 'Repay').click();
          cy.contains('.input-label', 'Amount')
            .next('.input-wrapper')
            .within(() => {
              cy.get('input[type="number"]').click();
              cy.get('input[type="number"]').type(1);
            });
        });

      cy.contains('button', 'Adjust Vault').click();
      cy.confirmTransaction().then(taskCompleted => {
        expect(taskCompleted).to.be.true;
        cy.contains('p', "Your vault's balances have been updated.", {
          timeout: MINUTE_MS,
        }).should('exist');
        cy.contains('Adjust more').click();
      });
    });

    it('should close the vault and approve the transaction successfully', () => {
      cy.contains('Close Out Vault').click();
      cy.contains('button.bg-interPurple', 'Close Out Vault').click();

      cy.confirmTransaction().then(taskCompleted => {
        expect(taskCompleted).to.be.true;
      });
    });
  });
});
