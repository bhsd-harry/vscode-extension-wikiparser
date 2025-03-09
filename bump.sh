#!/usr/local/bin/bash
if [[ $2 == 'npm' ]]
then
	npx vsce publish
else
	npm run lint && npm run build && npm test
	if [[ $? -eq 0 ]]
	then
		sed -i '' -E "s/\"version\": \".+\"/\"version\": \"$1\"/" package.json
		npm i --package-lock-only
		git add -A
		git commit -m "chore: bump version to $1"
		git push
		git tag "$1"
		git push origin "$1"
	fi
fi
