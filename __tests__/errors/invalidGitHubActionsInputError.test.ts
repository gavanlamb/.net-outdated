describe('InvalidGitHubActionsInputError', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('should create an instance of InvalidGitHubActionsInputError with the correct properties', async () => {
        const inputName = 'testInput';
        const message = 'Invalid input provided';

        const { InvalidGitHubActionsInputError } = await import("../../src/errors/invalidGitHubActionsInputError");
        const error = new InvalidGitHubActionsInputError(inputName, message);

        expect(error).toBeInstanceOf(InvalidGitHubActionsInputError);
        expect(error.name).toBe('InvalidGitHubActionsInputError');
        expect(error.inputName).toBe(inputName);
        expect(error.message).toBe(message);
    });

    it('should have a stack trace', async () => {
        const inputName = 'testInput';
        const message = 'Invalid input provided';

        const { InvalidGitHubActionsInputError } = await import("../../src/errors/invalidGitHubActionsInputError");
        const error = new InvalidGitHubActionsInputError(inputName, message);

        expect(error.stack).toBeDefined();
    });
});