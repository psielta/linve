
import { branches, changelog, commitAnalyzer, git, releaseNotesGenerator } from '@govbr-ds/release-config'

export default {
  branches: branches,
  plugins: [
    commitAnalyzer,
    releaseNotesGenerator,
    changelog,
    git,
    [
      '@semantic-release/gitlab',
      {
        successComment:
          ':tada: Issue/Merge Request incluído(a) na versão v${nextRelease.version} :tada:\n\nPara mais detalhes:\n- [GitLab release]($CI_PROJECT_URL/-/releases/v${nextRelease.version})\n- [GitLab tag]($CI_PROJECT_URL/-/tags/v${nextRelease.version})',
        failComment:
          'A release a partir da branch ${branch.name} falhou devido aos seguintes erros:\n- ${errors.map(err => err.message).join("\\n- ")}',
        failTitle: 'A release automática falhou 🚨',
        labels: 'crítico, precisa-de-triagem, semantic-release',
      },
    ],
  ],
}
