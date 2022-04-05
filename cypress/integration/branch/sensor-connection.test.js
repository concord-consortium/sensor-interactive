import Workspace from "../../support/elements/workspace";

const workspace = new Workspace

context('Connecting a wired sensor',()=>{
    before(()=>{
        // See cypress.json for viewport size
        cy.viewport(1400,1280)
        cy.visit('/examples/fake-sensor.html')
    })
    it('verify status message shows connection',()=>{
        workspace.getSensorTypeButton('Wired').click()
        workspace.getStatusIcon().should('be.visible').and ('have.class','connected')
        workspace.getStatusMessage().should('contain','Fake Sensor connected')
    })
    it('verify zero sensor button exists',()=>{
        workspace.getZeroSensorButton().should('exist');
    })
    it('verify sensor selection dropdown shows available sensors',()=>{
        workspace.selectSensor("102")
        workspace.getYAxisLabel().should('contain', "Position (m)")
        workspace.getGraphLegend().find('.name').should('contain','Position')
        workspace.selectSensor("101")
        workspace.getYAxisLabel().should('contain',"Temperature (degC)")
        workspace.getGraphLegend().find('.name').should('contain','Temperature')
    })
    it.skip('verify reading shows value',()=>{ //need to work on fake sensor code to show a value

    })
    it('verify Add sensor button is visible',()=>{
        workspace.getAddSensorButton().should('be.visible')
    })
    it('verify footer control panel is enabled',()=>{
        workspace.getBottomControlPanel().should('be.visible').and('not.have.attr','disabled')
        workspace.getStartButton().should('not.have.attr','disabled')
        workspace.getStopButton().should('have.attr','disabled')
        workspace.getSaveDataButton().should('have.attr','disabled')
        workspace.getNewRunButton().should('have.attr','disabled')
    })
})    
 context('Collecting Data from 1 sensor',()=>{  
    it('verify graph shows data',()=>{
        let duration="1";
        workspace.selectDuration(duration)
        workspace.getXAxisMaxValue().should('contain',duration)
        workspace.getStartButton().click();
        cy.wait(1000);
        cy.matchImageSnapshot(duration+"_graph");
    })
    it('verify Reading container shows a reading',()=>{
        workspace.getSensorReading().should('not.to.be.empty')
    })
    //for some reason website gets reloaded at this point during Travis build causing test to fail
    //so will have to initialize conditions again so test can proceed
    it('initialize state again',()=>{
        let duration="1";
        cy.visit('/examples/fake-sensor.html')
        workspace.getSensorTypeButton('Wired').click()
        workspace.selectDuration(duration)
        workspace.getStartButton().click();
        cy.wait(1000);
    })
    it('verify Save Data button is enabled',()=>{
        workspace.getSaveDataButton().should('not.have.attr','disabled')
    })
    it('verify New Run button is enabled',()=>{
        workspace.getNewRunButton().should('not.have.attr','disabled')
    })
    it('verify New Run without saving produces warning',()=>{
        workspace.getNewRunButton().click();
        workspace.getDialogHeader().should('contain',"Warning")
        workspace.getDialogButtons().should('contain',"Preserve Data")
        workspace.getDialogButtons().should('contain',"Discard Data")
    })
    it('verify graph is cleared when data is discarded',()=>{
        workspace.discardData();
        cy.wait(500)
        cy.matchImageSnapshot("cleared_graph")
    })
    it('verify Save Data gets disabled after clicked',()=>{
        workspace.getStartButton().click();
        workspace.getSaveDataButton().click();
        workspace.getSaveDataButton().should('have.attr','disabled')
    })
    it('verify Start button is disabled when data collection is started',()=>{
        let duration="30";
        workspace.getNewRunButton().click()
        workspace.selectDuration(duration)
        workspace.getXAxisMaxValue().should('contain',duration)
        workspace.getStartButton().click();
        cy.wait(5000);
        workspace.getStartButton().should('have.attr','disabled')
    })
    it('verify Stop button is enabled when data collection is started',()=>{//depends on previous test
        workspace.getStopButton().should('not.have.attr','disabled')
    })
    it('verify data collection is stopped when Stop button is clicked',()=>{
        workspace.getStopButton().click();
        workspace.getSaveDataButton().should('not.have.attr',"disabled")
        workspace.getNewRunButton().should('not.have.attr',"disabled")
        cy.matchImageSnapshot("stopped_graph")
    })
    it('verify graph rescale',()=>{
        workspace.getRescaleButton().click();
        workspace.getXAxisMaxValue().should('contain','5')
        cy.matchImageSnapshot('rescaled_graph')
    })
})