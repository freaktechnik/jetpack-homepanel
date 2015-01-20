# jetpack-homepanel
Module to add home panels to Firefox for Android with Jetpack

## License
This project is licensed unter the MPL 2.0. For the full license text, check out [mozilla.org/MPL/2.0/](http://mozilla.org/MPL/2.0/).

## Usage
### Section
Represents a list or grid of items in a panel on the homescreen. Fennec
currently only supports one per panel.
#### Items
Items for the section follow https://developer.mozilla.org/en-US/Add-ons/Firefox_for_Android/API/HomeProvider.jsm/HomeStorage#Item_attributes. The maximal number of supported items is 100.
#### Constructor
##### Required Options
###### type
Either has the value of `Types.GRID` or `Types.LIST`. `Types.GRID` shows
"thumbnails" like the default panel and `Types.LIST` shows the items in a list,
like the other default panels.
##### Optional Options
###### backImageUrl
An string with a URL poitning to a background image for the panel.
###### empty
Object with a text and imageUrl property, specifying the contents of the panel
when there are no items to display.
###### data
List of items added to the section upon construction.
###### manuallyRefreshable
Boolean indicating, if a user can pull down to refresh the content of the panel.
Defaults to true.
###### onRefresh
Event listener attached to the refresh event.
#### Properties
##### id
(readonly) ID of the section in the HomeStorage.
##### type
The (readonly) type of the section.
##### data
Array of items within the section.
#### Methods
##### addData(newData)
This is a more efficient way of adding items to the section than setting the data
attribute with a concatenated array.
##### clear()
Removes all items from the section
##### destroy()
Cleans the object's private attributes and clears its items.
##### Event listening methods (on, once etc.)
#### Events
##### refresh
The refresh event can only get fired if manuallyRefreshable was true in the
constructor. It is triggered after the user pulled down to refresh. The loading
animation will only stop, if the data property is set or addData is called.
### HomePanel
#### Constructor
Adds a panel to fennec's homescreen.
##### Required arguments
###### title
The title displayed for the panel on the fennec homepage.
###### sections
An array of at least one Sections. Firefox currently only supports one Section per HomePanel.
##### Optional arguments
###### onShow
Event listener for the show event.
###### onHide
Event listener for the hide event.
#### Properties
##### isShowing
Boolean indicating, whether or not the panel is currently accessible on Fennec's
homescreen.
#### Methods
##### show()
Adds the panel to fennec's homescreen.
##### hide()
Removes the panel from fennec's homescreen.
##### destroy()
Clears the panel's attributes and sections.
##### Event listening methods (on, once, etc.)
#### Events
##### show
Fired whenever the panel is added to fennec's homescreen.
##### hide
Fired whenever the panel is removed from fennec's homescreen.

### Example
```js
const { HomePanel, Section, Types } = require("homepanel");

let section = Section({
        type: Types.GRID,
        backImageUrl: "http://example.com/blank.png",
        empty: {
            text: "Nothing here!",
            imageUrl: "http://example.com/empty.png"
        },
        manuallyRefreshable: true,
        onrefresh: () => {
            // user manually refreshed
        }
    }),
    panel = HomePanel({
        title: "Test Panel",
        sections: [ section ],
        onShow: () => {
            // panel has been added to the homescreen
        },
        onHide: () => {
            // panel has been removed from the homescreen
        }
    });
```
