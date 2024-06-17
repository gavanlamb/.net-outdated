import {
    setFailed
} from "@actions/core";
import {
    createCheckRun,
    addComment
} from "./githubService";
import {
    listOutdatedPackages
} from "./dotnetService";
import {
    getDetailedBody,
    getSummaryBody
} from "./summaryService";

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run(): Promise<void>
{
    try
    {
        const outdatedResponse = await listOutdatedPackages();

        const summaryBody = getSummaryBody(
            outdatedResponse);

        const detailedBody = getDetailedBody(
            outdatedResponse);

        const anyOutdatedPackages = outdatedResponse
            .projects
            .filter(project => !!project.frameworks)
            .flatMap(project => project.frameworks)
            .filter(framework => !!framework)
            .flatMap(framework => framework!.topLevelPackages)
            .filter(topLevelPackages => !!topLevelPackages)
            .length > 0;

        await createCheckRun(
            summaryBody,
            detailedBody,
            anyOutdatedPackages);


        await addComment(
            detailedBody);

    } catch (error) {
        if (error instanceof Error)
            setFailed(error.message);
    }
}

export {
    run
};
