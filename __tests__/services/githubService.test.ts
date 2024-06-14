import { when } from 'jest-when';
import {CheckRunStatus} from "../../src/types/checkRunStatus";
import {CheckConclusion} from "../../src/types/checkConclusion";
import {components} from "@octokit/openapi-types";

describe("createCheckRun", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should not create a check run if add-check-run input is false", async () => {
        const body = "body";
        const hasAny = true;

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('add-check-run', false).mockReturnValueOnce(false);
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock }));

        jest.doMock("../../src/clients/githubChecksClient", () => {});

        jest.doMock("../../src/clients/githubIssueCommentClient", () => {});

        const { createCheckRun } = await import("../../src/services/githubService");
        await createCheckRun(body, hasAny);

        expect(getBooleanInputMock).toHaveBeenCalledTimes(1);
        expect(debugMock).toHaveBeenCalledWith('Check run is disabled');
    });

    test.each([
        [CheckConclusion.Failure, true, true],
        [CheckConclusion.Success, true, false],
        [CheckConclusion.Success, false, true],
        [CheckConclusion.Success, false, false]
    ])("should create a check run with conclusion equal to %s when fail-check-run-if-contains-outdated is %s and hasAny is %s", async (conclusion, failCheckRunIfContainsOutdated, hasAny) => {
        const body = "body";
        const name = "name";
        const owner = "owner";
        const repo = "repo";
        const sha = "sha";
        const status = CheckRunStatus.Completed;

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('add-check-run', false).mockReturnValueOnce(true);
        when(getBooleanInputMock).calledWith('fail-check-run-if-contains-outdated', false).mockReturnValueOnce(failCheckRunIfContainsOutdated);
        const getStringInputMock = jest.fn();
        when(getStringInputMock).calledWith('check-run-name').mockImplementationOnce(() => name);
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock, getStringInput: getStringInputMock }));

        const repoMock = jest.fn().mockReturnValue({ owner, repo });
        jest.doMock("@actions/github", () => ({context: { get repo() { return repoMock(); }, sha }}));

        const createCheckMock = jest.fn();
        jest.doMock("../../src/clients/githubChecksClient", () => ({ createCheck: createCheckMock }));

        jest.doMock("../../src/clients/githubIssueCommentClient", () => {});

        const { createCheckRun } = await import("../../src/services/githubService");
        await createCheckRun(body, hasAny);

        expect(getBooleanInputMock).toHaveBeenCalledTimes(2);
        expect(repoMock).toHaveBeenCalledTimes(2);
        expect(debugMock).toHaveBeenCalledWith(`owner: ${owner}`);
        expect(debugMock).toHaveBeenCalledWith(`repo: ${repo}`);
        expect(getStringInputMock).toHaveBeenCalledTimes(1);
        expect(debugMock).toHaveBeenCalledWith(`name: ${name}`);
        expect(debugMock).toHaveBeenCalledWith(`headSha: ${sha}`);
        expect(debugMock).toHaveBeenCalledWith(`status: ${status}`);
        expect(debugMock).toHaveBeenCalledWith(`conclusion: ${conclusion}`);
        expect(createCheckMock).toHaveBeenCalledTimes(1);
        expect(createCheckMock).toHaveBeenCalledWith(owner, repo, name, sha, status, conclusion, name, body);
    });

    test.each([
        ["name", "name"],
        ["Dotnet Outdated", null]
    ])("should create a check run with a name of %s when the check-run-name is %s", async (expectedName: string, name: string | null) => {
        const body = "body";
        const conclusion = CheckConclusion.Success;
        const owner = "owner";
        const repo = "repo";
        const sha = "sha";
        const status = CheckRunStatus.Completed;

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('add-check-run', false).mockReturnValueOnce(true);
        when(getBooleanInputMock).calledWith('fail-check-run-if-contains-outdated', false).mockReturnValueOnce(false);
        const getStringInputMock = jest.fn();
        when(getStringInputMock).calledWith('check-run-name').mockImplementationOnce(() => name);
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock, getStringInput: getStringInputMock }));

        const repoMock = jest.fn().mockReturnValue({ owner, repo });
        jest.doMock("@actions/github", () => ({context: { get repo() { return repoMock(); }, sha }}));

        const createCheckMock = jest.fn();
        jest.doMock("../../src/clients/githubChecksClient", () => ({ createCheck: createCheckMock }));

        jest.doMock("../../src/clients/githubIssueCommentClient", () => {});

        const { createCheckRun } = await import("../../src/services/githubService");
        await createCheckRun(body, true);

        expect(getBooleanInputMock).toHaveBeenCalledTimes(2);
        expect(repoMock).toHaveBeenCalledTimes(2);
        expect(debugMock).toHaveBeenCalledWith(`owner: ${owner}`);
        expect(debugMock).toHaveBeenCalledWith(`repo: ${repo}`);
        expect(getStringInputMock).toHaveBeenCalledTimes(1);
        expect(debugMock).toHaveBeenCalledWith(`name: ${expectedName}`);
        expect(debugMock).toHaveBeenCalledWith(`headSha: ${sha}`);
        expect(debugMock).toHaveBeenCalledWith(`status: ${status}`);
        expect(debugMock).toHaveBeenCalledWith(`conclusion: ${conclusion}`);
        expect(createCheckMock).toHaveBeenCalledTimes(1);
        expect(createCheckMock).toHaveBeenCalledWith(owner, repo, expectedName, sha, status, conclusion, expectedName, body);
    });

    test.each([
        ["name", "name"],
        [null, "Dotnet Outdated"]
    ])("should create a check run when inputs are valid", async (name: string | null, expectedName: string) => {
        const body = "body";
        const conclusion = CheckConclusion.Success;
        const owner = "owner";
        const repo = "repo";
        const sha = "sha";
        const status = CheckRunStatus.Completed;

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('add-check-run', false).mockReturnValueOnce(true);
        when(getBooleanInputMock).calledWith('fail-check-run-if-contains-outdated', false).mockReturnValueOnce(false);
        const getStringInputMock = jest.fn();
        when(getStringInputMock).calledWith('check-run-name').mockImplementationOnce(() => name);
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock, getStringInput: getStringInputMock }));

        const repoMock = jest.fn().mockReturnValue({ owner, repo });
        jest.doMock("@actions/github", () => ({context: { get repo() { return repoMock(); }, sha }}));

        const createCheckMock = jest.fn();
        jest.doMock("../../src/clients/githubChecksClient", () => ({ createCheck: createCheckMock }));

        jest.doMock("../../src/clients/githubIssueCommentClient", () => {});

        const { createCheckRun } = await import("../../src/services/githubService");
        await createCheckRun(body, true);

        expect(getBooleanInputMock).toHaveBeenCalledTimes(2);
        expect(repoMock).toHaveBeenCalledTimes(2);
        expect(debugMock).toHaveBeenCalledWith(`owner: ${owner}`);
        expect(debugMock).toHaveBeenCalledWith(`repo: ${repo}`);
        expect(getStringInputMock).toHaveBeenCalledTimes(1);
        expect(debugMock).toHaveBeenCalledWith(`name: ${expectedName}`);
        expect(debugMock).toHaveBeenCalledWith(`headSha: ${sha}`);
        expect(debugMock).toHaveBeenCalledWith(`status: ${status}`);
        expect(debugMock).toHaveBeenCalledWith(`conclusion: ${conclusion}`);
        expect(createCheckMock).toHaveBeenCalledTimes(1);
        expect(createCheckMock).toHaveBeenCalledWith(owner, repo, expectedName, sha, status, conclusion, expectedName, body);
    });

    it("should catch exceptions and log errors", async () => {
        const body = "body";
        const errorText = "Unexpected error";
        const owner = "owner";
        const repo = "repo";
        const sha = "sha";

        const debugMock = jest.fn();
        const errorMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock, error: errorMock }));

        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('add-check-run', false).mockReturnValueOnce(true);
        when(getBooleanInputMock).calledWith('fail-check-run-if-contains-outdated', false).mockReturnValueOnce(false);
        const getStringInputMock = jest.fn();
        when(getStringInputMock).calledWith('check-run-name').mockImplementationOnce(() => {
            throw new Error(errorText);
        });
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock, getStringInput: getStringInputMock }));

        const repoMock = jest.fn().mockReturnValue({ owner, repo });
        jest.doMock("@actions/github", () => ({context: { get repo() { return repoMock(); }, sha }}));

        jest.doMock("../../src/clients/githubChecksClient", () => {});

        jest.doMock("../../src/clients/githubIssueCommentClient", () => {});

        const { createCheckRun } = await import("../../src/services/githubService");
        await createCheckRun(body, true);

        expect(getBooleanInputMock).toHaveBeenCalledTimes(2);
        expect(repoMock).toHaveBeenCalledTimes(2);
        expect(debugMock).toHaveBeenCalledWith(`owner: ${owner}`);
        expect(debugMock).toHaveBeenCalledWith(`repo: ${repo}`);
        expect(debugMock).toHaveBeenCalledTimes(2);
        expect(getStringInputMock).toHaveBeenCalledTimes(1);
        expect(errorMock).toHaveBeenCalledWith(errorText);
        expect(errorMock).toHaveBeenCalledTimes(1);
    });
});

