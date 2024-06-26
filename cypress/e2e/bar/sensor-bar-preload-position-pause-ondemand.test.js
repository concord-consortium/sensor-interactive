import Workspace from "../../support/elements/workspace";

const workspace = new Workspace

context('Sensor Bar Preload Position Pause Ondemand',()=>{
    it('Sensor Bar Preload Position Pause Ondemand', ()=>{
        // See cypress.json for viewport size
        cy.viewport(1400,1280)
        cy.visit('/examples/fake-sensor-bar-preload-position-pause-ondemand.html')

        cy.log("verify Initial Display")
        workspace.getStatusMessage().should('contain','No devices connected.')
        workspace.verifyPredictionButtonsNotDisplayed()
        workspace.getYAxisLabel().should('contain', "Position (m)")
        workspace.getXAxisLabel().should('contain', "Time ()")
        workspace.getGraphLegendPrerecording().should('contain','Sample ')

        cy.log("verify Wireless Sensor Button Connect")
        workspace.getSensorTypeButton('Wired').should('be.visible')
        workspace.getSensorTypeButton('Wireless').should('be.visible')
        workspace.getSensorTypeButton('Wireless').click()
        workspace.getStatusIcon().should('be.visible').and ('have.class','connected')
        workspace.getStatusMessage().should('contain','Fake Sensor connected')
        workspace.getSensorDropdown().find('option').should('have.length',1)
        workspace.getSensorDropdown().find('option').should('contain','Position (m) [1]')
        workspace.getSensorReading().should('not.to.be.empty')
        workspace.getZeroSensorButton().should('not.have.attr','disabled')
        workspace.getRemoveSensorButton().should('be.visible')
        workspace.getGraphLegend().find('.name').should('contain','Sensor Position')
        workspace.getPauseButton().should('be.visible').and('contain', "Pause Reading")

        cy.log("verify footer control panel")
        workspace.getBottomControlPanel().should('be.visible').and('not.have.attr','disabled')
        workspace.getStartButtonRightControl().should('not.have.attr','disabled')
        workspace.getStopButton().should('have.attr','disabled')
        workspace.getSaveDataButton().should('have.attr','disabled')
        workspace.getNewRunButton().should('have.attr','disabled')

        cy.log("Record Data")
        workspace.getStartButtonRightControl().click();
        workspace.getStatusMessage().contains("Data collection stopped.", {timeout: 30000});
        workspace.getStartButtonRightControl().should('have.attr','disabled')
        workspace.getStopButton().should('have.attr','disabled')
        workspace.getSaveDataButton().should('not.have.attr','disabled')
        workspace.getNewRunButton().should('not.have.attr','disabled')

        cy.log("Pause Reading")
        workspace.getPauseButton().click()
        workspace.getPauseButton().should('be.visible').and('contain', "Start Reading")
        workspace.getSensorReading().should('contain', "Paused")

        cy.log("Start Reading")
        workspace.getPauseButton().click()
        workspace.getPauseButton().should('be.visible').and('contain', "Pause Reading")
        workspace.getSensorReading().should('not.contain', "Paused")

        cy.log("verify New Run")
        workspace.getNewRunButton().click();
        workspace.getDialogContent("Pressing New Run without pressing Save Data will discard the current data. Set up a new run without saving the data first?")
        workspace.discardDataDialog()
        workspace.getStartButtonRightControl().should('not.have.attr','disabled')
        workspace.getStartButtonRightControl().click();
        workspace.getStatusMessage().contains("Data collection stopped.", {timeout: 30000});
        workspace.getStartButtonRightControl().should('have.attr','disabled')
        workspace.getStopButton().should('have.attr','disabled')
        workspace.getSaveDataButton().should('not.have.attr','disabled')
        workspace.getNewRunButton().should('not.have.attr','disabled')

        cy.log("Delete Sensor")
        workspace.getRemoveSensorButton().click()
        workspace.getStatusMessage().contains("No devices connected.")
        workspace.verifySensorDropdownNotExist()
        workspace.getSensorTypeButton('Wired').should('be.visible')
        workspace.getSensorTypeButton('Wireless').should('be.visible')
    })
})
