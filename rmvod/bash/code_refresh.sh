#!/bin/bash

# code_refresh.sh  Copyright 2023 Paul Tourville

# This file is part of RIBBBITmedia VideoOnDemand (a.k.a. "rmvod").

# RIBBBITmedia VideoOnDemand (a.k.a. "rmvod") is free software: you 
# can redistribute it and/or modify it under the terms of the GNU \
# General Public License as published by the Free Software Foundation, 
# either version 3 of the License, or (at your option) any later 
# version.

# RIBBBITmedia VideoOnDemand (a.k.a. "rmvod") is distributed in the 
# hope that it will be useful, but WITHOUT ANY WARRANTY; without even 
# the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR 
# PURPOSE. See the GNU General Public License for more details.

# You should have received a copy of the GNU General Public License 
# along with RIBBBITmedia VideoOnDemand (a.k.a. "rmvod"). If not, 
# see <https://www.gnu.org/licenses/>.


mkdir -p /var/lib/rmvod/py /var/lib/rmvod/bash
mkdir -p /var/www/html/rmvod/js/ /var/www/html/rmvod/css

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


