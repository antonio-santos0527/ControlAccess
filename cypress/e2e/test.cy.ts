describe('ControlAccess App', () => {
  it('shows Login page when visiting root', () => {
    cy.visit('/')
    cy.contains('Hola!')
    cy.contains('Ingresar')
  })
})