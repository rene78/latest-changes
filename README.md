# OSM Latest Changes

Shows recent changes on OpenStreetMap.

Objects that have been modified (or created or deleted) during the last week (or month or day) are displayed alongside with their [changeset](https://wiki.openstreetmap.org/wiki/Changeset) meta data.

Newer edits are displayed in more saturated colors than older modifications. Deleted objects as well as the "previous state" of modified map features are displayed semi-transparently. Intermediate states of objects that have been modified more than once in the selected time period are not shown. The site currently doesn't show OSM modifications of relation objects.

This fork is based on [https://github.com/rene78/latest-changes](https://github.com/rene78/latest-changes) and adds a (currently partial) extension to filter for changes of a selected user (see [https://github.com/tyrasd/latest-changes/issues/18](https://github.com/tyrasd/latest-changes/issues/18)).

The fork is currently deployed on [https://www.xctrails.org/osm-latest-changes/](https://www.xctrails.org/osm-latest-changes/)

## Running

Just `git clone` and [boot up a quick development server](https://gist.github.com/tmcw/4989751).

![Picture of App][screenshot]

[screenshot]: img/multi-devices.png "Picture of the App"