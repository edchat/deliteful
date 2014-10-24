/** @module deliteful/TextBox */
define([
	"dcl/dcl",
	"delite/register",
	"delite/FormValueWidget",
	"delite/handlebars!./TextBox/TextBox.html",
	"delite/theme!./TextBox/themes/{{theme}}/TextBox.css",
	"delite/activationTracker"
], function (dcl, register, FormValueWidget, template) {

	//var labelClickHandler;

	/**
	 * A form-aware widget similar to an HTML5 input type="text" element.
	 * @example
	 * <d-text-box></d-text-box>
	 * @class module:deliteful/TextBox
	 * @augments module:delite/FormValueWidget
	 */
	return register("d-text-box", [HTMLElement, FormValueWidget], /** @lends module:deliteful/TextBox# */ {

		/**
		 * The component css base class.
		 * @member {string}
		 * @default "d-text-box"
		 */
		baseClass: "d-text-box",

		template: template,

		/**
		 * If `true`, the user must fill in a value for the TextBox in order to pass validation unless
		 * the TextBox is `disabled`.  An empty TextBox with required "true" will not fail validation if
		 * disabled is "true".
		 * @member {boolean} module:deliteful/TextBox#required
		 * @default false
		 */
		required: false,

		// Old comments from dijit TODO: cleanup these comments
		// displayedValue: String
		//		For subclasses like ComboBox where the displayed value
		//		(ex: Kentucky) and the serialized value (ex: KY) are different,
		//		this represents the displayed value.
		//
		//		Setting "displayedValue" through set("displayedValue", ...)
		//		updates "value", and vice-versa.  Otherwise "value" is updated
		//		from "displayedValue" periodically, like onBlur etc.
		//
		//		TODO: move declaration to MappedTextBox?
		//		Problem is that ComboBox references displayedValue,
		//		for benefit of FilteringSelect.
		/**
		 * displayedValue matches the value of the valueNode (html of the widget.  It will hold the formatted value,
		 * if a format function is set.
		 *
		 * @member {boolean} module:deliteful/TextBox#required
		 * @default ""
		 */
		displayedValue: "",

		/**
		 * The type corresponding to the HTML input type. Other valid types are "password", "email", "tel",
		 * "search", "url"
		 * @member {string}
		 * @default "text"
		 */
		type: "text",

		/**
		 * The pattern corresponding to the HTML input pattern. It is a regular expression that the value
		 * of the TextBox is checked against.
		 * @member {string}
		 * @default ""
		 */
		pattern: "",

		/**
		 * The title corresponding to the HTML input title. It is used to describe the pattern to help the user
		 * if the value is invalid.
		 * TODO: I was not able to have title here, titlex is temporary until I figure out why!
		 * @member {string}
		 * @default ""
		 */
		titlex: "",
		//title: "", // having problems getting title passed back as prop, not sure why?

		/**
		 * The maxlength corresponding to the HTML input maxlength.
		 * If the value of the type attribute is text, email, search, password, tel, or url, this attribute specifies
		 * the maximum number of characters (in Unicode code points) that the user can enter.
		 * @member {number}
		 * @default 524288
		 */
		maxlength: 524288,

		/**
		 * Removes leading and trailing whitespace if true.
		 * @member {boolean}
		 * @default false
		 */
		trim: false,

		/**
		 * Converts all characters to uppercase if true.
		 * @member {boolean}
		 * @default false
		 */
		uppercase: false,

		/**
		 * Converts all characters to lowercase if true.
		 * @member {boolean}
		 * @default false
		 */
		lowercase: false,

		/**
		 * Converts the first character of each word to uppercase if true.
		 * @member {boolean}
		 * @default false
		 */
		propercase: false,

		/**
		 * If true, all text will be selected when focused with mouse.
		 * @member {boolean}
		 * @default false
		 */
		selectInputText: false,



		postRender: function () { // from delite/FormValueWidget, problem with using this.value?
			this.on("delite-activated", function () {
				// Called when user may be about to start input.
				// Saves the widget's current value, which is the most recent of:
				//
				//	1. the original value set on widget construction
				//	2. the value the user set when he previously used the widget
				//	3. the value the application set programatically
				//
				// This is all to avoid firing unnecessary change/input events in the corner case where the
				// user just selects and releases the Slider handle for example.
				this.on("click", this._inputClickHandler.bind(this), this.focusNode);
				this.on("change", this._inputChangeHandler.bind(this), this.focusNode);
			});
		},

		format: function (value) {
			// summary:
			//		Replaceable function to convert a value to a properly formatted string.
			// value: String
			// tags:
			//		protected extension
			return value == null /* or undefined */ ? "" : (value.toString ? value.toString() : value);
		},

		_getValueAttr: function () {
			// summary:
			//		Hook so get("value") works as we like.
			// description:
			//		For `deliteful/TextBox` this basically returns the value of the `<input>`.
			//
			if (this.focusNode) {
				var parsedValue = this.parse(this.displayedValue);
				//console.log("in TextBox " + this.id + ":_getValueAttr with value=", this.focusNode.value+
				// " parsedValue="+parsedValue);
				return parsedValue;
			} else {
				return "";
			}
		},

		//TODO: NOTE if trying to use is="TextBox" to enhance an input type=text I heard this will not be called...
		_setValueAttr: function (value) {
			var formattedValue;
			if (value !== undefined) {
				//formattedValue = this.format(value); // temp test
				// TODO: this is calling filter() on both the display value and the actual value.
				// I added a comment to the filter() definition about this, but it should be changed.
				var filteredValue = this.filter(value);
				if (typeof formattedValue !== "string") {
					if (filteredValue !== null && ((typeof filteredValue !== "number") || !isNaN(filteredValue))) {
						formattedValue = this.filter(this.format(filteredValue, this.constraints));
					} else {
						formattedValue = "";
					}
				}
			}
			if (formattedValue !== null /* and !undefined */ && ((typeof formattedValue) !== "number" ||
				!isNaN(formattedValue)) && this.focusNode.value !== formattedValue) {
				this.focusNode.value = formattedValue;
				this._set("displayedValue", this.displayedValue);
			}
		},

		_getDisplayedValueAttr: function () {
			// summary:
			//		Hook so get("displayedValue") works.
			// description:
			//		Returns the displayed value (what the user sees on the screen),
			//		after filtering (ie, trimming spaces etc.).
			//
			//		For some subclasses of TextBox (like ComboBox), the displayed value
			//		is different from the serialized value that's actually
			//		sent to the server (see `dijit/form/ValidationTextBox.serialize()`)

			// TODO: maybe we should update this.displayedValue on every keystroke so that we don't need
			// this method
			// TODO: this isn't really the displayed value when the user is typing
			return this.filter(this.focusNode.value);
		},

		_setDisplayedValueAttr: function (/*String*/ value) {
			// summary:
			//		Hook so set("displayedValue", ...) works.
			// description:
			//		Sets the value of the visual element to the string "value".
			//		The widget value is also set to a corresponding,
			//		but not necessarily the same, value.

			if (value == null /* or undefined */) {
				value = "";
			}
			else if (typeof value !== "string") {
				value = String(value);
			}

			this.focusNode.value = value;

			// sets the serialized value to something corresponding to specified displayedValue
			// (if possible), and also updates the textbox.value, for example converting "123"
			// to "123.00"
			this._setValueAttr(this.get("value"), undefined);

			this._set("displayedValue", this.get("displayedValue"));
		},

		parse: function (value) {
			// summary:
			//		Replaceable function to convert a formatted string to a value
			// value: String
			// tags:
			//		protected extension
			return value;	// String
		},

		_blankValue: "", // if the textbox is blank, what value should be reported
		filter: function (val) {
			// summary:
			//		Auto-corrections (such as trimming) that are applied to textbox
			//		value on blur or form submit.
			// description:
			//		For MappedTextBox subclasses, this is called twice
			//
			//		- once with the display value
			//		- once the value as set/returned by set("value", ...)
			//
			//		and get("value"), ex: a Number for NumberTextBox.
			//
			//		In the latter case it does corrections like converting null to NaN.  In
			//		the former case the NumberTextBox.filter() method calls this.inherited()
			//		to execute standard trimming code in TextBox.filter().
			//
			//		TODO: break this into two methods in 2.0
			//
			// tags:
			//		protected extension
			if (val === null) {
				return this._blankValue;
			}
			if (typeof val !== "string") {
				return val;
			}
			if (this.trim) {
				val = val.trim();
			}
			if (this.uppercase) {
				val = val.toUpperCase();
			}
			if (this.lowercase) {
				val = val.toLowerCase();
			}
			if (this.propercase) {
				val = val.replace(/[^\s]+/g, function (word) {
					return word.substring(0, 1).toUpperCase() + word.substring(1);
				});
			}
			return val;
		},

		_inputClickHandler: function () {
			if (this.selectInputText) {
				this.focusNode.select();
			}
		},

		_inputChangeHandler: function () {
			this.value = this.focusNode.value;
		},

		//checkValidity: function () {
		//	return this.focusNode.checkValidity; // currently not being called, the focusNode is being called
		//},

		refreshRendering: function (props) {
			if ("required" in props) {
				var required = this.required;
				if (this.valueNode && this.valueNode !== this) {
					this.valueNode.required = required; // inform screen reader
				}
			}
			if ("pattern" in props) {
				var pattern = this.pattern;
				if (this.valueNode && this.valueNode !== this) {
					this.valueNode.pattern = pattern; // put the pattern on the input
				}
			}
			/**/
			if ("titlex" in props) { //TODO: I am having a problem getting the title attr in the props
				var title = this.titlex;
				if (this.valueNode && this.valueNode !== this) {
					this.valueNode.title = title; // put the title on the input
					this.removeAttribute("title"); // remove the title from the textbox wrapper
				}
				if (!title) {
					this.removeAttribute("titlex");
				}
			}
			/**/
			if ("type" in props) {
				var type = this.type;
				if (this.valueNode && this.valueNode !== this) {
					this.valueNode.type = type; // put the type on the input
					this.removeAttribute("type"); // remove the type from the textbox wrapper
				}
				if (!type) {
					this.removeAttribute("type");
				}
			}
			if ("maxlength" in props) {
				var maxlength = this.maxlength;
				if (this.valueNode && this.valueNode !== this) {
					this.valueNode.maxlength = maxlength; // put the maxlength on the input
				}
			}
			/* should name be on the TextBox or on the valueNode (input)?
			if ("name" in props) {
				var name = this.name;
				if (this.valueNode && this.valueNode !== this) {
					this.valueNode.name = name; // put the name on the input
					this.removeAttribute("name"); // remove the name from the textbox wrapper
				}
				if (!name) {
					this.removeAttribute("name");
				}
			}
			*/
		}//,

		//computeProperties: function (props) { // thought this might help with getting title set, but it did not
		//	if ("title" in props || "label" in props) {
		//		this.title = this.title || this.label || "";
		//	}
		//}
	});
});