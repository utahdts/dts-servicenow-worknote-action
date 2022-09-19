# Service Now Worknote Action

[![Pull Request Events](https://github.com/agrc/service-now-worknote-action/actions/workflows/pull-request.yml/badge.svg)](https://github.com/agrc/service-now-worknote-action/actions/workflows/pull-request.yml)
[![Push Events](https://github.com/agrc/service-now-worknote-action/actions/workflows/push.yml/badge.svg)](https://github.com/agrc/service-now-worknote-action/actions/workflows/push.yml)

This action posts a worknote to a Service Now table based on a [Github Action environment review](https://docs.github.com/en/actions/managing-workflow-runs/reviewing-deployments).

A comment is posted to the table with the reviewers email and any comments.

## Configure this action

This action requires 5 Action secrets.

- SN_INSTANCE - the sub address to `https://{SN_INSTANCE}.service-now.com`
- SN_TABLE - the parent table to write to
- SN_SYS_ID - the child table to write to
- SN_USERNAME - the service account name
- SN_PASSWORD - the service account password

## Usage

You can now consume the action by referencing the v1 branch

```yaml
- name: Create deployment notification
  uses: agrc/service-now-worknote-action@v1
  with:
    username: ${{ secrets.SN_USERNAME }}
    password: ${{ secrets.SN_PASSWORD }}
    system-id: ${{ secrets.SN_SYS_ID }
```
