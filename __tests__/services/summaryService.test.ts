import {
    Configuration
} from "../../src/types/configuration";
import {
    when
} from "jest-when";

describe("getDetailedBody", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a detailed markdown view for a given configuration", async () => {
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

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getFileNameMock = jest.fn().mockReturnValue("project.csproj");
        jest.doMock("../../src/helpers/pathHelper", () => ({getFileName: getFileNameMock}));

        const semverDiffMock = jest.fn();
        when(semverDiffMock).calledWith("1.0.0", "2.0.0").mockReturnValue("major");
        when(semverDiffMock).calledWith("1.0.0-foo", "2.0.0").mockReturnValue("premajor");
        when(semverDiffMock).calledWith("1.0.0", "1.1.0").mockReturnValue("minor");
        when(semverDiffMock).calledWith("1.0.0-foo", "1.1.0").mockReturnValue("preminor");
        when(semverDiffMock).calledWith("1.0.0", "1.0.1").mockReturnValue("patch");
        when(semverDiffMock).calledWith("1.0.0-foo", "1.0.1").mockReturnValue("prepatch");
        when(semverDiffMock).calledWith("1.0.0-foo", "1.0.0-foo.bar").mockReturnValue("prerelease");
        when(semverDiffMock).calledWith("1.0.0", "1.0.0+foo").mockReturnValue("build");
        when(semverDiffMock).calledWith("1.0.1", "1.0.0").mockReturnValue(undefined);
        jest.doMock("semver-diff", () => ({ __esModule: true, default: semverDiffMock }));

        const { getDetailedBody } = await import("../../src/services/summaryService");
        const result = getDetailedBody(configuration);

        expect(debugMock).toHaveBeenCalledWith("Going to generate detailed view...");
        expect(getFileNameMock).toHaveBeenCalledWith("/path/to/project.csproj");
        expect(debugMock).toHaveBeenCalledWith("Generated detailed view " +
            "## project.csproj\n" +
            "\n" +
            "### net5.0\n" +
            "\n" +
            "| Package name | Type | Request version | Resolved version | Latest version | Severity |\n" +
            "|---|---|---:|---:|---:|---:|\n" +
            "| PackageA | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{red}{\\textsf{2.0.0}}$ | Major |\n" +
            "| PackageB | Top Level | 1.0.0-foo | 1.0.0-foo | $\\textcolor{red}{\\textsf{2.0.0}}$ | Premajor |\n" +
            "| PackageC | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{yellow}{\\textsf{1.1.0}}$ | Minor |\n" +
            "| PackageD | Top Level | 1.0.0-foo | 1.0.0-foo | $\\textcolor{yellow}{\\textsf{1.1.0}}$ | Preminor |\n" +
            "| PackageE | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{green}{\\textsf{1.0.1}}$ | Patch |\n" +
            "| PackageF | Transitive |  | 1.0.0-foo | $\\textcolor{green}{\\textsf{1.0.1}}$ | Prepatch |\n" +
            "| PackageG | Transitive |  | 1.0.0-foo | $\\textcolor{green}{\\textsf{1.0.0-foo.bar}}$ | Prerelease |\n" +
            "| PackageH | Transitive |  | 1.0.0 | $\\textcolor{green}{\\textsf{1.0.0+foo}}$ | Build |\n" +
            "| PackageI | Transitive |  | 1.0.1 | 1.0.0 |  |\n" +
            "\n" +
            "> __Note__\n" +
            ">\n" +
            "> 🔴: Major version update or pre-release version. Possible breaking changes.\n" +
            ">\n" +
            "> 🟡: Minor version update. Backwards-compatible features added.\n" +
            ">\n" +
            "> 🟢: Patch version update. Backwards-compatible bug fixes.\n");
        expect(result).toContain("## project.csproj");
        expect(result).toContain("### net5.0");
        expect(result).toContain("| Package name | Type | Request version | Resolved version | Latest version | Severity |");
        expect(result).toContain("| PackageA | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{red}{\\textsf{2.0.0}}$ | Major |");
        expect(result).toContain("| PackageB | Top Level | 1.0.0-foo | 1.0.0-foo | $\\textcolor{red}{\\textsf{2.0.0}}$ | Premajor |");
        expect(result).toContain("| PackageC | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{yellow}{\\textsf{1.1.0}}$ | Minor |");
        expect(result).toContain("| PackageD | Top Level | 1.0.0-foo | 1.0.0-foo | $\\textcolor{yellow}{\\textsf{1.1.0}}$ | Preminor |");
        expect(result).toContain("| PackageE | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{green}{\\textsf{1.0.1}}$ | Patch |");
        expect(result).toContain("| PackageF | Transitive |  | 1.0.0-foo | $\\textcolor{green}{\\textsf{1.0.1}}$ | Prepatch |");
        expect(result).toContain("| PackageG | Transitive |  | 1.0.0-foo | $\\textcolor{green}{\\textsf{1.0.0-foo.bar}}$ | Prerelease |");
        expect(result).toContain("| PackageH | Transitive |  | 1.0.0 | $\\textcolor{green}{\\textsf{1.0.0+foo}}$ | Build |");
        expect(result).toContain("| PackageI | Transitive |  | 1.0.1 | 1.0.0 |  |");
    });

    it("should return a detailed markdown view for a given configuration when topLevelPackages is undefined", async () => {
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
                            topLevelPackages: undefined,
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

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getFileNameMock = jest.fn().mockReturnValue("project.csproj");
        jest.doMock("../../src/helpers/pathHelper", () => ({getFileName: getFileNameMock}));

        const semverDiffMock = jest.fn();
        when(semverDiffMock).calledWith("1.0.0-foo", "1.0.1").mockReturnValue("prepatch");
        when(semverDiffMock).calledWith("1.0.0-foo", "1.0.0-foo.bar").mockReturnValue("prerelease");
        when(semverDiffMock).calledWith("1.0.0", "1.0.0+foo").mockReturnValue("build");
        when(semverDiffMock).calledWith("1.0.1", "1.0.0").mockReturnValue(undefined);
        jest.doMock("semver-diff", () => ({ __esModule: true, default: semverDiffMock }));

        const { getDetailedBody } = await import("../../src/services/summaryService");
        const result = getDetailedBody(configuration);

        expect(debugMock).toHaveBeenCalledWith("Going to generate detailed view...");
        expect(getFileNameMock).toHaveBeenCalledWith("/path/to/project.csproj");
        expect(debugMock).toHaveBeenCalledWith("Generated detailed view " +
            "## project.csproj\n" +
            "\n" +
            "### net5.0\n" +
            "\n" +
            "| Package name | Type | Request version | Resolved version | Latest version | Severity |\n" +
            "|---|---|---:|---:|---:|---:|\n" +
            "| PackageF | Transitive |  | 1.0.0-foo | $\\textcolor{green}{\\textsf{1.0.1}}$ | Prepatch |\n" +
            "| PackageG | Transitive |  | 1.0.0-foo | $\\textcolor{green}{\\textsf{1.0.0-foo.bar}}$ | Prerelease |\n" +
            "| PackageH | Transitive |  | 1.0.0 | $\\textcolor{green}{\\textsf{1.0.0+foo}}$ | Build |\n" +
            "| PackageI | Transitive |  | 1.0.1 | 1.0.0 |  |\n" +
            "\n" +
            "> __Note__\n" +
            ">\n" +
            "> 🔴: Major version update or pre-release version. Possible breaking changes.\n" +
            ">\n" +
            "> 🟡: Minor version update. Backwards-compatible features added.\n" +
            ">\n" +
            "> 🟢: Patch version update. Backwards-compatible bug fixes.\n");
        expect(result).toContain("## project.csproj");
        expect(result).toContain("### net5.0");
        expect(result).toContain("| Package name | Type | Request version | Resolved version | Latest version | Severity |");
        expect(result).toContain("| PackageF | Transitive |  | 1.0.0-foo | $\\textcolor{green}{\\textsf{1.0.1}}$ | Prepatch |");
        expect(result).toContain("| PackageG | Transitive |  | 1.0.0-foo | $\\textcolor{green}{\\textsf{1.0.0-foo.bar}}$ | Prerelease |");
        expect(result).toContain("| PackageH | Transitive |  | 1.0.0 | $\\textcolor{green}{\\textsf{1.0.0+foo}}$ | Build |");
        expect(result).toContain("| PackageI | Transitive |  | 1.0.1 | 1.0.0 |  |");
    });

    it("should return a detailed markdown view for a given configuration when topLevelPackages is empty", async () => {
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
                            topLevelPackages: [],
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

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getFileNameMock = jest.fn().mockReturnValue("project.csproj");
        jest.doMock("../../src/helpers/pathHelper", () => ({getFileName: getFileNameMock}));

        const semverDiffMock = jest.fn();
        when(semverDiffMock).calledWith("1.0.0-foo", "1.0.1").mockReturnValue("prepatch");
        when(semverDiffMock).calledWith("1.0.0-foo", "1.0.0-foo.bar").mockReturnValue("prerelease");
        when(semverDiffMock).calledWith("1.0.0", "1.0.0+foo").mockReturnValue("build");
        when(semverDiffMock).calledWith("1.0.1", "1.0.0").mockReturnValue(undefined);
        jest.doMock("semver-diff", () => ({ __esModule: true, default: semverDiffMock }));

        const { getDetailedBody } = await import("../../src/services/summaryService");
        const result = getDetailedBody(configuration);

        expect(debugMock).toHaveBeenCalledWith("Going to generate detailed view...");
        expect(getFileNameMock).toHaveBeenCalledWith("/path/to/project.csproj");
        expect(debugMock).toHaveBeenCalledWith("Generated detailed view " +
            "## project.csproj\n" +
            "\n" +
            "### net5.0\n" +
            "\n" +
            "| Package name | Type | Request version | Resolved version | Latest version | Severity |\n" +
            "|---|---|---:|---:|---:|---:|\n" +
            "| PackageF | Transitive |  | 1.0.0-foo | $\\textcolor{green}{\\textsf{1.0.1}}$ | Prepatch |\n" +
            "| PackageG | Transitive |  | 1.0.0-foo | $\\textcolor{green}{\\textsf{1.0.0-foo.bar}}$ | Prerelease |\n" +
            "| PackageH | Transitive |  | 1.0.0 | $\\textcolor{green}{\\textsf{1.0.0+foo}}$ | Build |\n" +
            "| PackageI | Transitive |  | 1.0.1 | 1.0.0 |  |\n" +
            "\n" +
            "> __Note__\n" +
            ">\n" +
            "> 🔴: Major version update or pre-release version. Possible breaking changes.\n" +
            ">\n" +
            "> 🟡: Minor version update. Backwards-compatible features added.\n" +
            ">\n" +
            "> 🟢: Patch version update. Backwards-compatible bug fixes.\n");
        expect(result).toContain("## project.csproj");
        expect(result).toContain("### net5.0");
        expect(result).toContain("| Package name | Type | Request version | Resolved version | Latest version | Severity |");
        expect(result).toContain("| PackageF | Transitive |  | 1.0.0-foo | $\\textcolor{green}{\\textsf{1.0.1}}$ | Prepatch |");
        expect(result).toContain("| PackageG | Transitive |  | 1.0.0-foo | $\\textcolor{green}{\\textsf{1.0.0-foo.bar}}$ | Prerelease |");
        expect(result).toContain("| PackageH | Transitive |  | 1.0.0 | $\\textcolor{green}{\\textsf{1.0.0+foo}}$ | Build |");
        expect(result).toContain("| PackageI | Transitive |  | 1.0.1 | 1.0.0 |  |");
    });

    it("should return a detailed markdown view for a given configuration when transitivePackages is undefined", async () => {
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
                            transitivePackages: undefined
                        }
                    ]
                }
            ]
        };

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getFileNameMock = jest.fn().mockReturnValue("project.csproj");
        jest.doMock("../../src/helpers/pathHelper", () => ({getFileName: getFileNameMock}));

        const semverDiffMock = jest.fn();
        when(semverDiffMock).calledWith("1.0.0", "2.0.0").mockReturnValue("major");
        when(semverDiffMock).calledWith("1.0.0-foo", "2.0.0").mockReturnValue("premajor");
        when(semverDiffMock).calledWith("1.0.0", "1.1.0").mockReturnValue("minor");
        when(semverDiffMock).calledWith("1.0.0-foo", "1.1.0").mockReturnValue("preminor");
        when(semverDiffMock).calledWith("1.0.0", "1.0.1").mockReturnValue("patch");
        jest.doMock("semver-diff", () => ({ __esModule: true, default: semverDiffMock }));

        const { getDetailedBody } = await import("../../src/services/summaryService");
        const result = getDetailedBody(configuration);

        expect(debugMock).toHaveBeenCalledWith("Going to generate detailed view...");
        expect(getFileNameMock).toHaveBeenCalledWith("/path/to/project.csproj");
        expect(debugMock).toHaveBeenCalledWith("Generated detailed view " +
            "## project.csproj\n" +
            "\n" +
            "### net5.0\n" +
            "\n" +
            "| Package name | Type | Request version | Resolved version | Latest version | Severity |\n" +
            "|---|---|---:|---:|---:|---:|\n" +
            "| PackageA | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{red}{\\textsf{2.0.0}}$ | Major |\n" +
            "| PackageB | Top Level | 1.0.0-foo | 1.0.0-foo | $\\textcolor{red}{\\textsf{2.0.0}}$ | Premajor |\n" +
            "| PackageC | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{yellow}{\\textsf{1.1.0}}$ | Minor |\n" +
            "| PackageD | Top Level | 1.0.0-foo | 1.0.0-foo | $\\textcolor{yellow}{\\textsf{1.1.0}}$ | Preminor |\n" +
            "| PackageE | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{green}{\\textsf{1.0.1}}$ | Patch |\n" +
            "\n" +
            "> __Note__\n" +
            ">\n" +
            "> 🔴: Major version update or pre-release version. Possible breaking changes.\n" +
            ">\n" +
            "> 🟡: Minor version update. Backwards-compatible features added.\n" +
            ">\n" +
            "> 🟢: Patch version update. Backwards-compatible bug fixes.\n");
        expect(result).toContain("## project.csproj");
        expect(result).toContain("### net5.0");
        expect(result).toContain("| Package name | Type | Request version | Resolved version | Latest version | Severity |");
        expect(result).toContain("| PackageA | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{red}{\\textsf{2.0.0}}$ | Major |");
        expect(result).toContain("| PackageB | Top Level | 1.0.0-foo | 1.0.0-foo | $\\textcolor{red}{\\textsf{2.0.0}}$ | Premajor |");
        expect(result).toContain("| PackageC | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{yellow}{\\textsf{1.1.0}}$ | Minor |");
        expect(result).toContain("| PackageD | Top Level | 1.0.0-foo | 1.0.0-foo | $\\textcolor{yellow}{\\textsf{1.1.0}}$ | Preminor |");
        expect(result).toContain("| PackageE | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{green}{\\textsf{1.0.1}}$ | Patch |");
    });

    it("should return a detailed markdown view for a given configuration when transitivePackages is empty", async () => {
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
                            transitivePackages: []
                        }
                    ]
                }
            ]
        };

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getFileNameMock = jest.fn().mockReturnValue("project.csproj");
        jest.doMock("../../src/helpers/pathHelper", () => ({getFileName: getFileNameMock}));

        const semverDiffMock = jest.fn();
        when(semverDiffMock).calledWith("1.0.0", "2.0.0").mockReturnValue("major");
        when(semverDiffMock).calledWith("1.0.0-foo", "2.0.0").mockReturnValue("premajor");
        when(semverDiffMock).calledWith("1.0.0", "1.1.0").mockReturnValue("minor");
        when(semverDiffMock).calledWith("1.0.0-foo", "1.1.0").mockReturnValue("preminor");
        when(semverDiffMock).calledWith("1.0.0", "1.0.1").mockReturnValue("patch");
        jest.doMock("semver-diff", () => ({ __esModule: true, default: semverDiffMock }));

        const { getDetailedBody } = await import("../../src/services/summaryService");
        const result = getDetailedBody(configuration);

        expect(debugMock).toHaveBeenCalledWith("Going to generate detailed view...");
        expect(getFileNameMock).toHaveBeenCalledWith("/path/to/project.csproj");
        expect(debugMock).toHaveBeenCalledWith("Generated detailed view " +
            "## project.csproj\n" +
            "\n" +
            "### net5.0\n" +
            "\n" +
            "| Package name | Type | Request version | Resolved version | Latest version | Severity |\n" +
            "|---|---|---:|---:|---:|---:|\n" +
            "| PackageA | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{red}{\\textsf{2.0.0}}$ | Major |\n" +
            "| PackageB | Top Level | 1.0.0-foo | 1.0.0-foo | $\\textcolor{red}{\\textsf{2.0.0}}$ | Premajor |\n" +
            "| PackageC | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{yellow}{\\textsf{1.1.0}}$ | Minor |\n" +
            "| PackageD | Top Level | 1.0.0-foo | 1.0.0-foo | $\\textcolor{yellow}{\\textsf{1.1.0}}$ | Preminor |\n" +
            "| PackageE | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{green}{\\textsf{1.0.1}}$ | Patch |\n" +
            "\n" +
            "> __Note__\n" +
            ">\n" +
            "> 🔴: Major version update or pre-release version. Possible breaking changes.\n" +
            ">\n" +
            "> 🟡: Minor version update. Backwards-compatible features added.\n" +
            ">\n" +
            "> 🟢: Patch version update. Backwards-compatible bug fixes.\n");
        expect(result).toContain("## project.csproj");
        expect(result).toContain("### net5.0");
        expect(result).toContain("| Package name | Type | Request version | Resolved version | Latest version | Severity |");
        expect(result).toContain("| PackageA | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{red}{\\textsf{2.0.0}}$ | Major |");
        expect(result).toContain("| PackageB | Top Level | 1.0.0-foo | 1.0.0-foo | $\\textcolor{red}{\\textsf{2.0.0}}$ | Premajor |");
        expect(result).toContain("| PackageC | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{yellow}{\\textsf{1.1.0}}$ | Minor |");
        expect(result).toContain("| PackageD | Top Level | 1.0.0-foo | 1.0.0-foo | $\\textcolor{yellow}{\\textsf{1.1.0}}$ | Preminor |");
        expect(result).toContain("| PackageE | Top Level | 1.0.0 | 1.0.0 | $\\textcolor{green}{\\textsf{1.0.1}}$ | Patch |");
    });

    it("should return a message indicating all frameworks contains no items", async () => {
        const configuration: Configuration = {
            parameters: "-outdated",
            version: 1,
            sources: [],
            projects: [
                {
                    path: "/path/to/project.csproj",
                    frameworks: undefined
                }
            ]
        };

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getFileNameMock = jest.fn().mockReturnValue("project.csproj");
        jest.doMock("../../src/helpers/pathHelper", () => ({ getFileName: getFileNameMock }));

        const semverDiffMock = jest.fn().mockReturnValue(null);
        jest.doMock("semver-diff", () => ({ __esModule: true, default: semverDiffMock }));

        const { getDetailedBody } = await import("../../src/services/summaryService");
        const result = getDetailedBody(configuration);

        expect(debugMock).toHaveBeenCalledWith("Going to generate detailed view...");
        expect(debugMock).toHaveBeenCalledWith("Generated detailed view All packages are up-to-date with the latest versions");
        expect(result).toContain("All packages are up-to-date with the latest versions");
    });

    it("should return a message indicating all packages are up-to-date when there are no updates", async () => {
        const configuration: Configuration = {
            parameters: "-outdated",
            version: 1,
            sources: [],
            projects: [
                {
                    path: "/path/to/project.csproj",
                    frameworks: []
                }
            ]
        };

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getFileNameMock = jest.fn().mockReturnValue("project.csproj");
        jest.doMock("../../src/helpers/pathHelper", () => ({ getFileName: getFileNameMock }));

        const semverDiffMock = jest.fn().mockReturnValue(null);
        jest.doMock("semver-diff", () => ({ __esModule: true, default: semverDiffMock }));

        const { getDetailedBody } = await import("../../src/services/summaryService");
        const result = getDetailedBody(configuration);

        expect(debugMock).toHaveBeenCalledWith("Going to generate detailed view...");
        expect(debugMock).toHaveBeenCalledWith("Generated detailed view All packages are up-to-date with the latest versions");
        expect(result).toContain("All packages are up-to-date with the latest versions");
    });

    it("should return an empty detailed view when there are no projects", async () => {
        const configuration: Configuration = {
            parameters: "-outdated",
            version: 1,
            sources: [],
            projects: []
        };

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        jest.doMock("semver-diff", () => {});

        const { getDetailedBody } = await import("../../src/services/summaryService");
        const result = getDetailedBody(configuration);

        expect(debugMock).toHaveBeenCalledWith("Going to generate detailed view...");
        expect(debugMock).toHaveBeenCalledWith("Generated detailed view All packages are up-to-date with the latest versions");
        expect(result).toContain("All packages are up-to-date with the latest versions");
    });
});

