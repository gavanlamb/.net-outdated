describe("createOctokitClient", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should handle auth failures gracefully", async () => {
        const errorMessage = "Auth failed";

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const createActionAuthMock = jest.fn();
        jest.doMock("@octokit/auth-action", () => ({ createActionAuth: createActionAuthMock }));

        const OctokitMock = { plugin: jest.fn() };
        jest.doMock("@octokit/core", () => ({ Octokit: OctokitMock }));

        const pluginRetryMock = jest.fn();
        jest.doMock("@octokit/plugin-retry", () => ({ retry: pluginRetryMock }));

        const authMock = jest.fn();
        createActionAuthMock.mockReturnValue(authMock);
        authMock.mockRejectedValue(new Error(errorMessage));

        const { createOctokitClient } = await import("../../src/clients/octokit");
        const clientPromise = createOctokitClient();

        expect(debugMock).toHaveBeenCalledWith('Going to create octokit client...');
        await expect(clientPromise).rejects.toThrow(errorMessage);
        expect(createActionAuthMock).toHaveBeenCalledTimes(1);
    });

    it("should call Octokit.plugin with retry", async () => {
        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const createActionAuthMock = jest.fn();
        jest.doMock("@octokit/auth-action", () => ({ createActionAuth: createActionAuthMock }));

        const OctokitMock = { plugin: jest.fn() };
        jest.doMock("@octokit/core", () => ({ Octokit: OctokitMock }));

        const pluginRetryMock = jest.fn();
        jest.doMock("@octokit/plugin-retry", () => ({ retry: pluginRetryMock }));

        const authMock = jest.fn();
        createActionAuthMock.mockReturnValue(authMock);
        authMock.mockResolvedValue({ token: "test-token" });

        const octokitInstanceMock = jest.fn();
        OctokitMock.plugin.mockReturnValue(octokitInstanceMock);

        const { createOctokitClient } = await import("../../src/clients/octokit");
        await createOctokitClient();

        expect(OctokitMock.plugin).toHaveBeenCalledWith(pluginRetryMock);
    });

    it("should pass correct config to the Octokit client", async () => {
        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const createActionAuthMock = jest.fn();
        jest.doMock("@octokit/auth-action", () => ({ createActionAuth: createActionAuthMock }));

        const OctokitMock = { plugin: jest.fn() };
        jest.doMock("@octokit/core", () => ({ Octokit: OctokitMock }));

        const pluginRetryMock = jest.fn();
        jest.doMock("@octokit/plugin-retry", () => ({ retry: pluginRetryMock }));

        const authMock = jest.fn();
        createActionAuthMock.mockReturnValue(authMock);
        authMock.mockResolvedValue({ token: "test-token" });

        const octokitInstanceMock = jest.fn();
        OctokitMock.plugin.mockReturnValue(octokitInstanceMock);

        const { createOctokitClient } = await import("../../src/clients/octokit");
        await createOctokitClient();

        expect(octokitInstanceMock).toHaveBeenCalledWith({
            auth: "test-token",
            request: {
                retries: 3,
                retryAfter: 1000,
            }
        });
    });

    it("should create the Octokit client successfully", async () => {
        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const createActionAuthMock = jest.fn();
        jest.doMock("@octokit/auth-action", () => ({ createActionAuth: createActionAuthMock }));

        const OctokitMock = { plugin: jest.fn() };
        jest.doMock("@octokit/core", () => ({ Octokit: OctokitMock }));

        const pluginRetryMock = jest.fn();
        jest.doMock("@octokit/plugin-retry", () => ({ retry: pluginRetryMock }));

        const token = "test-token";
        const authMock = jest.fn();
        createActionAuthMock.mockReturnValue(authMock);
        authMock.mockResolvedValue({ token });

        const octokitInstanceMock = jest.fn();
        OctokitMock.plugin.mockReturnValue(octokitInstanceMock);

        const { createOctokitClient } = await import("../../src/clients/octokit");
        await createOctokitClient();

        expect(debugMock).toHaveBeenCalledWith('Going to create octokit client...');
        expect(createActionAuthMock).toHaveBeenCalledTimes(1);
        expect(authMock).toHaveBeenCalledTimes(1);
        expect(debugMock).toHaveBeenCalledWith('Retrieved Octokit auth');
        expect(debugMock).toHaveBeenCalledWith('Created Octokit auth');
        expect(OctokitMock.plugin).toHaveBeenCalledWith(pluginRetryMock);
        expect(debugMock).toHaveBeenCalledWith('Added retry policy to octokit client');
        expect(octokitInstanceMock).toHaveBeenCalledWith({
            auth: token,
            request: {
                retries: 3,
                retryAfter: 1000,
            }
        });
        expect(debugMock).toHaveBeenCalledWith('Created Octokit client');
    });
});
