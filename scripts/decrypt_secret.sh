#!/bin/sh

if [ -z "$1" ] || [ -z "$2" ]
then
    echo "Decript failed. Host is empty!"
else
    echo "Decript with host: $1, to $2...";
    # --batch to prevent interactive command
    # --yes to assume "yes" for questions
    gpg --quiet --batch --yes --decrypt --passphrase="$SECRET_PASSPHRASE" \
    --output $2 $1
    echo "Decript successfully";
fi
