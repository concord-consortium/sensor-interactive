// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import {addMatchImageSnapshotCommand} from '@simonsmith/cypress-image-snapshot/command'
import 'cypress-commands';

addMatchImageSnapshotCommand({ //need to fine tune thresholds
    comparisonMethod: 'ssim', // Look at structural differences instead of pixels
    failureThreshold: 0.02, // up to 2% difference is allowed
    failureThresholdType: 'percent', // percent of image or number of pixels
    capture: 'viewport', // capture viewport in screenshot
    allowSizeMismatch: true,
})

// On a Mac with display scaling, the screenshots are twice as big as they
// should be when Chrome is running in headed mode (interactive Cypress)
// So we skip the screenshots in this case.
// https://github.com/cypress-io/cypress/issues/6485
//
// Note that as of Cypress 13.12.0 Electron running on a mac uses double the 
// resolution even in headless mode. So Chrome must be used for these tets.
//
// Note that the browser size limits the size of the snapshot. So even if 
// you use cy.viewport to set the viewport larger, the snapshot size is 
// limited. The Chrome size is current set in cypress.config.ts

// Cypress.Commands.overwrite(
//   'screenshot',
//   (originalFn, subject, name, options) => {
//     // only take screenshots in headless browser
//     if (Cypress.browser.isHeadless) {
//       // return the original screenshot function
//       return originalFn(subject, name, options)
//     }

//     return cy.log('No screenshot taken when headed')
//   }
// )

// We pass the ENV variable failOnSnapshotDiff=false so that
// matchImageSnapshot is disabled. We could also disable it
// with thi overwrite:
// 
// Cypress.Commands.overwrite(
//   'matchImageSnapshot',
//   (originalFn, subject, name, options) => {
//     // only match snapshots in headless browser
//     if (Cypress.browser.isHeadless) {
//       // return the original screenshot function
//       return originalFn(subject, name, options)
//     }

//     return cy.log('Snapshots not matched when headed')
//   }
// )

