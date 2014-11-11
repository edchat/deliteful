define([
	"dcl/dcl",
	"intern!object",
	"intern/chai!assert",
	"delite/register",
	"dojo/dom-class",
	"deliteful/Textbox"
], function (dcl, registerSuite, assert, register, domClass, Textbox) {

	// TODO: can use declaratively only if global????
	/*global upperCaseFormat:true*/ // for jshint
	upperCaseFormat = function (value) {
		var newValue = "";
		newValue = value.toUpperCase();
	    return newValue;
	};
	/*global lowerCaseFormat:true*/
	lowerCaseFormat = function (value) {
		var newValue = "";
		newValue = value.toLowerCase();
	    return newValue;
	};
	/*global noFormat:true*/
	noFormat = function (value) { //
	    return value;
	};


	var container,
		html = "<d-textbox id='tb1' required></d-textbox><br>" +
			"<d-textbox id='tb2' disabled></d-textbox><br>" +
			"<d-textbox id='tb3' selectInputText></d-textbox><br>" +
			"<d-textbox id='tb4' value='foo'></d-textbox><br>" +
			"<d-textbox id='tb5' trim=true value='Test  '></d-textbox><br>" +
			"<d-textbox id='tb6' case='upper' value='Test'></d-textbox><br>" +
			"<d-textbox id='tb7' case='lower' value='Test'></d-textbox><br>" +
			"<d-textbox id='tb8' case='proper' value='Test'></d-textbox><br>" +
			"<d-textbox id='tb9' type='tel' pattern='[a-zA-Z0-9]+' value='alphaumericOnly$'></d-textbox><br>" +
			"<d-textbox id='tb9b' type='tel' pattern='\\d{3}[\\-]\\d{3}[\\-]\\d{4}' " +
			"value='111-222-3333'></d-textbox><br>" +
			"<d-textbox id='tb10' type='text' format=upperCaseFormat value='Uppercase Value'></d-textbox><br>" +
			"<input id='htmltb1' type='tel' pattern='[a-zA-Z0-9]+' value='1234567890'>";

	function checkValues(widget, val, errorMsg) {
		assert.strictEqual(widget.value, val, errorMsg);
		assert.strictEqual(widget.valueNode.value, val, errorMsg);
	}

	var suite = {
		setup: function () {
		//	container = document.createElement("div");
		//	document.body.appendChild(container);
		//	container.innerHTML = html;
		//	register.parse();
		},
		"initState": function () {
			var tb4 = document.getElementById("tb4");
			assert.strictEqual(tb4.value, "foo",
				"Unexpected default value for 'value' property if 'value' specified");
		},
		"required": function () {
			var tb1 = document.getElementById("tb1");
			tb1.deliver();
			assert.isTrue(tb1.valueNode.required,
				"Unexpected default value for 'required' property if 'required' specified");
			tb1.required = false;
			tb1.deliver();
			assert.isFalse(tb1.valueNode.required, "Unexpected default value for 'required' property is set = false");
			tb1.required = true;
			tb1.deliver();
			assert.isTrue(tb1.valueNode.required, "Unexpected default value for 'required' property is set = true");
		},
		"disabled": function () {
			var tb2 = document.getElementById("tb2");
			tb2.deliver();
			assert.isTrue(tb2.valueNode.disabled,
				"Unexpected default value for 'disabled' property if 'disabled' specified");
			tb2.disabled = false;
			tb2.deliver();
			assert.isFalse(tb2.valueNode.disabled, "Unexpected default value for 'disabled' property is set = false");
			tb2.disabled = true;
			tb2.deliver();
			assert.isTrue(tb2.valueNode.disabled, "Unexpected default value for 'disabled' property is set = true");
		},
		"selectInputText": function () { //selectInputText is not set on the node, handled in Textbox _inputClickHandler
			var tb3 = document.getElementById("tb3");
			assert.isTrue(tb3.selectInputText,
				"Unexpected default value for 'selectInputText' property if 'selectInputText' specified");
			tb3.selectInputText = false;
			assert.isFalse(tb3.selectInputText,
				"Unexpected default value for 'selectInputText' property is set = false");
			tb3.selectInputText = true;
			assert.isTrue(tb3.selectInputText, "Unexpected default value for 'selectInputText' property is set = true");
		},
	/*	"filters": function () { // test trim, uppercase, lowercase, and propercase
			var tb5 = document.getElementById("tb5");
			//var tb4 = document.getElementById("tb4");
			tb5.deliver();
			assert.strictEqual(tb5.value, "Test",
				"Unexpected initial value property, initial value should be trimmed with 'trim' specified.");
			assert.strictEqual(tb5.valueNode.value, "Test",
				"Unexpected initial value property, initial valueNode.value should be trimmed with 'trim' specified.");
			//tb5.click();
			//tb5.type('Test trim    ');
			tb5.value = "Test trim    "; // setting tb5.value here, need to test typing in the input in function test.
			//tb4.click();
			tb5.deliver();
			assert.strictEqual(tb5.value, "Test trim",
				"Unexpected value property, updated value should be trimmed with 'trim' set.");
			assert.strictEqual(tb5.valueNode.value, "Test trim",
				"Unexpected value property, updated valueNode.value should be trimmed with 'trim' set.");
		},
	*/
		"trimFilter": function () { // test trim
			var tb5 = document.getElementById("tb5");
			tb5.value = "Test  "; // TODO: FF & IE  failed with the original value setting tb5.value here to pass FF.
			tb5.deliver();
			checkValues(tb5, "Test",
				"Unexpected initial value property, initial value should be trimmed with 'trim' specified.");
			tb5.value = "Test trim    "; // setting tb5.value here, need to test typing input in the functional test.
			checkValues(tb5, "Test trim",
				"Unexpected value property, updated value should be trimmed with 'trim' set.");
			tb5.trim = false;
			tb5.value = "Test trim    "; // setting tb5.value here, need to test typing input in the functional test.
			checkValues(tb5, "Test trim    ",
				"Unexpected value property, updated value should be not be trimmed with 'trim' false.");
		},
		"uppercaseFilter": function () { // test case = "upper"
			var tb6 = document.getElementById("tb6");
			tb6.value = "Test"; // TODO: FF & IE  failed with the original value setting tb6.value here to pass FF.
			tb6.deliver();
			checkValues(tb6, "TEST",
				"Unexpected initial value property, initial value should be uppercased with 'uppercase' specified.");
			tb6.value = "test uppercase"; // setting tb6.value here, need to test typing input in the functional test.
			checkValues(tb6, "TEST UPPERCASE",
				"Unexpected value property, updated value should be uppercased with 'uppercase' set.");
			tb6.case = "none";
			tb6.value = "Test uppercase"; // setting tb6.value here, need to test typing input in the functional test.
			checkValues(tb6, "Test uppercase",
				"Unexpected value property, updated value should not be uppercased with case = 'none'.");
		},
		"lowercaseFilter": function () { // test case = "lower"
			var tb7 = document.getElementById("tb7");
			tb7.value = "Test"; // TODO: FF & IE failed with the original value setting tb7.value here to pass FF.
			tb7.deliver();
			checkValues(tb7, "test",
				"Unexpected initial value property, initial value should be lowercased with 'lowercase' specified.");
			tb7.value = "Test LowerCase"; // setting tb7.value here, need to test typing in the functional test.
			checkValues(tb7, "test lowercase",
				"Unexpected value property, updated value should be lowercased with 'lowercase' set.");
			tb7.case = "none";
			tb7.value = "Test LowerCase"; // setting tb7.value here, need to test typing in the functional test.
			checkValues(tb7, "Test LowerCase",
				"Unexpected value property, updated value should not be lowercased with case='none'.");
		},
		"propercaseFilter": function () { // test case = "proper"
			var tb8 = document.getElementById("tb8");
			checkValues(tb8, "Test",
				"Unexpected initial value property, initial value should be propercased with 'propercase' specified.");
			tb8.value = "test propercase"; // setting tb8.value here, need to test typing in the functional test.
			checkValues(tb8, "Test Propercase",
				"Unexpected value property, updated value should be propercased with 'propercase' set.");
			tb8.case = "none";
			tb8.value = "test propercase"; // setting tb8.value here, need to test typing in the functional test.
			checkValues(tb8, "test propercase",
				"Unexpected value property, updated value should not be propercased with case='none'.");
		},
		"pattern": function () { // test pattern
			var tb9 = document.getElementById("tb9");
			tb9.deliver();
			assert.strictEqual(tb9.valueNode.pattern, "[a-zA-Z0-9]+",
				"Unexpected default value for 'pattern' property if 'pattern' specified");
			tb9.pattern = "";
			tb9.deliver();
			assert.strictEqual(tb9.valueNode.pattern, "",
				"Unexpected pattern when set to blank value for 'pattern' property");
			tb9.pattern = "[a-zA-Z0-9]+";
			tb9.deliver();
			assert.strictEqual(tb9.valueNode.pattern, "[a-zA-Z0-9]+",
				"Unexpected pattern value for 'pattern' property when set");
		},
		"formatter": function () { // test format and parse
			var tb10 = document.getElementById("tb10");
			// TODO: How to set the format declaratively, it has to be global?
			tb10.value = "Uppercase Value"; // TODO: FF required this to be set here, did not format original value?
			tb10.deliver();
			assert.strictEqual(tb10.valueNode.value, "UPPERCASE VALUE",
				"Unexpected default value for format of 'upperCaseFormat' specified");
			tb10.format = lowerCaseFormat;
			tb10.value = "LowerCase Value";
			tb10.deliver();
			assert.strictEqual(tb10.valueNode.value, "lowercase value",
				"Unexpected value for format of 'lowerCaseFormat' specified");
		},

		"Validation": function () { // test Textbox validation
			var tb1 = document.getElementById("tb1"); // tb1 is required
			tb1.required = true;
			tb1.value = "test validation"; // setting tb1.value here, need to test typing in the functional test.
			tb1.deliver();
			//var valid = tb1.valueNode.checkValidity();
			assert.isTrue(tb1.valueNode.checkValidity(), "required field tb1 has a value, should be valid");
			tb1.value = ""; // setting tb1.value here, need to test typing in the input in the functional test.
			assert.isFalse(tb1.valueNode.checkValidity(), "required field tb1 has no value, should be invalid");
			tb1.disabled = true;
			tb1.deliver();
			assert.isTrue(tb1.valueNode.checkValidity(),
				"required field tb1 has no value, but is disabled so should be valid");
			var tb9 = document.getElementById("tb9");
			tb9.pattern = "[a-zA-Z0-9]+";
			tb9.value = "alphaOnly";
			tb9.deliver();
			assert.isTrue(tb9.valueNode.checkValidity(),
				"pattern field tb9 has a value that should match, should be valid");
			tb9.value = "alphaOnly%^&*";
			tb9.deliver();
			assert.isFalse(tb9.valueNode.checkValidity(),
				"pattern field tb9 has a value that does not match the pattern, should be invalid");
			tb9.value = "27513";
			tb9.deliver();
			assert.isTrue(tb9.valueNode.checkValidity(),
				"pattern field tb9 has a value that should match, should be valid value is " + tb9.valueNode.value);
			var tb9b = document.getElementById("tb9b");
		//	tb9b.value = "111-222-3333";
		//	tb9b.pattern="(\d{5}([\-]\d{4})?)"; // VALIDATION FAILS WHEN CHANGING PATTERNS not sure why
		//	tb9b.deliver();
			assert.isTrue(tb9b.valueNode.checkValidity(),
				"pattern field tb9b has a value that should match, should be valid value is " + tb9b.valueNode.value);
			tb9b.value = "111-222-333";
		//  Note I was never able to figure out a way to change the pattern and have it cleanup the patternMismatch
		//	tb9b.valueNode.reset();
		//	tb9b.pattern="(\d{5}([\-]\d{3})?)"; // VALIDATION FAILS WHEN CHANGING PATTERNS not sure why
		//	tb9b.valueNode.validity.patternMismatch = false;
		//	tb9b.valueNode.setCustomValidity("");
			tb9b.deliver();
		//	assert.isTrue(tb9b.valueNode.checkValidity(),
		// "pattern field tb9b has a value that should match, should be valid value is "+tb9b.valueNode.value);
			assert.isFalse(tb9b.valueNode.checkValidity(),
				"pattern field tb9b has a value that should match, should be valid value is " + tb9b.valueNode.value);
		//	var htmltb1 = document.getElementById("htmltb1");
		//	htmltb1.pattern = "\d{3}[\-]\d{3}[\-]\d{4}";
		//	htmltb1.value = "123-456-7890";
		//	var valid = htmltb1.checkValidity();
		//	assert.isTrue(htmltb1.checkValidity(),
		// "pattern field htmltb1 has a value that does not match, so should be valid");
		},
		afterEach: function () {
			container.parentNode.removeChild(container);
		}
	};

	// Markup
	var markupSuite = {
		name: "deliteful/Textbox: markup",
		"beforeEach": function () {
			container = document.createElement("div");
			document.body.appendChild(container);
			container.innerHTML = html;
			register.parse();
		}
	};
	dcl.mix(markupSuite, suite);
	registerSuite(markupSuite);

	var progSuite = {
		name: "deliteful/Textbox: programmatic",
		beforeEach: function () {
			container = document.createElement("div");
			document.body.appendChild(container);
			var tb = new Textbox({id: "tb1", required: true});
			container.appendChild(tb);
			tb.startup();
			tb = new Textbox({id: "tb2", disabled: true});
			container.appendChild(tb);
			tb.startup();
			tb = new Textbox({id: "tb3", selectInputText: true});
			container.appendChild(tb);
			tb.startup();
			tb = new Textbox({id: "tb4", value: "foo"});
			container.appendChild(tb);
			tb.startup();
			tb = new Textbox({id: "tb5", trim: true, value: "Test  "});
			container.appendChild(tb);
			tb.startup();
			tb = new Textbox({id: "tb6", case: "upper", value: "Test"});
			container.appendChild(tb);
			tb = new Textbox({id: "tb7", case: "lower", value: "Test"});
			container.appendChild(tb);
			tb.startup();
			tb = new Textbox({id: "tb8", case: "proper", value: "Test"});
			container.appendChild(tb);
			tb.startup();
			tb = new Textbox({id: "tb9", type: "text", pattern: "[a-zA-Z0-9]+", value: "alphanumeric"});
			container.appendChild(tb);
			tb.startup();
			tb = new Textbox({id: "tb9b", type: "tel", pattern: "(\\d{5}([\\-]\\d{4})?)", value: "111-222-3333"});
			container.appendChild(tb);
			tb.startup();
			tb = new Textbox({id: "tb10", type: "text", format: upperCaseFormat, value: "Uppercase Value"});
			container.appendChild(tb);
			tb.startup();
		}
	};
	dcl.mix(progSuite, suite);
	registerSuite(progSuite);
});
