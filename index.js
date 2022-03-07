import axios from "axios";

const base_url = "https://api.zrutech.ca/builder/instance/api";
const headers = {
	Authorization: "X",
	"Content-Type": "application/json",
};
const parameters = {};

const deploy = () => {
	// Create the instance in the platform first
	const instanceDeploy = await axios.post(`${base_url}/deploy`, parameters, {
		headers,
	});

	if (instanceDeploy.status !== 200 || instanceDeploy.status !== 201) {
		console.error("Something went wrong...");
		console.error(instanceDeploy.data);
		return;
	} else {
		console.log("Started deployment...");
		const instanceId = instanceDeploy.data.instance.id;

		let i = 0,
			keepGoing = true;
		while (keepGoing) {
			setTimeout(() => {
				const deploymentDetails = await axios.get(
					`${base_url}/details/${instanceId}`,
					{ headers }
				);
				const state = deploymentDetails.data.metadata.status;
				console.log(`Current state: ${state}`);

				if (i > 100) {
					console.error("Timing out after ~500 seconds.");
					return;
				}

				if (state.toUpperCase() === "DEPLOYED") {
					console.log("Deployed successfully!");
					console.log(deploymentDetails.metadata.output);
					return;
				}

				i++;
			}, 10000);
		}
	}
};

deploy();
