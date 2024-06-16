# Contributing
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



PRs are squash commits

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