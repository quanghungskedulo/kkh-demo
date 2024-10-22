Note: The yarn dependencies are very out-of-date and have numerous vulnerabilities.

### Install

```shell
$ sked artifacts web-extension upsert -f artifacts/web-extension/test-page/state.json -w 180
Upserting WebExtension: cli-examples-test-page... done
```

### View

Once installed into a tenant, this example can be viewed at `https://<team domain>/c/cli-examples-test-page/page`

### Delete

```shell
$ sked artifacts web-extension delete --name "cli-examples-test-page"
Deleting WebExtension: cli-examples-test-page... done
```
