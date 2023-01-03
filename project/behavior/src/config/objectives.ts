/*
|--------------------------------------------------------------------------
| Objectives
|--------------------------------------------------------------------------
|
| This is a list of all objectives this pack uses
| please add any objective to this list so it can be added at world creation
| make sure to add them before sending pack to others and new worlds.
|
*/
interface IObjective {
  objective: string;
  displayName?: string;
}

export const OBJECTIVES: Array<IObjective> = [];
