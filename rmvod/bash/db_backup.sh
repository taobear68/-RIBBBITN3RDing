#!/bin/bash

# db_backup.sh  Copyright 2023 Paul Tourville

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


BUTDIR="/root"
DBNM="vodlib"
ENVNM="prod"
DTSTR=$(date +%Y%m%d%H%M%S)
OFILNMRT="${DBNM}_${ENVNM}_${DTSTR}"
SQLFILNM="${OFILNMRT}.sql"
#TFFP="${BUTDIR}/${SQLFILNM}"
TARFIL="${OFILNMRT}.tar.gz"
pushd ${BUTDIR}
mysqldump --add-drop-table --add-locks --comments --dump-date --lock-tables ${DBNM} > ${SQLFILNM}
tar -czvf ${TARFIL} ${SQLFILNM} && rm ${SQLFILNM}
popd


#mysqldump --add-drop-table --add-locks --comments --dump-date --lock-tables ${DBNM} | tar -czv ${TARFILFP} 

