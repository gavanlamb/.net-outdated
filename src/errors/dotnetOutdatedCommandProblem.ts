/**
 * Error indicating a dotnet outdated command problem
 */
class DotnetOutdatedCommandProblem extends Error {
    projectName: string;

    constructor(projectName: string, message: string) {
        super(message);
        this.name = 'DotnetOutdatedCommandProblem';
        this.projectName = projectName;
    }
}

export {
    DotnetOutdatedCommandProblem
};