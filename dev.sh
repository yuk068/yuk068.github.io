#!/bin/bash

# Start Jekyll in development mode.
export JEKYLL_ENV="development"
echo "JEKYLL_ENV=$JEKYLL_ENV"
trap 'echo "JEKYLL_ENV=$JEKYLL_ENV"' EXIT
echo "Starting Jekyll dev server (development mode)..."
bundle exec jekyll serve
