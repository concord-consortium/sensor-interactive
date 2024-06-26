import Workspace from "../../support/elements/workspace";

const workspace = new Workspace

context('Connection UI',()=>{
    beforeEach(()=>{
        // See cypress.json for viewport size
        cy.viewport(1400,1280)
        cy.visit('')
    })
    // This causes a dialog to come up which can't be dismissed
    describe.skip('Wired with SensorConnector',()=>{
        it('verify SensorConnector launch',()=>{
            // cy.stub('window:alert',)
            // cy.window().then(($window)=>{
            // cy.stub($window, 'alert').returns(false)
            //     workspace.getSensorTypeButton('Wired').click()
            // })
            cy.on('window:alert',(text)=>{
                // FIXME: how could this work without a stub? There will be no sensor connector running
                // in a test environment????
                expect(text).to.contain('sensor connector is running')
            })
            workspace.getSensorTypeButton('Wired').click();

            cy.log("verify ui when sensor is not connected") //depends on previous test
            workspace.getStatusIcon().should('be.visible').and('not.have.attr','connected')
            workspace.getStatusMessage().should('contain','No').and('contain','connected')
        })
    })

    //TODO need to figure out how to NOT launch SensorConnector.
    //As currently written, The Open SensorConnector javascript alert defaults to opening the 
    //the SensorConnector even though window:confirm is set to false.
    // May be the wrong window type, of the stub is not written correctly
    describe.skip('Wired with no SensorConnector',()=>{
        before(()=>{
            workspace.getReloadButton().click();
        })
        it('verify SensorConnector dialog comes up when Wired sensor type button is clicked but not connected',()=>{
            cy.on('window:confirm',(str)=>{
                return false
            })
            cy.window().then((window)=>{
            window.confirm("Open SensorConnector")
                workspace.getSensorTypeButton('Wired').click()
            })
            cy.wait(15000)
           workspace.getDialogHeader().contains('Warning').should('be.visible')
           workspace.dismissDialog();
        })
        it('verify ui when sensor is not connected',()=>{ //depends on previous test
            workspace.getStatusIcon().should('be.visible').and('not.have.attr','connected')
            workspace.getStatusMessage().should('contain','SensorConnector not responding')
        })
    })
    describe('Wireless',()=>{
        it('Wireless',()=>{
            workspace.getReloadButton().click();

            cy.log("verify Wireless dialog comes up")
            // In a normal browser this will cause a browser dialog to come up
            // It seems in Cypress this dialog is bypassed
            workspace.getSensorTypeButton('Wireless').click()

            cy.log("verify ui when sensor is not connected") //depends on previous test
            workspace.getStatusIcon().should('be.visible').and('not.have.attr','connected')
            workspace.getStatusMessage().should('contain','No').and('contain','connected')
        })
    })
})

context('Graph controls',()=>{
    beforeEach(()=>{
        // See cypress.json for viewport size
        cy.viewport(1400,1280)
    })
    it ('shows Start, Stop, and New Run buttons for a line graph', ()=> {
      cy.visit('/examples/fake-sensor.html')
      workspace.getBottomControlPanel().should('be.visible')
      workspace.getStartButton().should('be.visible')
      workspace.getRecordButton().should('not.exist')
      workspace.getStopButton().should('be.visible')
      workspace.getNewRunButton().should('be.visible')
    })
    it ('shows Record and New Run buttons for a single-read bar graph', ()=> {
      cy.visit('/examples/fake-sensor-bar-prerecorded-ondemand.html')
      workspace.getBottomControlPanel().should('be.visible')
      workspace.getStartButton().should('not.exist')
      workspace.getStopButton().should('not.exist')
      workspace.getRecordButton().should('be.visible')
      workspace.getNewRunButton().should('be.visible')
    })
})
