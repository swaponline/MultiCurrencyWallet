describe('Test main page', () => {
  it('View default currency', () => {
    cy.visit('/')
    cy.clearLocalStorage()
    cy.get('#flipExchange').click()
    cy.get('#buyCurrency').contains('BTC')
    cy.get('#sellCurrency').contains('ETH')
  })
  it('Change default currency', () => {
    cy.visit('/')
    cy.clearLocalStorage()
    cy.get('#flipExchange').click()
    cy.get('#buyCurrency').contains('BTC')
    cy.get('#sellCurrency').contains('ETH')
  })
})
