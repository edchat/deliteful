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

	registerSuite({
		name: "TextBox - functional",

		"Textbox behavior": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return loadFile(remote, "./TextBox.html")
				// default click action
				.execute("return document.getElementById('tb1').focusNode;")
				.then(function (element) {
					element.click();
					element.type("aaaa");
				})
				//	.pressKeys(keys.TAB)// Press TAB TODO: so on safari the tab is added to the value causing error,
				// TODO: so clicking on another element here to move the focus and update the value
				.execute("return document.getElementById('tb2').focusNode;")
				.then(function (element) {
					element.click();
				})
				.execute("return document.getElementById('tb1').focusNode.value;")
				.then(function (v) {
					assert.strictEqual(v, "aaaa", "Unexpected value after typing aaaa.");
				});
//				.then(pollUntil("return (document.getElementById('tb1').value === 'aaaa') ? true : null;", [],
//						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				// click on disabled textbox
//				.then(pollUntil("return document.getElementById('tb2').value ? null : true;", [],
//						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
//				.execute("return document.getElementById('tb2').focusNode;")
//				.then(function (element) {
//					element.click();
//					element.type("bbbb")
//				})
//				.then(pollUntil("return document.getElementById('tb2').value==='bbbb' ? true : null;", [],
//						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL));
		}//,
/*
		"TextBox Key nav": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			// keyb nav
			// give the focus to the button to have a ref starting point in the chain
			var remote = this.remote;
			if (/safari|iphone|selendroid/.test(remote.environmentType.browserName)) {
				// SafariDriver doesn't support sendKeys
				console.log("Skipping test: key nav as sendKeys not supported on Safari");
				return remote.end();
			}
			return remote
				.execute("return document.getElementById('b1').focus();")
				.getActiveElement()
				.end()
				.sleep(400)
				.pressKeys(keys.TAB) // Press TAB -> tb1
				.sleep(400)
				.getActiveElement()
				.getAttribute("name")
				.then(function (v) {
					assert.strictEqual(v, "tb1", "Unexpected focused element after 1st TAB.");
				})
				.end()
				.pressKeys(keys.SPACE) // Press Space to check tb1
				.then(pollUntil("return document.getElementById('tb1').checked ? null : true;", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.end()
				.pressKeys(keys.TAB) // Press TAB -> skip tb2 (disabled)
				.sleep(400)
				.getActiveElement()
				.getVisibleText()
				.then(function (v) {
					assert.strictEqual(v, "End", "Unexpected focused element after 2nd TAB.");
				})
				;
		},

		"TextBox Form": function () {
				//
				// Form tests
				//
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			if (/iphone|selendroid/.test(remote.environmentType.browserName)) {
				console.log("Skipping test: 'TextBox Form' on this platform.");
				return remote.end();
			}
			return loadFile(remote, "./TextBox.html")
				.findById("form1")
				.submit()
				.end()
				.setFindTimeout(intern.config.WAIT_TIMEOUT)
				.find("id", "parameters")
				.end()
				.execute("return document.getElementById('valueFor_tb3');")
				.then(function (value) {
						assert.isNull(value, "Unexpected value for unchecked textbox tb3.");
					})
				.end()
				.findById("valueFor_tb4")
				.getVisibleText()
				.then(function (value) {
					assert.strictEqual(value, "2", "Unexpected value for textbox tb4");
				})
				.end()
				.execute("return document.getElementById('valueFor_tb5');")
				.then(function (value) {
					assert.isNull(value, "Unexpected value for disabled textbox tb5.");
				})
				.findById("valueFor_tb6")
				.getVisibleText()
				.then(function (value) {
					assert.strictEqual(value, "4", "Unexpected value for textbox tb6");
				})
				;
		}
		*/
	});
});
