# Contributing to TypeScript Express API Boilerplate

First off, thank you for considering contributing! It's people like you that make the open-source community such a great place. We welcome any and all contributions.

Reading and following these guidelines will help us make the contribution process easy and effective for everyone involved.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report any unacceptable behavior.

## How Can I Contribute?

There are many ways to contribute, from writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests, or writing code which can be incorporated into the main project.

### Reporting Bugs

Bugs are tracked as GitHub issues. Before you create a bug report, please check the existing issues to see if your problem has already been reported.

When creating a bug report, please include as many details as possible:

- A clear and descriptive title.
- A step-by-step description of how to reproduce the issue.
- The expected behavior and what actually happened.
- Your environment details (Node.js version, OS, etc.).

### Suggesting Enhancements

If you have an idea for a new feature or an improvement to an existing one, please open an issue to discuss it. This allows us to coordinate our efforts and prevent duplication of work.

## Your First Code Contribution

Unsure where to begin? You can start by looking through `good-first-issue` and `help-wanted` issues:

- **Good first issues** - Issues that are ideal for new contributors.
- **Help wanted issues** - Issues that are a bit more involved but are open for community contribution.

## Pull Request Process

When you're ready to contribute code, please follow these steps:

1.  **Fork the repository** and create your branch from `main`. A good branch name would be `feat/new-user-feature` or `fix/login-bug`.

2.  **Set up your development environment** by following the instructions in the README.md.

3.  **Make your changes.** Write clean, readable code and add comments where necessary. Ensure you adhere to the existing code style.

4.  **Add or update tests.** Your changes should be covered by new or existing tests. Run the test suite to make sure everything is passing.

    ```bash
    npm run test
    ```

5.  **Update documentation.** If you are adding a new feature or changing an existing one, please update the `README.md` and any relevant API documentation.

6.  **Commit your changes.** We follow the Conventional Commits specification. This helps us automate changelogs and versioning. Your commit message should be structured as follows:

    ```
    <type>[optional scope]: <description>

    [optional body]

    [optional footer]
    ```

    **Example:**

    ```
    feat(auth): add support for social login

    Implements Google and GitHub OAuth providers for user authentication.
    This resolves issue #42.
    ```

    Common types include: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

7.  **Format and lint your code.** Before committing, please run the following commands to format and lint your code:

    ```bash
    npm run format
    npm run lint
    ```

8.  **Push your branch** to your fork and **open a pull request** against the `main` branch of the original repository.

9.  **Address review comments.** A maintainer will review your pull request. Please be responsive to any feedback and make the necessary changes. Once your PR is approved, it will be merged.

## Swagger Documentation

We use Swagger to automatically generate API documentation from JSDoc comments in the route files. If you are adding or updating a route, please make sure to update the JSDoc comments accordingly.

To regenerate the documentation, run the following command:

```bash
npm run swagger-gen
```

## Security and Audit

We have `security` and `audit` services to handle session management and audit logging. If you are making changes that affect security or user activity, please make sure to use these services appropriately.

Thank you for your contribution!
