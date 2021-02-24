#!/bin/bash

echo "Enter token for farmdeployer.js (ex. E1HOSDK31...)"
read deployerToken

echo "Enter token for farmfactory.js (ex. E1HOSDK31...)"
read factoryToken

echo "Enter token for farmfactory.css (ex. E1HOSDK31...)"
read factoryStylesToken

farmPagePath="./src/front/shared/pages/FarmFactory/lib/"



# checking that all tokens aren't empty
if [[ -n "$deployerToken" && -n "$factoryToken" && -n "$factoryStylesToken"  ]]
then
  curl -o farmdeployer.js "https://raw.githubusercontent.com/noxonsu/farmfactory/main/lib/farmdeployer.js?token=$deployerToken"
  curl -o farmfactory.js "https://raw.githubusercontent.com/noxonsu/farmfactory/main/lib/farmfactory.js?token=$factoryToken"
  curl -o farmfactory.css "https://raw.githubusercontent.com/noxonsu/farmfactory/main/farmfactory.css?token=$factoryStylesToken"

  # checking that all files was downloaded
  if [[ -s farmdeployer.js && -s farmfactory.js && -s farmfactory.css ]]
  then
    # move files to the farm page directory
    mv farmdeployer.js "$farmPagePath"
    mv farmfactory.js "$farmPagePath"
    mv farmfactory.css "$farmPagePath"

    cd "$farmPagePath"

    # add 'export' in the beginning of the files
    sed -i "1s/^/export /" farmdeployer.js
    sed -i "1s/^/export /" farmfactory.js
  else
    rm farmdeployer.js farmfactory.js farmfactory.css
    echo "Cannot download files"
  fi
else 
  echo "Not all tokens are listed"
fi
