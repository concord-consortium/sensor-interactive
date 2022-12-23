import Workspace from "../../support/elements/workspace";

const workspace = new Workspace

context('Sensor Bar Prediction',()=>{
    before(()=>{
        // See cypress.json for viewport size
        cy.viewport(1400,1280)
        cy.visit('/examples/fake-sensor-bar-prediction.html')
    })
    it('verify Initial Display',()=>{
        workspace.getStatusMessage().should('contain','No devices connected.')
        workspace.verifySensorTypeButtonNotExist()
        workspace.getPredictButton().should('be.visible')
        workspace.getGraphPanel().invoke("attr", "class").should("contain", "disabled")
        workspace.getYAxisLabel().should('contain', "Sensor Reading (-)")
        workspace.getXAxisLabel().should('contain', "Time ()")
        workspace.getGraphLegendPrediction().should('contain','Predicted ')
    })
    it('verify Predict Buttons',()=>{
        workspace.getPredictButton().click();
        workspace.getPredictButton().should('have.attr','disabled')
        workspace.getGraphPanel().invoke("attr", "class").should("not.contain", "disabled");
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
    it('verify Wireless Sensor Button Connect Temperature',()=>{
        workspace.getSensorTypeButton('Wired').should('be.visible')
        workspace.getSensorTypeButton('Wireless').should('be.visible')
        workspace.getSensorTypeButton('Wireless').click()
        workspace.getStatusIcon().should('be.visible').and ('have.class','connected')
        workspace.getStatusMessage().should('contain','Fake Sensor connected')
        workspace.getSensorReading().should('not.to.be.empty')
        workspace.getZeroSensorButton().should('have.attr','disabled')
        workspace.getRemoveSensorButton().should('be.visible')
        workspace.getAddSensorButton().should('be.visible')
        workspace.getGraphLegend().find('.name').should('contain','Sensor Temperature')
    })
    it('verify footer control panel',()=>{
        workspace.getBottomControlPanel().should('be.visible').and('not.have.attr','disabled')
        workspace.getStartButtonRightControl().should('not.have.attr','disabled')
        workspace.getStopButton().should('have.attr','disabled')
        workspace.getSaveDataButton().should('have.attr','disabled')
        workspace.getNewRunButton().should('have.attr','disabled')
    })
    it('Record Data For Temperature',()=>{
        workspace.getStartButtonRightControl().click();
        workspace.getStatusMessage().contains("Data collection stopped.", {timeout: 30000});
        workspace.getStartButtonRightControl().should('have.attr','disabled')
        workspace.getStopButton().should('have.attr','disabled')
        workspace.getSaveDataButton().should('not.have.attr','disabled')
        workspace.getNewRunButton().should('not.have.attr','disabled')
    })
    it('verify New Run For Temperature',()=>{
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
    })
    it('Record Data For Position',()=>{
        workspace.selectSensor("102")
        workspace.getDialogContent("Switching the type of measurement will discard your current data. Do you want to continue?")
        workspace.continueDialog()
        workspace.getYAxisLabel().should('contain', "Position (m)")
        workspace.getGraphLegend().find('.name').should('contain','Sensor Position')
        workspace.getStartButtonRightControl().click();
        workspace.getStatusMessage().contains("Data collection stopped.", {timeout: 30000});
        workspace.getStartButtonRightControl().should('have.attr','disabled')
        workspace.getStopButton().should('have.attr','disabled')
        workspace.getSaveDataButton().should('not.have.attr','disabled')
        workspace.getNewRunButton().should('not.have.attr','disabled')
    })
    it('verify New Run For Position',()=>{
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
    })
})

context('Add Second Sensor',()=>{
    it('Add Sensor 2',()=>{
        workspace.getAddSensorButton().click()
        workspace.getTwoGraphs().should('be.visible')
        workspace.getGraphYAxisLabel(0).should('contain', "Position (m)")
        workspace.getGraphYAxisLabel(1).should('contain', "Temperature (degC)")
        workspace.getXAxisLabel().should('contain', "Time (s)")
        workspace.getGraphLegendPrediction().should('contain','Predicted ')
        workspace.getGraphLegend().find('.name').should('contain','Sensor Position')
        workspace.getGraphLegend().find('.name').should('contain','Sensor 2 Temperature')
    })
    it('Record Data For Position',()=>{
        workspace.getNewRunButton().click();
        workspace.discardDataDialog()
        workspace.getStartButtonRightControl().click();
        workspace.getStatusMessage().contains("Data collection stopped.", {timeout: 30000});
        workspace.getStartButtonRightControl().should('have.attr','disabled')
        workspace.getStopButton().should('have.attr','disabled')
        workspace.getSaveDataButton().should('not.have.attr','disabled')
        workspace.getNewRunButton().should('not.have.attr','disabled')
    })
    it('verify New Run For Position',()=>{
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
    })
})
