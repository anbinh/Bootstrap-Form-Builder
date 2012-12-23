$(document).ready(function(){
  $("#components-pane").html(componentsListHtml);
  $("#preview-pane").html(previewHtml);
  $('head').append(styles);

  $("form").delegate(".component", "mousedown", function(md){
    $(".popover").remove();

    md.preventDefault();
    var tops = [];
    var mouseX = md.pageX;
    var mouseY = md.pageY;
    var $temp;
    var timeout;
    var $this = $(this);
    var delays = {
      main: 0,
      form: 120
    }
    var type;

    if($this.parent().parent().parent().parent().attr("id") === "components"){
      type = "main";
    } else {
      type = "form";
    }

    var delayed = setTimeout(function(){
      if(type === "main"){
        $temp = $("<form class='form-horizontal span6' id='temp'></form>").append($this.clone());
      } else {
        if($this.attr("id") !== "legend"){
          $temp = $("<form class='form-horizontal span6' id='temp'></form>").append($this);
        }
      }

      $("body").append($temp);

      $temp.css({"position" : "absolute",
                 "top"      : mouseY - ($temp.height()/2) + "px",
                 "left"     : mouseX - ($temp.width()/2) + "px",
                 "opacity"  : "0.9"}).show()

      var half_box_height = ($temp.height()/2);
      var half_box_width = ($temp.width()/2);
      var $target = $("#target");
      var tar_pos = $target.position();
      var $target_component = $("#target .component");

      $(document).delegate("body", "mousemove", function(mm){

        var mm_mouseX = mm.pageX;
        var mm_mouseY = mm.pageY;

        $temp.css({"top"      : mm_mouseY - half_box_height + "px",
          "left"      : mm_mouseX - half_box_width  + "px"});

        if ( mm_mouseX > tar_pos.left &&
          mm_mouseX < tar_pos.left + $target.width() + $temp.width()/2 &&
          mm_mouseY > tar_pos.top &&
          mm_mouseY < tar_pos.top + $target.height() + $temp.height()/2
          ){
            $("#target").css("background-color", "#fafdff");
            $target_component.css({"border-top" : "1px solid white", "border-bottom" : "none"});
            tops = $.grep($target_component, function(e){
              return ($(e).position().top -  mm_mouseY + half_box_height > 0 && $(e).attr("id") !== "legend");
            });
            if (tops.length > 0){
              $(tops[0]).css("border-top", "1px solid #22aaff");
            } else{
              if($target_component.length > 0){
                $($target_component[$target_component.length - 1]).css("border-bottom", "1px solid #22aaff");
              }
            }
          } else{
            $("#target").css("background-color", "#fff");
            $target_component.css({"border-top" : "1px solid white", "border-bottom" : "none"});
            $target.css("background-color", "#fff");
          }
      });

      $("body").delegate("#temp", "mouseup", function(mu){
        mu.preventDefault();

        var mu_mouseX = mu.pageX;
        var mu_mouseY = mu.pageY;
        var tar_pos = $target.position();

        $("#target .component").css({"border-top" : "1px solid white", "border-bottom" : "none"});

        // acting only if mouse is in right place
        if (mu_mouseX + half_box_width > tar_pos.left &&
          mu_mouseX - half_box_width < tar_pos.left + $target.width() &&
          mu_mouseY + half_box_height > tar_pos.top &&
          mu_mouseY - half_box_height < tar_pos.top + $target.height()
          ){
            $temp.attr("style", null);
            // where to add
            if(tops.length > 0){
              $($temp.html()).insertBefore(tops[0]);
            } else {
              $("#target fieldset").append($temp.append("\n\n\ \ \ \ ").html());
            }
          } else {
            // no add
            $("#target .component").css({"border-top" : "1px solid white", "border-bottom" : "none"});
            tops = [];
          }

        //clean up & add popover
        $target.css("background-color", "#fff");
        $(document).undelegate("body", "mousemove");
        $("body").undelegate("#temp","mouseup");
        $("#target .component").popover({trigger: "manual"});
        $temp.remove();
        genSource();
      });
    }, delays[type]);

    $(document).mouseup(function () {
      clearInterval(delayed);
      return false;
    });
    $(this).mouseout(function () {
      clearInterval(delayed);
      return false;
    });
  });

  var genSource = function(){
    var $temptxt = $("<div>").html($("#build").html());
    //scrubbbbbbb
    $($temptxt).find(".component").attr({"title": null,
      "data-original-title":null,
      "data-type": null,
      "data-content": null,
      "rel": null,
      "trigger":null,
      "style": null});
    $($temptxt).find(".valtype").attr("data-valtype", null).removeClass("valtype");
    $($temptxt).find(".component").removeClass("component");
    $($temptxt).find("form").attr({"id":  null, "style": null});
    $("#source").val($temptxt.html().replace(/\n\ \ \ \ \ \ \ \ \ \ \ \ /g,"\n"));
  }


  //activate legend popover
  $("#target .component").popover({trigger: "manual"});
  //popover on click event
  $("#target").delegate(".component", "click", function(e){
    e.preventDefault();
    $(".popover").hide();
    var $active_component = $(this);
    $active_component.popover("show");
    var valtypes = $active_component.find(".valtype");
    $.each(valtypes, function(i,e){
      var valID ="#" + $(e).attr("data-valtype");
      var val;
      if(valID ==="#placeholder"){
        val = $(e).attr("placeholder");
        $(".popover " + valID).val(val);
      } else if(valID==="#checkbox"){
        val = $(e).attr("checked");
        $(".popover " + valID).attr("checked",val);
      } else if(valID==="#option"){
        val = $.map($(e).find("option"), function(e,i){return $(e).text()});
        val = val.join("\n")
      $(".popover "+valID).text(val);
      } else if(valID==="#checkboxes"){
        val = $.map($(e).find("label"), function(e,i){return $(e).text().trim()});
        val = val.join("\n")
      $(".popover "+valID).text(val);
      } else if(valID==="#radios"){
        val = $.map($(e).find("label"), function(e,i){return $(e).text().trim()});
        val = val.join("\n");
        $(".popover "+valID).text(val);
        $(".popover #name").val($(e).find("input").attr("name"));
      } else if(valID==="#inline-checkboxes"){
        val = $.map($(e).find("label"), function(e,i){return $(e).text().trim()});
        val = val.join("\n")
          $(".popover "+valID).text(val);
      } else if(valID==="#inline-radios"){
        val = $.map($(e).find("label"), function(e,i){return $(e).text().trim()});
        val = val.join("\n")
          $(".popover "+valID).text(val);
        $(".popover #name").val($(e).find("input").attr("name"));
      } else if(valID==="#button") {
        val = $(e).text();
        var type = $(e).find("button").attr("class").split(" ").filter(function(e){return e.match(/btn-.*/)});
        $(".popover #color option").attr("selected", null);
        if(type.length === 0){
          $(".popover #color #default").attr("selected", "selected");
        } else {
          $(".popover #color #"+type[0]).attr("selected", "selected");
        }
        val = $(e).find(".btn").text();
        $(".popover #button").val(val);
      } else {
        val = $(e).text();
        $(".popover " + valID).val(val);
      }
    });

    $(".popover").delegate(".btn-danger", "click", function(e){
      e.preventDefault();
      $active_component.popover("hide");
    });

    $(".popover").delegate(".btn-info", "click", function(e){
      e.preventDefault();
      var inputs = $(".popover input");
      inputs.push($(".popover textarea")[0]);
      $.each(inputs, function(i,e){
      var vartype = $(e).attr("id");
      var value = $active_component.find('[data-valtype="'+vartype+'"]')
      if(vartype==="placeholder"){
        $(value).attr("placeholder", $(e).val());
      } else if (vartype==="checkbox"){
        if($(e).is(":checked")){
          $(value).attr("checked", true);
        }
        else{
          $(value).attr("checked", false);
        }
      } else if (vartype==="option"){
        var options = $(e).val().split("\n");
        $(value).html("");
        $.each(options, function(i,e){
          $(value).append("\n      ");
          $(value).append($("<option>").text(e));
        });
      } else if (vartype==="checkboxes"){
        var checkboxes = $(e).val().split("\n");
        $(value).html("\n      <!-- Multiple Checkboxes -->");
        $.each(checkboxes, function(i,e){
          if(e.length > 0){
            $(value).append('\n      <label class="checkbox">\n        <input type="checkbox" value="'+e+'">\n        '+e+'\n      </label>');
          }
        });
        $(value).append("\n  ")
      } else if (vartype==="radios"){
        var group_name = $(".popover #name").val();
        var radios = $(e).val().split("\n");
        $(value).html("\n      <!-- Multiple Radios -->");
        $.each(radios, function(i,e){
          if(e.length > 0){
            $(value).append('\n      <label class="radio">\n        <input type="radio" value="'+e+'" name="'+group_name+'">\n        '+e+'\n      </label>');
          }
        });
        $(value).append("\n  ")
          $($(value).find("input")[0]).attr("checked", true)
      } else if (vartype==="inline-checkboxes"){
        var checkboxes = $(e).val().split("\n");
        $(value).html("\n      <!-- Inline Checkboxes -->");
        $.each(checkboxes, function(i,e){
          if(e.length > 0){
            $(value).append('\n      <label class="checkbox inline">\n        <input type="checkbox" value="'+e+'">\n        '+e+'\n      </label>');
          }
        });
        $(value).append("\n  ")
      } else if (vartype==="inline-radios"){
        var radios = $(e).val().split("\n");
        var group_name = $(".popover #name").val();
        $(value).html("\n      <!-- Inline Radios -->");
        $.each(radios, function(i,e){
          if(e.length > 0){
            $(value).append('\n      <label class="radio inline">\n        <input type="radio" value="'+e+'" name="'+group_name+'">\n        '+e+'\n      </label>');
          }
        });
        $(value).append("\n  ")
          $($(value).find("input")[0]).attr("checked", true)
      } else if (vartype === "button"){
        var type =  $(".popover #color option:selected").attr("id");
        $(value).find("button").text($(e).val()).attr("class", "btn "+type);
      } else {
        $(value).text($(e).val());
      }
    $active_component.popover("hide");
    genSource();
    });
    });
  });
  $("#navtab").delegate("#sourcetab", "click", function(e){
    genSource();
  });
});

