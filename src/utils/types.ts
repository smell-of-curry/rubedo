/**
 * Represents a dependency in the Rubedo manifest
 */
export interface RubedoDependency {
  module_name: string;
  version: string;
  localPath?: string; // Path to a local instance of the repository
}

/**
 * Represents the Rubedo module in the manifest
 */
export interface RubedoModule {
  description: string;
  type: "rubedo";
  dependencies: RubedoDependency[];
}

/**
 * Represents a module in the manifest
 */
export interface ManifestModule {
  description: string;
  type: string;
  uuid: string;
  version: [number, number, number];
  language?: string;
  entry?: string;
  dependencies?: RubedoDependency[];
}

/**
 * Represents the header of the manifest
 */
export interface ManifestHeader {
  name: string;
  description: string;
  min_engine_version: [number, number, number];
  uuid: string;
  version: [number, number, number];
}

/**
 * Represents a dependency in the manifest
 */
export interface ManifestDependency {
  module_name: string;
  version: string;
}

/**
 * Represents the metadata of the manifest
 */
export interface ManifestMetadata {
  authors: string[];
  license: string;
  url: string;
}

/**
 * Represents the Minecraft Bedrock manifest.json
 */
export interface Manifest {
  format_version: number;
  header: ManifestHeader;
  modules: ManifestModule[];
  capabilities?: string[];
  dependencies?: ManifestDependency[];
  metadata?: ManifestMetadata;
  rubedo_dependencies?: RubedoDependency[];
} 