/**
* A Button Widget
*
* @module button
* @since 3.5.0
*/

var CLASS_NAMES = Y.ButtonCore.CLASS_NAMES,
    ARIA_STATES = Y.ButtonCore.ARIA_STATES,
    ARIA_ROLES  = Y.ButtonCore.ARIA_ROLES;

/**
* Creates a ButtonWidget
*
* @class ButtonWidget
* @extends Widget
* @param config {Object} Configuration object
* @constructor
*/
function ButtonWidget(config) {
    ButtonWidget.superclass.constructor.apply(this, arguments);
}

/* ButtonWidget extends Widget */
Y.extend(ButtonWidget, Y.Widget,  {

    BOUNDING_TEMPLATE: Y.ButtonCore.prototype.TEMPLATE,

    CONTENT_TEMPLATE: null,

    /**
    * @method initializer
    * @description Internal init() handler.
    * @param config {Object} Config object.
    * @private
    */
    initializer: function(config) {
        this._host = this.get('boundingBox');
    },

    /**
     * bindUI implementation
     *
     * @description Hooks up events for the widget
     * @method bindUI
     */
    bindUI: function() {
        var button = this;
        button.after('labelChange', button._afterLabelChange);
        button.after('disabledChange', button._afterDisabledChange);
    },

    /**
     * @method syncUI
     * @description Updates button attributes
     */
    syncUI: function() {
        var button = this;
        button._uiSetLabel(button.get('label'));
        button._uiSetDisabled(button.get('disabled'));
    },

    /**
    * @method _afterLabelChange
    * @private
    */
    _afterLabelChange: function(e) {
        this._uiSetLabel(e.newVal);
    },

    /**
    * @method _afterDisabledChange
    * @private
    */
    _afterDisabledChange: function(e) {
        this._uiSetDisabled(e.newVal);
    }

}, {
    // Y.Button static properties

    /**
     * The identity of the widget.
     *
     * @property NAME
     * @type String
     * @default 'button'
     * @readOnly
     * @protected
     * @static
     */
    NAME: 'button',

    /**
    * Static property used to define the default attribute configuration of
    * the Widget.
    *
    * @property ATTRS
    * @type {Object}
    * @protected
    * @static
    */
    ATTRS: {
        label: {
            value: Y.ButtonCore.ATTRS.label.value
        },

        disabled: {
            value: false
        }
    },

    /**
    * @property HTML_PARSER
    * @type {Object}
    * @protected
    * @static
    */
    HTML_PARSER: {
        label: function(node) {
            this._host = node; // TODO: remove
            return this._getLabel();
        },

        disabled: function(node) {
            return node.getDOMNode().disabled;
        }
    },

    /**
     * List of class names used in the ButtonGroup's DOM
     *
     * @property CLASS_NAMES
     * @type Object
     * @static
     */
    CLASS_NAMES: CLASS_NAMES
});

Y.mix(ButtonWidget.prototype, Y.ButtonCore.prototype);

/**
* Creates a ToggleButton
*
* @class ToggleButton
* @extends ButtonWidget
* @param config {Object} Configuration object
* @constructor
*/
function ToggleButton(config) {
    ButtonWidget.superclass.constructor.apply(this, arguments);
}

// TODO: move to ButtonCore subclass to enable toggle plugin, widget, etc.
/* ToggleButton extends ButtonWidget */
Y.extend(ToggleButton, ButtonWidget,  {
    
    trigger: 'click',
    selectedAttrName: '',
    
    initializer: function (config) {
        var button = this,
            type = button.get('type'),
            selectedAttrName = (type === "checkbox" ? 'checked' : 'pressed'),
            selectedState = config[selectedAttrName] || false;
        
        // Create the checked/pressed attribute
        button.addAttr(selectedAttrName, {
            value: selectedState
        });
        
        button.selectedAttrName = selectedAttrName;
    },
    
    destructor: function () {
        delete this.selectedAttrName;
    },
    
    /**
     * @method bindUI
     * @description Hooks up events for the widget
     */
    bindUI: function() {
         var button = this,
             cb = button.get('contentBox');
        
        ToggleButton.superclass.bindUI.call(button);
        
        cb.on(button.trigger, button.toggle, button);
        button.after(button.selectedAttrName + 'Change', button._afterSelectedChange);
    },

    /**
     * @method bindUI
     * @description Syncs the UI for the widget
     */
    syncUI: function() {
        var button = this,
            cb = button.get('contentBox'),
            type = button.get('type'),
            ROLES = ToggleButton.ARIA_ROLES,
            role = (type === 'checkbox' ? ROLES.CHECKBOX : ROLES.TOGGLE),
            selectedAttrName = button.selectedAttrName;

        ToggleButton.superclass.syncUI.call(button);
        
        cb.set('role', role);
        button._uiSetSelected(button.get(selectedAttrName));
    },
    
    _afterSelectedChange: function(e){
        this._uiSetSelected(e.newVal);
    },
    
    /**
    * @method _uiSetSelected
    * @private
    */
    _uiSetSelected: function(value) {
        var button = this,
            cb = button.get('contentBox'),
            STATES = ToggleButton.ARIA_STATES,
            type = button.get('type'),
            ariaState = (type === 'checkbox' ? STATES.CHECKED : STATES.PRESSED);
        
        cb.toggleClass(ButtonWidget.CLASS_NAMES.SELECTED, value);
        cb.set(ariaState, value);
    },
    
    /**
    * @method toggle
    * @description Toggles the selected/pressed/checked state of a ToggleButton
    * @public
    */
    toggle: function() {
        var button = this;
        button._set(button.selectedAttrName, !button.get(button.selectedAttrName));
    }

}, {
    
    /**
    * The identity of the widget.
    *
    * @property NAME
    * @type {String}
    * @default 'buttongroup'
    * @readOnly
    * @protected
    * @static
    */
    NAME: 'toggleButton',
    
    /**
    * Static property used to define the default attribute configuration of
    * the Widget.
    *
    * @property ATTRS
    * @type {Object}
    * @protected
    * @static
    */
    ATTRS: {
        type: {
            value: 'toggle',
            writeOnce: 'initOnly'
        }
    },
    
    /**
    * @property HTML_PARSER
    * @type {Object}
    * @protected
    * @static
    */
    HTML_PARSER: {
        checked: function(node) {
            return node.hasClass(CLASS_NAMES.SELECTED);
        },
        pressed: function(node) {
            return node.hasClass(CLASS_NAMES.SELECTED);
        }
    },
    
    /**
    * @property ARIA_STATES
    * @type {Object}
    * @protected
    * @static
    */
    ARIA_STATES: ARIA_STATES,

    /**
    * @property ARIA_ROLES
    * @type {Object}
    * @protected
    * @static
    */
    ARIA_ROLES: ARIA_ROLES,

    /**
     * List of class names used in the ButtonGroup's DOM
     *
     * @property CLASS_NAMES
     * @type Object
     * @static
     */
    CLASS_NAMES: CLASS_NAMES
    
});

// Export
Y.Button = ButtonWidget;
Y.ToggleButton = ToggleButton;
