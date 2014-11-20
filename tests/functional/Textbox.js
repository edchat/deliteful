define([
    "intern",
	"intern!object",
	"intern/dojo/node!leadfoot/helpers/pollUntil",
	"intern/chai!assert",
	"intern/dojo/node!leadfoot/keys",
	"require"
], function (intern, registerSuite, pollUntil, assert, keys, require) {

	function loadFile(remote, url) {
		return remote
			.setExecuteAsyncTimeout(intern.config.WAIT_TIMEOUT)
			.get(require.toUrl(url))
			.executeAsync(function (done) {
				require(["delite/register", "deliteful/Textbox", "requirejs-domready/domReady!"], function (register) {
					register.parse();
					done();
				});
			});
	}
	function logTestStart(remote, testName) {
		console.log("Starting [" + testName + "] test for "+remote.environmentType.browserName + " " +
			remote.environmentType.version + " on " + remote.environmentType.platform)
	}
	// jshint quotmark : true
	var checkTextbox = function (remote, widgetId, expectedValue, expectedRequired, expectedDisabled) {
		return remote
			.findByCssSelector("#" + widgetId)
			.getProperty("focusNode")
			.getProperty("value")
			.then(function (value) {
				//console.log("[checkTextbox(remote, '" + widgetId + "', '" + expectedValue + "', " +
				//	expectedRequired + ", " + expectedDisabled + ");] on " + remote.environmentType.browserName);
				assert.equal(value, expectedValue.toString(), "Unexpected widget focusNode value for " + widgetId);
			})
			.getProperty("value")
			.then(function (value) {
				assert.equal(value, expectedValue.toString(), "Unexpected widget value for " + widgetId);
			})
			.getProperty("displayedValue")
			.then(function (displayedValue) {
				assert.equal(displayedValue, expectedValue.toString(), "Unexpected widget displayedValue for " +
					widgetId);
			})
			.getProperty("required")
			.then(function (required) {
				assert.strictEqual(required, expectedRequired, "Unexpected widget required for " + widgetId);
			})
			.getProperty("focusNode")
			.getAttribute("aria-required")
			.then(function (required) {
				assert.strictEqual(required, expectedRequired+"", "Unexpected widget focusNode aria-required for " +
					widgetId);
			})
			.getProperty("focusNode")
			.getProperty("required")
			.then(function (required) {
				assert.strictEqual(required, expectedRequired, "Unexpected widget focusNode required for " + widgetId);
			})
			.getProperty("focusNode")
			.getProperty("disabled")
			.then(function (disabled) {
				assert.strictEqual(disabled, expectedDisabled, "Unexpected widget focusNode disabled for " + widgetId);
				//console.log("passed [checkTextbox(remote, '" + widgetId + "', '" + expectedValue + "', " +
				//	"...);] on " + remote.environmentType.browserName);
			});
	};

		/* this is not working right on IE, can not seem to get to validity */
	var checkValidity = function (remote, widgetId, expectedValue, expectedValid, expectedRequired, expectedDisabled,
		expectedValueMissing) {
		return remote
			.findByCssSelector("#" + widgetId + " > input")
			.getProperty("validity")
			.then(function (v) {
				if (v && v.valid !== undefined) {
					//console.log("[checkValidity(remote, '" + widgetId + "', '" + expectedValue + "', " +
					//	expectedValid + ", " + expectedDisabled + ", " + expectedRequired + "," +
					//	expectedValueMissing + ");] on " + remote.environmentType.browserName);
					assert.strictEqual(v.valid, expectedValid, "Unexpected widget focusNode valid for " + widgetId);
					assert.strictEqual(v.valueMissing, expectedValueMissing,
						"Unexpected widget focusNode valueMissing for " + widgetId);
					//console.log(" passed [checkValidity(remote, '" + widgetId + "', '" + expectedValue + "', " +
					//	expectedValid + ", ...);] on " + remote.environmentType.browserName);
				} else {
					console.log(" Skipped [checkValidity(remote, '" + widgetId +
						 "', ...); call validity.valid is not avalable on " +
						remote.environmentType.browserName);
				}
			});
	};

	var goToEnd = function (remote, tbId) {
		// In order to function properly on all platforms, we need to know
		// what the proper character sequence is to go to the end of a text field.
		// End key works generally everywhere except Mac OS X.
		//console.log("in goToEnd remote.environmentType.platform = " + remote.environmentType.platform);
		//TODO: currently I do not think this is working, see code at bottom for more information
		if ((/MAC/.test(remote.environmentType.platform))) {
			//console.log("in goToEnd for MAC using  = keys.COMMAND + keys.RIGHT_ARROW + keys.NULL");
			//return remote.type(keys.COMMAND + keys.RIGHT_ARROW + keys.NULL);
			console.log("in goToEnd for MAC skipping code to try to go to end having problems");
			return;
		} else {
			//console.log("in goToEnd not MAC using  = keys.END ");
			return remote.pressKeys(keys.END);
		}

/*
		return isInputHomeEndSupported(remote).then(function (isSupported) {
			console.log("in goToEnd isSupported = " + isSupported);
			gotoEnd = isSupported ? function (remote) {
				console.log("in goToEnd before keys.END");
				return remote.pressKeys(keys.END);
			} : function (remote) {
				console.log("in goToEnd before keys.META + keys.RIGHT_ARROW");
				return remote.pressKeys(keys.META + keys.RIGHT_ARROW +
					keys.NULL);
			};
		});
		*/
	};

	registerSuite({
		name: "Textbox - functional",

		"Basic Textbox Update Value": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			logTestStart(remote, "Basic Textbox Update Value");
			return loadFile(remote, "./Textbox.html")
				.then(pollUntil("return document.getElementById('basictb1');", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.findByCssSelector("#basictb1 > input")
				.getAttribute("class")
				.then(function (classVal) {
					assert.equal(classVal, "d-textbox-input",
						"Unexpected class for #basictb1 > input");
				})
				.end()
				.findByCssSelector("#basictb1")
				.getAttribute("class")
				.then(function (classVal) {
					assert.equal(classVal, "d-textbox",
						"Unexpected class for #basictb1");
				})
				.end()
				// Click on initial textbox basictb1
				.findByCssSelector("#basictb1 > input").click()
				.then(function () {
					return checkTextbox(remote, "basictb1", "", false, false);
				})
				.end()
				.findByCssSelector("#basictb1 > input").click()
				.pressKeys("abcdef")
				.end()
				//	.pressKeys(keys.TAB)// Press TAB TODO: so on safari the tab is added to the value causing error,
				// TODO: so clicking on another element here to move the focus and update the value
				.findByCssSelector("#disabledtb2 > input").click().end()
			//	.then(pollUntil("return document.getElementById('basictb1').value ? 'abcdef' : null;", [],
			//			intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.findByCssSelector("#basictb1 > input").click()
				.then(function () {
					return checkTextbox(remote, "basictb1", "abcdef", false, false);
				})
				.end();
		},
		"Textbox required value": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			logTestStart(remote, "Textbox required value");
			return loadFile(remote, "./Textbox.html")
				.then(pollUntil("return document.getElementById('requiredtb1');", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				// Click on initial textbox requiredtb1
				.findByCssSelector("#requiredtb1 > input").click()
				.then(function () {
					checkValidity(remote, "requiredtb1", "a", true, true, false, false);
					return checkTextbox(remote, "requiredtb1", "a", true, false);
				})
				.end()
				.findByCssSelector("#requiredtb1 > input").click()
				.pressKeys(" update")
				.end()
				//	.pressKeys(keys.TAB)// Press TAB TODO: so on safari the tab is added to the value causing error,
				// TODO: so clicking on another element here to move the focus and update the value
				.findByCssSelector("#disabledtb2 > input").click()
			//	.then(pollUntil("return document.getElementById('requiredtb1').value ? 'a update' : null;", [],
			//			intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.then(function () {
					checkValidity(remote, "requiredtb1", "a update", true, true, false, false);
					return checkTextbox(remote, "requiredtb1", "a update", true, false);
				})
				.end()
				.findByCssSelector("#requiredtb1 > input")
				.clearValue()
				.then(function () {
					checkValidity(remote, "requiredtb1b", "", false, true, false, true); // not valid required empty
					return checkValidity(remote, "requiredtb1", "", false, true, false, true); // not valid required
				})
				.end()
				.findByCssSelector("#requiredtb1b > input").click()
				.pressKeys("update2")
				.end()
			//	.then(pollUntil("return document.getElementById('requiredtb1b').value ? 'update2' : null;", [],
			//			intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.then(function () {
					return checkValidity(remote, "requiredtb1b", "update2", true, true, false, false);
				})
				.end();
		},

		"Textbox disabled": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			logTestStart(remote, "Textbox disabled");
			return loadFile(remote, "./Textbox.html")
				// default click action
				.then(pollUntil("return document.getElementById('disabledtb2');", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				// click on disabled textbox
				.then(function () {
					return checkTextbox(remote, "disabledtb2", "Disabled", false, true);
				})
				.end()
				.findByCssSelector("#disabledtb2 > input").click()
				.pressKeys("update")
				.end()
				.findByCssSelector("#requiredtb1 > input").click()
				.then(function () {
					return checkTextbox(remote, "disabledtb2", "Disabled", false, true);
				});
		},

		"Textbox trim": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			logTestStart(remote, "Textbox trim");
			return loadFile(remote, "./Textbox.html")
				// default click action
				.then(pollUntil("return document.getElementById('trimtb3');", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				//TODO temp code to work around FF problem with initial value not doing filter!!!!
				.pressKeys(" ") // type blank and click away to update value (trim it)
				.end()
				.findByCssSelector("#requiredtb1 > input").click()
				.sleep(100)
				.then(function () {
					return checkTextbox(remote, "trimtb3", "Trim", false, false);
				})
				.end()
				.findByCssSelector("#trimtb3 > input").click() // click back and update again
				.then(function () {
					return goToEnd(remote, "trimtb3");
				})
				.pressKeys(" Update    ")
				.end()
				.findByCssSelector("#requiredtb1 > input").click()
				.sleep(100)
				.then(function () {
					if (/firefox|internet explorer/.test(remote.environmentType.browserName)) {
						console.log("Skipping Textbox test: Textbox trim update on " +
							remote.environmentType.browserName);
						return remote.end();
					}
					return checkTextbox(remote, "trimtb3", "Trim Update", false, false);
				});
		},

		"Textbox case upper": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			logTestStart(remote, "Textbox case upper");
			return loadFile(remote, "./Textbox.html")
				// default click action
				.then(pollUntil("return document.getElementById('uppercasetb4');", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.then(function () {
					return checkTextbox(remote, "uppercasetb4", "UPPER CASE", false, false);
				})
				.end()
				.findByCssSelector("#uppercasetb4 > input")
				.then(function (element) {
					return remote.moveMouseTo(element, 120, 9);
				})
				.end()
				.pressMouseButton()
				//.click()
				//.then(function () {
				//	return goToEnd(remote, "uppercasetb4");
				//})
				.sleep(100)
				.pressKeys(" update")
				.end()
				.findByCssSelector("#requiredtb1 > input").click()
				.then(function () {
					// chrome and IE fail with goToEnd(), Update is typed in the middle of the text
					// and safari fails with moveMouseTo/pressMouseButton, update is not typed into the field
					//if (/chrome|internet explorer/.test(remote.environmentType.browserName)) {
						// Webdriver issues for now with FF
					if (/safari/.test(remote.environmentType.browserName)) {
						console.log("Skipping Textbox test: Textbox case upper update on " +
							remote.environmentType.browserName);
						return remote.end();
					}
					return checkTextbox(remote, "uppercasetb4", "UPPER CASE UPDATE", false, false);
				});
		},
		"Textbox case lower": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			logTestStart(remote, "Textbox case lower");
			return loadFile(remote, "./Textbox.html")
				// default click action
				.then(pollUntil("return document.getElementById('lowercasetb5');", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.then(function () {
					return checkTextbox(remote, "lowercasetb5", "lower case", false, false);
				})
				.end()
				.findByCssSelector("#lowercasetb5 > input").click()
				.then(function () {
					return goToEnd(remote, "lowercasetb5");
				})
				.pressKeys(" update")
				.end()
				.findByCssSelector("#requiredtb1 > input").click()
				.sleep(400)
				.then(function () {
					return checkTextbox(remote, "lowercasetb5", "lower case update", false, false);
				});
		},
		"Textbox case proper": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			logTestStart(remote, "Textbox case proper");
			return loadFile(remote, "./Textbox.html")
				// default click action
				.then(pollUntil("return document.getElementById('propercasetb6');", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.then(function () {
					return checkTextbox(remote, "propercasetb6", "Proper Case", false, false);
				})
				.end()
				.findByCssSelector("#propercasetb6 > input").click()
				.then(function () {
					return goToEnd(remote, "propercasetb6");
				})
				.pressKeys(" update")
				.end()
				.findByCssSelector("#requiredtb1 > input").click()
				.sleep(400)
				.then(function () {
					return checkTextbox(remote, "propercasetb6", "Proper Case Update", false, false);
				});
		},
		"Textbox selectInputText": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			logTestStart(remote, "Textbox selectInputText");
			return loadFile(remote, "./Textbox.html")
				// default click action
				.then(pollUntil("return document.getElementById('selectInputTexttb7');", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.then(function () {
					return checkTextbox(remote, "selectInputTexttb7", "select input text", false, false);
				})
				.end()
				.findByCssSelector("#selectInputTexttb7 > input").click()
				.sleep(100)
				.pressKeys("Replace")
				.end()
				.then(function () {
					if (/firefox/.test(remote.environmentType.browserName)) {
						// Webdriver issues for now with FF
						console.log("Skipping Textbox selectInputText Update on " +
							remote.environmentType.browserName);
						return remote.end();
					}
					return checkTextbox(remote, "selectInputTexttb7", "Replace", false, false); // failed on FF
				});
		},

		"Textbox pattern alphanumeric": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			logTestStart(remote, "Textbox pattern alphanumeric");
			return loadFile(remote, "./Textbox.html")
				// default click action
				.then(pollUntil("return document.getElementById('patterntb8');", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.then(function () {
					checkValidity(remote, "patterntb8", "alphaumericOnly$", false, false, false, false);
					return checkTextbox(remote, "patterntb8", "alphaumericOnly$", false, false);
				})
				.end()
				.findByCssSelector("#patterntb8 > input").click()
				.clearValue()
				.sleep(100)
				.pressKeys("ABC123")
				.end()
				.then(function () {
					checkValidity(remote, "patterntb8", "ABC123", true, false, false, false);
					return checkTextbox(remote, "patterntb8", "ABC123", false, false);
			});

		},
		"Textbox pattern tel": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			logTestStart(remote, "Textbox pattern tel");
			return loadFile(remote, "./Textbox.html")
				.then(pollUntil("return document.getElementById('patterntb8b');", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.then(function () {
					checkValidity(remote, "patterntb8b", "111-222-333", false, false, false, false);
					return checkTextbox(remote, "patterntb8b", "111-222-333", false, false);
				})
				.end()
				.findByCssSelector("#patterntb8b > input").click()
				//.clearValue()
				//.sleep(100)
				.pressKeys("3")
				.end()
				.then(function () {
					checkValidity(remote, "patterntb8b", "111-222-3333", true, false, false, false);
					return checkTextbox(remote, "patterntb8b", "111-222-3333", false, false);
				})
				.end()
				.findByCssSelector("#patterntb8b > input")
				.getProperty("title")
				.then(function (title) {
					assert.equal(title, "Enter valid US phone number, use pattern ###-###-####",
						"Unexpected title for #patterntb8b > input");
				})
				.end()
				.findByCssSelector("#patterntb8b")
				.getProperty("tip")
				.then(function (tip) {
					assert.equal(tip, "Enter valid US phone number, use pattern ###-###-####",
						"Unexpected tip for #patterntb8b");
				})
		},
		"Textbox maxlength": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			logTestStart(remote, "Textbox maxlength");
			return loadFile(remote, "./Textbox.html")
				.then(pollUntil("return document.getElementById('maxlengthtb9');", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.findByCssSelector("#maxlengthtb9 > input")
				.getAttribute("maxlength")
				.then(function (maxlength) {
					assert.equal(maxlength, 8,
						"Unexpected maxlength for #maxlengthtb9 > input");
				})
				.end()
				.findByCssSelector("#maxlengthtb9")
				.getAttribute("maxlength")
				.then(function (maxlength) {
					assert.equal(maxlength, 8,
						"Unexpected maxlength for #maxlengthtb9");
				})
				.end()
				.findByCssSelector("#maxlengthtb9 > input").click()
				.then(function () {
					checkValidity(remote, "maxlengthtb9", "0123456789", false, false, false, false);
					return checkTextbox(remote, "maxlengthtb9", "0123456789", false, false);
				})
				.end()
				.findByCssSelector("#maxlengthtb9 > input").click()
				.clearValue()
				.sleep(100)
				.pressKeys("01234")
				.end()
				.then(function () {
					checkValidity(remote, "maxlengthtb9", "01234", true, false, false, false);
					return checkTextbox(remote, "maxlengthtb9", "01234", false, false);
				})
				.end()
		// Need tests for format and parse with DisplayedValue and value
		// need tests for class (do this on the basic test)
		// need tests for forms to return the correct values too
		// need tests for name (do this on the form test?)

		}


				// TODO: Keep track of these THINGS THAT DID NOT WORK FOR ME

/*  This test showed the following problems, not sure why value would be [], and on mac test 2 should work:
in goToEnd widgetid =trimtb3 value =[] for firefox 31.0 on XP
in goToEnd test 2 widgetid =trimtb3 value =[2] for firefox on XP
in goToEnd Neither test worked using  = keys.END for firefox
same for propercasetb6

in goToEnd widgetid =propercasetb6 value =[] for internet explorer 11 on WINDOWS
in goToEnd test 2 widgetid =propercasetb6 value =[2undefined3undefined1] for internet explorer on WINDOWS
in goToEnd Neither test worked using  = keys.END for internet explorer

in goToEnd widgetid =trimtb3 value =[231] for safari 7.0.6 on MAC
in goToEnd test 2 widgetid =trimtb3 value =[2undefined3undefined1] for safari on MAC
in goToEnd Neither test worked using  = keys.END for safari

in goToEnd widgetid =trimtb3 value =[] for chrome 32.0.1700.107 on Windows NT
in goToEnd test 2 widgetid =trimtb3 value =[2undefined3undefined1] for chrome on Windows NT
in goToEnd Neither test worked using  = keys.END for chrome

in goToEnd widgetid =lowercasetb5 value =[231] for safari 7.0.6 on MAC
in goToEnd test 2 widgetid =lowercasetb5 value =[2undefined3undefined1] for safari on MAC
in goToEnd Neither test worked using  = keys.END for safari

in goToEnd widgetid =propercasetb6 value =[231] for safari 7.0.6 on MAC
in goToEnd test 2 widgetid =propercasetb6 value =[2undefined3undefined1] for safari on MAC
in goToEnd Neither test worked using  = keys.END for safari

in goToEnd widgetid =propercasetb6 value =[] for chrome 32.0.1700.107 on Windows NT
in goToEnd test 2 widgetid =propercasetb6 value =[2undefined3undefined1] for chrome on Windows NT
in goToEnd Neither test worked using  = keys.END for chrome

*/
/*		var found = false;
		remote
		.findByCssSelector("#tempInput")
		.click()
		.clearValue()
		.pressKeys("2" + keys.END + "3" + keys.HOME + "1")
		.end()
		.findByCssSelector("#tempInput")
		.getProperty("value")
		.then(function (value) {
			console.log("in goToEnd widgetid ="+ tbId +" value =[" + value + "] for " +
				remote.environmentType.browserName + " " +remote.environmentType.version +
				" on " + remote.environmentType.platform);
			// having trouble with the feature test, can not waste more time on this so check for mac if no value
			if(value){
				if(value === "123"){
					console.log("in goToEnd value == 123 using  = keys.END ");
					found = true;
					return remote.pressKeys(keys.END);
				}
			}
		})
		.end()
		.findByCssSelector("#tempInput")
		.click()
		.clearValue()
		.type("2" + keys.COMMAND + keys.RIGHT_ARROW + "3" + keys.LEFT_ARROW + "1" + keys.NULL)
		.end()
		.findByCssSelector("#tempInput")
		.getProperty("value")
		.then(function (value) {
			if(found){
				return;
			}
			console.log("in goToEnd test 2 widgetid ="+ tbId +" value =[" + value + "] for " +
				remote.environmentType.browserName + " on " + remote.environmentType.platform);
			if(value === "123"){
				console.log("in goToEnd value == 123 using  = keys.COMMAND + keys.RIGHT_ARROW + keys.NULL ");
				return remote.type(keys.COMMAND + keys.RIGHT_ARROW + keys.NULL);
			} else {
				console.log("in goToEnd Neither test worked using  = keys.END for " +
					remote.environmentType.browserName);
				return remote.pressKeys(keys.END);
			}
		})
*/

			/*	if(isInputHomeEndSupported(remote)) {
			console.log("isInputHomeEndSupported returned true use keys.END for " + remote.environmentType.platform);
			remote.pressKeys(keys.END);
			return
		} else {
			console.log("isInputHomeEndSupported returned false use keys.COMMAND + keys.RIGHT_ARROW + keys.NULL for " +
				remote.environmentType.platform);
			remote.type(keys.COMMAND + keys.RIGHT_ARROW + keys.NULL);
			return;
		}
*/
	/*
				else {
					console.log("in goToEnd value !== 123 using  = keys.COMMAND + keys.RIGHT_ARROW + keys.NULL");
					remote.type(keys.COMMAND + keys.RIGHT_ARROW + keys.NULL);
					return;
				}
			} else {
	*/


/*
	isInputHomeEndSupported = function (remote) { // Currently not being called see goToEnd
		// summary:
		// Detects whether the given browser/OS combination supports
		// using the home and end keys to move the caret in a textbox.
		// remote: PromisedWebDriver
		// A webdriver instance with a remote page already loaded
		// returns:
		// A promise that resolves to a boolean
		var HomeEndSupportedValue = null;
		return remote
			.findByCssSelector("#tempInput")
			.clearValue()
			.end()
			//.findByCssSelector("#tempInput")
			.click()
			.pressKeys("2" + keys.END + "3" + keys.HOME + "1")
			.end()
			//.findByCssSelector("#tempInput")
			.getProperty("value")
			.then(function (value) {
				HomeEndSupportedValue = value;
			})
			.end()
			.end()
			.then(function (value) {
				console.log("in isInputHomeEndSupported returning HomeEndSupported =" + HomeEndSupported + " for " +
				remote.environmentType.platform);
				return HomeEndSupported
			})
			.then(pollUntil("return document.getElementById('tempInput').value ? !null : null;", [],
					intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
			.then(function () {
				console.log("in isInputHomeEndSupported returning HomeEndSupportedValue =" + HomeEndSupportedValue +
				" for " + remote.environmentType.platform);
				return HomeEndSupportedValue === "123"
			})
*//*
		remote.execute(function () {
		//	console.log("in isInputHomeEndSupported before createElement document=" + document);
			var input = document.createElement("input");
			input.id = "homeEndTestInput";
			input.value = "2";
		//	console.log("in isInputHomeEndSupported after createElement input=" + input);
			document.body.appendChild(input);
			var inputTest = document.getElementById("homeEndTestInput");
		//	console.log("in isInputHomeEndSupported inputTest=" + inputTest);
		});
		remote.elementById("homeEndTestInput")
		.click()
		.type(keys.END + "3" + keys.HOME + "1")
		.end();
		return remote.execute(function () {
			console.log("in isInputHomeEndSupported 2");
			var input = document.getElementById("homeEndTestInput"),
			value = input.value;
			document.body.removeChild(input);
			console.log("in isInputHomeEndSupported value=" + value);
			return value === "123";
		});
	*/
	/*	return
		remote
		.findByCssSelector("#tempInput")
		.then(function (temp) {
			console.log("in isInputHomeEndSupported before createElement");
			temp.value = "2";
		})
		.click()
		.pressKeys(keys.END + "3" + keys.HOME + "1")
		return remote.execute(function () {
			remote.findByCssSelector("#tempInput")
			.getProperty("value")
			.then(function (value) {
				console.log("in isInputHomeEndSupported returning " + value === "123");
				return value === "123";
			})
		})
*/
//	};


			//	.execute("return document.getElementById('disabledtb2').focusNode;")
			//	.getAttribute("aria-disabled")
			//	.then(function (value) {
			//		assert.strictEqual(value, "true", "aria-disabled");
			//	})

				//.type("update")


			//	.getActiveElement() // This did not work either.
			//	.sleep(400)
			//	.getProperty("validity")
			//	.then(function (element) {
			//		console.log("requiredtb1 test1 validity = " + element);
			//	})
			//	.pressKeys(keys.TAB)
			//	.execute("return document.activeElement.parentNode.id")
			//	.then(function (element) {
			//	   console.log("focus on element.id" + element.id);
			//	})

			// using keys.END or keys.TAB inserted a char on safari
			//	.pressKeys(keys.SHIFT)
			//	.type(keys.COMMAND)
			//	.type(keys.RIGHT_ARROW)
			//	.type(" update")
			//	.pressKeys(keys.COMMAND)
			//	.pressKeys(keys.RIGHT_ARROW)
			//	.pressKeys(keys.END)

	});

});
