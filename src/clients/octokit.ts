import { createActionAuth } from "@octokit/auth-action";
import { Octokit } from "@octokit/core";
import { retry } from "@octokit/plugin-retry";
import { debug } from "@actions/core";

/**
 * Create and get the Octokit client
 * @returns {Promise<any>} Resolves when the action is complete. Include the Octokit client
 */
async function createOctokitClient(): Promise<any> {
    debug('Going to create octokit client...');

    const auth = createActionAuth();
    debug('Retrieved Octokit auth');

    const authentication = await auth();
    debug('Created Octokit auth');

    const octokitClient = Octokit.plugin(retry);
    debug('Added retry policy to octokit client');

    const client= new octokitClient({
        auth: authentication.token,
        request: {
            retries: 3,
            retryAfter: 1000,
        }
    });
    debug('Created Octokit client');

    return client;
}

export {
    createOctokitClient
};
