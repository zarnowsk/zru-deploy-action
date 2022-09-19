# ZRU deploy instance action

This action deploys an instance via the ZRU platform and prints the deployment output.

## Inputs

### `api_key`

**Required** Authorization API key belonging to the Organization.

### `solution_id`

**Required** ID of the Solution the Instance will be based on.

### `parameters`

**Required** Deployment parameters. **Must** be written in the following format:

```
    parameters: >           <-- greater-than character to signify multiline input
        {                   <-- curly braces for JSON input
            "name": "actions-test-8",       <-- each parameter as JSON key:value pair
            "nextParam": "param-data"
        }
```

### `api_endpoint`

URL of the API. By default, Instances will be deployed to production environment.

### `timeout`

Time in minutes after which the deployment should fail.

## Outputs

### `deployment_output`

The output from the deployment.

## Example usage

```
deploy-zru:
  runs-on: ubuntu-latest
  name: Attempts to deploy via ZRU
  steps:
    - name: Deploy
      id: zrudeploy
      uses: zerorampup/zru-deploy-action@main
      with:
        api_key: QWETQEJfajfhaRQWIURYQUWajfakjsfh
        solution_id: 1
        parameters: >
          {
            "name": "actions-test-1",
            "nextParam": "param-data"
          }
    - name: Log deployment output
      run: echo "Deployment output ${{ steps.zrudeploy.outputs.deployment_output }}"
```

## Contributing/development

To add extra features or make changes, ensure you have a code complier installed.
Eg. `npm i -g @vercel/ncc`

Once changes are ready to be deployed, run `ncc build index.js -o dist` to compile the code and deploy to Github.
