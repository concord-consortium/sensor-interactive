import Workspace from "../../support/elements/workspace";

const workspace = new Workspace

context('Sensor Line Preload Temperature',()=>{
    before(()=>{
        // See cypress.json for viewport size
        cy.viewport(1400,1280)
        cy.visit('/examples/fake-sensor-line-preload-temperature.html')
    })
    it('verify Initial Display',()=>{
        workspace.getStatusMessage().should('contain','No devices connected.')
        workspace.verifyPredictionButtonsNotDisplayed()
        workspace.getYAxisLabel().should('contain', "Temperature (degC)")
        workspace.getXAxisLabel().should('contain', "Time ()")
        workspace.getGraphLegendPrerecording().should('contain','Sample ')
    })
    it('verify Wireless Sensor Button Connect',()=>{
        workspace.getSensorTypeButton('Wired').should('be.visible')
        workspace.getSensorTypeButton('Wireless').should('be.visible')
        workspace.getSensorTypeButton('Wireless').click()
        workspace.getStatusIcon().should('be.visible').and ('have.class','connected')
        workspace.getStatusMessage().should('contain','Fake Sensor connected')
        workspace.getSensorDropdown().find('option').should('have.length',1)
        workspace.getSensorDropdown().find('option').should('contain','Temperature (degC) [1]')
        workspace.getSensorReading().should('not.to.be.empty')
        workspace.getZeroSensorButton().should('have.attr','disabled')
        workspace.getRemoveSensorButton().should('be.visible')
        workspace.getGraphLegend().find('.name').should('contain','Sensor Temperature')
    })
    it('verify footer control panel',()=>{
        workspace.getBottomControlPanel().should('be.visible').and('not.have.attr','disabled')
        workspace.getRecordButton().should('not.have.attr','disabled')
        workspace.getSaveDataButton().should('have.attr','disabled')
        workspace.getNewRunButton().should('have.attr','disabled')
    })
    it('Record Data',()=>{
        workspace.getRecordButton().click().click().click().click().click().click()
        workspace.getStatusMessage().contains("Data collection stopped");
        workspace.getRecordButton().should('not.have.attr','disabled')
        workspace.getSaveDataButton().should('not.have.attr','disabled')
        workspace.getNewRunButton().should('not.have.attr','disabled')
    })
    it('verify New Run',()=>{
        workspace.getNewRunButton().click();
        workspace.getDialogContent("Pressing New Run without pressing Save Data will discard the current data. Set up a new run without saving the data first?")
        workspace.discardDataDialog()
        workspace.getRecordButton().should('not.have.attr','disabled')
        workspace.getRecordButton().click().click().click().click().click().click()
        workspace.getStatusMessage().contains("Data collection stopped.")
        workspace.getRecordButton().should('not.have.attr','disabled')
        workspace.getSaveDataButton().should('not.have.attr','disabled')
        workspace.getNewRunButton().should('not.have.attr','disabled')
    })
    it('Delete Sensor',()=>{
        workspace.getRemoveSensorButton().click()
        workspace.getStatusMessage().contains("No devices connected.")
        workspace.verifySensorDropdownNotExist()
        workspace.getSensorTypeButton('Wired').should('be.visible')
        workspace.getSensorTypeButton('Wireless').should('be.visible')
    })
})
