import axios from "axios";
const core = require("@actions/core");

const base_url = "https://api.dev.zrutech.ca/builder/instance/api";
const api_key = core.getInput("api_key", { required: true });
const headers = {
	Authorization: api_key,
	"Content-Type": "application/json",
};

const extractInputParameters = () => {
	/* Parameters are input as multiline YAML string in the following format:
	   parameters: 
           name:actions-name
           anotherParam:test-test-test
		This function will create a JS object out of raw input.
	*/
	const paramInput = core.getMultilineInput("parameters", { required: true });
	const rawParams = paramInput[0].split(" ");
	const params = {};
	rawParams.forEach((param) => {
		const splitParam = param.split(":");
		params[`${splitParam[0]}`] = splitParam[1];
	});
	return params;
};

const parameters = {
	solutionId: core.getInput("solution_id", { required: true }),
	parameters: JSON.parse(core.getInput("parameters", { required: true })),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const deploy = async () => {
	try {
		// Create the instance in the platform first
		const instanceDeploy = await axios.post(`${base_url}/deploy`, parameters, {
			headers,
		});

		if (instanceDeploy.status !== 200 && instanceDeploy.status !== 201) {
			console.error("Something went wrong...");
			console.error(instanceDeploy.data);
			return;
		} else {
			console.log("Started deployment...");
			const instanceId = instanceDeploy.data.instance.id;

			let i = 0,
				keepGoing = true;
			while (keepGoing) {
				try {
					const deploymentDetails = await axios.get(
						`${base_url}/details/?instanceId=${instanceId}`,
						{ headers }
					);
					const state = deploymentDetails.data.metadata.status;
					console.log(`Current state: ${state}`);

					if (i > 100) {
						console.error("Timing out after ~500 seconds.");
						core.setOutput(
							"deployment_output",
							"Deployment timed out after ~500 seconds."
						);

						keepGoing = false;
						return;
					}

					if (state.toUpperCase() === "DEPLOYED") {
						console.log("Deployed successfully!");
						core.setOutput(
							"deployment_output",
							JSON.stringify(deploymentDetails.data.metadata.output)
						);

						keepGoing = false;
						return;
					}
				} catch (e) {
					console.error(e);
				}

				await sleep(10000);
				i++;
			}
		}
	} catch (e) {
		console.error(e);
	}
};

deploy();
