//Use namespace: slApp
const slApp = (function(window, $) {
  var listData = [];
  function setListData(data) {
    listData = data;
  }
  function getListData() {
    return listData;
  }
  function pushToListData(liItem) {
    listData.push(liItem);
  }
  $(document).ready(function() {
    var modalOptions = {
      backdrop: false,
      keyboard: true,
      show: false
    };
    $("#modalForm").modal(modalOptions);
  });
  var itemCounter = (function() {
    var count = 0;
    function changeBy(val) {
      count += val;
      $("#itemCounter").html(count);
    }
    function init(val) {
      count = val;
      $("#itemCounter").html(count);
    }
    return {
      init: function(val) {
        init(val);
      },
      inc: function() {
        changeBy(1);
      },
      dec: function() {
        changeBy(-1);
      },
      value: function() {
        return count;
      }
    };
  })();

  function liItem(itemData) {
    const content = `<li class="ui-state-default" id="${itemData._id}" order="${
      itemData.displayOrder
    }">
    <div class="row">
      <div class="col text-left">
        <img class="rounded-circle list-img" id="${itemData._id}_img" 
          src="/api/listitems/img/${itemData._id}"/>
      </div>
      <div class="col-9" id="${itemData._id}_desc">${itemData.description}</div>
      <div class="col text-right">
        ${buttons(itemData)}
      </div>
    </div>
  </li>`;
    return content;
  }
  function buildList(data) {
    let html = '<ul id="sortableList">';
    for (item in data) {
      html += liItem(data[item]);
    }
    html += "</ul>";
    return html;
  }

  const buttons = itemData => {
    const contents = `
    <button type="button" onclick="slApp.confirmDeleteItem('${
      itemData._id
    }');" class="btn btn-light text-danger btn-sm " title="Delete item">
    <i class="fas fa-times"></i>
    </button>
    <button type="button" onclick="slApp.editItem('${
      itemData._id
    }');" class="btn btn-light btn-sm " title="Edit item">
      <i class="fas fa-edit"></i>
      </button>`;
    return contents;
  };
  function validateExtension(fileName) {
    if (!/\.(gif|jpg|jpeg|png)$/i.test(fileName)) {
      return false;
    } else {
      return true;
    }
  }
  //Resize and crop image prior to upload
  function prepareImage(file) {
    var reader = new FileReader();
    var image = new Image();
    var canvas = document.getElementById("imgCanvas");

    reader.onload = function(readerEvent) {
      $("#canvasContainer").hide();
      image.onload = function() {
        var dataUrl;
        var targetWidth = 320;
        var targetHeight = 320;
        var width = image.width;
        var height = image.height;
        var rate =
          Math.min(width, height) / Math.min(targetWidth, targetHeight);

        if (width > height) {
          height = targetHeight;
          width /= rate;
        } else {
          width = targetWidth;
          height /= rate;
        }
        //resize image to match target size
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        canvas.getContext("2d").drawImage(image, 0, 0, width, height);
        //crop image to match target size
        crop_canvas = document.createElement("canvas");
        crop_canvas.getContext("2d").drawImage(
          canvas,
          0,
          0,
          width,
          height,

          0,
          0,
          targetWidth,
          targetHeight
        );

        dataUrl = crop_canvas.toDataURL(file.type);
        $("#canvasContainer").show();
      };
      image.src = readerEvent.target.result;
    };

    reader.readAsDataURL(file);
  }
  function confirmDeleteItem(itemId) {
    if (confirm("Are you sure you want to delete this item?")) {
      slAjax.deleteItem(itemId);
    }
  }

  //Clear image canvas in modal form
  function clearCanvas(canvasId) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  //Reset modal form
  function resetModal() {
    document.getElementById("itemForm").reset();
    clearCanvas("imgCanvas");
    $("#itemDescription").attr("class", "form-control");
    $("#imgFile").attr("class", "form-control-file");
  }

  //Open add item modal
  function addItem() {
    resetModal();
    $("#canvasContainer").hide();
    $("#modalFormTitle").html("Add Item");
    $("#formAction").val("create");
    $("#modalForm").modal("show");
  }

  //Open edit item modal
  function editItem(itemId) {
    resetModal();
    $("#modalFormTitle").html("Edit Item");
    $("#formAction").val("update");
    $("#itemId").val(itemId);
    $("#itemDescription").val($("#" + itemId + "_desc").html());
    var image = new Image();
    var canvas = document.getElementById("imgCanvas");

    image.src = "/api/listitems/img/" + itemId + "#" + new Date().getTime();
    image.onload = function() {
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext("2d").drawImage(image, 0, 0, 320, 320);
    };
    $("#canvasContainer").show();
    $("#modalForm").modal("show");
  }

  function submitModal(event) {
    var formAction = $("#formAction").val();
    var formOK = validateForm(formAction);
    event.preventDefault();
    event.stopPropagation();
    if (formOK) {
      if (formAction == "create") {
        slAjax.createItem();
      } else if (formAction == "update") {
        slAjax.updateItem();
      } else {
        return;
      }
    }
  }

  //Form validations
  function validateForm(action) {
    var descFieldOk = true;
    var fileFieldOk = true;

    var descField = document.getElementById("itemDescription");
    var fileField = document.getElementById("imgFile");

    if (descField.value.length < 1 || descField.value.length > 300) {
      descFieldOk = false;
    }

    descFieldOk
      ? (descField.className = "form-control")
      : (descField.className = "form-control is-invalid");

    if (action === "create") {
      if (
        $("#imgFile")[0].files.length != 1 ||
        !validateExtension($("#imgFile")[0].files[0].name)
      ) {
        fileFieldOk = false;
      }
    }
    fileFieldOk
      ? (fileField.className = "form-control-file")
      : (fileField.className = "form-control-file is-invalid");

    return descFieldOk && fileFieldOk;
  }
  //---------------------------------------
  return {
    setListData: setListData,
    itemCounter: itemCounter,
    liItem: itemData => liItem(itemData),
    buildList: data => buildList(data),
    getListData: () => getListData(),
    pushToListData: liItem => pushToListData(liItem),
    listData: listData,
    addItem: addItem,
    prepareImage: file => prepareImage(file),
    confirmDeleteItem: itemId => confirmDeleteItem(itemId),
    editItem: itemId => editItem(itemId),
    submitModal: event => submitModal(event)
  };
})(window, jQuery);
