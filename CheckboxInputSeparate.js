/** @module deliteful/Checkbox */
define([
	"dcl/dcl",
	"delite/register",
	"delite/FormWidget",
	"./Toggle",
	"delite/handlebars!./Checkbox/Checkbox.html",
	"delite/theme!./Checkbox/themes/{{theme}}/Checkbox.css"
], function (dcl, register, FormWidget, Toggle, template) { //

	var labelClickHandler;

	/**
	 * A 2-state checkbox widget similar to an HTML5 input type="checkbox" element.
	 * @example
	 * <d-checkbox checked="true"></d-checkbox>
	 * @class module:deliteful/Checkbox
	 * @augments module:delite/FormWidget
	 * @augments module:deliteful/Toggle
	 */
	return register("d-checkbox", [HTMLElement, FormWidget, Toggle], /** @lends module:deliteful/Checkbox# */ {

		/**
		 * The component css base class.
		 * @member {string}
		 * @default "d-checkbox"
		 */
		baseClass: "d-checkbox",

		template: template,

/*		render: register.superCall(function (sup) {
			return function () {
				var test = this.querySelector("input");
				this.valueNode = this.querySelector("input") || this.ownerDocument.createElement("input");
				if(this.getAttribute("name")){
					this.valueNode.setAttribute("name", this.getAttribute("name"));
					this.removeAttribute("name"); // remove the name from the textbox wrapper
				}
				this.valueNode.setAttribute("type", "checkbox");
				this.valueNode.setAttribute("role", "checkbox");
				console.log("in render for this.id["+this.id+"] this.valueNode.checked=["+this.valueNode.checked+"]");
				this.checked = this.valueNode.checked;
				sup.call(this);
				this.appendChild(this.valueNode);
				this.focusNode = this.valueNode;
			//	this.value = this.value; // filter value
			//	this.handleMin.setAttribute("aria-valuemin", this.min); // from Slider
			//	this.focusNode.setAttribute("aria-valuemax", this.max);
			//	this.tabStops = "handleMin,focusNode";
			//	this.handleMin._isActive = true;
			};
		}),
*/
		postRender: function () {
			this._lbl4 = null;
			this.on("click", this._inputClickHandler.bind(this), this.focusNode);
			this.on("change", this._inputClickHandler.bind(this), this.focusNode);
		},

		_inputClickHandler: function () {
			this.checked = this.focusNode.checked;
//			this.value = this.focusNode.checked ? "on" : "off";
		},

		attachedCallback: function () {
			// The fact that deliteful/Checkbox is not an HTMLInputElement seems not being compatible with the default
			// "<label for" behavior of the browser. So it needs to explicitly listen to click on associated
			// <label for=...> elements.
			if (!labelClickHandler) {
				// set a global listener that listens to click events on label elt
				labelClickHandler = function (e) {
					var forId;
					if (/label/i.test(e.target.tagName) && (forId = e.target.getAttribute("for"))) {
						var elt = document.getElementById(forId);
						if (elt && elt.render && elt._lbl4 !== undefined) { //_lbl4: to check it's a checkbox
							// call click() on the input instead of this.toggle() to get the 'change' event for free
							elt.focusNode.click();
						}
					}
				};
				this.ownerDocument.addEventListener("click", labelClickHandler);
			}
		}
	});
});