var styles = "\
<style>\
#target{\
  min-height: 200px;\
  border: 1px solid #ccc;\
  padding: 5px;\
}\
#target .component{\
  border: 1px solid #fff;\
}\
.popover-content form {\
  margin: 0 auto;\
  width: 213px;\
}\
.popover-content form .btn {\
  margin-right: 10px\
}\
#navtab > li > a {\
  padding-right: 9px;\
  padding-left: 9px;\
}\
#source {\
  min-height: 500px;\
}\
<style>\
";

var previewHtml = "\
<div id=\"build\">\
  <form id=\"target\" class=\"form-horizontal\">\
    <fieldset>\
      <div id=\"legend\" class=\"component\" rel=\"popover\" title=\"Form Title\" trigger=\"manual\"\
        data-content=\"\
        <form class='form'>\
          <div class='controls'>\
            <label class='control-label'>Title</label> <input class='input-large' type='text' name='title' id='text'>\
            <hr/>\
            <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
          </div>\
        </form>\"\
        >\
        <legend class=\"valtype\" data-valtype=\"text\">Form Name</legend>\
      </div>\
    </fieldset>\
  </form>\
</div>";

  // Converted " -> \" and \n -> \\\n
var componentsListHtml = "\
<div class=\"tabbable\">\
<ul class=\"nav nav-tabs\" id=\"navtab\">\
  <li class=\"active\"><a href=\"#1\" data-toggle=\"tab\">Input</a></li>\
  <li class><a href=\"#2\" data-toggle=\"tab\">Select</a></li>\
  <li class><a href=\"#3\" data-toggle=\"tab\">Checkbox / Radio</a></li>\
  <li class><a href=\"#4\" data-toggle=\"tab\">File / Button</a></li>\
  <li class><a id=\"sourcetab\" href=\"#5\" data-toggle=\"tab\">Generated Source</a></li>\
</ul>\
<form class=\"form-horizontal\" id=\"components\">\
  <fieldset>\
    <div class=\"tab-content\">\
      <div class=\"tab-pane active\" id=\"1\">\
        <div class=\"control-group component\" data-type=\"text\" rel=\"popover\" title=\"Text Input\" trigger=\"manual\"\
          data-content=\"\
          <form class='form'>\
            <div class='controls'>\
              <label class='control-label'>Label Text</label> <input class='input-large' type='text' name='label' id='label'>\
              <label class='control-label'>Placeholder</label> <input type='text' name='placeholder' id='placeholder'>\
              <label class='control-label'>Help Text</label> <input type='text' name='help' id='help'>\
              <hr/>\
              <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
            </div>\
          </form>\"\
          >\
          <!-- Text input-->\
          <label class=\"control-label valtype\" for=\"input01\" data-valtype='label'>Text input</label>\
          <div class=\"controls\">\
            <input type=\"text\" placeholder=\"placeholder\" class=\"input-xlarge valtype\" data-valtype=\"placeholder\" >\
            <p class=\"help-block valtype\" data-valtype='help'>Supporting help text</p>\
          </div>\
        </div>\
        <div class=\"control-group component\" data-type=\"search\" rel=\"popover\" title=\"Search Input\" trigger=\"manual\"\
          data-content=\"\
          <form class='form'>\
            <div class='controls'>\
              <label class='control-label'>Label Text</label> <input class='input-large' type='text' name='label' id='label'>\
              <label class='control-label'>Placeholder</label> <input type='text' name='placeholder' id='placeholder'>\
              <label class='control-label'>Help Text</label> <input type='text' name='help' id='help'>\
              <hr/>\
              <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
            </div>\
          </form>\"\
          >\
          <!-- Search input-->\
          <label class=\"control-label valtype\" data-valtype=\"label\">Search input</label>\
          <div class=\"controls\">\
            <input type=\"text\" placeholder=\"placeholder\" class=\"input-xlarge search-query valtype\" data-valtype=\"placeholder\">\
            <p class=\"help-block valtype\" data-valtype=\"help\">Supporting help text</p>\
          </div>\
        </div>\
        <div class=\"control-group component\" data-type=\"prep-text\" rel=\"popover\" title=\"Prepended Text Input\" trigger=\"manual\"\
          data-content=\"\
          <form class='form'>\
            <div class='controls'>\
              <label class='control-label'>Label Text</label> <input class='input-large' type='text' name='label' id='label'>\
              <label class='control-label'>Prepend</label> <input type='text' name='prepend' id='prepend'>\
              <label class='control-label'>Placeholder</label> <input type='text' name='placeholder' id='placeholder'>\
              <label class='control-label'>Help Text</label> <input type='text' name='help' id='help'>\
              <hr/>\
              <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
            </div>\
          </form>\"\
          >\
          <!-- Prepended text-->\
          <label class=\"control-label valtype\" data-valtype=\"label\">Prepended text</label>\
          <div class=\"controls\">\
            <div class=\"input-prepend\">\
              <span class=\"add-on valtype\" data-valtype=\"prepend\">^_^</span>\
              <input class=\"span2 valtype\" placeholder=\"placeholder\" id=\"prependedInput\" type=\"text\" data-valtype=\"placeholder\">\
            </div>\
            <p class=\"help-block valtype\" data-valtype=\"help\">Supporting help text</p>\
          </div>\
        </div>\
        <div class=\"control-group component\" data-type=\"app-text\" rel=\"popover\" title=\"Appended Text Input\" trigger=\"manual\"\
          data-content=\"\
          <form class='form'>\
            <div class='controls'>\
              <label class='control-label'>Label Text</label> <input class='input-large' type='text' name='label' id='label'>\
              <label class='control-label'>Appepend</label> <input type='text' name='append' id='append'>\
              <label class='control-label'>Placeholder</label> <input type='text' name='placeholder' id='placeholder'>\
              <label class='control-label'>Help Text</label> <input type='text' name='help' id='help'>\
              <hr/>\
              <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
            </div>\
          </form>\"\
          >\
          <!-- Appended input-->\
          <label class=\"control-label valtype\" data-valtype=\"label\">Appended text</label>\
          <div class=\"controls\">\
            <div class=\"input-append\">\
              <input class=\"span2 valtype\" data-valtype=\"placeholder\" placeholder=\"placeholder\" type=\"text\">\
              <span class=\"add-on valtype\" data-valtype=\"append\">^_^</span>\
            </div>\
            <p class=\"help-block valtype\" data-valtype=\"help\">Supporting help text</p>\
          </div>\
        </div>\
        <div class=\"control-group component\" rel=\"popover\" title=\"Search Input\" trigger=\"manual\"\
          data-content=\"\
          <form class='form'>\
            <div class='controls'>\
              <label class='control-label'>Label Text</label> <input class='input-large' type='text' name='label' id='label'>\
              <label class='control-label'>Placeholder</label> <input type='text' name='placeholder' id='placeholder'>\
              <label class='control-label'>Help Text</label> <input type='text' name='help' id='help'>\
              <label class='checkbox'><input type='checkbox' class='input-inline' name='checked' id='checkbox'>Checked</label>\
              <hr/>\
              <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
            </div>\
          </form>\"\
          >\
          <!-- Prepended checkbox -->\
          <label class=\"control-label valtype\" data-valtype=\"label\">Prepended checkbox</label>\
          <div class=\"controls\">\
            <div class=\"input-prepend\">\
              <span class=\"add-on\">\
                <label class=\"checkbox\">\
                  <input type=\"checkbox\" class=\"valtype\" data-valtype=\"checkbox\">\
                </label>\
              </span>\
              <input class=\"span2 valtype\" placeholder=\"placeholder\" type=\"text\" data-valtype=\"placeholder\">\
            </div>\
            <p class=\"help-block valtype\" data-valtype=\"help\">Supporting help text</p>\
          </div>\
        </div>\
        <div class=\"control-group component\" rel=\"popover\" title=\"Search Input\" trigger=\"manual\"\
          data-content=\"\
          <form class='form'>\
            <div class='controls'>\
              <label class='control-label'>Label Text</label> <input class='input-large' type='text' name='label' id='label'>\
              <label class='control-label'>Placeholder</label> <input type='text' name='placeholder' id='placeholder'>\
              <label class='control-label'>Help Text</label> <input type='text' name='help' id='help'>\
              <label class='checkbox'><input type='checkbox' class='input-inline' name='checked' id='checkbox'>Checked</label>\
              <hr/>\
              <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
            </div>\
          </form>\"\
          >\
          <!-- Appended checkbox -->\
          <label class=\"control-label valtype\" data-valtype=\"label\">Append checkbox</label>\
          <div class=\"controls\">\
            <div class=\"input-append\">\
              <input class=\"span2 valtype\" placeholder=\"placeholder\" type=\"text\" data-valtype=\"placeholder\">\
              <span class=\"add-on\">\
                <label class=\"checkbox\" for=\"appendedCheckbox\">\
                  <input type=\"checkbox\" class=\"valtype\" data-valtype=\"checkbox\">\
                </label>\
              </span>\
            </div>\
            <p class=\"help-block valtype\" data-valtype=\"help\">Supporting help text</p>\
          </div>\
        </div>\
        <div class=\"control-group component\" rel=\"popover\" title=\"Search Input\" trigger=\"manual\"\
          data-content=\"\
          <form class='form'>\
            <div class='controls'>\
              <label class='control-label'>Label Text</label> <input class='input-large' type='text' name='label' id='label'>\
              <hr/>\
              <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
            </div>\
          </form>\"\
          >\
          <!-- Textarea -->\
          <label class=\"control-label valtype\" data-valtype=\"label\">Textarea</label>\
          <div class=\"controls\">\
            <div class=\"textarea\">\
                  <textarea type=\"\" class=\"valtype\" data-valtype=\"checkbox\" /> </textarea>\
            </div>\
          </div>\
        </div>\
      </div>\
      <div class=\"tab-pane\" id=\"2\">\
        <div class=\"control-group component\" rel=\"popover\" title=\"Search Input\" trigger=\"manual\"\
          data-content=\"\
          <form class='form'>\
            <div class='controls'>\
              <label class='control-label'>Label Text</label> <input class='input-large' type='text' name='label' id='label'>\
              <label class='control-label'>Options: </label>\
              <textarea style='min-height: 200px' id='option'> </textarea>\
              <hr/>\
              <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
            </div>\
          </form>\"\
          >\
          <!-- Select Basic -->\
          <label class=\"control-label valtype\" data-valtype=\"label\">Select - Basic</label>\
          <div class=\"controls\">\
            <select class=\"input-xlarge valtype\" data-valtype=\"option\">\
              <option>Enter</option>\
              <option>Your</option>\
              <option>Options</option>\
              <option>Here!</option>\
            </select>\
          </div>\
        </div>\
        <div class=\"control-group component\" rel=\"popover\" title=\"Search Input\" trigger=\"manual\"\
          data-content=\"\
          <form class='form'>\
            <div class='controls'>\
              <label class='control-label'>Label Text</label> <input class='input-large' type='text' name='label' id='label'>\
              <label class='control-label'>Options: </label>\
              <textarea style='min-height: 200px' id='option'></textarea>\
              <hr/>\
              <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
            </div>\
          </form>\"\
          >\
          <!-- Select Multiple -->\
          <label class=\"control-label valtype\" data-valtype=\"label\">Select - Multiple</label>\
          <div class=\"controls\">\
            <select class=\"input-xlarge valtype\" multiple=\"multiple\" data-valtype=\"option\">\
              <option>Enter</option>\
              <option>Your</option>\
              <option>Options</option>\
              <option>Here!</option>\
            </select>\
          </div>\
        </div>\
      </div>\
      <div class=\"tab-pane\" id=\"3\">\
        <div class=\"control-group component\" rel=\"popover\" title=\"Multiple Checkboxes\" trigger=\"manual\"\
          data-content=\"\
          <form class='form'>\
            <div class='controls'>\
              <label class='control-label'>Label Text</label> <input class='input-large' type='text' name='label' id='label'>\
              <label class='control-label'>Options: </label>\
              <textarea style='min-height: 200px' id='checkboxes'> </textarea>\
              <hr/>\
              <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
            </div>\
          </form>\"\
          >\
          <label class=\"control-label valtype\" data-valtype=\"label\">Checkboxes</label>\
          <div class=\"controls valtype\" data-valtype=\"checkboxes\">\
            <!-- Multiple Checkboxes -->\
            <label class=\"checkbox\">\
              <input type=\"checkbox\" value=\"Option one\">\
              Option one\
            </label>\
            <label class=\"checkbox\">\
              <input type=\"checkbox\" value=\"Option two\">\
              Option two\
            </label>\
          </div>\
        </div>\
        <div class=\"control-group component\" rel=\"popover\" title=\"Multiple Radios\" trigger=\"manual\"\
          data-content=\"\
          <form class='form'>\
            <div class='controls'>\
              <label class='control-label'>Label Text</label> <input class='input-large' type='text' name='label' id='label'>\
              <label class='control-label'>Group Name Attribute</label> <input class='input-large' type='text' name='name' id='name'>\
              <label class='control-label'>Options: </label>\
              <textarea style='min-height: 200px' id='radios'></textarea>\
              <hr/>\
              <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
            </div>\
          </form>\"\
          >\
          <label class=\"control-label valtype\" data-valtype=\"label\">Radio buttons</label>\
          <div class=\"controls valtype\" data-valtype=\"radios\">\
            <!-- Multiple Radios -->\
            <label class=\"radio\">\
              <input type=\"radio\" value=\"Option one\" name=\"group\" checked=\"checked\">\
              Option one\
            </label>\
            <label class=\"radio\">\
              <input type=\"radio\" value=\"Option two\" name=\"group\">\
              Option two\
            </label>\
          </div>\
        </div>\
        <div class=\"control-group component\" rel=\"popover\" title=\"Inline Checkboxes\" trigger=\"manual\"\
          data-content=\"\
          <form class='form'>\
            <div class='controls'>\
              <label class='control-label'>Label Text</label> <input class='input-large' type='text' name='label' id='label'>\
              <textarea style='min-height: 200px' id='inline-checkboxes'></textarea>\
              <hr/>\
              <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
            </div>\
          </form>\"\
          >\
          <label class=\"control-label valtype\" data-valtype=\"label\">Inline Checkboxes</label>\
          <!-- Multiple Checkboxes -->\
          <div class=\"controls valtype\" data-valtype=\"inline-checkboxes\">\
            <label class=\"checkbox inline\">\
              <input type=\"checkbox\" value=\"1\"> 1\
            </label>\
            <label class=\"checkbox inline\">\
              <input type=\"checkbox\" value=\"2\"> 2\
            </label>\
            <label class=\"checkbox inline\">\
              <input type=\"checkbox\" value=\"3\"> 3\
            </label>\
          </div>\
        </div>\
        <div class=\"control-group component\" rel=\"popover\" title=\"Inline radioes\" trigger=\"manual\"\
          data-content=\"\
          <form class='form'>\
            <div class='controls'>\
              <label class='control-label'>Label Text</label> <input class='input-large' type='text' name='label' id='label'>\
              <label class='control-label'>Group Name Attribute</label> <input class='input-large' type='text' name='name' id='name'>\
              <textarea style='min-height: 200px' id='inline-radios'></textarea>\
              <hr/>\
              <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
            </div>\
          </form>\"\
          >\
          <label class=\"control-label valtype\" data-valtype=\"label\">Inline radios</label>\
          <div class=\"controls valtype\" data-valtype=\"inline-radios\">\
            <!-- Inline Radios -->\
            <label class=\"radio inline\">\
              <input type=\"radio\" value=\"1\" checked=\"checked\" name=\"group\">\
              1\
            </label>\
            <label class=\"radio inline\">\
              <input type=\"radio\" value=\"2\" name=\"group\">\
              2\
            </label>\
            <label class=\"radio inline\">\
              <input type=\"radio\" value=\"3\">\
              3\
            </label>\
          </div>\
        </div>\
      </div>\
      <div class=\"tab-pane\" id=\"4\">\
        <div class=\"control-group component\" rel=\"popover\" title=\"File Upload\" trigger=\"manual\"\
          data-content=\"\
          <form class='form'>\
            <div class='controls'>\
              <label class='control-label'>Label Text</label> <input class='input-large' type='text' name='label' id='label'>\
              <hr/>\
              <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
            </div>\
          </form>\"\
          >\
          <label class=\"control-label valtype\" data-valtype=\"label\">File Button</label>\
          <!-- File Upload -->\
          <div class=\"controls\">\
            <input class=\"input-file\" id=\"fileInput\" type=\"file\">\
          </div>\
        </div>\
        <div class=\"control-group component\" rel=\"popover\" title=\"Search Input\" trigger=\"manual\"\
          data-content=\"\
          <form class='form'>\
            <div class='controls'>\
              <label class='control-label'>Label Text</label> <input class='input-large' type='text' name='label' id='label'>\
              <label class='control-label'>Button Text</label> <input class='input-large' type='text' name='label' id='button'>\
              <label class='control-label' id=''>Type: </label>\
              <select class='input' id='color'>\
                <option id='btn-default'>Default</option>\
                <option id='btn-primary'>Primary</option>\
                <option id='btn-info'>Info</option>\
                <option id='btn-success'>Success</option>\
                <option id='btn-warning'>Warning</option>\
                <option id='btn-danger'>Danger</option>\
                <option id='btn-inverse'>Inverse</option>\
              </select>\
              <hr/>\
              <button class='btn btn-info'>Save</button><button class='btn btn-danger'>Cancel</button>\
            </div>\
          </form>\"\
          >\
          <label class=\"control-label valtype\" data-valtype=\"label\">Button</label>\
          <!-- Button -->\
          <div class=\"controls valtype\"  data-valtype=\"button\">\
            <button class='btn btn-success'>Button</button>\
          </div>\
        </div>\
      </div>\
      <div class=\"tab-pane\" id=\"5\">\
        <textarea id=\"source\" class=\"span6\"></textarea>\
      </div>\
    </fieldset>\
  </form>\
</div>";