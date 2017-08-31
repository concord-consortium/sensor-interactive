/*
 * This component is a very thin wrapper around a standard button designed to prevent
 * extraneous focus highlighting added by browsers when clicking on a button while
 * maintaining keyboard accessibility. See
 * https://www.paciellogroup.com/blog/2012/04/how-to-remove-css-outlines-in-an-accessible-manner/
 * for details. The upshot is that we use mouse events on the button to disable the
 * focus highlight -- mousing/clicking on a push button should not be used as an
 * indicator that the user would like to keyboard-interact with that button, which
 * is what focusing a clicked button implies.
 * IMPORTANT: To maintain accessibility, there must be code somewhere to reenable
 * the focus highlight when appropriate. This can be done for 'keydown' by calling
 * enableButtonFocusHighlightOnKeyDown() during application/page initialization,
 * or by adding your own event handler that calls enableButtonFocusHighlight().
 */

export default class SmartFocusHighlight {

  // add to all elements to enable smart focus highlight functionality
  static kSmartFocusHighlightClass = 'smart-focus-highlight';
  // added to elements when appropriate to disable focus highlight
  static kDisableFocusHighlightClass = 'disable-focus-highlight';
  
  // Installs a keydown handler on the document which will enable button focus highlighting.
  // Should be called once during application initialization.
  static enableFocusHighlightOnKeyDown() {
    document.addEventListener('keydown', () => this.enableFocusHighlight());
  }

  // Enables button focus highlighting; designed to be called from the keydown handler above
  // but available separately for implementations that require it.
  static enableFocusHighlight() {
    const controls = document.querySelectorAll(`.${this.kSmartFocusHighlightClass}`),
          count = controls.length;
    // cf. https://developer.mozilla.org/en-US/docs/Web/API/NodeList#Example
    for (let i = 0; i < count; ++i) {
      const control = controls[i];
      if (control && control.className) {
        // cf. http://stackoverflow.com/questions/195951/change-an-elements-class-with-javascript
        control.className = control.className.replace(/(?:^|\s)no-focus-highlight(?!\S)/g , '');
      }
    }
  }

  // prevent extraneous focus highlight on click while maintaining keyboard accessibility
  // see https://www.paciellogroup.com/blog/2012/04/how-to-remove-css-outlines-in-an-accessible-manner/
  static suppressFocusHighlight(elt:HTMLElement) {
    if (elt && elt.className.indexOf(this.kDisableFocusHighlightClass) < 0)
      elt.className += ' ' + this.kDisableFocusHighlightClass;
  }
}
