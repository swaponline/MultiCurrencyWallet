#!/bin/bash

# ?token=AOYPUHTNECOHBM5IWVSOKMDAGZPS2
# ?token=AOYPUHTQTXAEN3MED7OB4ZTAGZPUG
# ?token=AOYPUHQAKVEEKGIQ4UHHB5TAGZPVQ

farmPagePath="../src/front/shared/pages/FarmFactory/lib/"

curl -O "https://raw.githubusercontent.com/noxonsu/farmfactory/main/lib/farmdeployer.js"
curl -O "https://raw.githubusercontent.com/noxonsu/farmfactory/main/lib/farmfactory.js"
curl -O "https://raw.githubusercontent.com/noxonsu/farmfactory/main/farmfactory.css"

# checking that all files was downloaded
if [[ -e farmdeployer.js && -e farmfactory.js && -e farmfactory.css ]]
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
  echo "Can not download files"
fi

