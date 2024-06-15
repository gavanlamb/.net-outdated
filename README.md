# Dotnet outdated 
This action checks for outdated dependencies in a .NET project. 

This action uses the `dotnet list packages` command. The action can also add a comment to the pull request and create a check run with the outdated dependencies.

## Inputs
| Name                                  | Description                                                                                                                                                                                                             | Value type   | Required  |
|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|-----------|
| `add-pr-comment`                      | A flag to indicate whether to add a comment to the associated PR with a report of the outdated packages. If this is enabled and the action is executed for a non-pull-request build then the comment will not be added. | `boolean`    | false     |
| `pr-comment-name`                     | A unique suffix for the pull-request comment for the current run.                                                                                                                                                       | `string`     | false     |
| `add-check-run`                       | A flag to indicate whether to add a check run, to the action, containing a report of the outdated packages.                                                                                                             | `boolean`    | false     |
| `fail-check-run-if-contains-outdated` | A flag to indicate whether the check run should fail if there are any direct dependencies that are out of date. In order for this to work the check run needs to be enabled by setting `add-check-run` to be true.      | `boolean`    | false     |
| `check-run-name`                      | A unique name for the check run tab.                                                                                                                                                                                    | `string`     | false     |
| `include-transitive-dependencies`     | A flag to indicate whether to include transitive and top-level packages.                                                                                                                                                | `boolean`    | false     |
| `include-prerelease-dependencies`     | A flag to indicate whether to include prerelease packages as the target.                                                                                                                                                | `boolean`    | false     |
| `include-highest-minor-only`          | A flag to indicate whether to consider only the packages with a matching major version number when searching for newer packages.                                                                                        | `boolean`    | false     |
| `include-highest-patch-only`          | A flag to indicate whether to consider only the packages with a matching major and minor version numbers when searching for newer packages.                                                                             | `boolean`    | false     |
| `nuget-sources`                       | The NuGet sources to use when searching for newer packages. To specify more than one use a comma separated value.                                                                                                       | `csv string` | false     |
| `nuget-config-file-path`              | The path to the NuGet config file to use.                                                                                                                                                                               | `string`     | false     |
| `frameworks`                          | The framework or frameworks to run the command for. To specify more than one use a comma separated value.                                                                                                               | `csv string` | false     |
| `target`                              | The project or solution file to target. If a file is not specified, the command will search the current directory for one.                                                                                              | `string`     | false     |

## Environment variables
| Name           | Description                                                                               | Required | Example                       |
|----------------|-------------------------------------------------------------------------------------------|----------|-------------------------------|
| `GITHUB_TOKEN` | The GitHub actions token. This is required for the action to interact with the GitHub API | true     | `${{ secrets.GITHUB_TOKEN }}` |

## Required permissions

## Examples
### Single execution

```yaml
steps:
  - name: My action
    with:
      add-pr-comment: true
      add-check-run: true
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Multiple executions

```yaml
steps:
  - name: My action
    with:
      add-pr-comment: true
      add-check-run: true
      frameworks: net5.0
      target: ./test.sln
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  - name: My action
    with:
      add-pr-comment: true
      add-check-run: true
      frameworks: net6.0
      target: ./test.sln
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Changes
### Branching strategy
This repository uses [GitHub Flow](https://githubflow.github.io/) as the branching strategy. 

Branch names follow the format of `{type}/{ticket number}-{description}` the branch name is used to enrich the pull request description
Supported branch names are:
* `feature/*`
* `feat/*`
* `hotfix/*`
* `hf/*`
* `fix/*`
* `docs/*`
* `style/*`
* `refactor/*`
* `test/*`
* `chore/*`

### Commit messages
Commit messages for this repository follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

Why is this approach used?

The intended release approaches

examples:

The versioning of this repository follows [Semantic Versioning](https://semver.org/) and the version is

### Versioning
Versioning is achieved using [GitVersion](https://gitversion.net/). The version is calculated based on the commits and the history of the repository. 

Supported scenarios
* main
* hotfix
* feature
* pull request

Can be bumped or ignored based on commit messages. Look at `-version-bump-message` sections in https://gitversion.net/docs/reference/configuration.

### Release notes
Are generated from the generated version.

### Testing
#### Unit tests
Code coverage at branch 100%

#### Integration tests



