# Rubedo Versioning Guide

Rubedo supports multiple versioning strategies for dependencies, giving you precise control over which version of a dependency to use in your project.

## Version Formats

In your `manifest.json` file, you can specify dependencies with different version formats:

### Semantic Versioning (e.g., "1.0.0")

```json
{
  "module_name": "organization/repo",
  "version": "1.0.0"
}
```

This will checkout the tag `v1.0.0` from the repository. Rubedo looks for tags in the format `v1.0.0`.

### Latest Version

```json
{
  "module_name": "organization/repo",
  "version": "latest"
}
```

This will checkout the default branch of the repository and pull the latest changes.

### Commit Hash (Recommended for Production)

```json
{
  "module_name": "organization/repo",
  "version": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
}
```

Or using a short commit hash:

```json
{
  "module_name": "organization/repo",
  "version": "a1b2c3d"
}
```

This will checkout the specific commit, giving you exact control over the version of the dependency. This is recommended for production environments as it ensures consistent builds regardless of upstream changes.

### Branch Name

```json
{
  "module_name": "organization/repo",
  "version": "main"
}
```

This will checkout the specified branch.

## Versioning Best Practices

1. **Development**: During development, you might want to use `"latest"` to get the most recent changes.

2. **Integration/Testing**: When integrating or testing, consider using a branch name to get a relatively stable version.

3. **Production**: For production builds, always use a specific commit hash to ensure deterministic builds. This is similar to how `go.mod` works in Go, ensuring that your builds are reproducible.

## Finding Commit Hashes

To find a commit hash for a repository:

1. Visit the repository on GitHub
2. Navigate to the commit you want to use
3. The commit hash will be displayed in the URL and on the page
4. You can use either the full 40-character hash or a shortened version (at least 7 characters)

## Updating Dependencies

When you want to update a dependency to a newer commit:

1. Find the new commit hash you want to use
2. Update the `version` field in your `manifest.json`
3. Run `rubedo update` to update the dependency

By using commit hashes, you have precise control over when and how your dependencies are updated, ensuring that your builds remain stable and deterministic. 