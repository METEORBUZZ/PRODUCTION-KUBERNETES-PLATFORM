# Jenkins CI

Configure a Jenkins **Multibranch Pipeline** for this repository and set the
script path to `jenkins/Jenkinsfile`. Configure a webhook or branch indexing so
Jenkins runs builds for pull requests and branch updates.

The Jenkins agent must have Node.js 22, Docker with daemon access, AWS CLI,
Trivy, Kustomize, Terraform, and Python 3 installed. The pipeline runs backend
tests and builds, frontend checks and builds, infrastructure validation, and
HIGH/CRITICAL Trivy scans. On `main`, it also pushes uniquely tagged images to
ECR and commits the image references to `helm/cat-dog-voting/values.yaml`.
Argo CD watches that Helm chart and performs deployment; Jenkins does not access
the Kubernetes API.

Add these Jenkins credentials:

| Credential ID | Type | Purpose |
| --- | --- | --- |
| `jenkins-aws-credentials` | Username with password | AWS access key ID as the username and secret access key as the password. Grant only ECR authentication/push and `sts:GetCallerIdentity` permissions. |
| `github-write-token` | Username with password | GitHub account username and a token with permission to push changes to this repository. Used only for the image-values commit. |

The GitHub source-control configuration used by the Multibranch Pipeline also
needs read access to this repository. Do not put AWS or GitHub credentials in
the Jenkinsfile or repository. The Jenkins Git plugin must have a Git
installation named `Default` for the authenticated push binding in the pipeline.

The generated `chore(deploy): update image tags ...` commit triggers CI again,
but image publishing is skipped for that commit to prevent a build loop.
