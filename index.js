import axios from "axios";
const core = require("@actions/core");

const base_url = "https://api.dev.zrutech.ca/builder/instance/api";
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
		console.log(core.getMultilineInput("parameters", { required: true }));
		console.log(core.getInput("parameters", { required: true }));
		console.log(JSON.parse(core.getInput("parameters", { required: true })));
		// Create the instance in the platform first
		// const instanceDeploy = await axios.post(`${base_url}/deploy`, parameters, {
		// 	headers,
		// });

		// if (instanceDeploy.status !== 200 && instanceDeploy.status !== 201) {
		// 	console.error("Something went wrong...");
		// 	console.error(instanceDeploy.data);
		// 	return;
		// } else {
		// 	console.log("Started deployment...");
		// 	const instanceId = instanceDeploy.data.instance.id;

		// 	let i = 0,
		// 		keepGoing = true;
		// 	while (keepGoing) {
		// 		try {
		// 			const deploymentDetails = await axios.get(
		// 				`${base_url}/details/?instanceId=${instanceId}`,
		// 				{ headers }
		// 			);
		// 			const state = deploymentDetails.data.metadata.status;
		// 			console.log(`Current state: ${state}`);

		// 			if (i > 100) {
		// 				console.error("Timing out after ~500 seconds.");
		// 				keepGoing = false;
		// 				return;
		// 			}

		// 			if (state.toUpperCase() === "DEPLOYED") {
		// 				console.log("Deployed successfully!");
		// 				console.log("Output:");

		// 				Object.entries(deploymentDetails.data.metadata.output).forEach(
		// 					([key, value]) => {
		// 						console.log(`${key}: ${value}`);
		// 					}
		// 				);
		// 				keepGoing = false;
		// 				return;
		// 			}
		// 		} catch (e) {
		// 			console.error(e);
		// 		}

		// 		await sleep(10000);
		// 		i++;
		// 	}
		// }
	} catch (e) {
		console.error(e);
	}
};

deploy();
