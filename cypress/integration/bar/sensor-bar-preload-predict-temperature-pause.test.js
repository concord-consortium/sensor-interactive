import Workspace from "../../support/elements/workspace";

const workspace = new Workspace

context('Sensor Bar Preload Temperature Pause',()=>{
    before(()=>{
        // See cypress.json for viewport size
        cy.viewport(1400,1280)
        cy.visit('/examples/fake-sensor-bar-preload-predict-temperature-pause.html')
    })
    it('verify Initial Display',()=>{
        workspace.getStatusMessage().should('contain','No devices connected.')
        workspace.verifySensorTypeButtonNotExist()
        workspace.getPredictButton().should('be.visible')
        workspace.getYAxisLabel().should('contain', "Temperature (degC)")
        workspace.getXAxisLabel().should('contain', "Trials")
        workspace.getGraphLegendPrerecording().should('contain','Sample ')
        workspace.getGraphLegendPrediction().should('contain','Predicted ')
    })
    it('verify Predict Buttons',()=>{
        workspace.getPredictButton().click();
        workspace.getPredictButton().should('have.attr','disabled')
        workspace.getClearPredictionButton().should('be.visible')
        workspace.getSavePredictButton().should('be.visible')
    })
    it('verify Clear Prediction',()=>{
        workspace.getSlider(0).click('top')
        workspace.getSlider(1).click('top')
        workspace.getClearPredictionButton().click()
        workspace.getDialogContent("This will discard your current prediction data.")
        workspace.clearPredictionDialog()
        workspace.getPredictButton().should('have.attr','disabled')
        workspace.getClearPredictionButton().should('be.visible').and('not.have.attr','disabled')
        workspace.getSavePredictButton().should('be.visible').and('not.have.attr','disabled')
    })
    it('verify Save Prediction',()=>{
        workspace.getSlider(0).click('top')
        workspace.getSlider(1).click('top')
        workspace.getSlider(2).click('top')
        workspace.getSlider(3).click('top')
        workspace.getSlider(4).click('top')
        workspace.getSavePredictButton().click()
        workspace.getDialogContent("Once you have saved your prediction you can't change it.")
        workspace.savePredictionDialog()
        workspace.getClearPredictionButton().should('be.visible').should('have.attr','disabled')
        workspace.getSavePredictButton().should('be.visible').should('have.attr','disabled')
        workspace.getPredictButton().should('have.attr','disabled')
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
        workspace.getPauseButton().should('be.visible').and('contain', "Pause Reading")
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
        workspace.getRecordButton().should('have.attr','disabled')
        workspace.getSaveDataButton().should('not.have.attr','disabled')
        workspace.getNewRunButton().should('not.have.attr','disabled')
    })
    it('Pause Reading',()=>{
        workspace.getPauseButton().click()
        workspace.getPauseButton().should('be.visible').and('contain', "Start Reading")
        workspace.getSensorReading().should('contain', "Paused")
    })

    it('Start Reading',()=>{
        workspace.getPauseButton().click()
        workspace.getPauseButton().should('be.visible').and('contain', "Pause Reading")
        workspace.getSensorReading().should('not.contain', "Paused")
    })
    it('verify New Run',()=>{
        workspace.getNewRunButton().click();
        workspace.getDialogContent("Pressing New Run without pressing Save Data will discard the current data. Set up a new run without saving the data first?")
        workspace.discardDataDialog()
        workspace.getRecordButton().should('not.have.attr','disabled')
        workspace.getRecordButton().click().click().click().click().click().click()
        workspace.getStatusMessage().contains("Data collection stopped.")
        workspace.getRecordButton().should('have.attr','disabled')
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
    it('Reload Sensor',()=>{
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
