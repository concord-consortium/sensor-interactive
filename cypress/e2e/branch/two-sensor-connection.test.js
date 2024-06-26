import Workspace from "../../support/elements/workspace";

const workspace = new Workspace

context('Add second sensor',()=>{
    it('Add second sensor',()=>{
        // See cypress.json for viewport size
        cy.viewport(1400,1280)
        cy.visit('/examples/fake-sensor.html')
        workspace.getSensorTypeButton('Wired').click()
        workspace.getAddSensorButton().click();

        cy.log("sensor control panel")

        cy.log("verify status message shows connection")
        workspace.getStatusIcon().should('be.visible').and ('have.class','connected')
        workspace.getStatusMessage().should('contain','Fake Sensor connected')

        cy.log("verify Add Sensor button does not exist")
        workspace.getAddSensorButton().should('not.exist')

        cy.log("verify 2 different sensors are showing in sensor control")
        workspace.getSensorReading().should('have.length',2)
        workspace.getSensorDropdown().should('have.length', 2)

        cy.log("verify Remove sensor button is visible")
        workspace.getRemoveSensorButton().should('have.length', 2)

        // TODO: work on fake sensor code to show a value, so we
        // can verify both reading shows value

        cy.log("graph area")

        let sensor0='Temperature', sensor1='Position'

        cy.log("verify 2 graphs are visible")
        workspace.getGraphPanelBox().should('have.length',2)
        workspace.getRescaleButton().should('have.length',2)

        cy.log("verify time axis only appears once")
        workspace.getXAxisLabel().should('have.length',1)

        cy.log("verify legends matches dropdown order")
        workspace.getGraphLegend().find('.name').eq(0).should('contain', sensor0)
        workspace.getGraphLegend().find('.name').eq(1).should('contain', sensor1)

        cy.log("verify y axis label matches sensor order")
        workspace.getYAxisLabel().eq(0).should('contain', sensor0)
        workspace.getYAxisLabel().eq(1).should('contain', sensor1)

        cy.log("verify changing sensor in top dropdown changes sensor in bottom dropdown")
        //Can't verify using the dropdown text so verifying using the graph axis label which should
        //match the order
        workspace.selectSensor('102',0)
        workspace.getYAxisLabel().eq(0).should('contain', sensor1)
        workspace.getYAxisLabel().eq(1).should('contain', sensor0)

        cy.log("verify legend changes order when sensor order is switched")
        workspace.getGraphLegend().find('.name').eq(0).should('contain', sensor1)
        workspace.getGraphLegend().find('.name').eq(1).should('contain', sensor0)
    })

    it('Collecting Data from 2 sensor', ()=>{
        // See cypress.json for viewport size
        cy.viewport(1280,720)
        cy.visit('/examples/fake-sensor.html')
        workspace.getSensorTypeButton('Wired').click()
        workspace.getAddSensorButton().click();        

        cy.log("verify graph shows data")
        let duration="1";
        workspace.selectDuration(duration)
        workspace.getXAxisMaxValue().should('contain',duration)
        workspace.getStartButton().click();
        cy.wait(1000);
        cy.matchImageSnapshot(duration+"_2graph");

        cy.log("verify Reading container shows a reading")
        workspace.getSensorReading().should('have.length', 2).should('not.to.be.empty')

        cy.log("verify both graph is cleared when data is discarded")
        workspace.getNewRunButton().click();
        workspace.discardData();
        cy.wait(500)
        cy.matchImageSnapshot("cleared_2graph")
        workspace.selectDuration("30")
        workspace.getStartButton().click();
        cy.wait(5100);
        workspace.getStopButton().click();

        workspace.getNewRunButton().click()
        workspace.discardData()
    })
    it.skip('verify graph rescale happens to both graphs regardless of which rescale button is clicked',()=>{
        let duration="30";
        workspace.selectDuration(duration)
        workspace.getStartButton().click();
        cy.wait(5100);
        workspace.getStopButton().click();
        workspace.getRescaleButton().eq(1).click();
        workspace.getXAxisMaxValue().should('contain','5.0')
        cy.matchImageSnapshot('2rescaled_2graph')

        workspace.getNewRunButton().click();
        workspace.discardData();
        workspace.selectDuration(duration)
        workspace.getStartButton().click();
        cy.wait(5100);
        workspace.getStopButton().click();
        workspace.getRescaleButton().eq(0).click();
        workspace.getXAxisMaxValue().should('contain','5.0')
        cy.matchImageSnapshot('rescaled_2graph')
    })

    it('Remove sensor', ()=>{
        // See cypress.json for viewport size
        cy.viewport(1400,1280)
        cy.visit('/examples/fake-sensor.html')
        workspace.getSensorTypeButton('Wired').click()
        workspace.getAddSensorButton().click();        

        // Flip the order of the sensors
        workspace.selectSensor('102',0)

        cy.log("verify remove second sensor")
        workspace.getRemoveSensorButton().eq(1).click();
        workspace.getStatusMessage().should('contain','Fake Sensor connected.')
        workspace.getSensorDropdown().should('have.length',1)
        workspace.getAddSensorButton().should('be.visible')
        workspace.getGraphPanelBox().should('have.length',1)
        workspace.getYAxisLabel().should('contain', 'Position (m)')
        workspace.getGraphLegend().should('contain','Position')

        cy.log("verify remove first sensor")
        //add second sensor back in
        workspace.getAddSensorButton().click();
        workspace.getSensorDropdown().should('have.length',2)

        workspace.getRemoveSensorButton().eq(0).click();
        workspace.getSensorDropdown().should('have.length',1)
        workspace.getAddSensorButton().should('be.visible')
        workspace.getGraphPanelBox().should('have.length',1)
        workspace.getYAxisLabel().should('contain', 'Temperature')
        workspace.getGraphLegend().should('contain','Temperature')

        cy.log("verify remove all sensors")
        workspace.getRemoveSensorButton().eq(0).click();
        workspace.getSensorDropdown().should('not.exist')
        workspace.getSensorTypeButton('Wired').should('be.visible')
        workspace.getSensorTypeButton('Wireless').should('be.visible')
        workspace.getGraphPanelBox().should('have.length',1)
        workspace.getYAxisLabel().should('contain', 'Temperature')
        workspace.getGraphLegend().should('contain','Temperature')
    })
})
