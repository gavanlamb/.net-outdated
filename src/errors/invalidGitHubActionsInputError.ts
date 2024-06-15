/**
 * Error indicating a GitHub Actions Input error
 */
class InvalidGitHubActionsInputError extends Error {
    inputName: string;

    constructor(inputName: string, message: string) {
        super(message);
        this.name = 'InvalidGitHubActionsInputError';
        this.inputName = inputName;
    }
}

export {
    InvalidGitHubActionsInputError
};