const core = require('@actions/core');
const github = require('@actions/github');
const http = require('@actions/http-client');
const auth = require('@actions/http-client/lib/auth');

const approval_notes = (lastAttempt) => {
  const approver = lastAttempt.user.login;
  const comments = lastAttempt.comment;
  
  let notes = `[code]<h2>🚀🚀🚀 New Deployment 🚀🚀🚀</h2>[/code]
        [code]This item has been deployed using the <strong>${lastAttempt.environments[0].name}</strong> environment via a <a href="https://github.com/${owner}/${repo}/actions/runs/${runId}">GitHub Action</a> pipeline.[/code]
        [code]It was <strong>${lastAttempt.state}</strong> by the GitHub user <a href="${lastAttempt.user.html_url}">${approver}</a>.[/code]`;
  if (comments.length > 0) {
    notes += `

      The following comment was added with the approval

      [code]<pre>${comments}</pre>[/code]`;
  }
  return notes;
};

const basic_notes = () => {
  return `[code]<h2>🚀🚀🚀 New Deployment 🚀🚀🚀</h2>[/code]
        [code]This item has been deployed via a <a href="https://github.com/${owner}/${repo}/actions/runs/${runId}">GitHub Action</a> pipeline.[/code]
        [code]By the GitHub user ${user}.[/code]`;
};

const owner =
  github.context.payload.repository.organization ??
  github.context.payload.repository.owner.login;
const repo = github.context.payload.repository.name;
const runId = github.context.runId;
const user = github.context.actor;

async function run() {
  try {
    const token = core.getInput('repo-token', {required: true});
    const username = core.getInput('username', {required: true});
    const password = core.getInput('password', {required: true});
    const systemId = core.getInput('system-id', {required: true});
    const tableName = core.getInput('table-name', {required: false});
    const instanceName = core.getInput('instance-name', {required: false});
    const checkApprovals = core.getBooleanInput('check-approvals', {required: false}) || true;

    core.setSecret(token);
    core.setSecret(username);
    core.setSecret(password);
    core.setSecret(systemId);
    core.setSecret(tableName);
    core.setSecret(instanceName);

    const httpClient = new http.HttpClient(
      'service-now-work-notes-github-action',
      [new auth.BasicCredentialHandler(username, password)]
    );

    const url = `https://${instanceName}.service-now.com/api/now/table/${tableName}/${systemId}`;

    const octokit = github.getOctokit(token);
    
    let notes;

    if (checkApprovals) {
      core.startGroup('🔔 Querying for run approvals');

      core.info(`Action run Id: ${github.context.runId}`);
      core.info(
        `API request: GET /repos/${owner}/${repo}/actions/runs/${runId}/approvals`
      );

      const {data} = await octokit.request(
        `GET /repos/${owner}/${repo}/actions/runs/${runId}/approvals`,
        {
          owner,
          repo,
          run_id: runId,
        }
      );

      core.info(`Approvals: ${data.length}`);

      if (data.length === 0) {
        core.setFailed(`No approvals found for runId: ${runId}. Does this environment require approvals? Check your environments in settings: https://github.com/${owner}/${repo}/settings/environments`);

        return;
      }

      const lastAttempt = data[0];

      core.info(
        `Approver: ${lastAttempt.user.login}, comment: ${lastAttempt.comment}`
      );

      notes = approval_notes(lastAttempt);
      
      core.endGroup();
    } else {
      core.startGroup('🔔 Building Notes');

      core.info(`Action run Id: ${github.context.runId}`);
      notes = basic_notes();
      core.endGroup();
    }

    core.startGroup('🔔 Sending work note to Service Now');

    core.info(`Sending: ${notes} to ${url}`);

    const response = await httpClient.patchJson(url, { work_notes: notes });
    core.info(`Service Now api response: ${response.statusCode}`);

    if (response.statusCode !== 200) {
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
