/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 637:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 738:
/***/ ((module) => {

module.exports = eval("require")("axios");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__nccwpck_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__nccwpck_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__nccwpck_require__.r(__webpack_exports__);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(738);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__nccwpck_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);

const core = __nccwpck_require__(637);

const base_url = `${core.getInput("api_endpoint", {
	required: false,
})}/builder/instance/api`;
const timeout = core.getInput("timeout", { required: false });
const api_key = core.getInput("api_key", { required: true });
const headers = {
	Authorization: api_key,
	"Content-Type": "application/json",
};

const parameters = {
	solutionId: core.getInput("solution_id", { required: true }),
	parameters: JSON.parse(core.getInput("parameters", { required: true })),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const deploy = async () => {
	try {
		// Create the instance in the platform first
		const instanceDeploy = await axios__WEBPACK_IMPORTED_MODULE_0___default().post(`${base_url}/deploy`, parameters, {
			headers,
		});

		if (instanceDeploy.status !== 200 && instanceDeploy.status !== 201) {
			console.log("Something went wrong...");
			console.log(instanceDeploy.data);
			throw new Error("Instance deploy status not in 2xx");
		} else {
			console.log("Started deployment...");
			const instanceId = instanceDeploy.data.instance.id;
			await sleep(10000);

			let i = 0,
				keepGoing = true;
			while (keepGoing) {
				try {
					try {
						const deploymentDetails = await axios__WEBPACK_IMPORTED_MODULE_0___default().get(
							`${base_url}/details?instanceId=${instanceId}`,
							{ headers }
						);
						const state = deploymentDetails.data.metadata.status;
						console.log(`Current state: ${state}`);
					} catch (error) {
						console.error(
							`Errir fetching details of deployment: ${error}. Retrying...`
						);
					}

					if (i > timeout * 6) {
						console.error(`Timing out after ${timeout} minutes.`);
						core.setOutput(
							"deployment_output",
							`Timing out after ${timeout} minutes.`
						);
						throw new Error("Instance deployment timed out");
					}

					if (state.toUpperCase() === "DEPLOYED") {
						console.log("Deployed successfully!");
						core.setOutput(
							"deployment_output",
							JSON.stringify(deploymentDetails.data.metadata.output)
						);

						keepGoing = false;
						return;
					} else if (state.toUpperCase() === "FAILED") {
						throw new Error("Instance failed to deploy in ZRU");
					}
				} catch (e) {
					throw new Error(`Instance deployment failed: ${e}`);
				}

				await sleep(10000);
				i++;
			}
		}
	} catch (e) {
		core.error("Master failure");
		console.log(e);

		core.setFailed(`Deployment failed with error: ${e}`);
	}
};

deploy();

})();

module.exports = __webpack_exports__;
/******/ })()
;