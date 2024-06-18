describe('DotnetOutdatedCommandProblemError', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('should create an instance of DotnetOutdatedCommandProblemError with the correct properties', async () => {
        const projectName = 'testInput.csproj';
        const message = 'Project not restored';

        const { DotnetOutdatedCommandProblemError } = await import("../../src/errors/dotnetOutdatedCommandProblemError");
        const error = new DotnetOutdatedCommandProblemError(projectName, message);

        expect(error).toBeInstanceOf(DotnetOutdatedCommandProblemError);
        expect(error.name).toBe('DotnetOutdatedCommandProblemError');
        expect(error.projectName).toBe(projectName);
        expect(error.message).toBe(message);
    });

    it('should have a stack trace', async () => {
        const projectName = 'testInput.csproj';
        const message = 'Project not restored';

        const { DotnetOutdatedCommandProblemError } = await import("../../src/errors/dotnetOutdatedCommandProblemError");
        const error = new DotnetOutdatedCommandProblemError(projectName, message);

        expect(error.stack).toBeDefined();
    });
});