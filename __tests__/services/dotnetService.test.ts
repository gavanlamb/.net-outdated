import {when} from "jest-when";
import {Configuration} from "../../src/types/configuration";

describe("listOutdatedPackages", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should be called with all arguments when specified", async () => {
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
        const dotnetFrameworks = ['net5.0', 'net6.0'];
        const exitCode = 0;
        const highestPatch = true;
        const highestMinor = true;
        const includeTransitiveDependencies = true;
        const includePrereleaseDependencies = true;
        const nugetSources = ['source1', 'source2'];
        const nugetConfigFile = 'nuget.config';
        const stdout = JSON.stringify(configuration);
        const target = "target";

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getStringInputMock = jest.fn();
        when(getStringInputMock).calledWith('target').mockImplementationOnce(() => target);
        when(getStringInputMock).calledWith('nuget-config-file-path').mockImplementationOnce(() => nugetConfigFile);
        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('include-transitive-dependencies', false).mockReturnValueOnce(includeTransitiveDependencies);
        when(getBooleanInputMock).calledWith('include-prerelease-dependencies', false).mockReturnValueOnce(includePrereleaseDependencies);
        when(getBooleanInputMock).calledWith('highest-patch', false).mockReturnValueOnce(highestPatch);
        when(getBooleanInputMock).calledWith('highest-minor', false).mockReturnValueOnce(highestMinor);
        const getStringArrayInputMock = jest.fn();
        when(getStringArrayInputMock).calledWith('nuget-sources').mockReturnValueOnce(nugetSources);
        when(getStringArrayInputMock).calledWith('dotnet-framework').mockReturnValueOnce(dotnetFrameworks);
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock, getStringArrayInput: getStringArrayInputMock, getStringInput: getStringInputMock }));

        const getExecOutputMock = jest.fn();
        getExecOutputMock.mockReturnValue({ exitCode, stdout });
        jest.doMock("@actions/exec", () => ({ getExecOutput: getExecOutputMock }));

        const expectedArgs = [
            target,
            'package',
            '--outdated',
            '--include-transitive',
            '--include-prerelease',
            '--highest-patch',
            '--highest-minor',
            '--source source1',
            '--source source2',
            '--config nuget.config',
            '--framework net5.0',
            '--framework net6.0',
            '--format json',
            '--verbosity q'
        ];

        const { listOutdatedPackages } = await import("../../src/services/dotnetService");
        const result = await listOutdatedPackages();

        expect(getStringInputMock).toHaveBeenCalledWith('target');
        expect(getStringInputMock).toHaveBeenCalledWith('nuget-config-file-path');
        expect(getBooleanInputMock).toHaveBeenCalledWith('include-transitive-dependencies', false);
        expect(getBooleanInputMock).toHaveBeenCalledWith('include-prerelease-dependencies', false);
        expect(getBooleanInputMock).toHaveBeenCalledWith('highest-patch', false);
        expect(getBooleanInputMock).toHaveBeenCalledWith('highest-minor', false);
        expect(getStringArrayInputMock).toHaveBeenCalledWith('nuget-sources');
        expect(getStringArrayInputMock).toHaveBeenCalledWith('dotnet-framework');
        expect(debugMock).toHaveBeenCalledWith(`Going to execute "dotnet ${expectedArgs.join(" ")}"`);
        expect(getExecOutputMock).toHaveBeenCalledWith('dotnet', expectedArgs);
        expect(debugMock).toHaveBeenCalledWith(`Executed "dotnet ${expectedArgs.join(" ")}" and the status code is ${exitCode}`);
        expect(debugMock).toHaveBeenCalledWith(`Executed "dotnet ${expectedArgs.join(" ")}" and the output is ${stdout}`);
        expect(result).toStrictEqual(configuration);
    });

    it("should be called with basic arguments when specified", async () => {
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
        const dotnetFrameworks: string[] = [];
        const exitCode = 0;
        const highestPatch = false;
        const highestMinor = false;
        const includeTransitiveDependencies = false;
        const includePrereleaseDependencies = false;
        const nugetSources: string[] = [];
        const nugetConfigFile = null;
        const stdout = JSON.stringify(configuration);
        const target = null;

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getStringInputMock = jest.fn();
        when(getStringInputMock).calledWith('target').mockImplementationOnce(() => target);
        when(getStringInputMock).calledWith('nuget-config-file-path').mockImplementationOnce(() => nugetConfigFile);
        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('include-transitive-dependencies', false).mockReturnValueOnce(includeTransitiveDependencies);
        when(getBooleanInputMock).calledWith('include-prerelease-dependencies', false).mockReturnValueOnce(includePrereleaseDependencies);
        when(getBooleanInputMock).calledWith('highest-patch', false).mockReturnValueOnce(highestPatch);
        when(getBooleanInputMock).calledWith('highest-minor', false).mockReturnValueOnce(highestMinor);
        const getStringArrayInputMock = jest.fn();
        when(getStringArrayInputMock).calledWith('nuget-sources').mockReturnValueOnce(nugetSources);
        when(getStringArrayInputMock).calledWith('dotnet-framework').mockReturnValueOnce(dotnetFrameworks);
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock, getStringArrayInput: getStringArrayInputMock, getStringInput: getStringInputMock }));

        const getExecOutputMock = jest.fn();
        getExecOutputMock.mockReturnValue({ exitCode, stdout });
        jest.doMock("@actions/exec", () => ({ getExecOutput: getExecOutputMock }));

        const expectedArgs = [
            'package',
            '--outdated',
            '--format json',
            '--verbosity q'
        ];

        const { listOutdatedPackages } = await import("../../src/services/dotnetService");
        const result = await listOutdatedPackages();

        expect(getStringInputMock).toHaveBeenCalledWith('target');
        expect(getStringInputMock).toHaveBeenCalledWith('nuget-config-file-path');
        expect(getBooleanInputMock).toHaveBeenCalledWith('include-transitive-dependencies', false);
        expect(getBooleanInputMock).toHaveBeenCalledWith('include-prerelease-dependencies', false);
        expect(getBooleanInputMock).toHaveBeenCalledWith('highest-patch', false);
        expect(getBooleanInputMock).toHaveBeenCalledWith('highest-minor', false);
        expect(getStringArrayInputMock).toHaveBeenCalledWith('nuget-sources');
        expect(getStringArrayInputMock).toHaveBeenCalledWith('dotnet-framework');
        expect(debugMock).toHaveBeenCalledWith(`Going to execute "dotnet ${expectedArgs.join(" ")}"`);
        expect(getExecOutputMock).toHaveBeenCalledWith('dotnet', expectedArgs);
        expect(debugMock).toHaveBeenCalledWith(`Executed "dotnet ${expectedArgs.join(" ")}" and the status code is ${exitCode}`);
        expect(debugMock).toHaveBeenCalledWith(`Executed "dotnet ${expectedArgs.join(" ")}" and the output is ${stdout}`);
        expect(result).toStrictEqual(configuration);
    });

    it("should throw an error exit code is not 0", async () => {
        const dotnetFrameworks: string[] = [];
        const exitCode = 1;
        const highestPatch = false;
        const highestMinor = false;
        const includeTransitiveDependencies = false;
        const includePrereleaseDependencies = false;
        const nugetSources: string[] = [];
        const nugetConfigFile = null;
        const stderr = "Error encountered";
        const target = null;

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getStringInputMock = jest.fn();
        when(getStringInputMock).calledWith('target').mockImplementationOnce(() => target);
        when(getStringInputMock).calledWith('nuget-config-file-path').mockImplementationOnce(() => nugetConfigFile);
        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('include-transitive-dependencies', false).mockReturnValueOnce(includeTransitiveDependencies);
        when(getBooleanInputMock).calledWith('include-prerelease-dependencies', false).mockReturnValueOnce(includePrereleaseDependencies);
        when(getBooleanInputMock).calledWith('highest-patch', false).mockReturnValueOnce(highestPatch);
        when(getBooleanInputMock).calledWith('highest-minor', false).mockReturnValueOnce(highestMinor);
        const getStringArrayInputMock = jest.fn();
        when(getStringArrayInputMock).calledWith('nuget-sources').mockReturnValueOnce(nugetSources);
        when(getStringArrayInputMock).calledWith('dotnet-framework').mockReturnValueOnce(dotnetFrameworks);
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock, getStringArrayInput: getStringArrayInputMock, getStringInput: getStringInputMock }));

        const getExecOutputMock = jest.fn();
        getExecOutputMock.mockReturnValue({ exitCode, stderr });
        jest.doMock("@actions/exec", () => ({ getExecOutput: getExecOutputMock }));

        const expectedArgs = [
            'package',
            '--outdated',
            '--format json',
            '--verbosity q'
        ];

        const { listOutdatedPackages } = await import("../../src/services/dotnetService");
        const result = listOutdatedPackages();

        await expect(result).rejects.toThrow(stderr);
        expect(getStringInputMock).toHaveBeenCalledWith('target');
        expect(getStringInputMock).toHaveBeenCalledWith('nuget-config-file-path');
        expect(getBooleanInputMock).toHaveBeenCalledWith('include-transitive-dependencies', false);
        expect(getBooleanInputMock).toHaveBeenCalledWith('include-prerelease-dependencies', false);
        expect(getBooleanInputMock).toHaveBeenCalledWith('highest-patch', false);
        expect(getBooleanInputMock).toHaveBeenCalledWith('highest-minor', false);
        expect(getStringArrayInputMock).toHaveBeenCalledWith('nuget-sources');
        expect(getStringArrayInputMock).toHaveBeenCalledWith('dotnet-framework');
        expect(debugMock).toHaveBeenCalledWith(`Going to execute "dotnet ${expectedArgs.join(" ")}"`);
        expect(getExecOutputMock).toHaveBeenCalledWith('dotnet', expectedArgs);
        expect(debugMock).toHaveBeenCalledWith(`Executed "dotnet ${expectedArgs.join(" ")}" and the status code is ${exitCode}`);
        expect(debugMock).toHaveBeenCalledWith(`Executed "dotnet ${expectedArgs.join(" ")}" and the output is ${stderr}`);
    });
});
