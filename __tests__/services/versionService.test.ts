import {
    when
} from "jest-when";

describe("getVersion", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('should return null if the first version is null and cannot be coerced', async () => {
        const validMock = jest.fn();
        when(validMock).calledWith(null).mockReturnValueOnce(null);
        when(validMock).calledWith('1.2.3').mockReturnValueOnce('1.2.3');

        const coerceMock = jest.fn();
        when(coerceMock).calledWith(null).mockReturnValueOnce(null);

        jest.doMock("semver", () => ({ valid: validMock, coerce: coerceMock }));

        const { getVersion } = await import("../../src/services/versionService");
        const result = getVersion(null, '1.2.3');

        expect(validMock).toHaveBeenNthCalledWith(1, null);
        expect(coerceMock).toHaveBeenNthCalledWith(1, null);
        expect(validMock).toHaveBeenNthCalledWith(2, '1.2.3');
        expect(result).toBeNull();
    });

    it('should return null if the second version is null and cannot be coerced', async () => {
        const validMock = jest.fn();
        when(validMock).calledWith('1.2.3').mockReturnValueOnce('1.2.3');
        when(validMock).calledWith(null).mockReturnValueOnce(null);

        const coerceMock = jest.fn();
        when(coerceMock).calledWith(null).mockReturnValueOnce(null);

        jest.doMock("semver", () => ({ valid: validMock, coerce: coerceMock }));

        const { getVersion } = await import("../../src/services/versionService");
        const result = getVersion('1.2.3', null);

        expect(validMock).toHaveBeenNthCalledWith(1, '1.2.3');
        expect(validMock).toHaveBeenNthCalledWith(2, null);
        expect(coerceMock).toHaveBeenNthCalledWith(1, null);
        expect(result).toBeNull();
    });

    it('should return null if both versions are null and cannot be coerced', async () => {
        const validMock = jest.fn();
        when(validMock).calledWith(null).mockReturnValue(null);

        const coerceMock = jest.fn();
        when(coerceMock).calledWith(null).mockReturnValue(null);

        jest.doMock("semver", () => ({ valid: validMock, coerce: coerceMock }));

        const { getVersion } = await import("../../src/services/versionService");
        const result = getVersion(null, null);

        expect(validMock).toHaveBeenNthCalledWith(1, null);
        expect(coerceMock).toHaveBeenNthCalledWith(1, null);
        expect(validMock).toHaveBeenNthCalledWith(2, null);
        expect(coerceMock).toHaveBeenNthCalledWith(2, null);
        expect(result).toBeNull();
    });

    it('should return the version diff', async () => {
        const validMock = jest.fn();
        when(validMock).calledWith("1.2.3").mockReturnValue("1.2.3");
        when(validMock).calledWith("1.2.4").mockReturnValue("1.2.4");

        const coerceMock = jest.fn();

        const diffMock = jest.fn();
        when(diffMock).calledWith("1.2.3", "1.2.4").mockReturnValue("patch");

        jest.doMock("semver", () => ({ valid: validMock, coerce: coerceMock, diff: diffMock }));

        const { getVersion } = await import("../../src/services/versionService");
        const result = getVersion("1.2.3", "1.2.4");

        expect(validMock).toHaveBeenNthCalledWith(1, "1.2.3");
        expect(validMock).toHaveBeenNthCalledWith(2, "1.2.4");
        expect(diffMock).toHaveBeenCalledWith("1.2.3", "1.2.4");
        expect(result).toBe("patch");
    });
});