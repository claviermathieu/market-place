# ADR-005 — Use importlib for app function dispatch

**Status:** Accepted

## Context

Apps in the marketplace are registered by cloning a GitHub repository. Each repo contains
a `function.py` file at an arbitrary path on disk. When a job runs, we need to import and
execute `function.py` without knowing its path at startup time.

Options considered:
- **Add function directory to sys.path** — `sys.path.append(function_dir)` then `import function`. Works, but causes name collisions if two apps both have `function.py` on the path simultaneously.
- **exec() the file content** — read `function.py` as a string and `exec()` it. Dangerous (no module scope, globals leak), impossible to audit, security concern.
- **Package the function as an installable Python package** — require each app to be a proper Python package with `setup.py`. Too much friction for new app authors.
- **`importlib.util.spec_from_file_location`** — load a module from an arbitrary file path with a unique module name. No sys.path pollution, each load is isolated.

## Decision

Use `importlib` to load `function.py` at runtime:

```python
import importlib.util

def load_function(function_path: str):
    spec = importlib.util.spec_from_file_location(
        "user_function",          # module name — unique per load
        f"{function_path}/function.py",
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.run
```

The `run` function is extracted from the module and called directly:
```python
run_fn = load_function(app.function_path)
result = await run_fn(inputs)
```

## Consequences

**Easier:**
- Any valid Python file at any disk path can be loaded and executed
- No `sys.path` pollution — each function loads into its own module namespace
- No infrastructure changes needed to add a new app — clone, register, run

**Harder:**
- The function file must be named exactly `function.py` and must expose exactly `async def run(inputs: dict) -> dict`
- Errors in the function file (syntax errors, import errors) surface as `ImportError` at runtime, not at startup — they're not caught until the first run
- Hot-reload is not supported — if the function file changes on disk, the running backend process keeps using the old version until restarted

## What we learned

**Module naming:** Using the same module name `"user_function"` for every loaded function means
Python's module cache (`sys.modules`) may return a cached version if the same path is loaded twice.
To avoid this, use the function name as the module name: `spec_from_file_location(app.function_name, ...)`.
This ensures each app's module is cached under a unique key.

**Security:** This approach executes arbitrary Python code from cloned repositories. In a
single-user local tool, this is acceptable. In a multi-user production deployment, each
function must run in an isolated process or container. The current architecture should not
be exposed to untrusted app submissions without sandboxing.

**The registration validation:** `POST /apps/register` validates:
1. `manifest.json` exists and can be parsed as JSON
2. `function.py` exists and can be imported
3. The imported module exposes `async def run`
These checks fail early and return a clear error before any data is written to the DB.
