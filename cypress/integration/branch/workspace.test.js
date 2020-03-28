import Workspace from "../../support/elements/workspace";

const workspace = new Workspace

before(()=>{
    cy.visit('')
})
context('Connection UI',()=>{
    describe('Wired with SensorConnector',()=>{
        it('verify SensorConnector launch',()=>{
            // cy.stub('window:alert',)
            // cy.window().then(($window)=>{
            // cy.stub($window, 'alert').returns(false)
            //     workspace.getSensorTypeButton('Wired').click()
            // })
            cy.on('window:alert',(text)=>{
                expect(text).to.contain('sensor connector is running')
            })
            workspace.getSensorTypeButton('Wired').click();
        })
       it('verify ui when sensor is not connected',()=>{ //depends on previous test
            workspace.getStatusIcon().should('be.visible').and('not.have.attr','connected')
            workspace.getStatusMessage().should('contain','No devices connected')
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
    describe('Wireless with no SensorConnector',()=>{
        before(()=>{
            workspace.getReloadButton().click();
        })
        it('verify SensorConnector dialog comes up when Wired sensor type button is clicked but not connected',()=>{
            cy.window().then(($window)=>{
            cy.stub($window, 'confirm').returns(false)
                workspace.getSensorTypeButton('Wireless').click()
            })
        })
        it('verify ui when sensor is not connected',()=>{ //depends on previous test
            workspace.getStatusIcon().should('be.visible').and('not.have.attr','connected')
            workspace.getStatusMessage().should('contain','No devices connected')
        })
    })
})