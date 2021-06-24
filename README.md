<div align="center">
  <h1>Selene GitHub Action</h1>

  <a href="https://github.com/NTBBloodbath/selene-action/actions"><img alt="selene-action status" src="https://github.com/NTBBloodbath/selene-action/workflows/build-test/badge.svg"></a>
</div>

GitHub action to run [selene](https://github.com/Kampfkarren/selene), a
blazing-fast modern Lua linter written in Rust.

## Usage

```yaml
- uses: actions/checkout@v2
- uses: NTBBloodbath/selene-action@v1.0.0
  with:
    # Github secret token
    token: ${{ secrets.GITHUB_TOKEN }}
    # selene arguments
    args: --display-style=quiet .
    # selene version
    version: 0.12.1
```

### Parameters

#### Required parameters

  - `token`
    - GitHub secret token for downloading selene binary from GitHub releases.
  - `args`
    - Arguments to be passed to selene.

#### Optional parameters

- `version`
  - Version of selene to be used. If not specified, installs the latest release.

## License

selene-action is [MIT licensed](./LICENSE)

## Inspiration

- [stylua-action](https://github.com/JohnnyMorganz/stylua-action)
