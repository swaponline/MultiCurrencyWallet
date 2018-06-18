describe('Create swap', () => {
  beforeEach(() => {
    cy.visit('/')
  })


  it.only('Open modal & add offer', () => {
    cy.get('.createOffer__3sD').click()
    cy.get('#Buy').focus().type(1)
    cy.contains('Next').click()
    cy.contains('Add').invoke('show').click()
  })
})