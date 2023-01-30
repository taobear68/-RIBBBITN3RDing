#!/bin/bash

echo "Cloning the repo..."
cd && mkdir -p git && \
pushd ~/git && \
rm -rf ./-RIBBBITN3RDing && \
git clone https://github.com/taobear68/-RIBBBITN3RDing.git && \
popd && \
date

echo "Refreshing deployed code..."
pushd ~/git/-RIBBBITN3RDing/rmvod/ && \
cp js/* /var/www/html/rmvod/js/ && \
cp html/* /var/www/html/rmvod/ && \
cp css/* /var/www/html/rmvod/css/ && \
cp py/* /var/lib/rmvod/py/ && \
cp bash/* /var/lib/rmvod/bash/ && \
popd && \
date

echo "The rmvod API will need to be manually restarted for all changes to take effect."


