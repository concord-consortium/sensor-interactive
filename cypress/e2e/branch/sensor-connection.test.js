import Workspace from "../../support/elements/workspace";

const workspace = new Workspace

context('Connecting a wired sensor',()=>{
    it('Connecting a wired sensor', ()=>{
        // See cypress.json for viewport size
        cy.viewport(1400,1280)
        cy.visit('/examples/fake-sensor.html')

        cy.log("verify status message shows connection")
        workspace.getSensorTypeButton('Wired').click()
        workspace.getStatusIcon().should('be.visible').and ('have.class','connected')
        workspace.getStatusMessage().should('contain','Fake Sensor connected')

        cy.log("verify zero sensor button exists")
        workspace.getZeroSensorButton().should('exist');

        cy.log("verify sensor selection dropdown shows available sensors")
        workspace.selectSensor("102")
        workspace.getYAxisLabel().should('contain', "Position (m)")
        workspace.getGraphLegend().find('.name').should('contain','Position')
        workspace.selectSensor("101")
        workspace.getYAxisLabel().should('contain',"Temperature (degC)")
        workspace.getGraphLegend().find('.name').should('contain','Temperature')

        // TODO: work on fake sensor code to show a value

        cy.log("verify Add sensor button is visible")
        workspace.getAddSensorButton().should('be.visible')

        cy.log("verify footer control panel is enabled")
        workspace.getBottomControlPanel().should('be.visible').and('not.have.attr','disabled')
        workspace.getStartButton().should('not.have.attr','disabled')
        workspace.getStopButton().should('have.attr','disabled')
        workspace.getSaveDataButton().should('have.attr','disabled')
        workspace.getNewRunButton().should('have.attr','disabled')
        
        cy.log("verify Reading container shows a reading")
        workspace.getSensorReading().should('not.to.be.empty')
    })

    /* test disabled on 5/31/2024 - it is intermittently failing builds
    it('verify graph shows data',()=>{
        let duration="1";
        workspace.selectDuration(duration)
        workspace.getXAxisMaxValue().should('contain',duration)
        workspace.getStartButton().click();
        cy.wait(1000);
        cy.matchImageSnapshot(duration+"_graph");
    })
    */

    //for some reason website gets reloaded at this point during Travis build causing test to fail
    //so will have to initialize conditions again so test can proceed
    it('Collecting Data',()=>{
        // See cypress.json for viewport size
        cy.viewport(1280,720)
        let duration="1";
        cy.visit('/examples/fake-sensor.html')
        workspace.getSensorTypeButton('Wired').click()
        workspace.selectDuration(duration)
        workspace.getStartButton().click();
        cy.wait(1000);

        cy.log("verify Save Data button is enabled")
        workspace.getSaveDataButton().should('not.have.attr','disabled')

        cy.log("verify New Run button is enabled")
        workspace.getNewRunButton().should('not.have.attr','disabled')

        cy.log("verify New Run without saving produces warning")
        workspace.getNewRunButton().click();
        workspace.getDialogHeader().should('contain',"Warning")
        workspace.getDialogButtons().should('contain',"Preserve Data")
        workspace.getDialogButtons().should('contain',"Discard Data")

        cy.log("verify graph is cleared when data is discarded")
        workspace.discardData();
        cy.wait(500)
        cy.matchImageSnapshot("cleared_graph")

        cy.log("verify Save Data gets disabled after clicked")
        workspace.getStartButton().click();
        workspace.getSaveDataButton().click();
        workspace.getSaveDataButton().should('have.attr','disabled')

        cy.log("verify Start button is disabled when data collection is started")
        duration="30";
        workspace.getNewRunButton().click()
        workspace.selectDuration(duration)
        workspace.getXAxisMaxValue().should('contain',duration)
        workspace.getStartButton().click();
        cy.wait(5000);
        workspace.getStartButton().should('have.attr','disabled')

        cy.log("verify Stop button is enabled when data collection is started")//depends on previous test
        workspace.getStopButton().should('not.have.attr','disabled')

        cy.log("verify data collection is stopped when Stop button is clicked")
        workspace.getStopButton().click();
        workspace.getSaveDataButton().should('not.have.attr',"disabled")
        workspace.getNewRunButton().should('not.have.attr',"disabled")
        cy.matchImageSnapshot("stopped_graph")

        cy.log("verify graph rescale")
        workspace.getRescaleButton().click();
        workspace.getXAxisMaxValue().should('contain','5')
        // cy.matchImageSnapshot('rescaled_graph')
    })
})

context('Collecting data with a single-read bar graph',()=>{
    it('Collecting data with a single-read bar graph',()=>{
        // See cypress.json for viewport size
        cy.viewport(1400,1280)
        cy.visit('/examples/fake-sensor-bar-prerecorded-ondemand.html')

        cy.log("has labels in the format 'Trial n'")
        workspace.getXAxisMinValue().should('be.visible').and('contain', 'Trial 1')
        workspace.getXAxisMaxValue().should('be.visible').and('contain', 'Trial 6')

        cy.log("records a single reading")
        workspace.getSensorTypeButton('Wired').should('be.visible').click()
        cy.wait(1000)
        workspace.getRecordButton().should('be.visible').click()
        cy.get('.dygraph-axis-label-x').first().should('be.visible').and('contain', '0 sec')

        cy.log("allows you to record only six single readings")
        workspace.getRecordButton().click().click().click().click().click()
        workspace.getRecordButton().should('have.attr','disabled')
    })
})
