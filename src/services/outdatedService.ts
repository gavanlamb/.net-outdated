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
    getDetailedView
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

        const message = getDetailedView(
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
            message,
            anyOutdatedPackages);

        await addComment(
            message);

    } catch (error) {
        if (error instanceof Error)
            setFailed(error.message);
    }
}

export {
    run
};
