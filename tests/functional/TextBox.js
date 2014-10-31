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
				require(["delite/register", "deliteful/TextBox", "requirejs-domready/domReady!"], function (register) {
					register.parse();
					done();
				});
			});
	}
	var checkTextBox = function (remote, widgetId, expectedValue, expectedRequired, expectedDisabled) {
		return remote
			.findByCssSelector("#"+widgetId)
			.getProperty("focusNode")
			.getProperty("value")
			.then(function (value) {
				console.log('[checkTextBox(remote, "'+widgetId + '", "'+expectedValue+'", '+
					expectedRequired + ', '+expectedDisabled +');] on '+remote.environmentType.browserName);
				assert.strictEqual(value, expectedValue.toString(), "Unexpected widget focusNode value for "+widgetId);
			})
			.getProperty("value")
			.then(function (value) {
				assert.strictEqual(value, expectedValue.toString(), "Unexpected widget value for "+widgetId);
			})
			.getProperty("displayedValue")
			.then(function (displayedValue) {
				assert.strictEqual(displayedValue, expectedValue.toString(), "Unexpected widget displayedValue for "+widgetId);
			})
			.getProperty("required")
			.then(function (required) {
				assert.strictEqual(required, expectedRequired, "Unexpected widget required for "+widgetId);
			})
			.getProperty("focusNode")
			.getProperty("required")
			.then(function (required) {
				assert.strictEqual(required, expectedRequired, "Unexpected widget focusNode required for "+widgetId);
			})
			.getProperty("focusNode")
			.getProperty("disabled")
			.then(function (disabled) {
				assert.strictEqual(disabled, expectedDisabled, "Unexpected widget focusNode disabled for "+widgetId);
				console.log('passed [checkTextBox(remote, "'+widgetId + '", "'+expectedValue+'", '+
					'", ...)] on '+ remote.environmentType.browserName);
			})
	};

		/* this is not working right on IE, can not seem to get to validity */
	var checkValidity = function (remote, widgetId, expectedValue, expectedValid, expectedRequired, expectedDisabled,
		expectedValueMissing) {
		return remote
			.findByCssSelector("#"+widgetId +" > input")
			.getProperty("validity")
			.then(function (v) {
				if(v && v.valid !== undefined) {
					console.log(' [checkValidity(remote, "'+widgetId + '", "'+expectedValue+'", '+
						expectedValid + ', '+expectedDisabled +', '+expectedRequired +', '+
						expectedValueMissing+');] on '+ remote.environmentType.browserName);
					assert.strictEqual(v.valid, expectedValid, "Unexpected widget focusNode valid for "+ widgetId);
					assert.strictEqual(v.valueMissing, expectedValueMissing,
						"Unexpected widget focusNode valueMissing for "+ widgetId);
					console.log(' passed [checkValidity(remote, "'+ widgetId + '", "'+ expectedValue +'", '+
						expectedValid + '", ...);] on '+ remote.environmentType.browserName);
				} else {
					console.log(' Skipped [checkValidity(remote, "'+ widgetId +
						 '", ...); call validity.valid is not avalable on '+
						remote.environmentType.browserName);
				}
			})
	};


	registerSuite({
		name: "TextBox - functional",

		"Basic Textbox Update Value": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return loadFile(remote, "./TextBox.html")
				// Click on initial textbox basictb1
				.findByCssSelector("#basictb1 > input").click()
				.then(function () {
					return checkTextBox(remote, "basictb1", "", false, false);
				})
				.end()
				.findByCssSelector("#basictb1 > input").click()
				.pressKeys("abcdef")
				.end()
				//	.pressKeys(keys.TAB)// Press TAB TODO: so on safari the tab is added to the value causing error,
				// TODO: so clicking on another element here to move the focus and update the value
				.findByCssSelector("#tb2 > input").click().end()
				.then(pollUntil("return document.getElementById('basictb1').value ? 'abcdef' : null;", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.findByCssSelector("#basictb1 > input").click()
				.then(function () {
					return checkTextBox(remote, "basictb1", "abcdef", false, false);
				})
				.end()
		},
		"Textbox required value": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return loadFile(remote, "./TextBox.html")
				.then(pollUntil("return document.getElementById('requiredtb1').value ? 'a' : null;", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				// Click on initial textbox requiredtb1
				.findByCssSelector("#requiredtb1 > input").click()
				.then(function () {
					return checkTextBox(remote, "requiredtb1", "a", true, false);
				})
				.end()
				.then(function () {
					return checkValidity(remote, "requiredtb1", "a", true, true, false, false);
				})
				.end()
				.findByCssSelector("#requiredtb1 > input").click()
				.pressKeys("aaaa")
				.end()
				//	.pressKeys(keys.TAB)// Press TAB TODO: so on safari the tab is added to the value causing error,
				// TODO: so clicking on another element here to move the focus and update the value
				.findByCssSelector("#tb2 > input").click()
				.then(pollUntil("return document.getElementById('requiredtb1').value ? 'aaaaa' : null;", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.then(function () {
					return checkTextBox(remote, "requiredtb1", "aaaaa", true, false);
				})
				.then(function () {
					return checkValidity(remote, "requiredtb1", "aaaaa", true, true, false, false);
				})
				.end()
				.findByCssSelector("#requiredtb1 > input")
				.clearValue()
				.then(function () {
					return checkValidity(remote, "requiredtb1", "", false, true, false, true);
				})
				.end()
				.then(function () {
					return checkValidity(remote, "requiredtb1b", "", false, true, false, true);
				})
				.end()
				.findByCssSelector("#requiredtb1b > input").click()
				.pressKeys("bbbb")
				.end()
				.then(pollUntil("return document.getElementById('requiredtb1b').value ? 'bbbb' : null;", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.then(function () {
					return checkValidity(remote, "requiredtb1b", "bbbb", true, true, false, false);
				})
				.end()
		},
		"Textbox disabled": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return loadFile(remote, "./TextBox.html")
				// default click action
				.then(pollUntil("return document.getElementById('tb2').value ? 'Disabled' : null;", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				// click on disabled textbox
				.then(function () {
					return checkTextBox(remote, "tb2", "Disabled", false, true);
				})
				.end()
				.findByCssSelector("#tb2 > input").click()
				.pressKeys("bbbb")
				//.type("bbbb")
				.end()
				.findByCssSelector("#requiredtb1 > input").click()
				.then(function () {
					return checkTextBox(remote, "tb2", "Disabled", false, true);
				})
		}//,
				// TODO: Keep track of these THINGS THAT DID NOT WORK FOR ME

			//	.execute("return document.getElementById('tb2').focusNode;")
			//	.getAttribute("aria-disabled")
			//	.then(function (value) {
			//		assert.strictEqual(value, "true", "aria-disabled");
			//	})


			//	.getActiveElement() // This did not work either.
			//	.sleep(400)
			//	.getProperty("validity")
			//	.then(function (element) {
			//		console.log("requiredtb1 test1 validity = "+element);
			//	})
			//	.pressKeys(keys.TAB)
			//	.execute("return document.activeElement.parentNode.id")
			//	.then(function (element) {
			//	   console.log("focus on element.id"+element.id);
			//	})
	});

});
