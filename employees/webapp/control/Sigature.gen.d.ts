import { CSSSize } from "sap/ui/core/library";
import { CSSColor } from "sap/ui/core/library";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $ControlSettings } from "sap/ui/core/Control";

declare module "./Signature" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $SigatureSettings extends $ControlSettings {
        width?: CSSSize | PropertyBindingInfo | `{${string}}`;
        height?: CSSSize | PropertyBindingInfo | `{${string}}`;
        backgroundColor?: CSSColor | PropertyBindingInfo | `{${string}}`;
    }

    export default interface Sigature {

        // property: width

        /**
         * Gets current value of property "width".
         *
         * Default value is: "300px"
         * @returns Value of property "width"
         */
        getWidth(): CSSSize;

        /**
         * Sets a new value for property "width".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: "300px"
         * @param [width="300px"] New value for property "width"
         * @returns Reference to "this" in order to allow method chaining
         */
        setWidth(width: CSSSize): this;

        // property: height

        /**
         * Gets current value of property "height".
         *
         * Default value is: "150px"
         * @returns Value of property "height"
         */
        getHeight(): CSSSize;

        /**
         * Sets a new value for property "height".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: "150px"
         * @param [height="150px"] New value for property "height"
         * @returns Reference to "this" in order to allow method chaining
         */
        setHeight(height: CSSSize): this;

        // property: backgroundColor

        /**
         * Gets current value of property "backgroundColor".
         *
         * Default value is: "white"
         * @returns Value of property "backgroundColor"
         */
        getBackgroundColor(): CSSColor;

        /**
         * Sets a new value for property "backgroundColor".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: "white"
         * @param [backgroundColor="white"] New value for property "backgroundColor"
         * @returns Reference to "this" in order to allow method chaining
         */
        setBackgroundColor(backgroundColor: CSSColor): this;
    }
}
