#!/bin/bash
cd ..
ls
git clone https://github.com/swaponline/swap.core.git
cd swap.core
echo "_________NPM install swap.react___________"
npm i
cd ../swap.react
