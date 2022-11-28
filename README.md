# Service Now Worknote Action

[![Pull Request Events](https://github.com/agrc/service-now-worknote-action/actions/workflows/pull-request.yml/badge.svg)](https://github.com/agrc/service-now-worknote-action/actions/workflows/pull-request.yml)
[![Push Events](https://github.com/agrc/service-now-worknote-action/actions/workflows/push.yml/badge.svg)](https://github.com/agrc/service-now-worknote-action/actions/workflows/push.yml)

This action posts a worknote to a Service Now table based on a [Github Action environment review](https://docs.github.com/en/actions/managing-workflow-runs/reviewing-deployments).

A comment is posted to the table with the reviewers email and any comments.

<img width="856" alt="image" src="https://user-images.githubusercontent.com/325813/191078116-557707db-594a-4514-970f-be28e59eb634.png">

## Usage

You can now consume the action by referencing the v1 branch

### Inputs
* repo-token
  * description: 'the github token for the runner'
  * required: true
* username:
  * description: 'the username of the credentials with REST API access for basic authentication'
  * required: true
* password:
  * description: 'the password of the credentials with REST API access for basic authentication'
  * required: true
* instance-name:
  * description: 'the sub address to `https://{SN_INSTANCE}.service-now.com`'
  * required: true
* table-name:
  * description: 'the table name that contains the system id item to update'
  * required: true
* system-id:
  * description: 'the specific sys-id (row) item to write a work note for'
  * required: true
* check-approvals:
  * description: 'boolean value to control whether to check for approvals, default: true, false skips approvals'
  * required: false
* environment:
  * description: 'the environment being deployed to'
  * required: false

### Example

```yaml
- name: Create deployment notification
  uses: agrc/service-now-worknote-action@v1
  with:
    repo-token: ${{ github.token }}
    username: ${{ secrets.SN_USERNAME }}
    password: ${{ secrets.SN_PASSWORD }}
    instance-name: ${{ secrets.SN_INSTANCE }}
    table-name: ${{ secrets.SN_TABLE }}
    system-id: ${{ secrets.SN_SYS_ID }}
    check-approvals: false # optional, default: true
    environment: 'dev' # optional, ignored if check-approvals is true
```
