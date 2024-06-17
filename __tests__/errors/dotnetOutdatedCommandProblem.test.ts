describe('DotnetOutdatedCommandProblem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('should create an instance of DotnetOutdatedCommandProblem with the correct properties', async () => {
        const projectName = 'testInput.csproj';
        const message = 'Project not restored';

        const { DotnetOutdatedCommandProblem } = await import("../../src/errors/dotnetOutdatedCommandProblem");
        const error = new DotnetOutdatedCommandProblem(projectName, message);

        expect(error).toBeInstanceOf(DotnetOutdatedCommandProblem);
        expect(error.name).toBe('DotnetOutdatedCommandProblem');
        expect(error.projectName).toBe(projectName);
        expect(error.message).toBe(message);
    });

    it('should have a stack trace', async () => {
        const projectName = 'testInput.csproj';
        const message = 'Project not restored';

        const { DotnetOutdatedCommandProblem } = await import("../../src/errors/dotnetOutdatedCommandProblem");
        const error = new DotnetOutdatedCommandProblem(projectName, message);

        expect(error.stack).toBeDefined();
    });
});