describe("getSummaryBody", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a summary markdown view", async () => {
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

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getFileNameMock = jest.fn().mockReturnValue("project.csproj");
        jest.doMock("../../src/helpers/pathHelper", () => ({getFileName: getFileNameMock}));

        const semverDiffMock = jest.fn();
        jest.doMock("semver-diff", () => ({ __esModule: true, default: semverDiffMock }));

        const { getSummaryBody } = await import("../../src/services/summaryService");
        const result = getSummaryBody(configuration);

        expect(debugMock).toHaveBeenCalledWith("Going to generate summary view...");
        expect(getFileNameMock).toHaveBeenCalledWith("/path/to/project.csproj");
        expect(debugMock).toHaveBeenCalledWith("Generated summary view " +
            "| Project Name | Type | Count |\n" +
            "|----|----|---:|\n" +
            "| project.csproj | Top Level | 5 |\n" +
            "| project.csproj | Transitive | 4 |\n");
        expect(result).toContain("| Project Name | Type | Count |");
        expect(result).toContain("|----|----|---:|");
        expect(result).toContain("| project.csproj | Top Level | 5 |");
        expect(result).toContain("| project.csproj | Transitive | 4 |");
    });

    it("should return a summary markdown with the distinct count when multiple frameworks have the same outdated packages", async () => {
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
                        },
                        {
                            framework: "net6.0",
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
                        },
                        {
                            framework: "net7.0",
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

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getFileNameMock = jest.fn().mockReturnValue("project.csproj");
        jest.doMock("../../src/helpers/pathHelper", () => ({getFileName: getFileNameMock}));

        const semverDiffMock = jest.fn();
        jest.doMock("semver-diff", () => ({ __esModule: true, default: semverDiffMock }));

        const { getSummaryBody } = await import("../../src/services/summaryService");
        const result = getSummaryBody(configuration);

        expect(debugMock).toHaveBeenCalledWith("Going to generate summary view...");
        expect(getFileNameMock).toHaveBeenCalledWith("/path/to/project.csproj");
        expect(debugMock).toHaveBeenCalledWith("Generated summary view " +
            "| Project Name | Type | Count |\n" +
            "|----|----|---:|\n" +
            "| project.csproj | Top Level | 5 |\n" +
            "| project.csproj | Transitive | 4 |\n");
        expect(result).toContain("| Project Name | Type | Count |");
        expect(result).toContain("|----|----|---:|");
        expect(result).toContain("| project.csproj | Top Level | 5 |");
        expect(result).toContain("| project.csproj | Transitive | 4 |");
    });

    it("should return a summary markdown view excluding transitive dependencies", async () => {
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
                            ]
                        }
                    ]
                }
            ]
        };

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getFileNameMock = jest.fn().mockReturnValue("project.csproj");
        jest.doMock("../../src/helpers/pathHelper", () => ({getFileName: getFileNameMock}));

        const semverDiffMock = jest.fn();
        jest.doMock("semver-diff", () => ({ __esModule: true, default: semverDiffMock }));

        const { getSummaryBody } = await import("../../src/services/summaryService");
        const result = getSummaryBody(configuration);

        expect(debugMock).toHaveBeenCalledWith("Going to generate summary view...");
        expect(getFileNameMock).toHaveBeenCalledWith("/path/to/project.csproj");
        expect(debugMock).toHaveBeenCalledWith("Generated summary view " +
          "| Project Name | Type | Count |\n" +
          "|----|----|---:|\n" +
          "| project.csproj | Top Level | 5 |\n");
        expect(result).toContain("| Project Name | Type | Count |");
        expect(result).toContain("|----|----|---:|");
        expect(result).toContain("| project.csproj | Top Level | 5 |");
    });

    it("should return a summary markdown view excluding top level dependencies", async () => {
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

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getFileNameMock = jest.fn().mockReturnValue("project.csproj");
        jest.doMock("../../src/helpers/pathHelper", () => ({getFileName: getFileNameMock}));

        const semverDiffMock = jest.fn();
        jest.doMock("semver-diff", () => ({ __esModule: true, default: semverDiffMock }));

        const { getSummaryBody } = await import("../../src/services/summaryService");
        const result = getSummaryBody(configuration);

        expect(debugMock).toHaveBeenCalledWith("Going to generate summary view...");
        expect(getFileNameMock).toHaveBeenCalledWith("/path/to/project.csproj");
        expect(debugMock).toHaveBeenCalledWith("Generated summary view " +
          "| Project Name | Type | Count |\n" +
          "|----|----|---:|\n" +
          "| project.csproj | Transitive | 4 |\n");
        expect(result).toContain("| Project Name | Type | Count |");
        expect(result).toContain("|----|----|---:|");
        expect(result).toContain("| project.csproj | Transitive | 4 |");
    });

    it("should return a string indicating frameworks all packages are up-to-date", async () => {
        const configuration: Configuration = {
            parameters: "-outdated",
            version: 1,
            sources: [],
            projects: [
                {
                    path: "/path/to/project.csproj"
                }
            ]
        };

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getFileNameMock = jest.fn().mockReturnValue("project.csproj");
        jest.doMock("../../src/helpers/pathHelper", () => ({getFileName: getFileNameMock}));

        const semverDiffMock = jest.fn();
        jest.doMock("semver-diff", () => ({ __esModule: true, default: semverDiffMock }));

        const { getSummaryBody } = await import("../../src/services/summaryService");
        const result = getSummaryBody(configuration);

        expect(debugMock).toHaveBeenCalledWith("Going to generate summary view...");
        expect(debugMock).toHaveBeenCalledWith("Generated summary view All packages are up-to-date with the latest versions");
        expect(result).toContain("All packages are up-to-date with the latest versions");
    });
});
