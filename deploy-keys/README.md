# Deploy keys

`github-actions.pub` is the public half of the SSH key that the GitHub Actions
deploy workflow uses to log into the production server.

The private key was set as the `SSH_KEY` repository secret and wiped from
disk — there is no copy outside GitHub.

If the key is ever leaked, rotate it:

```bash
ssh-keygen -t ed25519 -f /tmp/new -N "" -C "github-actions-deploy"
gh secret set SSH_KEY < /tmp/new
# Replace deploy-keys/github-actions.pub with /tmp/new.pub
# Update the server's ~/.ssh/authorized_keys to swap the old line for the new public key
rm /tmp/new /tmp/new.pub
```
