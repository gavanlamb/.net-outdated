import {Configuration} from "../../src/types/configuration";

describe("run", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should create message and call methods to create check and comment", async () => {
        const configuration: Configuration = {
            parameters: "-outdated",
            version: 1,
            sources: [],
            projects: [
                {
                    path: "/path/to/project.csproj",
                    frameworks: [
                        {
                            framework: "net5.0",
                            topLevelPackages: [
                                {
                                    id: "PackageA",
                                    requestedVersion: "1.0.0",
                                    resolvedVersion: "1.0.0",
                                    latestVersion: "2.0.0"
                                },
                                {
                                    id: "PackageB",
                                    requestedVersion: "1.0.0-foo",
                                    resolvedVersion: "1.0.0-foo",
                                    latestVersion: "2.0.0"
                                },
                                {
                                    id: "PackageC",
                                    requestedVersion: "1.0.0",
                                    resolvedVersion: "1.0.0",
                                    latestVersion: "1.1.0"
                                },
                                {
                                    id: "PackageD",
                                    requestedVersion: "1.0.0-foo",
                                    resolvedVersion: "1.0.0-foo",
                                    latestVersion: "1.1.0"
                                },
                                {
                                    id: "PackageE",
                                    requestedVersion: "1.0.0",
                                    resolvedVersion: "1.0.0",
                                    latestVersion: "1.0.1"
                                }
                            ],
                            transitivePackages: [
                                {
                                    id: "PackageF",
                                    resolvedVersion: "1.0.0-foo",
                                    latestVersion: "1.0.1"
                                },
                                {
                                    id: "PackageG",
                                    resolvedVersion: "1.0.0-foo",
                                    latestVersion: "1.0.0-foo.bar"
                                },
                                {
                                    id: "PackageH",
                                    resolvedVersion: "1.0.0",
                                    latestVersion: "1.0.0+foo"
                                },
                                {
                                    id: "PackageI",
                                    resolvedVersion: "1.0.1",
                                    latestVersion: "1.0.0"
                                }
                            ]
                        }
                    ]
                }
            ]
        };
        const listOutdatedPackagesMock = jest.fn();
        listOutdatedPackagesMock.mockReturnValue(Promise.resolve(configuration));
        jest.doMock("../../src/services/dotnetService", () => ({ listOutdatedPackages: listOutdatedPackagesMock }));

        const detailedBody = "# Dotnet Outdated";
        const getDetailedBodyMock = jest.fn();
        getDetailedBodyMock.mockReturnValue(detailedBody);
        const summaryBody = "# Dotnet Outdated";
        const getSummaryBodyMock = jest.fn();
        getSummaryBodyMock.mockReturnValue(summaryBody);
        jest.doMock("../../src/services/summaryService", () => ({ getDetailedBody: getDetailedBodyMock, getSummaryBody: getSummaryBodyMock }));

        const addCommentMock = jest.fn();
        addCommentMock.mockReturnValue(Promise.resolve);
        const createCheckRunMock = jest.fn();
        createCheckRunMock.mockReturnValue(Promise.resolve);
        jest.doMock("../../src/services/githubService", () => ({ addComment: addCommentMock, createCheckRun: createCheckRunMock }));

        const { run } = await import("../../src/services/outdatedService");
        await run();

        expect(getDetailedBodyMock).toHaveBeenCalledWith(configuration);
        expect(getSummaryBodyMock).toHaveBeenCalledWith(configuration);
        expect(createCheckRunMock).toHaveBeenCalledWith(summaryBody, detailedBody, true);
        expect(addCommentMock).toHaveBeenCalledWith(detailedBody);
    });

    it("should catch exceptions and fail execution", async () => {
        const setFailedMock = jest.fn();
        jest.doMock("@actions/core", () => ({ setFailed: setFailedMock }));

        const errorMessage = "Error message";

        const listOutdatedPackagesMock = jest.fn();
        listOutdatedPackagesMock.mockImplementation(() => { throw new Error(errorMessage); });
        jest.doMock("../../src/services/dotnetService", () => ({ listOutdatedPackages: listOutdatedPackagesMock }));

        jest.doMock("../../src/services/summaryService", () => {});

        jest.doMock("../../src/services/githubService", () => {});

        const { run } = await import("../../src/services/outdatedService");
        await run();

        expect(setFailedMock).toHaveBeenCalledTimes(1);
        expect(setFailedMock).toHaveBeenCalledWith(errorMessage);
    });
});
