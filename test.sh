#!/bin/bash -v
while [ true ]
do
  curl -d "foo=bar" -X POST --header "nox-url: google.com" http://localhost:7654/request
done
