/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only changes
        'style', // Formatting, missing semi colons, etc.
        'refactor', // Refactoring production code
        'perf', // Performance improvement
        'test', // Adding missing tests
        'build', // Changes to build system or dependencies
        'ci', // CI configuration changes
        'chore', // Updating build tasks, package manager configs, etc.
        'revert', // Revert a previous commit
        'wip', // Work in progress (avoid in main)
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
  },
};

export default config;
