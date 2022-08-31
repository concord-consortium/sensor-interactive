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
    getRecordButton(){
        return cy.get('.record-sensor')
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

    //Sensor Interactive dialogs
    getDialogHeader(){
        return cy.get('.sensor-dialog-header')
    }
    getDialogButtons(){
        return cy.get('.sensor-dialog-buttons')
    }
    // Launch SensorConnector dialog
    launchSensorConnector(){
        cy.get('.sensor-dialog-buttons').contains('Launch SensorConnector').click();
    }
    dismissDialog(){
        cy.get('.sensor-dialog-buttons').contains('Dismiss').click();
    }
    //New Run Warning dialog
    preserveData(){
        cy.get('.sensor-dialog-buttons').contains('Preserve Data').click();
    }
    discardData(){
        cy.get('.sensor-dialog-buttons').contains('Discard Data').click();
    }

    //Connected sensor ui
    getSensorDropdown(){
        return cy.get('.sensor-select')
    }
    selectSensor(sensor, position=0){//sensor value is a number string
        this.getSensorDropdown().eq(position).select(sensor)
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
    getAddSensorButton(){
        return cy.get('.add-sensor-button')
    }

    //graph
    getRescaleButton(){
        return cy.get('.graph-rescale-button')
    }
    getGraphPanel(){
        return cy.get('.graph-box')
    }
    getYAxisLabel(){
        return cy.get('.dygraph-ylabel')
    }
    getXAxisLabel(){
        return cy.get('.dygraph-xlabel')
    }
    getGraphLegend(){
        return cy.get('.bottom-legend')
    }
    getXAxisMaxValue(){
        return cy.get('.dygraph-axis-label-x').last()
    }
}
export default Workspace