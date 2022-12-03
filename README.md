![Intro Pic][social-media-pic]
# Introduction
*OSM Latest Changes* is a web application that helps to check recent OSM changes within a certain cartographic boundary, for example your home town. It displays all changesets in a list and on a map. The elements can be selected on the map whereby a tag comparison table opens up that highlights all created, modified or deleted tags. Furthermore a so called "Vandalism Meter" has been implemented that helps to find suspicious edits.

Objects that have been altered (i.e. modified, created or deleted) during a selectable time range (i.e. the last day, week or month) are displayed alongside their [changeset](https://wiki.openstreetmap.org/wiki/Changeset) meta data.

Newer edits are displayed in more saturated colors than older modifications. Deleted objects as well as the "previous state" of modified map features are displayed semi-transparently. Intermediate states of objects that have been modified more than once in the selected time period are not shown. The site currently doesn't show OSM modifications of relation objects.
![Picture of App][screenshot]
# Running
Just `git clone` and [boot up a quick development server](https://gist.github.com/tmcw/4989751). If you use *Visual Studio Code* you can alternatively install the *Live Server* extension.
# History
## 2013
It was first [prototyped](https://osmlab.github.io/latest-changes/) by [@lxbarth](https://github.com/lxbarth) and [@tmcw](https://github.com/tmcw) during the [Chicago Hack weekend](https://wiki.openstreetmap.org/wiki/Chicago_Hack_Weekend_April_2013) on the 26th-28th April 2013 (see [diary entry of lxbarth](http://www.openstreetmap.org/user/lxbarth/diary/19185) for background). This was conceived to be an enhancement to the OSM history tab with other notable users of the community working on coming up with a solution for a history tab that visualizes local changesets in an easy to understand way.
## 2013-2021
A hacked version of this prototype has been created with aims into saving bandwith and rendering time. Furthermore it allows lower zoom levels. It will show changes made in the last 24h, 3 days, 7 days or 30 days. Those enhancements were mainly implemented by [@tyrasd](https://github.com/tyrasd)
## 2022-now
As of July 2022 another updated version has been created, that offers added functionality, i.e. a tag comparison table, a vandalism checker and a filter functionality.

[social-media-pic]: img/SocialMedia-Latest-Changes.png "Intro Pic"
[screenshot]: img/multi-devices.png "Picture of the App"