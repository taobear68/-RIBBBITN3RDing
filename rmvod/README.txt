As of Feb. 12, 2023, RIBBBITmedia VideoOnDemand has moved to its own repository:

https://github.com/taobear68/rmvod

Please see that resository for code and commentary regarding RIBBBITmedia VideoOnDemand

Files will be preserved for 30 days in this repository, and will then be deleted.  Please update any references, bookmarks, et cetera to the new repository.

Thank you.



*****=====>>>>> DEPRECATED <<<<<=====*****

This is the RIBBBITmedia VideoOnDemand project.

In the interest of brevity, RIBBBITmedia VideoOnDemand will be referred to as "rmvod" throughout this document.

Purpose: 
Provide a browser-based UI for interacting with and consuming assets from a remote video-on-demand library.  The user experience should feel somewhat familar to users of existing popular commercial platforms.

It should be noted that rmvod is intended for use with media assets to which the user has secured and can defend the apropriate and necessary rights, and is not currently intended for use on a public-facing network. The user assumes all risks arising from exposing an rmvod installation or the assets catalogged therein on a public-facing network, or using rmvod to distribute media assets in a manner contrary to the relevant licenses under which those assets were originally released. 

Major Components:
1) Database: rmvod uses MariaDB as the foundation of its library.  Currently, the expectation is that the DB will reside on the same host as other "server side" components, but with a little effort, the DB can be moved to a separate machine.
2) Web Server: Scripted configuration of an rmvod system will only work with Apache2, but an experienced administrator could use any web server with the necessary features.  rmvod's API has no dependencies on any functionality exclusive to Apache2.  
3) API: rmvod uses flask to service an API written in Python 3 
4) Artifact Filestore: The user will organize and make available the filestore by whatever means they see fit, such that it is mounted on the machine hosting the rmvod Apache server, and the both the rmvod API and Apache have at least read access to it.
5) Single Page Web Application: In its current incarnation, rmvod provides a simple HTML framework, in which various Javascript elements render HTML to present information and control actions, such as displaying and filtering the list of assets, editing asset details, and playing assets.
6) Command Line Interface: In its current incarnation, rmvod has a "back end" CLI which permits fucntions more oriented toward someone administering the platform, such as creation and modification of artifact records in the database.  Most of these functions will likely end up in a separate web interface, but for now, the CLI exists, and operates on the same core code as the API, so it is useful for some testing and verification without using the full web stack, if necessary.



