/**
 * Error indicating a dotnet outdated command problem
 */
class DotnetOutdatedCommandProblemError extends Error {
    projectName: string;

    constructor(projectName: string, message: string) {
        super(message);
        this.name = 'DotnetOutdatedCommandProblemError';
        this.projectName = projectName;
    }
}

export {
    DotnetOutdatedCommandProblemError
};