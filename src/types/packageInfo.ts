interface PackageInfo {
    id: string;
    requestedVersion?: string;
    resolvedVersion: string;
    latestVersion: string;
}

export {
    PackageInfo
};