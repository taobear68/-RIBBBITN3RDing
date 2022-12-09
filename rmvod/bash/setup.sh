#!/bin/bash

# PLACEHOLDER for setup script for rmvod

# setup.sh  Copyright 2022 Paul Tourville

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


######
# This is nowhere near ready for execution.  Let's just bail out here.
echo "This setup script is not ready for execution.  Giving up."
exit 1


#Confirm that we are root


#MAKE SURE ALL SOFTWARE IS INSTALLED
#Confirm Apache2 is present and if not install it

#Confirm Python 3 is present, and if not install it

#Confirm Flask is present, and if not install it

#Confirm the following Python 3 modules are present, and if not install them: 
 #pymysql, copy, json, uuid, base64, os, yaml, requests

#Ask whether DB will be local or remote
#IF DB is local, confirm MariaDB is present, and if not install it
#IF DB is remote, get connection information (host, user, password, dbname)


echo "Creating some dorectories under /var/www/html for rmvod"
#MAKE SURE FILESYSTEM HAS NEEDED COMPONENTS
mkdir -p /var/www/html/rmvid/css
mkdir -p /var/www/html/rmvid/js
mkdir -p /var/www/html/rmvid/py
mkdir -p /var/www/html/rmvid/api
mkdir -p /var/www/html/rmvid/img
mkdir -p /var/www/html/rmvid/data
mkdir -p /var/www/html/rmvid/dl


# We probably want to make sure whether this is actual or a symlink
mkdir -p /var/www/html/rmvid/vidsrc



