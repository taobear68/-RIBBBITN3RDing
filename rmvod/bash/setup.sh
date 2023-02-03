#!/bin/bash

# setup.sh  Copyright 2022, 2023 Paul Tourville

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


#######
## This is nowhere near ready for execution.  Let's just bail out here.
#echo "This setup script is not ready for execution.  Giving up."
#exit 1

### We should still have some kind of thing here to check to see if this 
### is a Debian-based distro


IAM=$(whoami)
if [[ "${IAM}" != "root" ]] 
    then
        echo "This script must be run under sudo or as root."
        exit 1
    fi


#### FUNCTIONS
pkg_install(){
    apt-get install \
    python3 apache2 mariadb-server python3-flask \
    python3-pymysql python3-yaml || \
    {echo "Package install failed."; exit 1 }
}

fs_setup(){
    echo "Setting up the filesystem..."
    pushd /var/www/html && {
        {
            mkdir -p rmvod && cd rmvod && \
            mkdir -p api css data dl img js vidsrc 
        } || {
            echo "Filesystem Setup failed (var/www/html)!"; exit 1 
        }
    } && popd || {
        echo "Filesystem Setup failed!"; exit 1 
    }
    
    pushd /var/lib/ && {
        {
            mkdir -p rmvod && cd rmvod && \
            mkdir -p py && mkdir -p bash 
        } || {
            echo "Filesystem Setup failed (/var/lib/)!"; exit 1 
        }
    } && popd || {
        echo "Filesystem Setup failed!"; exit 1 
    }
}

file_copy(){
    echo "Copying files to the apropriate places..."
    cp js/* /var/www/html/rmvod/js/ && \
    cp img/* /var/www/html/rmvod/img/ && \
    cp html/* /var/www/html/rmvod/ && \
    cp css/* /var/www/html/rmvod/css/ && \
    cp py/* /var/lib/rmvod/py/ && \
    cp bash/* /var/lib/rmvod/bash/ && \
    cp apache/sites-available/*  /etc/apache2/sites-available/ && \
    chmod o+x /var/lib/rmvod/bash/*.sh && \
    chmod o+x /var/lib/rmvod/py/*.sh  || \
    {echo "File Copy failed!"; exit 1 }
}

wbsvr_setup(){
    echo "Setting up Apache2..."
    a2enmod proxy_http2 proxy_http proxy ssl && {
        pushd /etc/apache2/sites-enabled && \
        rm ./* && \
        ln -s ../sites-available/001-api-proxy.conf && \
        popd 
    } && { 
        systemctl restart apache2 
    } || {
        echo "Apache Setup failed!"
        exit 1 
    }
}

db_setup(){
    mariadb <  ./sql/vodlib_setup.sql  || {
        echo "Database Setup failed!"
        exit 1 
    }
}


# Install packages
echo
pkg_install || exit 1

echo
echo "Making sure we're in the right starting directory."
echo "This may take a moment..."
PYFIL="$(find $(pwd) -wholename "*/py/rmvod_api.py" | head -n 1)"
INSTSRCDIR="$(dirname $(dirname ${PYFIL}))"
pushd ${INSTSRCDIR} || \
{echo "Something has gone horribly wrong.  I don't know where I am."; \
    echo ${INSTSRCDIR}; exit 1 }

# Setup filesystem
echo
fs_setup || exit 1

# Just in case filesystem setup left us in a weird place, let's make 
# sure we're where we're supposed to be...
echo
dirs -c
pushd ${INSTSRCDIR} || \
{
    echo "Something has gone horribly wrong.  I don't know where I am.";
    echo ${INSTSRCDIR}
    exit 1 
}


# Put Files in the proper places
echo
file_copy || exit 1


# Adjust Apache2 configuration
echo
wbsvr_setup || exit 1

# Setup Database
echo
db_setup || exit 1

