import Workspace from "../../support/elements/workspace";

const workspace = new Workspace

context('Sensor Line',()=>{
    it('Sensor Line',()=>{
        // See cypress.json for viewport size
        cy.viewport(1400,1280)
        cy.visit('/examples/fake-sensor-line.html')

        cy.log("verify Initial Display")
        workspace.getStatusMessage().should('contain','No devices connected.')
        workspace.getSensorTypeButton('Wired').should('be.visible')
        workspace.getSensorTypeButton('Wireless').should('be.visible')
        workspace.getGraphPanel().invoke("attr", "class").should("contain", "disabled")
        workspace.getYAxisLabel().should('contain', "Sensor Reading (-)")
        workspace.getXAxisLabel().should('contain', "Time ()")
        workspace.verifyPredictButtonNotExist()
        workspace.getXAxisMinValue().should('be.visible').and('contain', '0.0 ')
        workspace.getXAxisMaxValue().should('be.visible').and('contain', '5.0 ')

        cy.log("verify footer control panel")
        workspace.getBottomControlPanel().should('be.visible').and('not.have.attr','disabled')
        workspace.getStartButtonRightControl().should('have.attr','disabled')
        workspace.getStopButton().should('have.attr','disabled')
        workspace.getSaveDataButton().should('have.attr','disabled')
        workspace.getNewRunButton().should('have.attr','disabled')

        cy.log("verify Wireless Sensor Button Connect")
        workspace.getSensorTypeButton('Wireless').click()
        workspace.getStatusIcon().should('be.visible').and ('have.class','connected')
        workspace.getStatusMessage().should('contain','Fake Sensor connected')
        workspace.getSensorDropdown().find('option').should('have.length',2)
        workspace.getSensorReading().should('not.to.be.empty')
        workspace.getZeroSensorButton().should('have.attr','disabled')
        workspace.getRemoveSensorButton().should('be.visible')
        workspace.getAddSensorButton().should('be.visible')
        workspace.getGraphLegend().find('.name').should('contain','Sensor Temperature')

        cy.log("Record Data")
        workspace.getStartButtonRightControl().click();
        workspace.getStatusMessage().contains("Data collection stopped.", {timeout: 30000});
        workspace.getStartButtonRightControl().should('have.attr','disabled')
        workspace.getSaveDataButton().should('not.have.attr','disabled')
        workspace.getNewRunButton().should('not.have.attr','disabled')

        cy.log("Add Sensor 2")
        workspace.getAddSensorButton().click()
        workspace.getTwoGraphs().should('be.visible')
        workspace.verifyAddSensorButtonNotDisplayed()
        workspace.getGraphYAxisLabel(0).should('contain', "Temperature (degC)")
        workspace.getGraphYAxisLabel(1).should('contain', "Position (m)")
        workspace.getXAxisLabel().should('contain', "Time (s)")
        workspace.getGraphLegend().find('.name').should('contain','Sensor Temperature')
        workspace.getGraphLegend().find('.name').should('contain','Sensor 2 Position')

        cy.log("Record Data For 2 Sensors")
        workspace.getNewRunButton().click()
        workspace.getDialogContent("Pressing New Run without pressing Save Data will discard the current data. Set up a new run without saving the data first?")
        workspace.discardDataDialog()
        workspace.getStartButtonRightControl().click();
        workspace.getStatusMessage().contains("Data collection stopped.", {timeout: 30000});
        workspace.getStartButtonRightControl().should('have.attr','disabled')
        workspace.getStopButton().should('have.attr','disabled')
        workspace.getSaveDataButton().should('not.have.attr','disabled')
        workspace.getNewRunButton().should('not.have.attr','disabled')

        cy.log("Delete Sensor")
        workspace.getRemoveSensorButtonTwo().click()
        workspace.getAddSensorButton().should('be.visible')
        workspace.getSensorDropdown().find('option').should('have.length',2)
        workspace.getRemoveSensorButton().click()
        workspace.verifyAddSensorButtonNotDisplayed()
        workspace.getStatusMessage().contains("No devices connected.")
        workspace.verifySensorDropdownNotExist()
        workspace.getSensorTypeButton('Wired').should('be.visible')
        workspace.getSensorTypeButton('Wireless').should('be.visible')
        workspace.getGraphLegend().find('.name').should('not.contain','Sensor 2 Position')
    })
})
