describe('Test order form', () => {
  // beforeEach(() => {
  //   cy.visit('/')
  // })
  it('Open order modal', () => {
    cy.visit('/')
    cy.get('#order__btn').click()
    cy.get('#order__modal').should('be.visible')
  })

  it('Shold have value after selecting coins count', () => {
    cy.get('.cell__1fG').first().click()
    cy.get('#sellAmount').should('not.have.value', 0)
    cy.get('#buyAmount').should('not.have.value', 0)
    cy.get('.button__3ri').should('not.have.class', 'disabled__1Wz')
  })

  it('Next btn must be disabled when sellAmount is empty', () => {
    cy.get('#sellAmount').clear()
    cy.get('.button__3ri').should('have.class', 'disabled__1Wz')
  })

  it('Next btn must be disabled when buyAmount is empty', () => {
    cy.get('.cell__1fG').first().click()
    cy.get('#buyAmount').clear()
    cy.get('.button__3ri').should('have.class', 'disabled__1Wz')
  })

  it('Next btn must be disabled when sellAmount is empty and change sell coin', () => {
    cy.get('.cell__1fG').first().click()
    cy.get('#sellAmount').clear()
    cy.get('.currencySelect__3zc').first().click()
    cy.get('.select__2uk .option__1fO').first().click()
    cy.get('.button__3ri').should('have.class', 'disabled__1Wz')
  })

  it('Should send order', () => {
    cy.get('.cell__1fG').first().click()
    cy.get('.button__3ri').click()
    // confirm order
    cy.get('#confirm').click()
    cy.get('#order__modal').should('not.be.visible')
    cy.get('.table__16x tbody tr').should('be.visible')
  })
})