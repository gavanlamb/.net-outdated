import {NugetSource} from "./nugetSource";
import {Project} from "./project";

interface Configuration {
    version: number;
    parameters: string;
    sources: NugetSource[];
    projects: Project[];
}

export {
    Configuration
};
