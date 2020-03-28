import { createYield } from "typescript"

class Workspace{
    getStatusMessage(){
        return cy.get('.status-message')
    }
    getStatusIcon(){
        return cy.get('.wireless-status-icon')
    }
    getConnectMessage(){
        return cy.get('.connect-message')
    }
    getSensorTypeButton(type){ //type=['Wireless','Wired']
        return cy.get('.connect-to-device-button').contains(type+' Sensor')
    }
    getReloadButton(){
        return cy.get('.icon.reload')
    }
    getBottomControlPanel(){
        return cy.get('.control-panel')
    }
    selectDuration(time){//time=[1,5,10,15,20,30,45,60,300,600,900,1200,1800]
        cy.get('.duration-select').select(time)
    }
    getStartButton(){
        return cy.get('.start-sensor')
    }
    getStopButton(){
        return cy.get('.stop-sensor')
    }
    getSaveDataButton(){
        return cy.get('.send-data')
    }
    getNewRunButton(){
        return cy.get('.new-data')
    }
    getRescaleButton(){
        return cy.get('.graph-rescale-button')
    }
    getGraphPanel(){
        return cy.get('.graph-box')
    }

    // Launch SensorConnector dialog
    getDialogHeader(){
        return cy.get('.sensor-dialog-header')
    }
    launchSensorConnector(){
        cy.get('.sensor-dialog-buttons').contains('Launch SensorConnector').click();
    }
    dismissDialog(){
        cy.get('.sensor-dialog-buttons').contains('Dismiss').click();
    }

    //Connected sensor ui
    selectSensor(sensor){//sensor value is a number string
        cy.get('.sensor-select').select(sensor)
    }
    getSensorReading(){
        return cy.get('.sensor-reading')
    }
    getZeroSensorButton(){
        return cy.get('.zero-button')
    }
    getRemoveSensorButton(){
        return cy.get('.remove-sensor-button')
    }

}
export default Workspace