# OSM Latest Changes

Shows recent changes on OpenStreetMap.

Objects that have been modified (or created or deleted) during the last week (or month or day) are displayed alongside with their [changeset](https://wiki.openstreetmap.org/wiki/Changeset) meta data.

Newer edits are displayed in more saturated colors than older modifications. Deleted objects as well as the "previous state" of modified map features are displayed semi-transparently. Intermediate states of objects that have been modified more than once in the selected time period are not shown. The site currently doesn't show OSM modifications of relation objects.

This is based on an earlier prototype by [@lxbarth](https://github.com/lxbarth), see http://www.openstreetmap.org/user/lxbarth/diary/19185 for background.

## Running

Just `git clone` and [boot up a quick development server](https://gist.github.com/tmcw/4989751).

![Picture of App][screenshot]

[screenshot]: img/multi-devices.png "Picture of the App"