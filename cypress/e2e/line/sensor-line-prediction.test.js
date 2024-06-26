import Workspace from "../../support/elements/workspace";

const workspace = new Workspace

context('Sensor Line Prediction',()=>{
    it('Sensor Line Prediction',()=>{
        // See cypress.json for viewport size
        cy.viewport(1400,1280)
        cy.visit('/examples/fake-sensor-line-prediction.html')

        cy.log("verify Initial Display")
        workspace.getStatusMessage().should('contain','No devices connected.')
        workspace.verifySensorTypeButtonNotExist()
        workspace.getPredictButton().should('be.visible')
        workspace.getGraphPanel().invoke("attr", "class").should("contain", "disabled")
        workspace.getYAxisLabel().should('contain', "Sensor Reading (-)")
        workspace.getXAxisLabel().should('contain', "Time ()")
        workspace.getGraphLegendPrediction().should('contain','Predicted ')

        cy.log("verify Predict Buttons")
        workspace.getPredictButton().click();
        workspace.getPredictButton().should('have.attr','disabled')
        workspace.getClearPredictionButton().should('be.visible')
        workspace.getSavePredictButton().should('be.visible')

        cy.log("verify Clear Prediction")
        workspace.getClearPredictionButton().click()
        workspace.getDialogContent("This will discard your current prediction data.")
        workspace.clearPredictionDialog()
        workspace.getPredictButton().should('have.attr','disabled')
        workspace.getClearPredictionButton().should('be.visible').and('not.have.attr','disabled')
        workspace.getSavePredictButton().should('be.visible').and('not.have.attr','disabled')

        cy.log("verify Save Prediction")
        workspace.getCanvas().click(400,200)
        workspace.getCanvas().click(600,400)
        workspace.getCanvas().click(800,600)
        workspace.getSavePredictButton().click()
        workspace.getDialogContent("Once you have saved your prediction you can't change it.")
        workspace.savePredictionDialog()
        workspace.getClearPredictionButton().should('be.visible').should('have.attr','disabled')
        workspace.getSavePredictButton().should('be.visible').should('have.attr','disabled')
        workspace.getPredictButton().should('have.attr','disabled')

        cy.log("verify Wireless Sensor Button Connect")
        workspace.getSensorTypeButton('Wired').should('be.visible')
        workspace.getSensorTypeButton('Wireless').should('be.visible')
        workspace.getSensorTypeButton('Wireless').click()
        workspace.getStatusIcon().should('be.visible').and ('have.class','connected')
        workspace.getStatusMessage().should('contain','Fake Sensor connected')
        workspace.getSensorDropdown().find('option').should('have.length',2)
        workspace.getSensorReading().should('not.to.be.empty')
        workspace.getZeroSensorButton().should('have.attr','disabled')
        workspace.getRemoveSensorButton().should('be.visible')
        workspace.getGraphLegend().find('.name').should('contain','Sensor Temperature')

        cy.log("verify footer control panel")
        workspace.getBottomControlPanel().should('be.visible').and('not.have.attr','disabled')
        workspace.getStartButtonRightControl().should('not.have.attr','disabled')
        workspace.getStopButton().should('have.attr','disabled')
        workspace.getSaveDataButton().should('have.attr','disabled')
        workspace.getNewRunButton().should('have.attr','disabled')

        cy.log("Record Data")
        workspace.getStartButtonRightControl().click();
        workspace.getStatusMessage().contains("Data collection stopped.", {timeout: 30000})
        workspace.getStartButtonRightControl().should('have.attr','disabled')
        workspace.getStopButton().should('have.attr','disabled')
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

        cy.log("Reload Sensor")
        workspace.getReloadButton().click()
        workspace.getStatusMessage().contains("Reloading SensorConnector")
        cy.wait(6000)
        workspace.getStatusMessage().contains("No devices connected.")
        workspace.verifySensorTypeButtonNotExist()
        workspace.getPredictButton().should('not.have.attr','disabled')
        workspace.verifyPredictionButtonsNotDisplayed()
        workspace.getGraphLegend().find('.name').should('not.contain','Sensor Temperature')
    })
})
