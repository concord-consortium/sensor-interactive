import Workspace from "../../support/elements/workspace";

const workspace = new Workspace

before(()=>{
    cy.visit('')
    // See cypress.json for viewport size
    cy.viewport(1280,720)
})
context('UI verification',()=>{
    it('verify all ui elements are visible',()=>{
        workspace.getStatusIcon().should('be.visible').and('not.have.class','connected')
        workspace.getStatusMessage().should('be.visible').and('contain','No devices connected.');
        workspace.getConnectMessage().should('contain','Connect A Device');
        workspace.getSensorTypeButton('Wireless').should('be.visible');
        workspace.getSensorTypeButton('Wired').should('be.visible');
        workspace.getReloadButton().should('be.visible')
        workspace.getBottomControlPanel().should('be.visible').and('have.class','disabled')
        workspace.getGraphPanel().should('be.visible')
    })

})