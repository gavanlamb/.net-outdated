import {
    Configuration
} from "../types/configuration";
import {
    getFileName
} from "../helpers/pathHelper";
import {
    dependencyDetails
} from "../types/dependencyDetails";
import {
    DependencyType
} from "../types/dependencyType";
import {
    info,
    debug
} from "@actions/core";
import {
    getVersion
} from "./versionService";
import {ReleaseType} from "semver";

function getFormattedVersion(
    difference: ReleaseType | null,
    version: string): string
{
    switch (difference) {
        case "premajor":
        case "major":
            return `\$\\textcolor{red}{\\textsf{${version}}}\$`;
        case "preminor":
        case "minor":
            return `\$\\textcolor{yellow}{\\textsf{${version}}}\$`;
        case "prepatch":
        case "patch":
        case "prerelease":
            return `\$\\textcolor{green}{\\textsf{${version}}}\$`;
        default:
            return version;
    }
}

/**
 * Get the detailed body of the outdated packages
 * @param configuration to generate the detailed body for
 */
function getDetailedBody(
    configuration: Configuration): string
{
    info('Generating detailed view...');

    let markdown = "";

    for (const project of configuration.projects)
    {
        const frameworks = project.frameworks ?? [];
        if(frameworks.length === 0)
            continue;

        const fileName = getFileName(project.path);
        markdown += `## ${fileName}\n\n`;

        for (const framework of frameworks)
        {
            let dependencies: dependencyDetails[] = [];
            const topLevelPackages = framework.topLevelPackages ?? [];
            for (const topLevelPackage of topLevelPackages)
            {
                dependencies.push(
                    {
                        ...topLevelPackage,
                        type: DependencyType.TopLevel,
                        versionDifference: getVersion(topLevelPackage.requestedVersion, topLevelPackage.latestVersion)
                    }
                );
            }

            const transitivePackages = framework.transitivePackages ?? [];
            for (const transitivePackage of transitivePackages)
            {
                dependencies.push(
                    {
                        ...transitivePackage,
                        type: DependencyType.Transitive,
                        versionDifference: getVersion(transitivePackage.resolvedVersion, transitivePackage.latestVersion)
                    }
                );
            }

            dependencies = dependencies.sort((a, b) => a.id.localeCompare(b.id));

            markdown += `### ${framework.framework}\n\n`;
            markdown += `| Package name | Type | Request version | Resolved version | Latest version | Severity |\n`;
            markdown += `|---|---|---:|---:|---:|---:|\n`;
            for (const dependency of dependencies)
            {
                const id = dependency.id;
                const type = dependency.type;
                const requestedVersion = dependency.requestedVersion ?? '';
                const resolvedVersion = dependency.resolvedVersion;
                const formattedVersion = getFormattedVersion(dependency.versionDifference, dependency.latestVersion);
                const versionDifference = (dependency.versionDifference?.charAt(0).toUpperCase() ?? "") + (dependency.versionDifference?.slice(1) ?? "");
                markdown += `| ${id} | ${type} | ${requestedVersion} | ${resolvedVersion} | ${formattedVersion} | ${versionDifference} |\n`;
            }

            markdown += "\n";
        }
    }

    if(markdown)
    {
        markdown = `${markdown}`
            + "> __Note__\n" +
            ">\n" +
            "> 🔴: Major version update or pre-release version. Possible breaking changes.\n" +
            ">\n" +
            "> 🟡: Minor version update. Backwards-compatible features added.\n" +
            ">\n" +
            "> 🟢: Patch version update. Backwards-compatible bug fixes.\n";
    }
    else
    {
        markdown = `All packages are up-to-date with the latest versions`;
    }

    debug(`Generated detailed view ${markdown}`);
    return markdown;
}

/**
 * Get the summary body of the outdated packages
 * @param configuration to generate the summary body for
 */
function getSummaryBody(
    configuration: Configuration): string
{
    info('Generating summary view...');

    let markdown = "";

    for (const project of configuration.projects)
    {
        const frameworks = project.frameworks ?? [];
        if(frameworks.length === 0)
            continue;

        const fileName = getFileName(project.path);

        const topLevelPackagesCount = frameworks
            .flatMap(framework => framework.topLevelPackages ?? [])
            .filter((item, index, self) => index === self.findIndex((t) => JSON.stringify(t) === JSON.stringify(item)))
            .length;
        if(topLevelPackagesCount > 0)
            markdown += `| ${fileName} | ${DependencyType.TopLevel} | ${topLevelPackagesCount} |\n`;

        const transitivePackagesCount = frameworks
            .flatMap(framework => framework.transitivePackages ?? [])
            .filter((item, index, self) => index === self.findIndex((t) => JSON.stringify(t) === JSON.stringify(item)))
            .length;
        if(transitivePackagesCount > 0)
            markdown += `| ${fileName} | ${DependencyType.Transitive} | ${transitivePackagesCount} |\n`;
    }

    if(markdown)
    {
        markdown = `| Project Name | Type | Count |\n|----|----|---:|\n${markdown}`;
    }
    else
    {
        markdown = "All packages are up-to-date with the latest versions";
    }

    debug(`Generated summary view ${markdown}`);
    return markdown;
}

export {
    getDetailedBody,
    getSummaryBody
};
