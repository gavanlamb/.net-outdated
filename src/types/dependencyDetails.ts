import {
    DependencyType
} from "./dependencyType";
import {
    ReleaseType
} from "semver";

interface dependencyDetails {
    id: string;
    requestedVersion?: string;
    resolvedVersion: string;
    latestVersion: string;
    type: DependencyType;
    versionDifference: ReleaseType | null;
}

export {
    dependencyDetails
};