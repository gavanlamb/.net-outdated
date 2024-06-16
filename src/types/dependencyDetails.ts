import { DependencyType } from "./dependencyType";
import * as semverDiff from "semver-diff";

interface dependencyDetails {
    id: string;
    requestedVersion?: string;
    resolvedVersion: string;
    latestVersion: string;
    type: DependencyType;
    versionDifference?: semverDiff.Difference;
}

export {
    dependencyDetails
};