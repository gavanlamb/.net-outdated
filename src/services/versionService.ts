import {
    coerce,
    diff,
    ReleaseType,
    valid
} from "semver";

function getVersion(
    v1: string | null | undefined,
    v2: string): ReleaseType | null {

    const a = valid(v1) !== null ? v1 : coerce(v1)?.toString();
    const b = valid(v2) !== null ? v2 : coerce(v2)?.toString();

    if(!a || !b) {
        return null;
    }

    return diff(a, b);
}

export {
    getVersion
};
