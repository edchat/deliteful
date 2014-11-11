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

	var goToEnd = function (remote) {
		// In order to function properly on all platforms, we need to know
		// what the proper character sequence is to go to the end of a text field.
		// End key works generally everywhere except Mac OS X.
		//console.log("in goToEnd remote.environmentType.platform = " + remote.environmentType.platform);
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
		remote.findByCssSelector("#tempInput")
	//	.then(function (temp) {
	//		console.log("in goToEnd set value = 2 for " + remote.environmentType.platform);
	//		temp.value = "2";
	//	})
	//	.end()
	//	.findByCssSelector("#tempInput")
		.click()
		.clearValue()
		.pressKeys("2" + keys.END + "3" + keys.HOME + "1")
		//.end()
		//.findByCssSelector("#tempInput")
		.getProperty("value")
		.then(function (/*value*/) {
			//console.log("in goToEnd value =[" + value + "] for " + remote.environmentType.platform);
			// having trouble with the feature test, can not waste more time on this so check for mac if no value
		/*
			if(value){
				if(value !== "123"){
					console.log("in goToEnd value !== 123 using  = keys.COMMAND + keys.RIGHT_ARROW + keys.NULL");
					remote.type(keys.COMMAND + keys.RIGHT_ARROW + keys.NULL);
					return;
				} else {
					console.log("in goToEnd value == 123 using  = keys.END ");
					remote.pressKeys(keys.END);
					return;
				}
			} else {
		*/
			if ((/MAC/.test(remote.environmentType.platform))) {
				//console.log("in goToEnd for MAC using  = keys.COMMAND + keys.RIGHT_ARROW + keys.NULL");
				return remote.type(keys.COMMAND + keys.RIGHT_ARROW + keys.NULL);
			} else {
				//console.log("in goToEnd not MAC using  = keys.END ");
				return remote.pressKeys(keys.END);
			}
		//	}
		});
/*
		//var mac = (/mac/.test(remote.environmentType.platform));
		if((/MAC/.test(remote.environmentType.platform))){
			console.log("in goToEnd for MAC using  = keys.COMMAND + keys.RIGHT_ARROW + keys.NULL");
			remote.type(keys.COMMAND + keys.RIGHT_ARROW + keys.NULL);
			return;
		} else {
			console.log("in goToEnd not MAC using  = keys.END ");
			return remote.pressKeys(keys.END);
		}
*//*
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
			return loadFile(remote, "./Textbox.html")
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
			return loadFile(remote, "./Textbox.html")
				.then(pollUntil("return document.getElementById('requiredtb1').value ? 'a' : null;", [],
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
			return loadFile(remote, "./Textbox.html")
				// default click action
				.then(pollUntil("return document.getElementById('disabledtb2').value ? 'Disabled' : null;", [],
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
			return loadFile(remote, "./Textbox.html")
				// default click action
				.then(pollUntil("return document.getElementById('trimtb3').value ? 'Trim' : null;", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.then(function () {
					return checkTextbox(remote, "trimtb3", "Trim", false, false);
				})
				.end()
				.findByCssSelector("#trimtb3 > input").click()
				.then(function () {
					return goToEnd(remote);
				})
				.pressKeys(" Update    ")
				.end()
				.findByCssSelector("#requiredtb1 > input").click()
				.sleep(400)
				.then(function () {
					return checkTextbox(remote, "trimtb3", "Trim Update", false, false);
				});
		},
		"Textbox case upper": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return loadFile(remote, "./Textbox.html")
				// default click action
				.then(pollUntil("return document.getElementById('uppercasetb4').value ? 'UPPER CASE' : null;", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.then(function () {
					return checkTextbox(remote, "uppercasetb4", "UPPER CASE", false, false);
				})
				.end()
				.findByCssSelector("#uppercasetb4 > input").click()
				.then(function () {
					return goToEnd(remote);
				})
				.pressKeys(" update")
				.end()
				.findByCssSelector("#requiredtb1 > input").click()
				.sleep(400)
				.then(function () {
					if (/chrome/.test(remote.environmentType.browserName)) {
						// Webdriver issues for now with FF
						console.log("Skipping Textbox Textbox case upper update on " +
							remote.environmentType.browserName);
						return remote.end();
					}
					return checkTextbox(remote, "uppercasetb4", "UPPER CASE UPDATE", false, false);
				});
		},
		"Textbox case lower": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return loadFile(remote, "./Textbox.html")
				// default click action
				.then(pollUntil("return document.getElementById('lowercasetb5').value ? 'lower case' : null;", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.then(function () {
					return checkTextbox(remote, "lowercasetb5", "lower case", false, false);
				})
				.end()
				.findByCssSelector("#lowercasetb5 > input").click()
				.then(function () {
					return goToEnd(remote);
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
			return loadFile(remote, "./Textbox.html")
				// default click action
				.then(pollUntil("return document.getElementById('propercasetb6').value ? 'Proper Case' : null;", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.then(function () {
					return checkTextbox(remote, "propercasetb6", "Proper Case", false, false);
				})
				.end()
				.findByCssSelector("#propercasetb6 > input").click()
				.then(function () {
					return goToEnd(remote);
				})
				.pressKeys(" update")
				.end()
				.findByCssSelector("#requiredtb1 > input").click()
				.sleep(400)
				.then(function () {
					return checkTextbox(remote, "propercasetb6", "Proper Case Update", false, false);
				});
		}
				// TODO: Keep track of these THINGS THAT DID NOT WORK FOR ME

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
