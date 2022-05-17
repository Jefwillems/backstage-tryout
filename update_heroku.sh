#!/usr/bin/env bash

docker image build . -f packages/backend/Dockerfile --tag registry.heroku.com/backstage-tryout/web

docker push registry.heroku.com/backstage-tryout/web

heroku container:release web -a backstage-tryout
