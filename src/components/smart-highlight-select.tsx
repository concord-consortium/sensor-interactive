/*
 * This component is a very thin wrapper around a standard <select> designed to prevent
 * extraneous focus highlighting added by browsers when clicking on a button while
 * maintaining keyboard accessibility. For details, see
 * https://www.paciellogroup.com/blog/2012/04/how-to-remove-css-outlines-in-an-accessible-manner/
 */
import * as React from "react";
import SmartFocusHighlight from "../utils/smart-focus-highlight";

interface ISmartHighlightSelectProps {
  className:string;
  [key:string]:any;
}

interface ISmartHighlightSelectState {}

export default class SmartHighlightSelect extends React.Component<
                                                    ISmartHighlightSelectProps,
                                                    ISmartHighlightSelectState> {
  private elementRef:any;

  // prevent extraneous focus highlight on click while maintaining keyboard accessibility
  // see https://www.paciellogroup.com/blog/2012/04/how-to-remove-css-outlines-in-an-accessible-manner/
  suppressFocusHighlight = () => {
    SmartFocusHighlight.suppressFocusHighlight(this.elementRef);
  }

  render() {
    const { className, ...others } = this.props,
          classes = (className ? className + ' ' : '') +
                      SmartFocusHighlight.kSmartFocusHighlightClass;
    return (
      <select className={classes} {...others}
              ref={(elt) => this.elementRef = elt}
              onMouseEnter={this.suppressFocusHighlight}
              onMouseDown={this.suppressFocusHighlight}>
        {this.props.children}
      </select>
    );
  }
}
