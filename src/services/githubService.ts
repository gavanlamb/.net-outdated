import {
    debug,
    error,
    warning
} from '@actions/core';
import {
    context
} from '@actions/github';
import {
    getBooleanInput, getStringInput
} from "../helpers/inputHelper";
import {
    createComment,
    deleteComment,
    listComments,
    updateComment
} from "../clients/githubIssueCommentClient";
import {
    createCheck
} from "../clients/githubChecksClient";
import {
    CheckRunStatus
} from "../types/checkRunStatus";
import {
    CheckConclusion
} from "../types/checkConclusion";

/**
 * Get the comment ID that starts with the messageId value
 * @param owner owner of the repo
 * @param repo repo name
 * @param issueNumber issue number to add the comment to
 * @param messageId the text at the beginning of the comment that's hidden from the user
 * @returns {Promise<number | null>} Resolves when the action is complete. Either the identifier of the comment or null.
 */
async function getCommentId(
    owner: string,
    repo: string,
    issueNumber: number,
    messageId: string): Promise<number | null>
{
    const comments = await listComments(
        owner,
        repo,
        issueNumber);
    debug(`Fetched ${comments.length} comments for PR #${issueNumber}.`);

    const foundComment= comments.find(c => c.body?.startsWith(messageId));
    if (foundComment && foundComment.id) {
        debug(`Found comment for ${messageId}. Comment ID is: ${foundComment.id}`);
        return foundComment.id;
    }

    debug(`No comment found for ${messageId}`);
    return null;
}

/**
 * Add check run
 * @returns {Promise<void>} Resolves when the action is complete.
 * @param body the main text that will be displayed to the user
 * @param hasAny flag to indicate if there are any packages detected, exclusive of transitive
 */
async function createCheckRun(
    body: string,
    hasAny: boolean): Promise<void>
{
    try
    {
        const addCheckRunArgument = getBooleanInput('add-check-run', false);
        if (!addCheckRunArgument) {
            debug('Check run is disabled');
            return;
        }

        const addFailCheckIfContainsOutdatedArgument = getBooleanInput('fail-check-run-if-contains-outdated', false);

        const owner  = context.repo.owner;
        debug(`owner: ${owner}`);

        const repo  = context.repo.repo;
        debug(`repo: ${repo}`);

        const name = getStringInput('check-run-name') ?? 'Dotnet Outdated';
        debug(`name: ${name}`);

        const headSha = context.sha;
        debug(`headSha: ${headSha}`);

        const status = CheckRunStatus.Completed;
        debug(`status: ${status}`);

        const conclusion = hasAny && addFailCheckIfContainsOutdatedArgument ? CheckConclusion.Failure : CheckConclusion.Success;
        debug(`conclusion: ${conclusion}`);

        await createCheck(
            owner,
            repo,
            name,
            headSha,
            status,
            conclusion,
            name,
            body);
    }
    catch (err)
    {
        if(err instanceof Error)
            error(err.message);
    }
}

/**
 * Add a comment to the PR
 * @returns {Promise<void>} Resolves when the action is complete.
 * @param message the body of the comment
 */
async function addComment(
    message: string | null): Promise<void>
{
    try
    {
        const addPrCommentArgument = getBooleanInput('add-pr-comment', false);
        if (!addPrCommentArgument) {
            debug('PR comment is disabled');
            return;
        }

        const pullRequest = context.payload.pull_request;
        const isForPr = pullRequest !== undefined;
        if (!isForPr) {
            warning('This action cannot add a comment as the run is not for a PR');
            return;
        }

        const owner  = context.repo.owner;
        debug(`owner: ${owner}`);

        const repo  = context.repo.repo;
        debug(`repo: ${repo}`);

        const issueNumber = pullRequest.number;
        debug(`issueNumber: ${issueNumber}`);

        const suffix = getStringInput('comment-key') ?? pullRequest.head.ref;
        debug(`suffix: ${suffix}`);

        const messageId = `<!-- dotnet-outdated-comment:${suffix} -->`;
        debug(`messageId: ${messageId}`);

        const commentId = await getCommentId(
            owner,
            repo,
            issueNumber,
            messageId);
        debug(`commentId: ${commentId}`);

        if (commentId) {
            if (!message)
            {
                await deleteComment(
                    owner,
                    repo,
                    commentId);
                debug('Comment deleted successfully');
            }
            else
            {
                await updateComment(
                    owner,
                    repo,
                    commentId,
                    `${messageId}\n\n${message}`);
                debug('Comment updated successfully');
            }
        }
        else
        {
            if (message) {
                await createComment(
                    owner,
                    repo,
                    issueNumber,
                    `${messageId}\n\n${message}`);
                debug('Comment added successfully');
            } else {
                debug('Comment is null or empty, no action taken');
            }
        }
    }
    catch (err)
    {
        if(err instanceof Error)
            error(err.message);
    }
}

export {
    createCheckRun,
    addComment
};