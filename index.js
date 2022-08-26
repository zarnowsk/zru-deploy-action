import axios from "axios";
const core = require("@actions/core");

const base_url = `${core.getInput("api_endpoint", {
	required: false,
})}/builder/instance/api`;
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
		const instanceDeploy = await axios.post(`${base_url}/deploy`, parameters, {
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
					console.log("Something went wrong...");
					console.log(e);
					throw new Error("Instance deployment failed while deploying");
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
