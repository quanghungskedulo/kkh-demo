# Skedulo CLI Examples

This repository contains example artifact definitions for all artifacts currently available via the Skedulo CLI

To learn more about the Skedulo CLI, [check out the documentation.](https://docs.skedulo.com/developer-guides/cli/skedulo-cli-introduction/)

## Overview

The Skedulo CLI is intended to be a universal command line interface for building, testing, and deploying custom solutions on Skedulo.  

With the Skedulo CLI, developers can:

* Manage access credentials to multiple environments or teams.
* Create, retrieve, update, and delete pulse platform solution capabilities.
* Provide specialty tooling to aid the development of specialized platform capabilities.
* Use scripts and other standard developer toolchains to automate various tasks.

The CLI supports both the Skedulo Pulse Platform and Skedulo for Salesforce.

## Usage

The primary use of the Skedulo CLI is managing artifacts. An artifact represents an instance of a configuration element, such as a definition of custom objects and fields for storing data or custom pages and templates to build custom user interfaces. This repository contains example artifacts definitions for each available artifact type.

The artifacts in this repository can be deployed to to your Skedulo tenant by running:

```
    $ sked artifacts <artifact-type> upsert --filename <artifact-filename>
```

Each artifact type is contained within a folder, for example `custom-fields` contains several example Custom Field artifacts. Some artifacts, such as `functions`, `mobile-extensions` and `web-extensions` are bundled. This means they contain an artifact file (e.g `hello-function.function.json`) and a folder containing the artifact itself. In order to deploy these, the artifact file must be passed to the CLI, not the folder.

More information on working with artifacts can be found in the [Skedulo documentation.](https://docs.skedulo.com/developer-guides/cli/working-with-artifacts/)

## Available Artifact types

The following artifact types are currently available in this repository (with links to their respective documentation)

* [Custom Fields (custom-field)](https://docs.skedulo.com/developer-guides/cli/command-reference/artifacts/custom-field/)
* [Custom Objects (custom-object)](https://docs.skedulo.com/developer-guides/cli/command-reference/artifacts/custom-object/)
* [Functions (functions)](https://docs.skedulo.com/developer-guides/cli/command-reference/artifacts/function/)
* [Horizon Pages (horizon-page)](https://docs.skedulo.com/developer-guides/cli/command-reference/artifacts/horizon-page/)
* [Horizon Templates (horizon-template)](https://docs.skedulo.com/developer-guides/cli/command-reference/artifacts/horizon-template/)
* [Mobile Extensions (mobile-extension)](https://docs.skedulo.com/developer-guides/cli/command-reference/artifacts/mobile-extension/)
* [Triggered Actions (triggered-action)](https://docs.skedulo.com/developer-guides/cli/command-reference/artifacts/triggered-action/)
* [Web Extensions (web-extension)](https://docs.skedulo.com/developer-guides/cli/command-reference/artifacts/web-extension/)
* [Webhooks (webhook)](https://docs.skedulo.com/developer-guides/cli/command-reference/artifacts/webhook/)
* [User Roles (user-role)](https://docs.skedulo.com/developer-guides/cli/command-reference/artifacts/user-role/)  

As more artifacts become available, examples will be added to this repository


## Further Reading

Check out the following documentation on the Skedulo CLI to learn more

1. [Downloading and installing the Skedulo CLI](https://docs.skedulo.com/developer-guides/cli/install-the-skedulo-cli/)
2. [Authenticating to a tenant](https://docs.skedulo.com/developer-guides/cli/authenticate-with-the-skedulo-cli/)
3. [Working with Artifacts](https://docs.skedulo.com/developer-guides/cli/working-with-artifacts/)
4. [Working with Packages](https://docs.skedulo.com/developer-guides/cli/working-with-packages/)
5. [Skedulo CLI Command Reference](https://docs.skedulo.com/developer-guides/cli/cli-command-reference)
6. [Artifact availability](https://docs.skedulo.com/developer-guides/cli/artifact-availability)
7. [Help and Troubleshooting](https://docs.skedulo.com/developer-guides/cli/help-and-troubleshooting/)
