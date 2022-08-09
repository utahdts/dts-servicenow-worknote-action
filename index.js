const core = require('@actions/core');
const github = require('@actions/github');
const http = require('@actions/http-client');
const auth = require('@actions/http-client/lib/auth');

async function run() {
  try {
    core.startGroup('Get inputs');
    const token = core.getInput('repoToken', { required: true });
    const username = core.getInput('username', { required: true });
    const password = core.getInput('password', { required: true });
    const systemId = core.getInput('system-id', { required: true });
    const tableName = core.getInput('table-name', { required: false });
    const instanceName = core.getInput('instance-name', { required: false });

    core.setSecret(token);
    core.setSecret(username);
    core.setSecret(password);
    core.setSecret(systemId);
    core.setSecret(tableName);
    core.setSecret(instanceName);
    core.endGroup();

    core.startGroup('Create http client');
    const httpClient = new http.HttpClient(
      'service-now-work-notes-github-action',
      [new auth.BasicCredentialHandler(username, password)]
    );
    core.endGroup();

    const url = `https://${instanceName}.service-now.com/api/now/table/${tableName}/${systemId}`;

    core.startGroup('Create octokit');
    const octokit = github.getOctokit(token);
    core.endGroup();

    core.startGroup('Get run approvals');
    const owner = github.context.payload.repository.organization;
    const repo = github.context.payload.repository.name;
    const runId = github.context.runId;

    core.info(`Run Id: ${github.context.runId}`);

    const { data } = await octokit.request(
      `GET /repos/${owner}/${repo}/actions/runs/${runId}/approvals`,
      {
        owner,
        repo,
        run_id: runId,
      }
    );

    core.info(`Approvals: ${JSON.stringify(data)}`);
    const lastAttempt = data[0];

    core.info(lastAttempt.user.login, lastAttempt.comment);

    const approver = lastAttempt.user.login;
    const comments = lastAttempt.comment;
    core.endGroup();

    core.startGroup('Send to ServiceNow');
    let notes = `This item has been deployed and approved by ${approver}.`;
    if (comments.length > 0) {
      notes += ` The following comments were added to the approval: ${comments}`;
    }

    const response = await httpClient.patchJson(url, { work_notes: notes });
    core.info(`Response ${response.statusCode}`);

    if (response.statusCode != 200) {
      core.setFailed(
        `request failed:${response.statusCode}, ${response.result}`
      );
    }
    core.endGroup();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