describe("addComment", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should not add a comment if add-pr-comment input is false", async () => {
        const body = "body";

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock }));

        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('add-pr-comment', false).mockReturnValueOnce(false);
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock }));

        jest.doMock("../../src/clients/githubChecksClient", () => {});

        jest.doMock("../../src/clients/githubIssueCommentClient", () => {});

        const { addComment } = await import("../../src/services/githubService");
        await addComment(body);

        expect(getBooleanInputMock).toHaveBeenCalledTimes(1);
        expect(debugMock).toHaveBeenCalledWith('PR comment is disabled');
    });

    it("should not add a comment if the run is not for a pull request", async () => {
        const body = "body";

        const debugMock = jest.fn();
        const warningMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock, warning: warningMock }));

        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('add-pr-comment', false).mockReturnValueOnce(true);
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock }));

        jest.doMock("@actions/github", () => ({ context: { payload: { pull_request: undefined } }}));

        jest.doMock("../../src/clients/githubChecksClient", () => {});

        jest.doMock("../../src/clients/githubIssueCommentClient", () => {});

        const { addComment } = await import("../../src/services/githubService");
        await addComment(body);

        expect(getBooleanInputMock).toHaveBeenCalledTimes(1);
        expect(warningMock).toHaveBeenCalledTimes(1);
        expect(warningMock).toHaveBeenCalledWith('This action cannot add a comment as the run is not for a PR');
    });

    it("should use head ref name when comment-key is not supplied", async () => {
        const body = null;
        const commentId = 2;
        const commentKey = null;
        const headRef = "feature/branch";
        const issueNumber = 1;
        const messageId = `<!-- dotnet-outdated-comment:${headRef} -->`;
        const owner = "owner";
        const repo = "repo";

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock}));

        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('add-pr-comment', false).mockReturnValueOnce(true);
        const getStringInputMock = jest.fn();
        when(getStringInputMock).calledWith('comment-key').mockReturnValueOnce(commentKey);
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock, getStringInput: getStringInputMock }));

        const repoMock = jest.fn().mockReturnValue({ owner, repo });
        jest.doMock("@actions/github", () => ({ context:{ payload:{ pull_request:{ number:issueNumber, head:{ ref:headRef } }}, get repo() { return repoMock(); }}}));

        jest.doMock("../../src/clients/githubChecksClient", () => {});

        const deleteCommentMock = jest.fn();
        when(deleteCommentMock).calledWith(owner, repo, commentId).mockReturnValue(Promise.resolve());
        const comments: components["schemas"]["issue-comment"][] = [
            {
                id: commentId,
                node_id: "1242342",
                url: "",
                body:`${messageId}\n\n#Dotnet Outdated`,
                body_text: undefined,
                body_html: undefined,
                html_url: "",
                user: null,
                created_at: "",
                updated_at: "",
                issue_url: "",
                author_association: "COLLABORATOR",
                performed_via_github_app: null,
                reactions: undefined
            },
            {
                id: 5,
                node_id: "1242342",
                url: "",
                body:`<!-- dotnet-outdated-comment:5467546785 -->\n\n#Dotnet Outdated`,
                body_text: undefined,
                body_html: undefined,
                html_url: "",
                user: null,
                created_at: "",
                updated_at: "",
                issue_url: "",
                author_association: "COLLABORATOR",
                performed_via_github_app: null,
                reactions: undefined
            }
        ];
        const listCommentsMock = jest.fn();
        when(listCommentsMock).calledWith(owner, repo, issueNumber).mockReturnValue(Promise.resolve(comments));
        jest.doMock("../../src/clients/githubIssueCommentClient", () => ({ deleteComment: deleteCommentMock, listComments: listCommentsMock }));

        const { addComment } = await import("../../src/services/githubService");
        await addComment(body);

        expect(getBooleanInputMock).toHaveBeenCalledTimes(1);
        expect(debugMock).toHaveBeenCalledWith(`owner: ${owner}`);
        expect(debugMock).toHaveBeenCalledWith(`repo: ${repo}`);
        expect(debugMock).toHaveBeenCalledWith(`issueNumber: ${issueNumber}`);
        expect(debugMock).toHaveBeenCalledWith(`suffix: ${headRef}`);
        expect(debugMock).toHaveBeenCalledWith(`messageId: ${messageId}`);
        expect(listCommentsMock).toHaveBeenCalledTimes(1);
        expect(listCommentsMock).toHaveBeenCalledWith(owner, repo, issueNumber);
        expect(debugMock).toHaveBeenCalledWith(`Fetched ${comments.length} comments for PR #${issueNumber}.`);
        expect(debugMock).toHaveBeenCalledWith(`Found comment for ${messageId}. Comment ID is: ${commentId}`);
        expect(debugMock).toHaveBeenCalledWith(`commentId: ${commentId}`);
        expect(deleteCommentMock).toHaveBeenCalledTimes(1);
        expect(deleteCommentMock).toHaveBeenCalledWith(owner, repo, commentId);
        expect(debugMock).toHaveBeenCalledWith('Comment deleted successfully');
    });

    it("should delete the comment when the body is null and a comment exists", async () => {
        const body = null;
        const commentId = 2;
        const commentKey = "key";
        const issueNumber = 1;
        const messageId = `<!-- dotnet-outdated-comment:${commentKey} -->`;
        const owner = "owner";
        const repo = "repo";

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock}));

        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('add-pr-comment', false).mockReturnValueOnce(true);
        const getStringInputMock = jest.fn();
        when(getStringInputMock).calledWith('comment-key').mockReturnValueOnce(commentKey);
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock, getStringInput: getStringInputMock }));

        const repoMock = jest.fn().mockReturnValue({ owner, repo });
        jest.doMock("@actions/github", () => ({ context:{ payload:{ pull_request:{ number:issueNumber }}, get repo() { return repoMock(); }}}));

        jest.doMock("../../src/clients/githubChecksClient", () => {});

        const deleteCommentMock = jest.fn();
        when(deleteCommentMock).calledWith(owner, repo, commentId).mockReturnValue(Promise.resolve());
        const comments: components["schemas"]["issue-comment"][] = [
            {
                id: commentId,
                node_id: "1242342",
                url: "",
                body:`${messageId}\n\n#Dotnet Outdated`,
                body_text: undefined,
                body_html: undefined,
                html_url: "",
                user: null,
                created_at: "",
                updated_at: "",
                issue_url: "",
                author_association: "COLLABORATOR",
                performed_via_github_app: null,
                reactions: undefined
            },
            {
                id: 5,
                node_id: "1242342",
                url: "",
                body:`<!-- dotnet-outdated-comment:5467546785 -->\n\n#Dotnet Outdated`,
                body_text: undefined,
                body_html: undefined,
                html_url: "",
                user: null,
                created_at: "",
                updated_at: "",
                issue_url: "",
                author_association: "COLLABORATOR",
                performed_via_github_app: null,
                reactions: undefined
            }
        ];
        const listCommentsMock = jest.fn();
        when(listCommentsMock).calledWith(owner, repo, issueNumber).mockReturnValue(Promise.resolve(comments));
        jest.doMock("../../src/clients/githubIssueCommentClient", () => ({ deleteComment: deleteCommentMock, listComments: listCommentsMock }));

        const { addComment } = await import("../../src/services/githubService");
        await addComment(body);

        expect(getBooleanInputMock).toHaveBeenCalledTimes(1);
        expect(debugMock).toHaveBeenCalledWith(`owner: ${owner}`);
        expect(debugMock).toHaveBeenCalledWith(`repo: ${repo}`);
        expect(debugMock).toHaveBeenCalledWith(`issueNumber: ${issueNumber}`);
        expect(debugMock).toHaveBeenCalledWith(`suffix: ${commentKey}`);
        expect(debugMock).toHaveBeenCalledWith(`messageId: ${messageId}`);
        expect(listCommentsMock).toHaveBeenCalledTimes(1);
        expect(listCommentsMock).toHaveBeenCalledWith(owner, repo, issueNumber);
        expect(debugMock).toHaveBeenCalledWith(`Fetched ${comments.length} comments for PR #${issueNumber}.`);
        expect(debugMock).toHaveBeenCalledWith(`Found comment for ${messageId}. Comment ID is: ${commentId}`);
        expect(debugMock).toHaveBeenCalledWith(`commentId: ${commentId}`);
        expect(deleteCommentMock).toHaveBeenCalledTimes(1);
        expect(deleteCommentMock).toHaveBeenCalledWith(owner, repo, commentId);
        expect(debugMock).toHaveBeenCalledWith('Comment deleted successfully');
    });

    it("should update the comment when the body is not null and a comment exists", async () => {
        const body = "Comment";
        const commentId = 2;
        const commentKey = "key";
        const issueNumber = 1;
        const messageId = `<!-- dotnet-outdated-comment:${commentKey} -->`;
        const owner = "owner";
        const repo = "repo";

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock}));

        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('add-pr-comment', false).mockReturnValueOnce(true);
        const getStringInputMock = jest.fn();
        when(getStringInputMock).calledWith('comment-key').mockReturnValueOnce(commentKey);
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock, getStringInput: getStringInputMock }));

        const repoMock = jest.fn().mockReturnValue({ owner, repo });
        jest.doMock("@actions/github", () => ({ context:{ payload:{ pull_request:{ number:issueNumber }}, get repo() { return repoMock(); }}}));

        jest.doMock("../../src/clients/githubChecksClient", () => {});

        const updateCommentMock = jest.fn();
        when(updateCommentMock).calledWith(owner, repo, commentId, `${messageId}\n\n${body}`).mockReturnValue(Promise.resolve());
        const comments: components["schemas"]["issue-comment"][] = [
            {
                id: commentId,
                node_id: "1242342",
                url: "",
                body:`${messageId}\n\n#Dotnet Outdated`,
                body_text: undefined,
                body_html: undefined,
                html_url: "",
                user: null,
                created_at: "",
                updated_at: "",
                issue_url: "",
                author_association: "COLLABORATOR",
                performed_via_github_app: null,
                reactions: undefined
            },
            {
                id: 5,
                node_id: "1242342",
                url: "",
                body:`<!-- dotnet-outdated-comment:5467546785 -->\n\n#Dotnet Outdated`,
                body_text: undefined,
                body_html: undefined,
                html_url: "",
                user: null,
                created_at: "",
                updated_at: "",
                issue_url: "",
                author_association: "COLLABORATOR",
                performed_via_github_app: null,
                reactions: undefined
            }
        ];
        const listCommentsMock = jest.fn();
        when(listCommentsMock).calledWith(owner, repo, issueNumber).mockReturnValue(Promise.resolve(comments));
        jest.doMock("../../src/clients/githubIssueCommentClient", () => ({ listComments: listCommentsMock, updateComment: updateCommentMock }));

        const { addComment } = await import("../../src/services/githubService");
        await addComment(body);

        expect(getBooleanInputMock).toHaveBeenCalledTimes(1);
        expect(debugMock).toHaveBeenCalledWith(`owner: ${owner}`);
        expect(debugMock).toHaveBeenCalledWith(`repo: ${repo}`);
        expect(debugMock).toHaveBeenCalledWith(`issueNumber: ${issueNumber}`);
        expect(debugMock).toHaveBeenCalledWith(`suffix: ${commentKey}`);
        expect(debugMock).toHaveBeenCalledWith(`messageId: ${messageId}`);
        expect(listCommentsMock).toHaveBeenCalledTimes(1);
        expect(listCommentsMock).toHaveBeenCalledWith(owner, repo, issueNumber);
        expect(debugMock).toHaveBeenCalledWith(`Fetched ${comments.length} comments for PR #${issueNumber}.`);
        expect(debugMock).toHaveBeenCalledWith(`Found comment for ${messageId}. Comment ID is: ${commentId}`);
        expect(debugMock).toHaveBeenCalledWith(`commentId: ${commentId}`);
        expect(updateCommentMock).toHaveBeenCalledTimes(1);
        expect(updateCommentMock).toHaveBeenCalledWith(owner, repo, commentId, `${messageId}\n\n${body}`);
        expect(debugMock).toHaveBeenCalledWith('Comment updated successfully');
    });

    it("should create the comment when the body is not null and a comment does not exist", async () => {
        const body = "Comment";
        const commentKey = "key";
        const issueNumber = 1;
        const messageId = `<!-- dotnet-outdated-comment:${commentKey} -->`;
        const owner = "owner";
        const repo = "repo";

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock}));

        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('add-pr-comment', false).mockReturnValueOnce(true);
        const getStringInputMock = jest.fn();
        when(getStringInputMock).calledWith('comment-key').mockReturnValueOnce(commentKey);
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock, getStringInput: getStringInputMock }));

        const repoMock = jest.fn().mockReturnValue({ owner, repo });
        jest.doMock("@actions/github", () => ({ context:{ payload:{ pull_request:{ number:issueNumber }}, get repo() { return repoMock();}}}));

        jest.doMock("../../src/clients/githubChecksClient", () => {});

        const createCommentMock = jest.fn();
        when(createCommentMock).calledWith(owner, repo, issueNumber, `${messageId}\n\n${body}`).mockReturnValue(Promise.resolve());
        const listCommentsMock = jest.fn();
        when(listCommentsMock).calledWith(owner, repo, issueNumber).mockReturnValue(Promise.resolve([]));
        jest.doMock("../../src/clients/githubIssueCommentClient", () => ({ createComment:createCommentMock, listComments: listCommentsMock }));

        const { addComment } = await import("../../src/services/githubService");
        await addComment(body);

        expect(getBooleanInputMock).toHaveBeenCalledTimes(1);
        expect(debugMock).toHaveBeenCalledWith(`owner: ${owner}`);
        expect(debugMock).toHaveBeenCalledWith(`repo: ${repo}`);
        expect(debugMock).toHaveBeenCalledWith(`issueNumber: ${issueNumber}`);
        expect(debugMock).toHaveBeenCalledWith(`suffix: ${commentKey}`);
        expect(debugMock).toHaveBeenCalledWith(`messageId: ${messageId}`);
        expect(listCommentsMock).toHaveBeenCalledTimes(1);
        expect(listCommentsMock).toHaveBeenCalledWith(owner, repo, issueNumber);
        expect(debugMock).toHaveBeenCalledWith(`commentId: ${null}`);
        expect(debugMock).toHaveBeenCalledWith(`No comment found for ${messageId}`);
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(owner, repo, issueNumber, `${messageId}\n\n${body}`);
        expect(debugMock).toHaveBeenCalledWith('Comment added successfully');
    });

    it("should not create the comment when the body is null and a comment does not exist", async () => {
        const body = null;
        const commentKey = "key";
        const issueNumber = 1;
        const messageId = `<!-- dotnet-outdated-comment:${commentKey} -->`;
        const owner = "owner";
        const repo = "repo";

        const debugMock = jest.fn();
        jest.doMock("@actions/core", () => ({ debug: debugMock}));

        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('add-pr-comment', false).mockReturnValueOnce(true);
        const getStringInputMock = jest.fn();
        when(getStringInputMock).calledWith('comment-key').mockReturnValueOnce(commentKey);
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock, getStringInput: getStringInputMock }));

        const repoMock = jest.fn().mockReturnValue({ owner, repo });
        jest.doMock("@actions/github", () => ({ context:{ payload:{ pull_request:{ number:issueNumber }}, get repo() { return repoMock();}}}));

        jest.doMock("../../src/clients/githubChecksClient", () => {});

        const listCommentsMock = jest.fn();
        when(listCommentsMock).calledWith(owner, repo, issueNumber).mockReturnValue(Promise.resolve([]));
        jest.doMock("../../src/clients/githubIssueCommentClient", () => ({ listComments: listCommentsMock }));

        const { addComment } = await import("../../src/services/githubService");
        await addComment(body);

        expect(getBooleanInputMock).toHaveBeenCalledTimes(1);
        expect(debugMock).toHaveBeenCalledWith(`owner: ${owner}`);
        expect(debugMock).toHaveBeenCalledWith(`repo: ${repo}`);
        expect(debugMock).toHaveBeenCalledWith(`issueNumber: ${issueNumber}`);
        expect(debugMock).toHaveBeenCalledWith(`suffix: ${commentKey}`);
        expect(debugMock).toHaveBeenCalledWith(`messageId: ${messageId}`);
        expect(listCommentsMock).toHaveBeenCalledTimes(1);
        expect(listCommentsMock).toHaveBeenCalledWith(owner, repo, issueNumber);
        expect(debugMock).toHaveBeenCalledWith(`No comment found for ${messageId}`);
        expect(debugMock).toHaveBeenCalledWith(`commentId: ${null}`);
        expect(debugMock).toHaveBeenCalledWith('Comment is null or empty, no action taken');
    });

    it("errors should be caught", async () => {
        const body = "body";
        const errorMessage = "Error message";

        const errorMock = jest.fn();
        jest.doMock("@actions/core", () => ({ error: errorMock }));

        const getBooleanInputMock = jest.fn();
        when(getBooleanInputMock).calledWith('add-pr-comment', false).mockImplementationOnce(()=> { throw new Error(errorMessage); });
        jest.doMock("../../src/helpers/inputHelper", () => ({ getBooleanInput: getBooleanInputMock }));

        jest.doMock("../../src/clients/githubChecksClient", () => {});

        jest.doMock("../../src/clients/githubIssueCommentClient", () => {});

        const { addComment } = await import("../../src/services/githubService");
        await addComment(body);

        expect(getBooleanInputMock).toHaveBeenCalledTimes(1);
        expect(errorMock).toHaveBeenCalledWith(errorMessage);
    });
});
