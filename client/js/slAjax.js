const slAjax = (function(window, $) {
  //Set item counter value
  (function() {
    $.ajax({
      type: "GET",
      url: "/api/listitems/count",
      dataType: "json",
      async: true,
      success: function(res) {
        slApp.itemCounter.init(res);
      }
    });
  })();

  //Load list items
  const loadList = (function() {
    $.ajax({
      type: "GET",
      url: "/api/listitems/",
      dataType: "json",
      async: true,
      success: function(res) {
        slApp.setListData(res);
        var listData = res;
        document.getElementById("sort-list").innerHTML = slApp.buildList(res);
        var liItem, originaLilIndex, newLiIndex;

        $(function() {
          $("#sortableList").sortable({
            items: "> li",
            //User starts dragging
            start: function(event, ui) {
              //Store original position and item
              originaLilIndex = ui.item.index();
              liItem = listData[originaLilIndex];
            },
            //List order changed
            update: function(event, ui) {
              //New item position
              newLiIndex = ui.item.index();
              //Update data array
              //Remove item from original position
              listData.splice(originaLilIndex, 1);
              //Insert item in new position
              listData.splice(newLiIndex, 0, liItem);

              //Get modified elements
              var start = Math.min(originaLilIndex, newLiIndex);
              var end = Math.max(originaLilIndex, newLiIndex);
              let modifiedData = listData.slice(start, end + 1);

              //Destructure array to only include _id and displayOrder
              modifiedData = modifiedData.map((item, index) => {
                var rItem = {};
                rItem = { _id: item._id, displayOrder: index + start };
                return rItem;
              });
              slApp.setListData(listData);
              //Store new items order in backend
              patchItemsOrder(modifiedData);
            }
          });
          $("#sortableList").disableSelection();
        });
      }
    });
  })();

  //Create new item
  function createItem() {
    var file = $("#imgFile")[0].files[0];

    var data = {
      description: $("#itemDescription").val(),
      displayOrder: slApp.itemCounter.value() + 1,
      fileName: file.name,
      contentType: file.type,
      imgFile: document.getElementById("imgCanvas").toDataURL("image/jpeg")
    };

    $.ajax({
      type: "POST",
      url: "/api/listitems",
      data: data,
      cache: false,
      success: function(data) {
        $("#modalForm").modal("hide");
        var itemData = {
          _id: data._id,
          imageId: data.imageId,
          description: data.description,
          displayOrder: data.displayOrder
        };
        //Add new item to DOM
        $("#sortableList").append(slApp.liItem(itemData));

        //Push to listData array
        slApp.pushToListData(itemData);

        //Increment item counter
        slApp.itemCounter.inc();
      }
    });
  }

  //Update Item
  function updateItem() {
    const itemId = $("#itemId").val();
    var file = $("#imgFile")[0].files[0];

    var data = { description: $("#itemDescription").val() };
    //If new file selected, attach file data
    if (file) {
      data = {
        ...data,
        updateImg: true,
        fileName: file.name,
        contentType: file.type,
        imgFile: document.getElementById("imgCanvas").toDataURL("image/jpeg")
      };
    }

    $.ajax({
      url: "/api/listitems/" + itemId,
      type: "PUT",
      data: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      },
      success: function(data) {
        var itemData = {
          _id: data._id,
          description: data.description
        };
        $("#" + itemId).replaceWith(slApp.liItem(itemData));
        //Refresh image
        var imgSrc = $("#" + itemId + "_img").attr("src");
        $("#" + itemId + "_img").attr(
          "src",
          imgSrc + "#" + new Date().getTime()
        );

        $("#modalForm").modal("hide");
      }
    });
  }

  //Delete item
  function deleteItem(itemId) {
    $.ajax({
      type: "DELETE",
      url: "/api/listitems/" + itemId,
      success: function(data) {
        $("#modalDelete").modal("hide");
        $("#" + itemId).remove();
        slApp.itemCounter.dec();
      }
    });
  }

  //Save items order after sorting
  function patchItemsOrder(modifiedData) {
    $.ajax({
      url: "/api/listitems/",
      type: "PATCH",
      data: JSON.stringify(modifiedData),
      headers: {
        "Content-Type": "application/json"
      },
      success: function(res) {
        //
      }
    });
  }
  //---------------------------------------
  return {
    createItem: createItem,
    updateItem: updateItem,
    deleteItem: itemId => deleteItem(itemId),
    patchItemsOrder: modifiedData => patchItemsOrder(modifiedData)
  };
})(window, jQuery);
